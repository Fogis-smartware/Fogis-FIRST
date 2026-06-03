import os
import glob

website_dir = "d:/CC/smartware/Version2/stitch_smartware_official_website"
files = glob.glob(os.path.join(website_dir, "product-*.html"))

fixed = 0
for filepath in files:
    with open(filepath, 'rb') as f:
        content = f.read()

    # Fix: /images\(... -> /images/...
    old = b'images\\\\([^.-]+)'
    new = b'images\\/([^.-]+)'

    if old in content:
        content = content.replace(old, new)
        with open(filepath, 'wb') as f:
            f.write(content)
        fixed += 1

print(f"Fixed {fixed} files")
