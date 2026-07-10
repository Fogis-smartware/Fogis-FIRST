"""Sort product cards in category-bicycle_accessories.html by series+number ascending."""
import re

with open(r'D:\GIT\category-bicycle_accessories.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract each card: from opening <div with data-model to its matching close
# Cards are structured as: <div ... data-model="X"> ... </div>\n</div>\n</div>
# We find the opening tag then count div depth to find the matching close

cards = []
pattern = re.compile(r'<div class="(?:product-card |group bg-white[^"]*product-card")[^>]*data-model="([^"]+)"')
for m in pattern.finditer(html):
    start = m.start()
    model = m.group(1)
    # Find matching closing by counting div depth
    depth = 0
    i = start
    while i < len(html):
        if html[i:i+4] == '<div':
            depth += 1
            i += 4
        elif html[i:i+5] == '</div':
            depth -= 1
            if depth == 0:
                end = i + 6
                break
            i += 6
        else:
            i += 1
    cards.append({'model': model, 'html': html[start:end]})

print(f'Found {len(cards)} cards')

# Sort function
def sort_key(card):
    model = card['model']
    parts = model.split('-')
    series = parts[0]  # ET3 or ET8
    code = parts[1]    # D001, E067, F001B
    sub = code[0]       # D, E, F
    num_str = code[1:]  # 001, 067, 001B

    # Parse base number and optional letter suffix
    m = re.match(r'(\d+)([A-Za-z]*)', num_str)
    base = int(m.group(1))
    letter = m.group(2) or ''

    # Optional dash suffix like E067-1
    suffix = int(parts[2]) if len(parts) > 2 else 0

    # series: ET3=1, ET8=2
    # sub: D=1, E=2, F=3
    s_order = 1 if series == 'ET3' else 2
    sub_order = {'D': 1, 'E': 2, 'F': 3}[sub]

    return (s_order, sub_order, base, suffix, letter)

cards.sort(key=sort_key)

# Verify order
print('First 5:', [c['model'] for c in cards[:5]])
print('Last 5:', [c['model'] for c in cards[-5:]])

# Find ET3-E range
et3e = [c for c in cards if c['model'].startswith('ET3-E')]
print(f'ET3-E: {len(et3e)} products, {et3e[0]["model"]} to {et3e[-1]["model"]}')

# Find grid boundaries in original HTML
grid_start_marker = '<div class="grid grid-cols-2 lg:grid-cols-3'
grid_start = html.find(grid_start_marker)
grid_open_end = html.find('>', grid_start) + 1

# Find where grid ends (<!-- No Results -->)
grid_end = html.find('<!-- No Results -->')
if grid_end < 0:
    grid_end = html.find('</div>\n</div>\n<!-- No Results -->')
    if grid_end < 0:
        print('ERROR: cannot find grid end')
        exit(1)

# Rebuild
before = html[:grid_open_end]
after = html[grid_end:]
sorted_html = '\n'.join(c['html'] for c in cards)

new_html = before + '\n' + sorted_html + '\n' + after

with open(r'D:\GIT\category-bicycle_accessories.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f'Done. {len(cards)} cards sorted.')
print(f'File: {len(new_html)} bytes')
