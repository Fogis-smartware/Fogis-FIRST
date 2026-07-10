"""
Fix: Insert missing grid-closing </div> before Load More in all sorted category pages.
Original structure: 2 card-closing </div>s + blank line + TAB-indented </div> + Load More
Current (broken):   2 card-closing </div>s + blank line + Load More (grid close missing)
"""
import re, glob, os

REPO = r'D:\GIT'
category_files = sorted(glob.glob(os.path.join(REPO, 'category-*.html')))

fixed = 0
for filepath in category_files:
    name = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find Load More position
    lm = html.find('<!-- Load More Container -->')
    if lm < 0:
        continue

    # Check the 50 chars before Load More
    before = html[max(0, lm-80):lm]
    # Count </div> occurrences
    div_count = before.count('</div>')

    # We should see 2 card-closing + 1 grid-closing = 3 </div> near the end
    # If only 2, grid close is missing
    if div_count >= 3:
        continue  # already correct

    # Insert </div> before the blank line that precedes Load More
    # Find the position: after the 2nd </div> + blank line, before Load More
    # Pattern: </div>\n</div>\n\n<!-- Load More -->
    # Should be: </div>\n</div>\n</div>\n<!-- Load More -->
    pattern = r'(\n</div>\n</div>\n)(\n?<!-- Load More Container -->)'
    replacement = r'\1</div>\n\2'
    new_html = re.sub(pattern, replacement, html)

    if new_html != html:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_html)
        fixed += 1
        print(f'{name}: FIXED')
    else:
        # Try alternative pattern (without blank line)
        pattern2 = r'(\n</div>\n</div>\n)(<!-- Load More Container -->)'
        replacement2 = r'\1</div>\n\2'
        new_html2 = re.sub(pattern2, replacement2, html)
        if new_html2 != html:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_html2)
            fixed += 1
            print(f'{name}: FIXED (alt pattern)')
        else:
            print(f'{name}: no match - div_count={div_count}, before={repr(before[-60:])}')

print(f'\nFixed {fixed} files')
