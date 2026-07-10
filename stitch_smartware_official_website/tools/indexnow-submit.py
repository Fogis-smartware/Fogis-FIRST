"""Submit all 283 URLs to IndexNow (Bing + Yandex)"""
import urllib.request
import json
import xml.etree.ElementTree as ET
import sys
import os

# Use proxy for API access
os.environ['http_proxy'] = 'http://127.0.0.1:29290'
os.environ['https_proxy'] = 'http://127.0.0.1:29290'

INDEXNOW_API = "https://api.indexnow.org/indexnow"
KEY = "b41cd2092c752f9cfb2bc47db803261b"
HOST = "www.smartware-official.com"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
SITEMAP_PATH = r"D:\GIT\sitemap.xml"

# Parse sitemap to get all URLs
print("Parsing sitemap...")
tree = ET.parse(SITEMAP_PATH)
root = tree.getroot()
ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

urls = []
for url_elem in root.findall('ns:url', ns):
    loc = url_elem.find('ns:loc', ns)
    if loc is not None and loc.text:
        urls.append(loc.text.strip())

print(f"Found {len(urls)} URLs in sitemap")

# IndexNow accepts up to 10,000 URLs per request
payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": KEY_LOCATION,
    "urlList": urls
}

print(f"Submitting {len(urls)} URLs to IndexNow...")
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(
    INDEXNOW_API,
    data=data,
    headers={
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Smartware-IndexNow/1.0'
    },
    method='POST'
)

try:
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode()
        print(f"SUCCESS: HTTP {resp.status}")
        print(f"Body: {body}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code}: {body}")
except Exception as e:
    print(f"Error: {e}")

print(f"\nKey file: https://{HOST}/{KEY}.txt")
