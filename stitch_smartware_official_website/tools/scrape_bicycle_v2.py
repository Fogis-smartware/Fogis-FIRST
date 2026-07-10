"""
Scrape bicycle product details - v2: handle both URL patterns
Pattern A: /MODEL-PG{ID} (newer products)
Pattern B: /ProductDetail/{ID}.html (older products)
"""
import re
import urllib.request
import urllib.error
import time
import json
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

# Sub-category pages to scrape
sub_cat_pages = [
    ('639444', 'LED Bicycle Front Light', 8),
    ('639446', 'LED Bicycle Rear Light', 2),
    ('639452', 'Mobile Holder', 2),
    ('639462', 'Bicycle pumps', 1),
]

all_products = {}  # model -> {detail_url, category, product_name, images}

print("=" * 60)
print("PHASE A: Extract product detail URLs from category pages")
print("=" * 60)

for cat_id, cat_name, total_pages in sub_cat_pages:
    print(f"\n--- {cat_name} (ID={cat_id}) ---")

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

                # Strategy: find all product cards and extract model + URL
                # Look for <a> tags that have an ET model in href or nearby

                # Pattern A: /MODEL-PG{ID}
                pattern_a = re.findall(
                    r"""href=['"]/?(ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)-PG(\d+)['"]""",
                    html
                )

                # Pattern B: /ProductDetail/{ID}.html
                # Need to associate model names (from alt text) with their parent <a> href
                # Parse line by line: find <a href="/ProductDetail/XXX.html"> and nearby alt="MODEL"
                pattern_b = []

                # Find all ProductDetail links and nearby model references
                pd_blocks = re.findall(
                    r"""<a\s+href=['"]/ProductDetail/(\d+)\.html['"][^>]*>.*?alt=['"](ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)['"]""",
                    html, re.DOTALL
                )

                # Also try: find alt text model near a link (broader search)
                # Split HTML into chunks around each ProductDetail link
                pd_links = list(re.finditer(r"""<a\s+href=['"]/ProductDetail/(\d+)\.html['"]""", html))
                model_refs = list(re.finditer(r"""alt=['"](ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)['"]""", html))

                # Associate models with nearest preceding ProductDetail link
                for mr in model_refs:
                    model = mr.group(1)
                    if model.startswith('ET1-'):
                        continue
                    # Find closest preceding PD link
                    best_pd = None
                    best_dist = 99999
                    for pd in pd_links:
                        if pd.end() < mr.start() and (mr.start() - pd.end()) < best_dist:
                            best_dist = mr.start() - pd.end()
                            best_pd = pd
                    if best_pd and best_dist < 2000:  # within 2000 chars
                        pd_id = best_pd.group(1)
                        pattern_b.append((model, pd_id))

                count = 0
                # Pattern A results
                for model, pg_id in pattern_a:
                    if not model.startswith('ET1-'):
                        all_products[model] = {
                            'detail_url': f'/{model}-PG{pg_id}',
                            'category': cat_name,
                            'cat_id': cat_id,
                        }
                        count += 1

                # Pattern B results
                for model, pd_id in pattern_b:
                    if model not in all_products and not model.startswith('ET1-'):
                        all_products[model] = {
                            'detail_url': f'/ProductDetail/{pd_id}.html',
                            'category': cat_name,
                            'cat_id': cat_id,
                        }
                        count += 1

                print(f"  Page {page}: {count} products (HTTP 200) - A:{len(pattern_a)} B:{len(pattern_b)}")
                break
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    retries += 1
                else:
                    print(f"  Page {page}: HTTP {e.code}")
                    break
            except Exception as e:
                print(f"  Page {page}: {e}")
                retries += 1

        time.sleep(3)

print(f"\nTotal products found: {len(all_products)}")

# Save
os.makedirs('tools', exist_ok=True)
with open('tools/bicycle_product_urls.json', 'w') as f:
    json.dump(all_products, f, indent=2)
print("Saved to tools/bicycle_product_urls.json")

# Phase B: Scrape detail pages (only for missing products)
print(f"\n{'=' * 60}")
print("PHASE B: Scrape detail pages")
print(f"{'=' * 60}")

# Only scrape the 63 missing products (ET3-E001 to E064)
missing_models = [m for m in all_products if m.startswith('ET3-E0') or m.startswith('ET3-E1')]
missing_models = [m for m in missing_models if m not in [
    'ET3-E065','ET3-E066','ET3-E067','ET3-E067-1','ET3-E067-2','ET3-E068',
    'ET3-E074','ET3-E076','ET3-E077','ET3-E078','ET3-E079','ET3-E080',
    'ET3-E081','ET3-E082','ET3-E083','ET3-E084','ET3-E085','ET3-E086',
    'ET3-E087-1','ET3-E087-2','ET3-E088-1','ET3-E088-2','ET3-E089-1','ET3-E089-2',
]]

# Also include the existing 72 that we want to verify
# Actually, let's scrape ALL 135 to have complete data
to_scrape = list(all_products.keys())
print(f"Products to scrape: {len(to_scrape)}")

success = 0
failed = []

for i, model in enumerate(sorted(to_scrape)):
    info = all_products[model]
    detail_url = f"https://www.sst-smartware.com{info['detail_url']}"

    retries = 0
    ok = False

    while retries <= 2:
        if retries > 0:
            time.sleep(20 * retries)

        try:
            req = urllib.request.Request(detail_url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode('utf-8', errors='ignore')

            # Extract title
            title_match = re.search(r'<title>([^<]+)</title>', html)
            info['title'] = title_match.group(1) if title_match else ''

            # Extract product name from H1 or heading
            h1_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
            info['h1'] = h1_match.group(1) if h1_match else ''

            # Extract images
            imgs = re.findall(r"""src=['"]([^'"]*?(?:img-for-hk|ET\d)[^'"]*?\.(?:jpg|jpeg|png|webp))['"]""", html, re.IGNORECASE)
            info['images'] = list(set(imgs))[:20]

            # Extract any spec/param content
            # Look for product name, model, description
            desc_blocks = re.findall(r'<p[^>]*>([^<]{15,200})</p>', html)
            info['paragraphs'] = desc_blocks[:10]

            # Look for tables
            tables = re.findall(r'<td[^>]*>([^<]+)</td>', html)
            info['table_cells'] = tables[:30]

            success += 1
            ok = True
            break

        except urllib.error.HTTPError as e:
            if e.code == 429:
                retries += 1
            else:
                failed.append({'model': model, 'error': f'HTTP {e.code}'})
                break
        except Exception as e:
            if retries >= 2:
                failed.append({'model': model, 'error': str(e)})
            retries += 1

    if (i + 1) % 10 == 0:
        print(f"  Progress: {i+1}/{len(to_scrape)} (ok={success}, fail={len(failed)})")

    time.sleep(1.5)

print(f"\n{'=' * 60}")
print(f"DETAIL SCRAPE COMPLETE")
print(f"  Success: {success}/{len(to_scrape)}")
print(f"  Failed: {len(failed)}")
if failed:
    print(f"  Failures:")
    for f in failed:
        print(f"    {f['model']}: {f['error']}")

# Save final
with open('tools/bicycle_products_full.json', 'w', encoding='utf-8') as f:
    json.dump({'products': all_products, 'success': success, 'failed': failed}, f, indent=2, ensure_ascii=False)
print("Saved to tools/bicycle_products_full.json")
