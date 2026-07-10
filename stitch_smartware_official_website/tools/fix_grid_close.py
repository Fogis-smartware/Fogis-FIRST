"""
Fix missing grid </div> before Load More container in all category pages.
The sort script accidentally consumed the grid-closing </div>.
"""
import re, glob, os

REPO = r'D:\GIT'

category_files = glob.glob(os.path.join(REPO, 'category-*.html'))

fixed = 0
for filepath in category_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    name = os.path.basename(filepath)

    # Find Load More container
    load_more = html.find('<!-- Load More Container -->')
    if load_more < 0:
        print(f'{name}: no Load More, skip')
        continue

    # Check if grid </div> exists right before Load More
    before = html[:load_more].rstrip()
    if before.endswith('</div>'):
        print(f'{name}: already has </div> before Load More')
        continue

    # Check what's right before the Load More comment
    chunk = html[max(0, load_more-100):load_more]
    # Count </div> tags after the last product card
    # We need exactly the grid's </div> between last card and Load More

    # Find the last product card's closing (should be 2 closing </div> tags)
    # Then we need one more </div> for the grid
    # Look at the pattern: the last card ends with </div>\n</div>\n then should have </div>\n<!-- Load More

    # Simple fix: add </div> before Load More only if it's missing
    # Check if there are already 3 closing divs before Load More
    snippet = html[max(0, load_more-200):load_more]
    closing_divs = len(re.findall(r'</div>', snippet))
    # Last card typically has 2 closing divs + 1 grid div = 3
    # If we see only 2, the grid div is missing

    if closing_divs < 3:
        # Insert </div> before the Load More comment
        insert_pos = load_more
        # Keep preceding newlines
        while insert_pos > 0 and html[insert_pos-1] in (' ', '\t'):
            insert_pos -= 1
        newline_pos = html.rfind('\n', 0, insert_pos)
        if newline_pos > 0:
            html = html[:newline_pos+1] + '</div>\n' + html[newline_pos+1:]
        else:
            html = html[:insert_pos] + '</div>\n' + html[insert_pos:]
        fixed += 1
        print(f'{name}: FIXED (added grid </div>)')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
    else:
        print(f'{name}: OK ({closing_divs} closing divs before Load More)')

print(f'\nFixed {fixed} files')
