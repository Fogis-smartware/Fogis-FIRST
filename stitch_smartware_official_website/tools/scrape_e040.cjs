/**
 * Quick scrape of ET3-E040 which was missed by original pagination.
 */
const CDP = 'http://127.0.0.1:9222';
const fs = require('fs');
const path = require('path');

async function cdpHttp(p, m = 'GET') {
  const r = await fetch(CDP + p, { method: m });
  return r.json();
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrape() {
  const url = 'https://www.sst-smartware.com/ProductDetail/10702306.html';
  console.log('Opening:', url);
  const tab = await cdpHttp('/json/new?' + encodeURIComponent(url), 'PUT');

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; setTimeout(() => rej(new Error('timeout')), 10000); });

  const pending = new Map();
  let id = 0;
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  async function send(method, params) {
    const mid = ++id;
    return new Promise((res, rej) => {
      pending.set(mid, res);
      ws.send(JSON.stringify({ id: mid, method, params }));
      setTimeout(() => { if (pending.has(mid)) { pending.delete(mid); rej(new Error('timeout')); } }, 15000);
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(6000);

  const text = await send('Runtime.evaluate', { expression: 'document.body?.innerText?.slice(0, 5000) || ""', returnByValue: true });
  const txt = text.result?.result?.value || '';
  console.log('Text:', txt.length, 'chars');
  console.log(txt);

  const imgs = await send('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s.includes('gcdn.meidianbang.cn') || s.includes('product'))`,
    returnByValue: true
  });
  console.log('Images:', (imgs.result?.result?.value || []).join('\n  '));

  ws.close();
  try { await cdpHttp('/json/close/' + tab.id, 'PUT'); } catch(e) {}
  return txt;
}

scrape().then(() => console.log('Done')).catch(e => console.error(e));
