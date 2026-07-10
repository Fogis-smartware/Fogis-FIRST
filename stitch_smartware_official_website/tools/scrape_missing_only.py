"""
Scrape detail pages for the 63 MISSING bicycle products only.
Long delays (10s) to avoid rate limiting.
Retry 2x with 60s wait on 429.
"""
import re, urllib.request, urllib.error, time, json, os, sys

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# Load Phase A data
with open('tools/bicycle_product_urls.json', 'r') as f:
    all_data = json.load(f)

# 63 missing models (all in ET3-E001 to E064 range)
missing = sorted([
    m for m in all_data
    if m.startswith('ET3-E0') or m.startswith('ET3-E1')
    if m not in [
        'ET3-E065','ET3-E066','ET3-E067','ET3-E067-1','ET3-E067-2','ET3-E068',
        'ET3-E074','ET3-E076','ET3-E077','ET3-E078','ET3-E079','ET3-E080',
        'ET3-E081','ET3-E082','ET3-E083','ET3-E084','ET3-E085','ET3-E086',
        'ET3-E087-1','ET3-E087-2','ET3-E088-1','ET3-E088-2','ET3-E089-1','ET3-E089-2',
    ]
])

print(f"Products to scrape: {len(missing)}", flush=True)
print(f"Range: {missing[0]} to {missing[-1]}", flush=True)

results = {}
success = 0
failed = []

for i, model in enumerate(missing):
    detail_url = f"https://www.sst-smartware.com{all_data[model]['detail_url']}"

    retries = 0
    ok = False

    while retries <= 2:
        if retries > 0:
            wait = 60 * retries
            print(f"  [{model}] retry {retries}/2 waiting {wait}s...", flush=True)
            time.sleep(wait)

        try:
            req = urllib.request.Request(detail_url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode('utf-8', errors='ignore')

            info = {'detail_url': detail_url}

            # Page title
            tm = re.search(r'<title>([^<]+)</title>', html)
            info['title'] = tm.group(1).strip() if tm else ''

            # H1
            hm = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
            info['h1'] = hm.group(1).strip() if hm else ''

            # Product name block
            nm = re.search(r'(?:pro-?name|prod-?name|product-?name)[\"\'][^>]*>([^<]+)', html, re.IGNORECASE)
            info['name_div'] = nm.group(1).strip() if nm else ''

            # Description paragraphs
            descs = re.findall(r'<p[^>]*>([^<]{20,400})</p>', html)
            info['descriptions'] = descs[:8]

            # Images
            imgs = re.findall(r"""src=['"]([^'"]*?(?:img-for-hk|ET\d)[^'"]*?\.(?:jpg|jpeg|png|webp))['"]""", html, re.IGNORECASE)
            info['images'] = list(set(imgs))[:12]

            # Table data
            tds = re.findall(r'<td[^>]*>([^<]+)</td>', html)
            info['td_count'] = len(tds)
            info['td_sample'] = tds[:20]

            # Breadcrumb
            bc = re.findall(r'<a[^>]*>([^<]+)</a>', html)
            info['breadcrumb'] = bc[:5]

            results[model] = info
            success += 1
            ok = True

            status = '200'
            if retries > 0:
                status = f'200(r{retries})'
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

    if not ok and not any(f['model'] == model for f in failed):
        failed.append({'model': model, 'error': 'All retries exhausted'})

    # Progress
    if (i + 1) % 10 == 0 or i < 3:
        avg_title_len = sum(len(r.get('title','')) for r in results.values()) / max(len(results), 1)
        print(f"  [{i+1}/{len(missing)}] {model}: {'OK' if ok else 'FAIL'} | "
              f"ok={success} fail={len(failed)} | avg_title_len={avg_title_len:.0f} | {detail_url}", flush=True)

    time.sleep(10)  # 10s between requests

print(f"\n{'='*60}", flush=True)
print(f"COMPLETE", flush=True)
print(f"  Success: {success}/{len(missing)}", flush=True)
print(f"  Failed: {len(failed)}", flush=True)
if failed:
    print("  Failure list:", flush=True)
    for f in failed:
        print(f"    {f['model']}: {f['error']}", flush=True)

os.makedirs('tools', exist_ok=True)
with open('tools/bicycle_missing_details.json', 'w', encoding='utf-8') as f:
    json.dump({'results': results, 'success': success, 'failed': failed}, f, indent=2, ensure_ascii=False)
print("Saved to tools/bicycle_missing_details.json", flush=True)
