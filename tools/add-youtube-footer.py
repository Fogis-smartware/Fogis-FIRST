"""Add YouTube link to footer after LinkedIn link in all HTML pages."""
import re
from pathlib import Path

ROOT = Path(r'D:\GIT')
YOUTUBE_ITEM = '''<li class="flex items-center gap-3 text-secondary">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#FF0000" style="flex-shrink:0"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
<a href="https://www.youtube.com/@Smartware-official" target="_blank" rel="noopener" class="hover:text-primary transition-colors">Smartware Official</a>
                    </li>
'''

LINKEDIN_HREF = 'href="https://www.linkedin.com/company/shenzhen-smartware-technology-co-ltd"'

# Pattern 1: LinkedIn <a>...</a> followed by </li> (content pages)
PATTERN1 = re.compile(
    r'(<a ' + re.escape(LINKEDIN_HREF) + r'[^<]*?</a>)\s*</li>',
    re.DOTALL
)
# Pattern 2: LinkedIn <a>...</a> followed by </ul> (product/category pages — no explicit </li>)
PATTERN2 = re.compile(
    r'(<a ' + re.escape(LINKEDIN_HREF) + r'[^<]*?</a>)\s*(</ul>)',
    re.DOTALL
)

html_files = sorted(ROOT.glob('*.html'))
count = 0

for fpath in html_files:
    content = fpath.read_text(encoding='utf-8')

    if 'youtube.com/@Smartware-official' in content:
        print(f'SKIP: {fpath.name}')
        continue

    new_content = PATTERN1.sub(
        lambda m: m.group(0) + '\n' + YOUTUBE_ITEM,
        content,
        count=1
    )

    if new_content == content:
        # Try pattern 2: insert YouTube </li> before </ul>
        new_content = PATTERN2.sub(
            lambda m: m.group(1) + '</li>\n' + YOUTUBE_ITEM + '\n' + m.group(2),
            content,
            count=1
        )

    if new_content != content:
        fpath.write_text(new_content, encoding='utf-8')
        count += 1
    else:
        print(f'WARN: {fpath.name}')

print(f'\nDone. Updated {count} files.')
