import zipfile
import os
import json

zip_path = '/vercel/share/v0-project/Dosage_20260313041844.zip'
output_dir = '/vercel/share/v0-project/flow-extracted'

# Create output directory
os.makedirs(output_dir, exist_ok=True)

# Extract the zip file
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    print("Files in zip:")
    for name in zip_ref.namelist():
        print(f"  - {name}")
    
    zip_ref.extractall(output_dir)
    print(f"\nExtracted to: {output_dir}")

# List extracted files
print("\nExtracted files:")
for root, dirs, files in os.walk(output_dir):
    for file in files:
        filepath = os.path.join(root, file)
        print(f"  - {filepath}")
        
        # If it's a JSON file, try to read and display structure
        if file.endswith('.json'):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print(f"    Keys: {list(data.keys()) if isinstance(data, dict) else 'Array'}")
            except Exception as e:
                print(f"    Could not parse: {e}")
