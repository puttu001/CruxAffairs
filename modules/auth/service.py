import os
import requests as http_requests
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select

from database.models.user import User
from database.models.email_otp import EmailOTP
from modules.auth.schemas import (
    RegisterRequest, LoginRequest, GoogleAuthRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    VerifyEmailRequest, ResendOTPRequest,
    AuthResponse, UserProfile,
)
from modules.auth.utils import (
    hash_password, verify_password,
    create_access_token, create_reset_token, decode_token,
    send_reset_email, generate_otp, send_otp_email,
)

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"


def _user_to_profile(user: User) -> UserProfile:
    return UserProfile(
        id=str(user.id),
        name=user.name or "",
        email=user.email,
        auth_provider=user.auth_provider or "email",
        is_verified=user.is_verified or False,
    )


def _build_auth_response(user: User) -> AuthResponse:
    token = create_access_token(str(user.id), user.email)
    return AuthResponse(access_token=token, user=_user_to_profile(user))


def _send_otp(db: Session, email: str):
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    row = db.execute(select(EmailOTP).where(EmailOTP.email == email)).scalar_one_or_none()
    if row:
        row.code = otp
        row.expires_at = expires_at
    else:
        db.add(EmailOTP(email=email, code=otp, expires_at=expires_at))
    db.commit()
    send_otp_email(email, otp)


def verify_email_otp(db: Session, data: VerifyEmailRequest) -> AuthResponse | str:
    row = db.execute(select(EmailOTP).where(EmailOTP.email == data.email)).scalar_one_or_none()
    if not row:
        return "No verification code found. Please request a new one."
    if datetime.utcnow() > row.expires_at:
        db.delete(row)
        db.commit()
        return "Code expired. Please request a new one."
    if row.code != data.otp:
        return "Invalid code."

    db.delete(row)
    user = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if not user:
        db.commit()
        return "User not found."
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return _build_auth_response(user)


def resend_otp(db: Session, data: ResendOTPRequest) -> str:
    _send_otp(db, data.email)
    return "ok"


def register_user(db: Session, data: RegisterRequest) -> AuthResponse | str:
    existing = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if existing:
        return "Email already registered"

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        auth_provider="email",
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        _send_otp(db, data.email)
    except Exception as e:
        print(f"[Auth] OTP email failed: {e}")

    return _build_auth_response(user)


def login_user(db: Session, data: LoginRequest) -> AuthResponse | str:
    user = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if not user:
        return "Invalid email or password"
    if not user.password_hash:
        return "This account uses Google login. Please sign in with Google."
    if not verify_password(data.password, user.password_hash):
        return "Invalid email or password"

    return _build_auth_response(user)


def google_auth(db: Session, data: GoogleAuthRequest) -> AuthResponse | str:
    """Verify Google ID token and create/login user."""
    try:
        resp = http_requests.get(f"{GOOGLE_TOKEN_INFO_URL}?id_token={data.token}", timeout=10)
        if resp.status_code != 200:
            return "Invalid Google token"
        google_data = resp.json()
    except Exception:
        return "Failed to verify Google token"

    email = google_data.get("email")
    google_id = google_data.get("sub")
    name = google_data.get("name", "")

    if not email or not google_id:
        return "Google token missing required fields"

    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()

    if user:
        if not user.google_id:
            user.google_id = google_id
            user.auth_provider = "google"
            db.commit()
            db.refresh(user)
    else:
        user = User(
            name=name,
            email=email,
            auth_provider="google",
            google_id=google_id,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return _build_auth_response(user)


def forgot_password(db: Session, data: ForgotPasswordRequest) -> str:
    user = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if not user:
        return "ok"  # don't reveal whether email exists

    if user.auth_provider == "google" and not user.password_hash:
        return "ok"  # google-only accounts can't reset password

    token = create_reset_token(user.email)
    send_reset_email(user.email, token)
    return "ok"


def reset_password(db: Session, data: ResetPasswordRequest) -> str:
    payload = decode_token(data.token)
    if not payload or payload.get("purpose") != "reset":
        return "Invalid or expired reset token"

    email = payload.get("email")
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user:
        return "Invalid or expired reset token"

    user.password_hash = hash_password(data.new_password)
    db.commit()
    return "ok"


def get_current_user(db: Session, token: str) -> User | None:
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
