"""
Scrape bicycle product details - v3: fixed regex (single quotes), both URL patterns.
"""
import re
import urllib.request
import urllib.error
import time
import json
import os
import sys

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

# Pattern for MODEL-PG links: href='/ET3-E089-2-PG11205684'
PG_PATTERN = re.compile(r"""href=['"]/?(ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)-PG(\d+)['"]""")

# Pattern for ProductDetail links: href='/ProductDetail/10702305.html'
PD_PATTERN = re.compile(r"""href=['"]/ProductDetail/(\d+)\.html['"]""")

# Pattern for model in alt text
ALT_PATTERN = re.compile(r"""alt=['"](ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)['"]""")

sub_cat_pages = [
    ('639444', 'LED Bicycle Front Light', 8),
    ('639446', 'LED Bicycle Rear Light', 2),
    ('639452', 'Mobile Holder', 2),
    ('639462', 'Bicycle pumps', 1),
]

all_products = {}

def fetch(url, max_retries=3):
    """Fetch URL with retry on 429."""
    for attempt in range(max_retries + 1):
        if attempt > 0:
            wait = 30 * attempt
            print(f'    [retry {attempt}/{max_retries}] waiting {wait}s...', flush=True)
            time.sleep(wait)
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except urllib.error.HTTPError as e:
            if e.code == 429:
                continue
            raise
        except Exception:
            if attempt >= max_retries:
                raise
    return None

# ================================================================
# PHASE A: Extract product URLs from category listing pages
# ================================================================
print("=" * 60, flush=True)
print("PHASE A: Extract product detail URLs", flush=True)
print("=" * 60, flush=True)

for cat_id, cat_name, total_pages in sub_cat_pages:
    print(f"\n--- {cat_name} (ID={cat_id}, {total_pages} pages) ---", flush=True)

    for page in range(1, total_pages + 1):
        if page == 1:
            url = f'https://www.sst-smartware.com/Product/{cat_id}.html'
        else:
            url = f'https://www.sst-smartware.com/Product/{cat_id}.html?PageNo={page}&ClassID={cat_id}'

        html = fetch(url)
        if not html:
            print(f"  Page {page}: FAILED after retries", flush=True)
            continue

        # Method 1: MODEL-PG links
        pg_matches = PG_PATTERN.findall(html)
        # Method 2: ProductDetail links (need to associate with alt models)
        pd_matches = PD_PATTERN.findall(html)
        # Alt models for association
        alt_matches = list(ALT_PATTERN.finditer(html))

        count_a = 0
        count_b = 0

        # Process MODEL-PG links
        for model, pg_id in pg_matches:
            if model.startswith('ET1-'):
                continue
            model_upper = model.upper()
            if model_upper not in all_products:
                all_products[model_upper] = {
                    'detail_url': f'/{model}-PG{pg_id}',
                    'category': cat_name,
                }
                count_a += 1

        # Process ProductDetail links + associate with alt models
        if pd_matches and len(alt_matches) > 0:
            pd_positions = [(int(m.group(1)), m.end()) for m in re.finditer(r"""href=['"]/ProductDetail/(\d+)\.html['"]""", html)]
            alt_positions = [(m.group(1), m.start()) for m in ALT_PATTERN.finditer(html)]

            for model, alt_pos in alt_positions:
                if model.startswith('ET1-'):
                    continue
                model_upper = model.upper()
                if model_upper in all_products:
                    continue
                # Find closest preceding PD link
                best_pd_id = None
                best_dist = 99999
                for pd_id, pd_end in pd_positions:
                    dist = alt_pos - pd_end
                    if 0 < dist < best_dist:
                        best_dist = dist
                        best_pd_id = pd_id
                if best_pd_id and best_dist < 3000:
                    all_products[model_upper] = {
                        'detail_url': f'/ProductDetail/{best_pd_id}.html',
                        'category': cat_name,
                    }
                    count_b += 1

        print(f"  Page {page}: HTTP 200 | PG={count_a} PD={count_b} | Total so far={len(all_products)}", flush=True)
        time.sleep(4)  # Delay between pages

# Also need alt-only pages (no links matched)
# If page 1 already got 12 with PG, but we're missing models from alt text
# Check for alt models that weren't captured
if len(all_products) < 12 * total_pages:
    print(f"\n  Warning: Only {len(all_products)} products found. Expected more.", flush=True)

print(f"\nTotal products in Phase A: {len(all_products)}", flush=True)

# Save URLs
os.makedirs('tools', exist_ok=True)
with open('tools/bicycle_product_urls.json', 'w') as f:
    json.dump(all_products, f, indent=2)
print("Saved URLs to tools/bicycle_product_urls.json", flush=True)

# ================================================================
# PHASE B: Scrape detail pages
# ================================================================
print(f"\n{'=' * 60}", flush=True)
print(f"PHASE B: Scrape {len(all_products)} product detail pages", flush=True)
print(f"{'=' * 60}", flush=True)

success = 0
failed = []

for i, (model, info) in enumerate(sorted(all_products.items())):
    detail_url = f"https://www.sst-smartware.com{info['detail_url']}"

    html = fetch(detail_url, max_retries=2)
    if not html:
        failed.append({'model': model, 'error': 'All retries exhausted'})
        continue

    # Extract data
    title_m = re.search(r'<title>([^<]+)</title>', html)
    info['page_title'] = title_m.group(1).strip() if title_m else ''

    h1_m = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
    info['h1'] = h1_m.group(1).strip() if h1_m else ''

    # Product name (typically in a name div)
    name_m = re.search(r'class=["\']pro-?name["\'][^>]*>([^<]+)', html, re.IGNORECASE)
    info['pro_name'] = name_m.group(1).strip() if name_m else ''

    # Description paragraphs
    descs = re.findall(r'<p[^>]*>([^<]{20,300})</p>', html)
    info['descriptions'] = descs[:5]

    # Images
    imgs = re.findall(r"""src=['"]([^'"]*?(?:img-for-hk|ET\d)[^'"]*?\.(?:jpg|jpeg|png|webp))['"]""", html, re.IGNORECASE)
    info['images'] = list(set(imgs))[:10]

    # Table rows
    trs = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL)
    info['table_rows'] = len(trs)

    success += 1

    if (i + 1) % 20 == 0:
        print(f"  Progress: {i+1}/{len(all_products)} (ok={success}, fail={len(failed)})", flush=True)

    time.sleep(2)

print(f"\nDETAIL SCRAPE COMPLETE", flush=True)
print(f"  Success: {success}/{len(all_products)}", flush=True)
print(f"  Failed: {len(failed)}", flush=True)
if failed:
    print(f"  Failures:", flush=True)
    for f in failed:
        print(f"    {f['model']}: {f['error']}", flush=True)

# Save
with open('tools/bicycle_products_full.json', 'w', encoding='utf-8') as f:
    json.dump({'products': all_products, 'success': success, 'failed': failed}, f, indent=2, ensure_ascii=False)
print("Saved to tools/bicycle_products_full.json", flush=True)
