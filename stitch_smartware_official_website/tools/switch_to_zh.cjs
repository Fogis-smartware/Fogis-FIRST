/**
 * Click language toggle to ZH, extract Chinese product data.
 */
const CDP = 'http://127.0.0.1:9222';

async function cdpHttp(pathname, method = 'GET') {
  const resp = await fetch(CDP + pathname, { method });
  return resp.json();
}
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeZh(model, detailUrl) {
  const fullUrl = `https://www.sst-smartware.com${detailUrl}`;
  console.log(`=== ${model} ===`);

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

  // Find and click the Chinese language option
  const findZh = await send('Runtime.evaluate', {
    expression: `
      (function() {
        // Find the lang-container
        const container = document.querySelector('.lang-container');
        if (!container) return 'no lang-container';

        // Look for the dropdown items
        const items = container.querySelectorAll('a, span, div, li');
        const result = [];
        items.forEach(item => {
          const text = item.innerText?.trim() || '';
          if (text === '中文' || text === '中') {
            result.push({
              tag: item.tagName,
              text: text,
              href: item.href || '',
              className: item.className?.toString()?.slice(0,80),
              clickable: item.onclick ? 'has onclick' : (item.href ? 'has href' : 'no handler'),
              parentTag: item.parentElement?.tagName,
              parentClass: item.parentElement?.className?.toString()?.slice(0,80)
            });
          }
        });
        return result;
      })()
    `,
    returnByValue: true
  });
  const zhItems = findZh.result?.result?.value || [];
  console.log(`ZH items found: ${JSON.stringify(zhItems, null, 2)}`);

  // Try clicking the first ZH item
  if (Array.isArray(zhItems) && zhItems.length > 0) {
    const clickResult = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const container = document.querySelector('.lang-container');
          if (!container) return 'no container';
          const items = container.querySelectorAll('a, span, div, li');
          for (const item of items) {
            if (item.innerText?.trim() === '中文') {
              item.click();
              return 'clicked: ' + item.tagName;
            }
          }
          return 'zh item not found for click';
        })()
      `,
      returnByValue: true
    });
    console.log(`Click ZH: ${clickResult.result?.result?.value}`);
    await sleep(3000);
  }

  // Also try clicking the "currentbox" to open dropdown, then click ZH
  if (!Array.isArray(zhItems) || zhItems.length === 0 || zhItems[0].clickable === 'no handler') {
    console.log('Trying dropdown approach...');

    // Click the current language to open dropdown
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const currentBox = document.querySelector('.currentbox');
          if (currentBox) { currentBox.click(); return 'opened dropdown'; }
          const langSwitch = document.querySelector('.ModuleLangSwitchV2Giant');
          if (langSwitch) { langSwitch.click(); return 'clicked module'; }
          return 'no dropdown found';
        })()
      `,
      returnByValue: true
    });
    await sleep(2000);

    // Now look for ZH option again
    const findZh2 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const all = document.querySelectorAll('*');
          const results = [];
          for (const el of all) {
            const text = el.innerText?.trim() || '';
            if (text === '中文' && el.children.length === 0) {
              results.push({
                tag: el.tagName,
                visible: el.offsetParent !== null,
                href: el.href?.slice(0, 100) || '',
                parentTag: el.parentElement?.tagName,
                parentClass: el.parentElement?.className?.toString()?.slice(0, 100)
              });
            }
          }
          return results;
        })()
      `,
      returnByValue: true
    });
    const zh2 = findZh2.result?.result?.value || [];
    console.log(`ZH items after dropdown: ${JSON.stringify(zh2, null, 2)}`);

    // Click visible ZH
    for (const item of (zh2 || [])) {
      if (item.visible) {
        await send('Runtime.evaluate', {
          expression: `
            (function() {
              const all = document.querySelectorAll('*');
              for (const el of all) {
                if (el.innerText?.trim() === '中文' && el.children.length === 0 && el.offsetParent !== null) {
                  el.click();
                  return 'clicked visible ZH';
                }
              }
              return 'not found';
            })()
          `,
          returnByValue: true
        });
        await sleep(3000);
        break;
      }
    }
  }

  // Extract final content
  const finalText = await send('Runtime.evaluate', {
    expression: 'document.body?.innerText?.slice(0, 5000) || ""',
    returnByValue: true
  });
  const finalVal = finalText.result?.result?.value || '';
  console.log(`\n--- Final text (${finalVal.length} chars) ---`);
  console.log(finalVal.slice(0, 2000));

  // Check URL
  const urlRes = await send('Runtime.evaluate', {
    expression: 'location.href',
    returnByValue: true
  });
  console.log(`\nFinal URL: ${urlRes.result?.result?.value}`);

  ws.close();
  try { await cdpHttp(`/json/close/${tab.id}`, 'PUT'); } catch(e) {}
}

async function main() {
  await scrapeZh('ET3-E001', '/ProductDetail/10702264.html');
  console.log('\n' + '='.repeat(60));
}

main().catch(e => console.error('FATAL:', e));
