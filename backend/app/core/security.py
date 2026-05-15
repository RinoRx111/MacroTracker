"""Security utilities for the application."""

from typing import Optional
from datetime import datetime, timedelta
import secrets


def generate_session_token(length: int = 32) -> str:
    """Generate a secure random session token."""
    return secrets.token_urlsafe(length)


def hash_password(password: str) -> str:
    """Hash a password for storage (simplified for demo)."""
    # In production, use passlib or bcrypt
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash (simplified for demo)."""
    return hash_password(plain_password) == hashed_password
