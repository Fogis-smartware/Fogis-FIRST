/**
 * Open E001, click language toggle, extract ZH content.
 */
const CDP = 'http://127.0.0.1:9222';

async function cdpHttp(pathname, method = 'GET') {
  const resp = await fetch(CDP + pathname, { method });
  return resp.json();
}
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function checkLangSwitch(model, detailUrl) {
  const fullUrl = `https://www.sst-smartware.com${detailUrl}`;
  console.log(`\n=== ${model} ===`);

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
  await sleep(5000);

  // ---- Find language toggle ----
  // Look for all clickable elements with "English" or "中文"
  const toggleRes = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const results = [];
        // Find elements with "English" or "中文" text
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node;
        while (node = walker.nextNode()) {
          const text = (node.innerText || '').trim();
          if (text === 'English' || text === '中文' || text === '中' || text === 'EN') {
            results.push({
              tag: node.tagName,
              id: node.id,
              className: node.className?.toString()?.slice(0, 100),
              text: text,
              onclick: node.onclick ? 'yes' : 'no',
              href: node.href || '',
              style: node.getAttribute('style') || '',
              parent: node.parentElement?.tagName || '',
              parentClass: node.parentElement?.className?.toString()?.slice(0, 100) || ''
            });
          }
        }
        return results;
      })()
    `,
    returnByValue: true
  });
  const toggles = toggleRes.result?.result?.value || [];
  console.log(`Toggle candidates: ${toggles.length}`);
  toggles.forEach(t => console.log(`  <${t.tag} id="${t.id}" class="${t.className.slice(0,60)}"> "${t.text}" onclick=${t.onclick} parent=<${t.parent} class="${t.parentClass.slice(0,60)}">`));

  // ---- Check for ZH text anywhere in the HTML ----
  const zhRes = await send('Runtime.evaluate', {
    expression: `document.body.innerHTML.match(/[一-鿿][一-鿿\\s，。！？；：""''（）《》…—]+/g)?.slice(0, 20) || []`,
    returnByValue: true
  });
  const zhText = zhRes.result?.result?.value || [];
  console.log(`Chinese text fragments: ${zhText.length}`);
  zhText.slice(0, 10).forEach(t => console.log(`  "${t.slice(0, 120)}"`));

  // ---- Check for hidden divs with ZH content ----
  const hiddenRes = await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('[style*="display:none"], [style*="display: none"], .zh, .cn, [lang="zh"], [data-lang="zh"]')).map(el => ({
        tag: el.tagName,
        cls: el.className?.toString()?.slice(0,80) || '',
        text: el.innerText?.trim()?.slice(0,300) || ''
      })).filter(d => d.text.length > 5).slice(0, 10)
    `,
    returnByValue: true
  });
  const hidden = hiddenRes.result?.result?.value || [];
  console.log(`Hidden elements with text: ${hidden.length}`);
  hidden.forEach(h => console.log(`  <${h.tag} class="${h.cls}"> "${h.text.slice(0, 150)}"`));

  // ---- Click on first "English" div and see what happens ----
  if (toggles.length > 0) {
    // Find the first DIV with "English" that has no parent navigation
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const divs = document.querySelectorAll('div');
          for (const d of divs) {
            if (d.innerText?.trim() === 'English' && d.children.length === 0) {
              d.click();
              return 'clicked ' + d.className?.toString()?.slice(0,50);
            }
          }
          return 'not found';
        })()
      `,
      returnByValue: true
    });
    console.log(`Click result: ${clickRes.result?.result?.value}`);

    await sleep(2000);

    // Check if page changed
    const newText = await send('Runtime.evaluate', {
      expression: 'document.body?.innerText?.slice(0, 3000) || ""',
      returnByValue: true
    });
    const newTextVal = newText.result?.result?.value || '';
    console.log(`After click - text length: ${newTextVal.length}`);
    // Check if Chinese appeared
    const hasZh = /[一-鿿]/.test(newTextVal);
    console.log(`Contains Chinese: ${hasZh}`);
    if (hasZh) {
      console.log('--- ZH text ---');
      console.log(newTextVal.slice(0, 1000));
    }
  }

  // ---- Try URL modification for ZH version ----
  // Check if there's a ZH version at a different URL
  const currentUrl = await send('Runtime.evaluate', {
    expression: 'location.href',
    returnByValue: true
  });
  console.log(`Current URL: ${currentUrl.result?.result?.value}`);

  ws.close();
  try { await cdpHttp(`/json/close/${tab.id}`, 'PUT'); } catch(e) {}
}

async function main() {
  await checkLangSwitch('ET3-E001', '/ProductDetail/10702264.html');
  console.log('\n' + '='.repeat(60));
}

main().catch(e => console.error('FATAL:', e));
