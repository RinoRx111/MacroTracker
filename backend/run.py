# backend/run.py
import os
import sys
from pathlib import Path

# Setup paths BEFORE importing uvicorn
backend_path = Path(__file__).parent.resolve()
sys.path.append(str(backend_path))

import uvicorn

if __name__ == "__main__":
    print(f"Launching MacroTracker in Single-Process Mode...")
    print(f"Backend Root: {backend_path}")
    
    try:
        # We use "app.main:app"
        # We DISABLE reload=True because reload creates a child process 
        # that breaks on OneDrive. We will use manual restarts for now.
        uvicorn.run(
            "app.main:app", 
            host="127.0.0.1", 
            port=8000, 
            reload=False, # Set to False to prevent the 'Child Process' crash
            log_level="info"
        )
    except Exception as e:
        print(f"Critical Error: {e}")
