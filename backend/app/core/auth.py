# backend/app/core/auth.py
import os
import time
import logging
import jwt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

logger = logging.getLogger("auth")

security = HTTPBearer(auto_error=False)

# In-memory cache for JWKS keys to prevent hitting Clerk API on every request
_jwks_cache = {
    "keys": {},
    "last_fetched": 0
}
JWKS_CACHE_TTL = 3600  # 1 hour

def fetch_jwks(jwks_url: str) -> dict:
    """Fetch and cache JSON Web Key Set from Clerk."""
    global _jwks_cache
    now = time.time()
    
    # Return cached keys if cache has not expired
    if _jwks_cache["keys"] and (now - _jwks_cache["last_fetched"] < JWKS_CACHE_TTL):
        return _jwks_cache["keys"]
        
    try:
        logger.info(f"Fetching JWKS from Clerk endpoint: {jwks_url}")
        response = httpx.get(jwks_url, timeout=5.0)
        response.raise_for_status()
        jwks = response.json()
        
        keys = {}
        for key_data in jwks.get("keys", []):
            kid = key_data.get("kid")
            if kid:
                keys[kid] = key_data
                
        _jwks_cache["keys"] = keys
        _jwks_cache["last_fetched"] = now
        return keys
    except Exception as e:
        logger.error(f"Error fetching Clerk JWKS: {e}")
        # Return stale cache if available as a fallback, otherwise raise error
        if _jwks_cache["keys"]:
            return _jwks_cache["keys"]
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not verify authentication credentials with authorization server."
        )

def verify_clerk_token(token: str) -> dict:
    """Verify the Clerk JWT bearer token signature and claims."""
    # Read environment variables as fallback
    jwks_url = settings.CLERK_JWKS_URL or os.getenv("CLERK_JWKS_URL")
    issuer = settings.CLERK_ISSUER or os.getenv("CLERK_ISSUER")
    
    if not jwks_url:
        logger.error("CLERK_JWKS_URL is not configured in settings or environment.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication configuration error."
        )
        
    try:
        # Decode header without validation to read the kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise jwt.InvalidTokenError("Token header is missing Key ID (kid).")
            
        # Retrieve public keys
        public_keys = fetch_jwks(jwks_url)
        jwk = public_keys.get(kid)
        if not jwk:
            # Force cache invalidation and refetch if Key ID is not found in cache
            global _jwks_cache
            _jwks_cache["last_fetched"] = 0
            public_keys = fetch_jwks(jwks_url)
            jwk = public_keys.get(kid)
            if not jwk:
                raise jwt.InvalidTokenError("Signing key not found in JWKS.")
                
        # Load the JWK key structure into a cryptography public key
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
        
        # Verify claims and decode
        decode_args = {
            "algorithms": ["RS256"],
            "options": {"verify_aud": False}  # Clerk session tokens typically lack aud
        }
        if issuer:
            decode_args["issuer"] = issuer
            
        payload = jwt.decode(token, public_key, **decode_args)
        return payload
        
    except jwt.ExpiredSignatureError as e:
        logger.warning(f"Clerk token expired: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again."
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid Clerk token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error validating token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed."
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to retrieve the verified User from the database.
    Decodes the Clerk JWT token, extracts the clerk_id, and matches it.
    If no user exists, dynamically initializes a User profile.
    """
    # Demo/Bypass mode: Fallback to the demo user if credentials are missing and Clerk is not configured,
    # or if we are in debug mode and a 'demo_token' is explicitly supplied.
    clerk_jwks_url = settings.CLERK_JWKS_URL or os.getenv("CLERK_JWKS_URL")
    is_demo_mode = False
    
    if not clerk_jwks_url:
        is_demo_mode = True
    elif credentials and credentials.credentials == "demo_token" and settings.DEBUG:
        is_demo_mode = True
    elif not credentials and settings.DEBUG:
        is_demo_mode = True
        
    if is_demo_mode:
        demo_user = db.query(User).filter(User.id == 1).first()
        if demo_user:
            return demo_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Demo user not found and authorization credentials missing."
        )
        
    payload = verify_clerk_token(credentials.credentials)
    clerk_id = payload.get("sub")
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload. Subject claim (sub) missing."
        )
        
    # Match clerk_id in local database
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        # User adoption logic: Adopt demo user id=1 if it doesn't have a clerk_id
        user_one = db.query(User).filter(User.id == 1).first()
        if user_one and not user_one.clerk_id:
            user_one.clerk_id = clerk_id
            db.commit()
            db.refresh(user_one)
            logger.info(f"Adopted demo user id=1 for clerk_id: {clerk_id}")
            user = user_one
        else:
            # Create a brand new user record
            email = payload.get("email") or f"{clerk_id}@clerk.user"
            username = payload.get("username") or f"clerk_{clerk_id[:12]}"
            
            # Guard against username/email uniqueness collisions
            email_exists = db.query(User).filter(User.email == email).first()
            if email_exists:
                email = f"{clerk_id}_{email}"
            username_exists = db.query(User).filter(User.username == username).first()
            if username_exists:
                username = f"{username}_{clerk_id[:6]}"
                
            user = User(
                clerk_id=clerk_id,
                username=username,
                email=email,
                hashed_password="clerk_auth_no_password",
                full_name=payload.get("name") or "New User",
                daily_calorie_goal=2000,
                protein_goal_g=150,
                carbs_goal_g=200,
                fat_goal_g=65,
                daily_step_goal=10000,
                daily_water_goal_ml=2000,
                daily_calories_burned_goal=500,
                is_active=True,
                dark_mode=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created user record in database for clerk_id: {clerk_id}")
            
    return user
