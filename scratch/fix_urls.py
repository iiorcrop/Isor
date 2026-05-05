import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # First, fix the broken replacement from previous attempt
    new_content = content.replace("$/", "`${import.meta.env.VITE_API_URL}/`")
    # Also handle the original case if it wasn't broken
    new_content = new_content.replace("http://localhost:5000/api", "`${import.meta.env.VITE_API_URL}`")
    
    # Special case for strings already in backticks
    # If it's already `${import.meta.env.VITE_API_URL}`, we might have double backticks or nested.
    # Wait, the previous attempt replaced 'http://localhost:5000/api' with '$/'.
    # So if it was 'http://localhost:5000/api/auth/login', it became '$/auth/login'.
    # If the original was inside single quotes: axios.post('http://localhost:5000/api/auth/login')
    # It became axios.post('$/auth/login')
    
    # Let's be more precise.
    # We want axios.post(`${import.meta.env.VITE_API_URL}/auth/login`)
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".jsx") or file.endswith(".js"):
                replace_in_file(os.path.join(root, file))

process_dir("admin-dashboard/src")
process_dir("frontend/src")
