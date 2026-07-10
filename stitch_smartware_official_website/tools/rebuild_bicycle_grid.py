"""
Insert 63 new ET3-E product cards, then sort ALL 135 cards by series.
Output: sorted category-bicycle_accessories.html
"""
import re

FILE = r'D:\GIT\category-bicycle_accessories.html'

with open(FILE, 'r', encoding='utf-8') as f:
    html = f.read()

# --- Step 1: Extract all existing cards ---
card_pattern = re.compile(
    r'<div class="(?:product-card |group bg-white[^"]*product-card")[^>]*data-model="([^"]+)"'
)

def find_card_end(html, start):
    """Find matching </div> for the card div starting at 'start'."""
    depth = 0
    i = start
    while i < len(html):
        if html.startswith('<div', i):
            depth += 1
            i += 4
        elif html.startswith('</div>', i):
            depth -= 1
            if depth == 0:
                return i + 6
            i += 6
        else:
            i += 1
    return len(html)

existing_cards = []
for m in card_pattern.finditer(html):
    start = m.start()
    model = m.group(1)
    end = find_card_end(html, start)
    existing_cards.append({'model': model, 'html': html[start:end]})

print(f'Existing cards: {len(existing_cards)}')

# --- Step 2: Generate 63 new cards ---
new_models = []
for i in range(1, 65):
    if i == 40:  # E040 doesn't exist
        continue
    new_models.append(f'ET3-E{i:03d}')

card_template = '''<div class="product-card group bg-white rounded-xl overflow-hidden shadow-soft border border-outline-variant transition-all hover:-translate-y-2 fade-up delay-{delay}" data-model="{model}">
<div class="aspect-square overflow-hidden relative bg-surface-container-low">
<img alt="{model}" class="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110" src="images/{lower}.jpg"/ loading="lazy">
</div>
<div class="p-6">
<h3 class="font-bold text-xl text-on-surface mb-1">{model}</h3>
<p class="text-primary text-sm font-semibold mb-4"><span lang="en">Bicycle Accessories</span><span lang="zh">自行车配件</span></p>
<a href="product-{lower}.html" class="block w-full py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors text-center text-sm"><span lang="en">VIEW DETAILS</span><span lang="zh">查看详情</span></a>
</div>
</div>'''

new_cards = []
for idx, model in enumerate(new_models):
    lower = model.lower()
    delay = (idx % 4) + 1
    new_cards.append({
        'model': model,
        'html': card_template.format(model=model, lower=lower, delay=delay)
    })

print(f'New cards: {len(new_cards)}')

# --- Step 3: Merge and sort ---
all_cards = existing_cards + new_cards

def sort_key(card):
    model = card['model']
    parts = model.split('-')
    series = parts[0]       # ET3 or ET8
    code = parts[1]          # D001, E067, F001B
    sub = code[0]            # D, E, F
    num_str = code[1:]       # 001, 067, 001B

    m = re.match(r'(\d+)([A-Za-z]*)', num_str)
    base = int(m.group(1))
    letter = m.group(2) or ''
    suffix = int(parts[2]) if len(parts) > 2 else 0

    s_order = 1 if series == 'ET3' else 2
    sub_order = {'D': 1, 'E': 2, 'F': 3}[sub]

    return (s_order, sub_order, base, suffix, letter)

all_cards.sort(key=sort_key)

print(f'Total cards: {len(all_cards)}')
print(f'First: {all_cards[0]["model"]} | Last: {all_cards[-1]["model"]}')

# Verify ET3-E range
et3e = [c for c in all_cards if c['model'].startswith('ET3-E')]
print(f'ET3-E: {len(et3e)} cards, {et3e[0]["model"]} to {et3e[-1]["model"]}')

# --- Step 4: Find grid boundaries and rebuild ---
# Find the grid opening div
grid_pattern = r'<div class="grid grid-cols-2 lg:grid-cols-3[^"]*"[^>]*>'
grid_match = re.search(grid_pattern, html)
if not grid_match:
    print('ERROR: grid not found')
    exit(1)

grid_start = grid_match.start()
grid_open_end = grid_match.end()

# Find where the grid section ends - look for the closing </div> of the grid
# The grid contains all cards, then closes with </div> before the No Results or CTA section
# Strategy: skip all card divs and find the first non-card </div> after the last card

# Find the end of the last existing card
last_card_end = 0
for m in card_pattern.finditer(html):
    last_card_end = max(last_card_end, find_card_end(html, m.start()))

# After last card, skip whitespace and find the next </div> - that closes the grid
after_cards = html[last_card_end:]
grid_close_match = re.search(r'</div>', after_cards)
if grid_close_match:
    grid_close_pos = last_card_end + grid_close_match.start() + 6
else:
    print('ERROR: grid close not found')
    exit(1)

before_grid = html[:grid_open_end]
after_grid = html[grid_close_pos:]

# --- Step 5: Build sorted grid ---
sorted_cards_html = '\n'.join(c['html'] for c in all_cards)
new_html = before_grid + '\n' + sorted_cards_html + '\n' + after_grid

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f'\nDone! File written: {len(new_html)} bytes')
print(f'Cards sorted: D-series -> E-series -> F-series (ET3 then ET8)')
