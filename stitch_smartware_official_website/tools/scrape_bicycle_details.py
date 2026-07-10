"""
Step 3: Scrape product detail pages for ALL 135 bicycle products from old site.
- Extract PG IDs from sub-category listing pages
- Visit each product detail page with retry (2x)
- Extract name (EN/ZH), images, specs
- Record failures
"""
import re
import urllib.request
import urllib.error
import time
import json
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
}

# Step A: Extract PG IDs + thumbnail names from all sub-category pages
print("=" * 60)
print("PHASE A: Extract PG IDs from category listing pages")
print("=" * 60)

sub_cat_pages = {
    '639444': ('LED Bicycle Front Light', 8),   # 8 pages
    '639446': ('LED Bicycle Rear Light', 2),     # 2 pages
    '639452': ('Mobile Holder', 2),              # 2 pages
    '639462': ('Bicycle pumps', 1),              # 1 page
}

all_products = {}  # model -> {pg_id, sub_category, thumb_name}

for cat_id, (cat_name, total_pages) in sub_cat_pages.items():
    print(f"\n--- {cat_name} (ID={cat_id}, {total_pages} pages) ---")

    for page in range(1, total_pages + 1):
        if page == 1:
            url = f'https://www.sst-smartware.com/Product/{cat_id}.html'
        else:
            url = f'https://www.sst-smartware.com/Product/{cat_id}.html?PageNo={page}&ClassID={cat_id}'

        retries = 0
        while retries <= 3:
            if retries > 0:
                time.sleep(20 * retries)
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as resp:
                    html = resp.read().decode('utf-8', errors='ignore')

                # Find product links: /MODEL-PGXXXXX
                product_links = re.findall(r'href=\"/(ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)-PG(\d+)\"', html)

                # Also find alt text with model names (for product titles)
                alt_names = re.findall(r'alt=\"(ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)\"', html)

                count = 0
                for model, pg_id in product_links:
                    if not model.startswith('ET1-'):  # Skip cross-promoted
                        all_products[model] = {
                            'pg_id': pg_id,
                            'category': cat_name,
                            'cat_id': cat_id,
                        }
                        count += 1

                print(f"  Page {page}: found {count} products (HTTP 200)")
                break
            except urllib.error.HTTPError as e:
                print(f"  Page {page}: HTTP {e.code}")
                if e.code == 429:
                    retries += 1
                else:
                    break
            except Exception as e:
                print(f"  Page {page}: {e}")
                retries += 1

        time.sleep(3)

print(f"\nTotal products with PG IDs: {len(all_products)}")

# Save PG IDs
os.makedirs('tools', exist_ok=True)
with open('tools/bicycle_pg_ids.json', 'w') as f:
    json.dump(all_products, f, indent=2)
print("Saved PG IDs to tools/bicycle_pg_ids.json")

# Step B: Visit each product detail page
print(f"\n{'=' * 60}")
print(f"PHASE B: Scrape {len(all_products)} product detail pages")
print(f"{'=' * 60}")

success = 0
failed = []

for i, (model, info) in enumerate(sorted(all_products.items())):
    pg_id = info['pg_id']
    url = f'https://www.sst-smartware.com/{model}-PG{pg_id}'

    retries = 0
    ok = False

    while retries <= 2:
        if retries > 0:
            wait = 20 if retries == 1 else 30
            time.sleep(wait)

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode('utf-8', errors='ignore')

            # Extract product name from title
            title_match = re.search(r'<title>([^<]+)</title>', html)
            title = title_match.group(1) if title_match else ''

            # Extract product images (look for img tags with model or product images)
            img_urls = re.findall(r'src=\"([^\"]*?(?:ET\d|img-for-hk)[^\"]*?\.(?:jpg|jpeg|png|webp))\"', html, re.IGNORECASE)

            # Extract description text
            desc_matches = re.findall(r'<p[^>]*>([^<]{20,})</p>', html)

            # Extract any specification table data
            spec_rows = re.findall(r'<tr[^>]*>.*?</tr>', html, re.DOTALL)

            info['detail_url'] = url
            info['title'] = title
            info['images'] = img_urls[:10]  # First 10 images
            info['descriptions'] = desc_matches[:5]  # First 5 paragraphs

            success += 1
            ok = True

            if (i + 1) % 10 == 0:
                print(f"  Progress: {i+1}/{len(all_products)} (success={success}, failed={len(failed)})")

            break

        except urllib.error.HTTPError as e:
            if e.code == 429:
                retries += 1
            else:
                failed.append({'model': model, 'url': url, 'error': f'HTTP {e.code}'})
                break
        except Exception as e:
            if retries >= 2:
                failed.append({'model': model, 'url': url, 'error': str(e)})
            retries += 1

    if not ok and not any(f['model'] == model for f in failed):
        failed.append({'model': model, 'url': url, 'error': 'All retries exhausted'})

    time.sleep(2)  # Rate limit avoidance

print(f"\n{'=' * 60}")
print(f"PHASE B COMPLETE")
print(f"  Success: {success}/{len(all_products)}")
print(f"  Failed: {len(failed)}/{len(all_products)}")
if failed:
    print(f"  Failure list:")
    for f in failed:
        print(f"    {f['model']}: {f['error']}")
print(f"{'=' * 60}")

# Save full details
with open('tools/bicycle_products_full.json', 'w', encoding='utf-8') as f:
    json.dump({'products': all_products, 'success': success, 'failed': failed}, f, indent=2, ensure_ascii=False)
print("Saved full details to tools/bicycle_products_full.json")
