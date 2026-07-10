"""
Sort product cards in ALL category pages by model number (natural sort).
Handles various model formats: ET1-C003, ET5-H009, ET1-G002AC, etc.
"""
import re, os, glob

REPO = r'D:\GIT'

def parse_model(model):
    """Parse model into sortable tuple. Format: ET{series}-{sub}{num}{suffix}[-{variant}]"""
    parts = model.split('-')
    series = parts[0]  # ET1, ET3, ET5, ET8, ET10

    # Extract series number
    series_num = int(re.search(r'\d+', series).group())

    if len(parts) >= 2:
        code = parts[1]  # C003, H009, G002AC, etc.
        # Extract sub-letter(s) at start
        sub_match = re.match(r'([A-Z]+)', code)
        sub = sub_match.group(1) if sub_match else ''
        rest = code[len(sub):]  # 003, 009, 002AC

        # Extract base number
        num_match = re.match(r'(\d+)', rest)
        base = int(num_match.group(1)) if num_match else 0
        suffix = rest[num_match.end():] if num_match else rest

        # Optional variant like -1, -2
        variant = int(parts[2]) if len(parts) >= 3 else 0
    else:
        sub = ''
        base = 0
        suffix = ''
        variant = 0

    return (series_num, sub, base, suffix, variant)

def find_card_end(html, start):
    """Find matching </div> for card div starting at 'start'."""
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

def sort_category_page(filepath):
    """Sort product cards in a single category page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find all product cards
    card_pattern = re.compile(
        r'<div class="(?:product-card |group bg-white[^"]*product-card")[^>]*data-model="([^"]+)"'
    )

    cards = []
    matches = list(card_pattern.finditer(html))
    if not matches:
        print(f'  SKIP: no cards found')
        return

    for m in matches:
        start = m.start()
        model = m.group(1)
        end = find_card_end(html, start)
        cards.append({'model': model, 'html': html[start:end]})

    # Sort
    cards.sort(key=lambda c: parse_model(c['model']))

    # Get first and last card positions
    first_start = matches[0].start()
    last_end = find_card_end(html, matches[-1].start())

    # Find grid boundaries
    # Grid opens before first card
    grid_open = html.rfind('<div class="grid', 0, first_start)
    if grid_open < 0:
        print(f'  SKIP: grid not found')
        return

    grid_open_tag_end = html.find('>', grid_open) + 1

    # Grid closes after last card - find the </div> that closes the grid
    # Skip past the last card's own closing divs
    after_last = html[last_end:]
    # The next </div> should be the grid close
    grid_close = after_last.find('</div>')
    if grid_close < 0:
        print(f'  SKIP: grid close not found')
        return
    grid_close_pos = last_end + grid_close + 6

    # Rebuild
    sorted_cards_html = '\n'.join(c['html'] for c in cards)
    new_html = html[:grid_open_tag_end] + '\n' + sorted_cards_html + '\n' + html[grid_close_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)

    print(f'  OK: {len(cards)} cards sorted | {cards[0]["model"]} -> {cards[-1]["model"]}')

# Main
category_files = sorted(glob.glob(os.path.join(REPO, 'category-*.html')))
print(f'Processing {len(category_files)} category pages...\n')

for f in category_files:
    name = os.path.basename(f)
    print(f'{name}:')
    sort_category_page(f)

print('\nDone.')
