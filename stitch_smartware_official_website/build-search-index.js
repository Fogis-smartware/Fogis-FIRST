/**
 * Build search index from product detail pages + category pages
 * Run: node build-search-index.js
 * Output: search-data.js
 */
const fs = require('fs');
const path = require('path');

// ── 1. Build category name map from category pages ──
const catFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('category-') && f.endsWith('.html'));
const catNames = {};

catFiles.forEach(catFile => {
  const content = fs.readFileSync(path.join(__dirname, catFile), 'utf8');
  let catEn = '', catZh = '';

  // Extract EN name from h1
  const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (h1Match) {
    const enM = h1Match[0].match(/lang="en">([^<]+)</);
    catEn = enM ? enM[1].trim() : '';
  }

  // Extract ZH name from the paragraph right after h1
  // Pattern: </h1>\n<p ...><span lang="zh">分类名</span>
  const zhParaMatch = content.match(/<\/h1>\s*<p[^>]*>\s*<span\s+lang="zh">([^<]+)</);
  if (zhParaMatch) {
    catZh = zhParaMatch[1].trim();
  }

  // Fallback: breadcrumb text for EN name
  if (!catEn) {
    const breadcrumbEnd = content.match(/<span class="text-primary[^"]*">\s*<span lang="en">([^<]+)</);
    if (breadcrumbEnd) catEn = breadcrumbEnd[1].trim();
  }

  catNames[catFile] = { en: catEn, zh: catZh };
});

// ── 2. Build product URL mapping ──
const urlLines = fs.readFileSync(path.join(__dirname, 'our-product-urls.txt'), 'utf8')
  .trim().split('\n').filter(l => l.trim());
const productMap = {};
urlLines.forEach(line => {
  const parts = line.split('|');
  if (parts.length >= 2) {
    productMap[parts[0].trim()] = parts[1].trim();
  }
});

// ── 3. Parse all product detail pages ──
const prodFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('product-') && f.endsWith('.html'));
const searchIndex = [];
const seenIds = new Set();

prodFiles.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const fileId = file.replace('product-', '').replace('.html', '');

    // Skip duplicates (some files might be .bak or special)
    if (seenIds.has(fileId)) return;
    seenIds.add(fileId);

    // Get model display name
    const model = productMap[fileId] || fileId.toUpperCase();

    // Get category from product page's category link
    const catMatch = content.match(/href="(category-[a-z_]+\.html)"/);
    let catEn = 'LED Lighting', catZh = 'LED 照明';
    if (catMatch && catNames[catMatch[1]]) {
      catEn = catNames[catMatch[1]].en || catEn;
      catZh = catNames[catMatch[1]].zh || catZh;
    }

    // Get image — prefer main product image
    let image = 'images/' + fileId + '.jpg';
    const imgMatch = content.match(/src="(images\/[a-z0-9\-]+\.jpg)"/i);
    if (imgMatch && !imgMatch[1].includes('logo')) {
      image = imgMatch[1];
    }

    searchIndex.push({
      id: fileId,
      model: model,
      categoryEn: catEn,
      categoryZh: catZh,
      url: file,
      image: image,
      tokens: [model, fileId, catEn, catZh].join(' ').toLowerCase()
    });

  } catch (e) {
    console.error('  Error reading ' + file + ': ' + e.message);
  }
});

// ── 4. Write output ──
const output = `/**
 * Smartware Product Search Index
 * Auto-generated — do not edit
 * Products: ${searchIndex.length}  |  Generated: ${new Date().toISOString()}
 */
window.__SMARTWARE_SEARCH__ = ${JSON.stringify(searchIndex)};
`;

fs.writeFileSync(path.join(__dirname, 'search-data.js'), output);

// ── 5. Report ──
console.log('✅ search-data.js — ' + searchIndex.length + ' products from ' + prodFiles.length + ' pages\n');

// Per-category counts
const counts = {};
searchIndex.forEach(p => {
  const key = p.categoryEn;
  counts[key] = (counts[key] || 0) + 1;
});
console.log('Products per category:');
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([cat, n]) => {
  console.log('  ' + cat + ': ' + n);
});

// Missing from our-product-urls.txt
const urlIds = new Set(Object.keys(productMap));
const foundIds = new Set(searchIndex.map(p => p.id));
const missing = [...urlIds].filter(id => !foundIds.has(id));
const extra = [...foundIds].filter(id => !urlIds.has(id));
if (missing.length) console.log('\n⚠ Missing from index: ' + missing.length);
if (extra.length) console.log('⚠ Extra in index (not in url list): ' + extra.length);

console.log('\nSample entries:');
searchIndex.slice(0, 5).forEach(p => {
  console.log('  ' + p.model + ' → ' + p.url + ' [' + p.categoryEn + ' / ' + p.categoryZh + ']');
});
