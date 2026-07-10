"""
CDP browser scraper via WebSocket.
Opens each old site bicycle product page in Chrome,
extracts all rendered content, saves per-product data.
"""
import json, os, sys, time, urllib.request, urllib.error, urllib.parse
from websocket import create_connection

CDP_HTTP = 'http://127.0.0.1:9222'
TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(TOOLS_DIR, 'bicycle_pages_data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def cdp_http(path, method='GET'):
    """Simple HTTP request to CDP endpoint."""
    req = urllib.request.Request(f'{CDP_HTTP}{path}', method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def new_tab(url):
    """Create a new tab navigating to URL."""
    encoded = urllib.parse.quote(url, safe='')
    return cdp_http(f'/json/new?{encoded}', method='PUT')

def close_tab(tab_id):
    try:
        req = urllib.request.Request(f'{CDP_HTTP}/json/close/{tab_id}', method='PUT')
        urllib.request.urlopen(req)
    except:
        pass

class CDPTab:
    """Wraps a CDP WebSocket connection to a single tab."""
    def __init__(self, ws_url):
        self.ws = create_connection(ws_url, timeout=30)
        self._id = 0

    def send(self, method, params=None):
        self._id += 1
        msg = {'id': self._id, 'method': method}
        if params:
            msg['params'] = params
        self.ws.send(json.dumps(msg))

    def recv_until(self, expected_id, timeout=20):
        """Receive messages until we get a response for expected_id."""
        self.ws.settimeout(timeout)
        result = None
        start = time.time()
        while time.time() - start < timeout:
            try:
                data = json.loads(self.ws.recv())
                if data.get('id') == expected_id:
                    result = data.get('result', {})
                    break
                # Also watch for Page.loadEventFired
                if data.get('method') == 'Page.loadEventFired':
                    pass  # keep waiting
            except Exception as e:
                if 'timed out' in str(e).lower():
                    continue
                break
        return result

    def enable(self, domain):
        self.send(f'{domain}.enable')
        return self.recv_until(self._id)

    def navigate(self, url):
        self.send('Page.navigate', {'url': url})
        return self.recv_until(self._id)

    def evaluate(self, expression):
        self.send('Runtime.evaluate', {'expression': expression, 'returnByValue': True})
        return self.recv_until(self._id)

    def screenshot(self):
        self.send('Page.captureScreenshot', {'format': 'png'})
        return self.recv_until(self._id)

    def close(self):
        try:
            self.ws.close()
        except:
            pass


def scrape_one_product(model, detail_url):
    """Scrape a single product page via CDP."""
    full_url = f"https://www.sst-smartware.com{detail_url}"
    result = {'model': model, 'url': full_url}

    tab_info = None
    cdp = None
    try:
        # Create tab
        tab_info = new_tab(full_url)
        ws_url = tab_info['webSocketDebuggerUrl']

        # Connect and enable domains
        cdp = CDPTab(ws_url)
        cdp.enable('Page')
        cdp.enable('Runtime')

        # Wait for page to fully render
        time.sleep(4)

        # Extract rendered text
        text_result = cdp.evaluate('document.body?.innerText || ""')
        if text_result and 'result' in text_result:
            result['innerText'] = text_result['result'].get('value', '')[:3000]

        # Extract all image URLs
        img_result = cdp.evaluate(
            'Array.from(document.querySelectorAll("img")).map(i => i.src).filter(s => s.includes("ET") || s.includes("img-for-hk"))'
        )
        if img_result and 'result' in img_result:
            result['images'] = img_result['result'].get('value', [])

        # Extract title
        title_result = cdp.evaluate('document.title || ""')
        if title_result and 'result' in title_result:
            result['title'] = title_result['result'].get('value', '')

        # Extract all links
        links_result = cdp.evaluate(
            'Array.from(document.querySelectorAll("a")).map(a => ({href: a.href, text: a.innerText.trim()})).filter(l => l.text.length > 0).slice(0, 20)'
        )
        if links_result and 'result' in links_result:
            result['links'] = links_result['result'].get('value', [])

        # Extract H1
        h1_result = cdp.evaluate(
            'Array.from(document.querySelectorAll("h1,h2,h3")).map(h => ({tag: h.tagName, text: h.innerText.trim()})).filter(h => h.text.length > 0)'
        )
        if h1_result and 'result' in h1_result:
            result['headings'] = h1_result['result'].get('value', [])

        # Extract any div with product info class
        div_result = cdp.evaluate(
            'Array.from(document.querySelectorAll("[class*=\"pro\"], [class*=\"detail\"], [class*=\"spec\"], [class*=\"desc\"]")).map(d => ({cls: d.className, text: d.innerText.trim().slice(0, 500)})).filter(d => d.text.length > 10).slice(0, 10)'
        )
        if div_result and 'result' in div_result:
            result['productDivs'] = div_result['result'].get('value', [])

        # Take screenshot (base64)
        shot = cdp.screenshot()
        if shot and 'data' in shot:
            result['screenshot'] = shot['data'][:100] + '...'  # Just flag existence

        result['status'] = 'success'

    except Exception as e:
        result['status'] = 'error'
        result['error'] = str(e)

    finally:
        if cdp:
            cdp.close()
        if tab_info:
            close_tab(tab_info['id'])

    return result


def main():
    # Load product URLs
    with open(os.path.join(TOOLS_DIR, 'bicycle_product_urls.json')) as f:
        all_data = json.load(f)

    # 63 missing models
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

    print(f"Total to scrape: {len(missing)}")
    print(f"Range: {missing[0]} to {missing[-1]}")
    print(f"Output dir: {OUTPUT_DIR}")
    print("=" * 60)

    all_results = {}
    success = 0
    fail = 0

    for i, model in enumerate(missing):
        detail_url = all_data[model]['detail_url']
        print(f"[{i+1}/{len(missing)}] {model} ... ", end='', flush=True)

        result = scrape_one_product(model, detail_url)
        all_results[model] = result

        if result['status'] == 'success':
            success += 1
            text_len = len(result.get('innerText', ''))
            img_count = len(result.get('images', []))
            print(f"OK | text={text_len} chars | images={img_count}")
        else:
            fail += 1
            print(f"FAIL: {result.get('error', 'unknown')}")

        # Save incrementally every 5 products
        if (i + 1) % 5 == 0 or i == len(missing) - 1:
            with open(os.path.join(OUTPUT_DIR, 'all_results.json'), 'w', encoding='utf-8') as f:
                json.dump({'success': success, 'fail': fail, 'results': all_results}, f, indent=2, ensure_ascii=False)
            print(f"  [saved checkpoint: {success} ok, {fail} fail]")

        # Small delay between products
        time.sleep(1)

    print(f"\n{'=' * 60}")
    print(f"DONE. Success: {success}, Failed: {fail}")
    print(f"Results saved to: {OUTPUT_DIR}/all_results.json")


if __name__ == '__main__':
    main()
