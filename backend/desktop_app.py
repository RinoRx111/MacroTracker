import os
import sys
import time
import subprocess
import threading
import urllib.request
import webbrowser
from pathlib import Path
import uvicorn

# Setup paths
backend_path = Path(__file__).parent.resolve()
sys.path.append(str(backend_path))

PORT = 8000
HOST = "127.0.0.1"
APP_URL = f"http://{HOST}:{PORT}"

def start_server():
    print(f"Starting backend server on {HOST}:{PORT}...")
    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info"
    )

def is_server_ready():
    try:
        with urllib.request.urlopen(f"{APP_URL}/health", timeout=1) as response:
            return response.status == 200
    except Exception:
        return False

def launch_browser():
    print("Launching application window...")
    # Isolated user profile directory inside the project to separate session data
    profile_dir = os.path.abspath(os.path.join(backend_path, "..", "data", "desktop_profile"))
    os.makedirs(profile_dir, exist_ok=True)
    
    # Try Edge first (guaranteed on Windows)
    edge_paths = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        "msedge"
    ]
    
    launched = False
    for path in edge_paths:
        try:
            # We run with --app (app mode) and a custom user data dir to isolate cookies and keep the process open
            cmd = [
                path, 
                f"--app={APP_URL}", 
                f"--user-data-dir={profile_dir}", 
                "--no-first-run", 
                "--no-default-browser-check",
                "--window-size=1200,800"
            ]
            print(f"Launching edge via: {path}")
            proc = subprocess.Popen(cmd)
            print("Edge application launched. Waiting for exit...")
            proc.wait() # Wait for user to close window
            launched = True
            break
        except Exception as e:
            print(f"Could not start Edge from {path}: {e}")
            continue
            
    if not launched:
        # Fallback to default browser
        print("Fallback: Launching default browser...")
        webbrowser.open(APP_URL)
        # Since we can't track standard browser processes, we just sleep or wait for manual Ctrl+C
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    # Start server in thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Wait for server to become responsive
    print("Waiting for server to start...")
    retries = 30
    while retries > 0:
        if is_server_ready():
            break
        time.sleep(0.5)
        retries -= 1
        
    if retries == 0:
        print("Error: Server failed to start in time.")
        sys.exit(1)
        
    print("Server is ready.")
    
    # Launch browser window (blocks until closed)
    try:
        launch_browser()
    except Exception as e:
        print(f"Browser execution ended: {e}")
        
    print("Application closed. Exiting...")
