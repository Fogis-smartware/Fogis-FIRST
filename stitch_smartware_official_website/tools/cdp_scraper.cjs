/**
 * CDP Browser Scraper - Node.js
 * Opens each old site bicycle product page in Chrome,
 * extracts all rendered content via CDP WebSocket.
 * Saves per-product data to JSON.
 */
const fs = require('fs');
const path = require('path');

const CDP = 'http://127.0.0.1:9222';
const TOOLS = __dirname;
const OUT = path.join(TOOLS, 'bicycle_pages_data');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Load product URLs
const allData = JSON.parse(fs.readFileSync(path.join(TOOLS, 'bicycle_product_urls.json'), 'utf8'));

// 63 missing models (ET3-E001 to E064)
const exclude = new Set([
  'ET3-E065','ET3-E066','ET3-E067','ET3-E067-1','ET3-E067-2','ET3-E068',
  'ET3-E074','ET3-E076','ET3-E077','ET3-E078','ET3-E079','ET3-E080',
  'ET3-E081','ET3-E082','ET3-E083','ET3-E084','ET3-E085','ET3-E086',
  'ET3-E087-1','ET3-E087-2','ET3-E088-1','ET3-E088-2','ET3-E089-1','ET3-E089-2',
]);

const missing = Object.keys(allData)
  .filter(m => (m.startsWith('ET3-E0') || m.startsWith('ET3-E1')) && !exclude.has(m))
  .sort();

console.log(`Total to scrape: ${missing.length}`);
console.log(`Range: ${missing[0]} to ${missing[missing.length-1]}`);
console.log(`Output: ${OUT}`);
console.log('='.repeat(60));

// ---------- CDP helpers ----------
async function cdpHttp(pathname, method = 'GET') {
  const resp = await fetch(`${CDP}${pathname}`, { method });
  return resp.json();
}

async function newTab(url) {
  return cdpHttp(`/json/new?${encodeURIComponent(url)}`, 'PUT');
}

async function closeTab(id) {
  try { await cdpHttp(`/json/close/${id}`, 'PUT'); } catch(e) {}
}

function cdpWS(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  let id = 0;

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  return {
    async connect() {
      return new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = reject;
        setTimeout(() => reject(new Error('WS timeout')), 10000);
      });
    },
    async send(method, params) {
      const msgId = ++id;
      return new Promise((resolve, reject) => {
        pending.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
        setTimeout(() => {
          if (pending.has(msgId)) {
            pending.delete(msgId);
            reject(new Error(`Timeout: ${method}`));
          }
        }, 15000);
      });
    },
    close() {
      try { ws.close(); } catch(e) {}
    }
  };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ---------- Scrape one product ----------
async function scrapeProduct(model, detailUrl) {
  const fullUrl = `https://www.sst-smartware.com${detailUrl}`;
  const result = { model, url: fullUrl };
  let tab = null;
  let cdp = null;

  try {
    // Open tab
    tab = await newTab(fullUrl);
    const wsUrl = tab.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error('No WS URL');

    // Connect WS
    cdp = cdpWS(wsUrl);
    await cdp.connect();

    // Enable domains
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // Wait for page to render
    await sleep(6000);

    // Get innerText
    const textRes = await cdp.send('Runtime.evaluate', {
      expression: 'document.body?.innerText?.slice(0, 3000) || ""',
      returnByValue: true
    });
    result.innerText = textRes.result?.result?.value || '';

    // Get title
    const titleRes = await cdp.send('Runtime.evaluate', {
      expression: 'document.title || ""',
      returnByValue: true
    });
    result.title = titleRes.result?.result?.value || '';

    // Get all images
    const imgRes = await cdp.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('img')).map(i => ({
        src: i.src,
        alt: i.alt || '',
        width: i.naturalWidth || i.width,
        height: i.naturalHeight || i.height
      }))`,
      returnByValue: true
    });
    result.images = imgRes.result?.result?.value || [];

    // Get all headings
    const hRes = await cdp.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => ({
        tag: h.tagName,
        text: h.innerText.trim()
      })).filter(h => h.text.length > 0)`,
      returnByValue: true
    });
    result.headings = hRes.result?.result?.value || [];

    // Get all links
    const linkRes = await cdp.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.innerText.trim().slice(0, 200)
      })).filter(l => l.text.length > 0).slice(0, 30)`,
      returnByValue: true
    });
    result.links = linkRes.result?.result?.value || [];

    // Get all <p> text
    const pRes = await cdp.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(t => t.length > 10).slice(0, 20)`,
      returnByValue: true
    });
    result.paragraphs = pRes.result?.result?.value || [];

    // Get ALL text nodes that might contain product info
    const descRes = await cdp.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('*')).filter(el => {
        const cls = (el.className || '').toString().toLowerCase();
        return cls.includes('desc') || cls.includes('spec') || cls.includes('detail') || cls.includes('prod') || cls.includes('param');
      }).map(el => ({ tag: el.tagName, cls: el.className?.toString()?.slice(0,100) || '', text: el.innerText?.trim()?.slice(0,500) || '' })).filter(d => d.text.length > 5).slice(0, 20)`,
      returnByValue: true
    });
    result.productSections = descRes.result?.result?.value || [];

    // Check for iframes
    const iframeRes = await cdp.send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('iframe')).map(f => f.src)`,
      returnByValue: true
    });
    result.iframes = iframeRes.result?.result?.value || [];

    result.status = 'success';

  } catch(e) {
    result.status = 'error';
    result.error = e.message;
  } finally {
    if (cdp) cdp.close();
    if (tab) await closeTab(tab.id);
  }

  return result;
}

// ---------- Main ----------
async function main() {
  const allResults = {};
  let success = 0;
  let fail = 0;

  for (let i = 0; i < missing.length; i++) {
    const model = missing[i];
    const detailUrl = allData[model].detail_url;

    process.stdout.write(`[${i+1}/${missing.length}] ${model} ... `);

    const result = await scrapeProduct(model, detailUrl);
    allResults[model] = result;

    if (result.status === 'success') {
      success++;
      const textLen = (result.innerText || '').length;
      const imgCount = (result.images || []).length;
      console.log(`OK | text=${textLen} chars | images=${imgCount}`);
    } else {
      fail++;
      console.log(`FAIL: ${result.error}`);
    }

    // Save every 5
    if ((i + 1) % 5 === 0 || i === missing.length - 1) {
      fs.writeFileSync(
        path.join(OUT, 'all_results.json'),
        JSON.stringify({ success, fail, results: allResults }, null, 2),
        'utf8'
      );
      console.log(`  [saved: ${success} ok, ${fail} fail]`);
    }

    // Brief delay
    await sleep(1000);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`DONE. Success: ${success}, Failed: ${fail}`);
  console.log(`Results: ${path.join(OUT, 'all_results.json')}`);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
