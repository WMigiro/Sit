import zipfile
import os
import json

# Try different paths
possible_paths = [
    '/vercel/share/v0-project/Dosage_20260313041844.zip',
    './Dosage_20260313041844.zip',
    '../Dosage_20260313041844.zip',
]

zip_path = None
for path in possible_paths:
    print(f"Checking: {path}")
    if os.path.exists(path):
        zip_path = path
        print(f"  Found!")
        break
    else:
        print(f"  Not found")

# Print current working directory
print(f"\nCurrent working directory: {os.getcwd()}")
print(f"Directory contents: {os.listdir('.')}")

if zip_path is None:
    # Try to find any zip file
    for item in os.listdir('.'):
        if item.endswith('.zip'):
            zip_path = item
            print(f"Found zip file: {zip_path}")
            break

if zip_path is None:
    print("No zip file found!")
    exit(1)

output_dir = '/vercel/share/v0-project/flow-extracted'

# Create output directory
os.makedirs(output_dir, exist_ok=True)

# Extract the zip file
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    print("\nFiles in zip:")
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
