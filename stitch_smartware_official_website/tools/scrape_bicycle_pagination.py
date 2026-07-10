"""
Step 2 (checklist): Exhaustive pagination for ALL bicycle sub-categories
- Same-page retry on 429
- Detailed HTTP status + count logging
- Empty page = stop
"""
import re
import urllib.request
import urllib.error
import time
import sys

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

sub_cats = {
    '639444': 'LED Bicycle Front Light',
    '639446': 'LED Bicycle Rear Light',
    '639452': 'Mobile Holder',
    '639462': 'Bicycle pumps',
}

all_results = {}
grand_total = 0

for cat_id, cat_name in sub_cats.items():
    print(f'\n{"="*60}')
    print(f'SUB-CATEGORY: {cat_name} (ID={cat_id})')
    print(f'{"="*60}')

    cat_products = []
    page = 1

    while page <= 20:
        if page == 1:
            url = f'https://www.sst-smartware.com/Product/{cat_id}.html'
        else:
            url = f'https://www.sst-smartware.com/Product/{cat_id}.html?PageNo={page}&ClassID={cat_id}'

        retries = 0
        success = False

        while retries <= 2:
            if retries > 0:
                wait = 20 if retries == 1 else 30
                print(f'  [RETRY {retries}/2] waiting {wait}s...')
                time.sleep(wait)

            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as resp:
                    http_status = resp.status
                    html = resp.read().decode('utf-8', errors='ignore')

                # Extract models, filter out ET1 cross-promotions
                all_models = re.findall(r'(ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)', html)
                seen = set()
                unique = []
                for m in all_models:
                    if m not in seen:
                        seen.add(m)
                        unique.append(m)
                actual = [m for m in unique if not m.startswith('ET1-')]

                print(f'  PageNo={page} | HTTP={http_status} | Products={len(actual)} | retries={retries}')

                if len(actual) == 0:
                    print(f'  -> EMPTY PAGE, stopping "{cat_name}"')
                    success = True
                    page = 99  # break outer loop
                else:
                    cat_products.extend(actual)
                    success = True

                break  # exit retry loop

            except urllib.error.HTTPError as e:
                print(f'  PageNo={page} | HTTP={e.code} **NON-200** | retries={retries} | URL={url}')
                if e.code == 429:
                    retries += 1
                    # stay on same page, retry
                else:
                    print(f'  -> Non-retryable HTTP error, skipping "{cat_name}" remaining pages')
                    page = 99
                    break
            except Exception as e:
                print(f'  PageNo={page} | ERROR={type(e).__name__}: {e} | retries={retries}')
                retries += 1

        if not success and retries > 2:
            print(f'  -> FAILED after 2 retries, recording and moving to next sub-category')
            break

        if page == 99:
            break

        page += 1
        time.sleep(4)  # normal delay between pages

    unique_cat = list(dict.fromkeys(cat_products))
    all_results[cat_name] = unique_cat
    grand_total += len(unique_cat)
    print(f'  >> TOTAL for {cat_name}: {len(unique_cat)} unique products')

print(f'\n{"="*60}')
print(f'GRAND TOTAL: {grand_total}')
print(f'Expected: 135 | {"MATCH!" if grand_total == 135 else f"MISMATCH (diff={135-grand_total})"}')
print(f'{"="*60}')
for cat_name, products in all_results.items():
    print(f'  {cat_name}: {len(products)}')

# Save results
import json
with open('tools/bicycle_products_old_site.json', 'w') as f:
    json.dump(all_results, f, indent=2)
print('\nResults saved to tools/bicycle_products_old_site.json')
