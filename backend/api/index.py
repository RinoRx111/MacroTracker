import os
import sys

# Ensure the root folder is in the Python search path (triggered Vercel auto-rebuild)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
