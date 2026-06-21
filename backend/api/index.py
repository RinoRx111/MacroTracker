import os
import sys

# Ensure root folder is in Python path (Neon database migration rebuild)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
