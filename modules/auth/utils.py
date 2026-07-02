import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _truncate(password: str) -> str:
    return password.encode("utf-8")[:72].decode("utf-8", errors="ignore")


def hash_password(password: str) -> str:
    return pwd_context.hash(_truncate(password))


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(_truncate(plain), hashed)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=1)
    payload = {"email": email, "purpose": "reset", "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


def generate_otp() -> str:
    return str(secrets.randbelow(900000) + 100000)  # 6-digit


def _smtp_send(to_email: str, subject: str, html_body: str):
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASS", "")

    if not smtp_user or not smtp_password:
        print(f"[Auth] SMTP not configured. Email to {to_email}: {subject}")
        return

    msg = MIMEMultipart()
    msg["From"] = os.environ.get("EMAIL_FROM", smtp_user)
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


def send_otp_email(to_email: str, otp: str):
    body = f"""
    <h2>Verify Your Email</h2>
    <p>Enter this code in the CruxAffairs app to verify your email address.</p>
    <div style="font-size: 2rem; font-weight: 800; letter-spacing: 0.4rem;
                color: #6366f1; padding: 1rem 0;">{otp}</div>
    <p style="color: #888; font-size: 12px;">This code expires in 15 minutes.
    If you didn't create a CruxAffairs account, ignore this email.</p>
    """
    _smtp_send(to_email, "CruxAffairs — Verify Your Email", body)


def send_reset_email(to_email: str, reset_token: str):
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3001")
    reset_link = f"{frontend_url}/auth/reset-password?token={reset_token}"
    body = f"""
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your CruxAffairs password. This link expires in 1 hour.</p>
    <p><a href="{reset_link}" style="background: #6366f1; color: white; padding: 10px 24px;
       border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a></p>
    <p style="color: #888; font-size: 12px;">If you didn't request this, ignore this email.</p>
    """
    _smtp_send(to_email, "CruxAffairs — Reset Your Password", body)
