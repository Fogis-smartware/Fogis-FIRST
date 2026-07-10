import re, urllib.request

headers = {'User-Agent': 'Mozilla/5.0'}
url = 'https://www.sst-smartware.com/Product/639444.html?PageNo=4&ClassID=639444'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

# Test 1: any href containing ET3
matches1 = re.findall(r"""href=['"]([^'"]*ET\d[^'"]*)['"]""", html)
print(f'Pattern 1 (any ET href): {len(matches1)} matches')
for m in matches1[:10]:
    print(f'  {m}')

# Test 2: PG pattern
matches2 = re.findall(r"""href=['"]/?([^'"]*ET\d[^'"]*-PG\d+)['"]""", html)
print(f'\nPattern 2 (PG pattern): {len(matches2)} matches')
for m in matches2[:10]:
    print(f'  {m}')

# Test 3: model + PG extracted
matches3 = re.findall(r"""href=['"]/?(ET\d+-[A-Z]\d+(?:-\d+)?(?:[ABR][A-Za-z]*)?)-PG(\d+)['"]""", html)
print(f'\nPattern 3 (model + PG ID): {len(matches3)} matches')
for m in matches3[:10]:
    print(f'  Model={m[0]}  PG={m[1]}')
