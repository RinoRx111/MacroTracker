# backend/repair_structure.py
import os

def repair():
    # All folders that MUST have an __init__.py
    required_packages = [
        "App",
        "App/api",
        "App/api/v1",
        "App/api/v1/endpoints",
        "App/db",
        "App/db/models",
        "App/schemas",
        "App/services"
    ]

    print("🛠️ Starting structure repair...")
    
    for pkg in required_packages:
        path = os.path.join(os.getcwd(), pkg)
        # Create folder if it doesn't exist
        os.makedirs(path, exist_ok=True)
        
        # Create __init__.py
        init_file = os.path.join(path, "__init__.py")
        with open(init_file, "w") as f:
            f.write("") # Create empty file
        
        print(f"✅ Verified: {pkg}/__init__.py")

    print("\n✨ Structure repair complete! All packages are now properly initialized.")

if __name__ == "__main__":
    repair()
