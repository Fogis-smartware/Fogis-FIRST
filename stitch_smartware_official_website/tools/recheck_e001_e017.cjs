/**
 * Re-scrape E001 and E017 with longer wait, language toggle, and screenshots.
 */
const fs = require('fs');
const path = require('path');
const CDP = 'http://127.0.0.1:9222';
const TOOLS = __dirname;

async function cdpHttp(pathname, method = 'GET') {
  const resp = await fetch(CDP + pathname, { method });
  return resp.json();
}
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeWithLangSwitch(model, detailUrl) {
  const fullUrl = `https://www.sst-smartware.com${detailUrl}`;
  console.log(`\n=== ${model} ===`);
  console.log(`URL: ${fullUrl}`);

  // Open tab
  const tab = await cdpHttp(`/json/new?${encodeURIComponent(fullUrl)}`, 'PUT');
  const wsUrl = tab.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
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
  await sleep(6000); // Longer wait

  // ---- EN content ----
  const enText = await send('Runtime.evaluate', {
    expression: 'document.body?.innerText?.slice(0, 5000) || ""',
    returnByValue: true
  });
  const enTextVal = enText.result?.result?.value || '';
  console.log(`EN text: ${enTextVal.length} chars`);

  // Extract EN title
  const titleRes = await send('Runtime.evaluate', {
    expression: 'document.title || ""',
    returnByValue: true
  });
  console.log(`Title: ${titleRes.result?.result?.value}`);

  // Extract images
  const imgRes = await send('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('img')).map(i => ({src: i.src, width: i.naturalWidth, height: i.naturalHeight})).filter(i => i.width > 50)`,
    returnByValue: true
  });
  const imgs = imgRes.result?.result?.value || [];
  console.log(`Images (>50px): ${imgs.length}`);
  imgs.slice(0, 5).forEach(i => console.log(`  ${i.src.slice(0, 100)} (${i.width}x${i.height})`));

  // ---- Try switching language ----
  // Look for language toggle elements
  const langBtns = await send('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('a, button, span, div')).filter(el => {
      const t = el.innerText?.trim() || '';
      return t === '中文' || t === 'English' || t === '中' || t === 'EN' || t === 'ZH' || t.includes('语言');
    }).map(el => ({tag: el.tagName, text: el.innerText?.trim()?.slice(0,50), href: el.href || '', onclick: el.onclick ? 'has' : 'none'}))`,
    returnByValue: true
  });
  const btns = langBtns.result?.result?.value || [];
  console.log(`Language toggle elements: ${btns.length}`);
  btns.forEach(b => console.log(`  <${b.tag}> "${b.text}" href="${b.href.slice(0,80)}"`));

  // Find and check all links
  const allLinks = await send('Runtime.evaluate', {
    expression: `Array.from(document.querySelectorAll('a')).map(a => ({href: a.href, text: a.innerText?.trim()?.slice(0,80)})).filter(l => l.text.length > 0).slice(0, 30)`,
    returnByValue: true
  });
  const links = allLinks.result?.result?.value || [];
  console.log(`\nLinks (first 30):`);
  links.forEach(l => console.log(`  "${l.text}" -> ${l.href.slice(0, 100)}`));

  // Print full innerText
  if (enTextVal.length > 0) {
    console.log(`\n--- Full EN text ---`);
    console.log(enTextVal);
  }

  ws.close();
  try { await cdpHttp(`/json/close/${tab.id}`, 'PUT'); } catch(e) {}
}

async function main() {
  // Data for E001 and E017
  const products = [
    { model: 'ET3-E001', url: '/ProductDetail/10702264.html' },
    { model: 'ET3-E017', url: '/ProductDetail/10702280.html' },
  ];

  for (const p of products) {
    await scrapeWithLangSwitch(p.model, p.url);
  }
  console.log('\nDone.');
}

main().catch(e => console.error('FATAL:', e));
