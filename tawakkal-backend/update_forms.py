import os
import re

frontend_dir = r"d:\Techmire Solutions\05_OJT\02_OJT_02\Project_08(Tawakkal)\tawakkal-frontend\src\admin\features"

def process_file(filepath, changes):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Auto-generate slug on name change
    if 'onChange={(e) => setFormData({ ...formData, name: e.target.value })}' in content:
        content = content.replace(
            'onChange={(e) => setFormData({ ...formData, name: e.target.value })}',
            'onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") })}'
        )
    
    # Remove image/logo upload
    for search, replace in changes:
        content = re.sub(search, replace, content, flags=re.DOTALL)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

brands_file = os.path.join(frontend_dir, "brands", "BrandList.jsx")
brands_changes = [
    (r'<div style={{ marginBottom: \'24px\' }}>\s*<label style={{.*?}}>Logo.*?</label>.*?</div>\s*<div style={{ marginBottom: \'24px\' }}>\s*<label style={{.*?}}>Cover Image.*?</label>.*?</div>', '')
]

badges_file = os.path.join(frontend_dir, "badges", "BadgeList.jsx")
badges_changes = [
    (r'<div style={{ marginBottom: \'24px\' }}>\s*<label style={{.*?}}>Icon.*?</label>.*?</div>', '')
]

categories_file = os.path.join(frontend_dir, "categories", "CategoryList.jsx")
categories_changes = [
    (r'<div style={{ marginBottom: \'24px\' }}>\s*<label style={{.*?}}>Image.*?</label>.*?</div>', '')
]

if os.path.exists(brands_file):
    process_file(brands_file, brands_changes)
if os.path.exists(badges_file):
    process_file(badges_file, badges_changes)
if os.path.exists(categories_file):
    process_file(categories_file, categories_changes)

print("Files updated successfully!")
