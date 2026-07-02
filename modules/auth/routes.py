from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from database.session import get_db
from modules.auth.schemas import (
    RegisterRequest, LoginRequest, GoogleAuthRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    VerifyEmailRequest, ResendOTPRequest,
    AuthResponse, UserProfile,
)
from modules.auth.service import (
    register_user, login_user, google_auth,
    forgot_password, reset_password, get_current_user,
    verify_email_otp, resend_otp,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    result = register_user(db, data)
    if isinstance(result, str):
        raise HTTPException(status_code=400, detail=result)
    return result


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    result = login_user(db, data)
    if isinstance(result, str):
        raise HTTPException(status_code=401, detail=result)
    return result


@router.post("/google", response_model=AuthResponse)
def google_login(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    result = google_auth(db, data)
    if isinstance(result, str):
        raise HTTPException(status_code=401, detail=result)
    return result


@router.post("/forgot-password")
def forgot_pwd(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    forgot_password(db, data)
    return {"message": "If an account exists with this email, a reset link has been sent."}


@router.post("/reset-password")
def reset_pwd(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    result = reset_password(db, data)
    if result != "ok":
        raise HTTPException(status_code=400, detail=result)
    return {"message": "Password reset successfully."}


@router.post("/verify-email", response_model=AuthResponse)
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    result = verify_email_otp(db, data)
    if isinstance(result, str):
        raise HTTPException(status_code=400, detail=result)
    return result


@router.post("/resend-verification")
def resend_verification(data: ResendOTPRequest, db: Session = Depends(get_db)):
    resend_otp(db, data)
    return {"message": "Verification code sent."}


@router.get("/me", response_model=UserProfile)
def me(authorization: str = Header(...), db: Session = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.split("Bearer ")[1]
    user = get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return UserProfile(
        id=str(user.id),
        name=user.name or "",
        email=user.email,
        auth_provider=user.auth_provider or "email",
        is_verified=user.is_verified or False,
    )
