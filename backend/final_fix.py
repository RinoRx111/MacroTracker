# backend/final_fix.py
import os

def final_repair():
    # Current working directory
    base = os.getcwd()
    
    # All folders that MUST be packages
    packages = [
        "App",
        "App/api",
        "App/api/v1",
        "App/api/v1/endpoints",
        "App/db",
        "App/db/models",
        "App/schemas",
        "App/services"
    ]

    print("🛠️ Performing Final Structure Audit...")
    
    for pkg in packages:
        pkg_path = os.path.join(base, pkg)
        os.makedirs(pkg_path, exist_ok=True)
        
        init_file = os.path.join(pkg_path, "__init__.py")
        with open(init_file, "w") as f:
            f.write("# Package Initialization")
        print(f"✅ Package Verified: {pkg}")

    # Verify critical files exist
    critical_files = [
        "App/services/food_provider.py",
        "App/services/nutrition_calc.py",
        "App/services/trend_engine.py",
        "App/main.py" # We will move this back inside for the final approach
    ]

    for cf in critical_files:
        if not os.path.exists(os.path.join(base, cf)):
            print(f"❌ MISSING FILE: {cf} - PLEASE CREATE IT!")
        else:
            print(f"✅ File Found: {cf}")

if __name__ == "__main__":
    final_repair()
