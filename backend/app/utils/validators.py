"""Data validation utilities."""

import re
from typing import Tuple


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_username(username: str) -> Tuple[bool, str]:
    """Validate username format."""
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    if len(username) > 50:
        return False, "Username must be less than 50 characters"
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        return False, "Username can only contain letters, numbers, hyphens, and underscores"
    return True, ""


def validate_password(password: str) -> Tuple[bool, str]:
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    return True, ""


def validate_weight(weight_kg: float) -> Tuple[bool, str]:
    """Validate weight value."""
    if weight_kg <= 0:
        return False, "Weight must be positive"
    if weight_kg < 30 or weight_kg > 250:
        return False, "Weight must be between 30 and 250 kg"
    return True, ""


def validate_height(height_cm: int) -> Tuple[bool, str]:
    """Validate height value."""
    if height_cm <= 0:
        return False, "Height must be positive"
    if height_cm < 120 or height_cm > 250:
        return False, "Height must be between 120 and 250 cm"
    return True, ""


def validate_age(age: int) -> Tuple[bool, str]:
    """Validate age value."""
    if age < 13 or age > 120:
        return False, "Age must be between 13 and 120"
    return True, ""


def validate_macros(protein_g: float, carbs_g: float, fat_g: float) -> Tuple[bool, str]:
    """Validate macro values."""
    if protein_g < 0 or carbs_g < 0 or fat_g < 0:
        return False, "Macro values cannot be negative"
    if protein_g > 500 or carbs_g > 1000 or fat_g > 500:
        return False, "Macro values seem too high"
    return True, ""
