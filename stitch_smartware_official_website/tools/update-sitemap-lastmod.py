"""Update all sitemap lastmod dates to today"""
import re

SITEMAP_PATH = r"D:\GIT\sitemap.xml"
TODAY = "2026-06-30"

with open(SITEMAP_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all lastmod dates
old_lastmod = r'<lastmod>[\d-]+</lastmod>'
new_lastmod = f'<lastmod>{TODAY}</lastmod>'
updated = re.sub(old_lastmod, new_lastmod, content)

count = len(re.findall(old_lastmod, content))
print(f"Updated {count} lastmod entries to {TODAY}")

with open(SITEMAP_PATH, 'w', encoding='utf-8') as f:
    f.write(updated)

print("Done!")
