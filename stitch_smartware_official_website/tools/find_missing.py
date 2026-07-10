"""Find which bicycle products are truly missing from the new site."""
import json, os

REPO = r'D:\GIT'
TOOLS = os.path.join(REPO, 'stitch_smartware_official_website', 'tools')

# Existing products in repo
existing = set()
for f in os.listdir(REPO):
    if not f.endswith('.html'):
        continue
    if f.startswith('product-et3-') or f.startswith('product-et8-'):
        name = f.replace('product-', '').replace('.html', '').upper()
        existing.add(name)

print(f'Existing products: {len(existing)}')

# Load old site URL data
with open(os.path.join(TOOLS, 'bicycle_product_urls.json')) as fh:
    old_data = json.load(fh)

old_set = {m.upper() for m in old_data.keys()}
print(f'Old site products: {len(old_set)}')

missing = sorted(old_set - existing)
print(f'Truly missing: {len(missing)}')

for prefix in ['ET3-D', 'ET3-E', 'ET3-F', 'ET8-E', 'ET8-F']:
    count = len([x for x in missing if x.startswith(prefix)])
    print(f'  Missing {prefix}: {count}')

with open(os.path.join(TOOLS, 'truly_missing.json'), 'w') as fh:
    json.dump(sorted(missing), fh, indent=2)
print('Saved to tools/truly_missing.json')
