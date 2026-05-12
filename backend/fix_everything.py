# backend/fix_everything.py
import os
import shutil

def fix():
    # 1. Move main.py from App/main.py to backend/main.py
    src = os.path.join("App", "main.py")
    dst = "main.py"
    if os.path.exists(src):
        shutil.move(src, dst)
        print("✅ Moved main.py to root backend folder")

    # 2. List of all files that need their imports fixed
    files_to_fix = [
        "main.py",
        "App/api/v1/api.py",
        "App/api/v1/endpoints/nutrition.py",
        "App/api/v1/endpoints/weight.py",
        "App/api/v1/endpoints/user.py",
        "App/db/models/nutrition_log.py",
        "App/db/models/user.py",
        "App/db/models/weight_log.py",
    ]

    print("🛠️ Fixing imports...")
    for file_path in files_to_fix:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Replace relative imports (... or ..) and weird App.App imports with clean absolute imports
        # This replaces things like 'from ...db.session' or 'from .db.session' with 'from App.db.session'
        import re
        
        # Remove any leading dots from imports that start with 'from .', 'from ..', or 'from ...'
        content = re.sub(r'from \.\.\.([\w\.]+)', r'from App\1', content)
        content = re.sub(r'from \.\.([\w\.]+)', r'from App\1', content)
        content = re.sub(r'from \.([\w\.]+)', r'from App\1', content)
        
        # Fix cases where it might have become App.App
        content = content.replace("App.App", "App")

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Fixed: {file_path}")

    print("\n✨ Everything is now in the professional standard structure!")

if __name__ == "__main__":
    fix()
