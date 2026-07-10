/**
 * Scrape Chinese version of product pages via /cn/ prefix.
 */
const CDP = 'http://127.0.0.1:9222';

async function cdpHttp(pathname, method = 'GET') {
  const resp = await fetch(CDP + pathname, { method });
  return resp.json();
}
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeZhProduct(model, enUrl) {
  // Convert EN URL to CN URL
  // EN: /ProductDetail/10702264.html -> CN: /cn/ProductDetail/10702264.html
  const cnUrl = enUrl.replace('/ProductDetail/', '/cn/ProductDetail/');
  const fullUrl = `https://www.sst-smartware.com${cnUrl}`;
  console.log(`\n=== ${model} ZH ===`);
  console.log(`URL: ${fullUrl}`);

  const tab = await cdpHttp(`/json/new?${encodeURIComponent(fullUrl)}`, 'PUT');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve; ws.onerror = reject;
    setTimeout(() => reject(new Error('timeout')), 10000);
  });

  const pending = new Map();
  let msgId = 0;
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  async function send(method, params) {
    const id = ++msgId;
    return new Promise((resolve, reject) => {
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) { pending.delete(id); reject(new Error('timeout')); }
      }, 15000);
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(6000);

  // Get innerText
  const textRes = await send('Runtime.evaluate', {
    expression: 'document.body?.innerText?.slice(0, 5000) || ""',
    returnByValue: true
  });
  const text = textRes.result?.result?.value || '';
  console.log(`Text length: ${text.length}`);
  console.log(`--- ZH content ---`);
  console.log(text);

  // Check title
  const titleRes = await send('Runtime.evaluate', {
    expression: 'document.title',
    returnByValue: true
  });
  console.log(`\nTitle: ${titleRes.result?.result?.value}`);

  // Check for images
  const imgRes = await send('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s.includes('product') || s.includes('gcdn')).slice(0, 5)`,
    returnByValue: true
  });
  console.log(`Product images: ${(imgRes.result?.result?.value || []).join('\\n  ')}`);

  ws.close();
  try { await cdpHttp(`/json/close/${tab.id}`, 'PUT'); } catch(e) {}

  return text;
}

async function main() {
  // Test with E001 and E017
  await scrapeZhProduct('ET3-E001', '/ProductDetail/10702264.html');
  console.log('\n' + '='.repeat(60));
  await scrapeZhProduct('ET3-E017', '/ProductDetail/10702280.html');
}

main().catch(e => console.error('FATAL:', e));
