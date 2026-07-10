/**
 * Generate 63 missing bicycle product HTML pages.
 * Template: existing ET3-E065
 * Data: CDP-scraped specs + images from old site
 * Description: same generic text as existing E065+ products
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const REPO = 'D:/GIT';
const TOOLS = __dirname;
const IMAGES_DIR = path.join(REPO, 'images');

// Load parsed product data
const parsed = JSON.parse(fs.readFileSync(path.join(TOOLS, 'bicycle_pages_data/parsed_products.json'), 'utf8'));

// Load the template
const template = fs.readFileSync(path.join(REPO, 'product-et3-e065.html'), 'utf8');

// Generic description (same across all existing E065+ products, sourced from old site E063)
const GENERIC_DESC_EN = 'USB fast charging, convenient switch, high gloss LED light Suitable for most bicycles, compact and exquisite, saving space Multiple modes can be switched, making nighttime cycling safer Wide range, life grade waterproof, rainproof, damp, do not soak in rain for a long time.';
const GENERIC_DESC_ZH = 'USB 快充，开关便捷，高亮度 LED 光源。适用于大多数自行车，小巧精致，节省空间。多模式切换，夜间骑行更安全。生活级防水，防雨防潮，不宜长时间浸泡。';

// Track stats
let success = 0;
let fail = 0;
const imageDownloads = [];

// Download image from CDN to local
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      try { fs.unlinkSync(destPath); } catch(e) {}
      reject(err);
    });
  });
}

// Format model for filename: ET3-E001 -> et3-e001
function modelToLower(m) {
  return m.toLowerCase();
}

// Build specs table HTML
function buildSpecsTable(specs) {
  const rows = Object.entries(specs).map(([key, val]) => {
    // Escape HTML
    const safeKey = key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeVal = val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<tr class="bg-surface-container-low/30 border-b border-outline-variant/50"><td class="py-3 px-5 font-semibold text-on-surface w-2/5 text-sm">${safeKey}</td><td class="py-3 px-5 text-secondary text-sm">${safeVal}</td></tr>`;
  }).join('');
  return rows;
}

// Generate one product page
async function generatePage(model) {
  const data = parsed[model];
  if (!data || !data.hasData) {
    console.log(`  ${model}: SKIP (no data)`);
    return false;
  }

  const modelLower = modelToLower(model);
  const imgName = `${modelLower}.jpg`;
  const localImgPath = path.join(IMAGES_DIR, imgName);
  const imgRelPath = `images/${imgName}`;

  // Download image from CDN (big version _b.jpg), only if not already exists
  if (data.mainImage && !fs.existsSync(localImgPath)) {
    // Convert _s.jpg to _b.jpg for full-size
    const bigImgUrl = data.mainImage.replace(/_s\.jpg$/, '_b.jpg');
    try {
      await downloadImage(bigImgUrl, localImgPath);
      imageDownloads.push({ model, url: bigImgUrl, status: 'ok' });
    } catch(e) {
      // Try _s version as fallback
      try {
        await downloadImage(data.mainImage, localImgPath);
        imageDownloads.push({ model, url: data.mainImage, status: 'fallback_s' });
      } catch(e2) {
        console.log(`  ${model}: IMAGE FAIL - ${e.message}`);
        imageDownloads.push({ model, url: bigImgUrl, status: 'failed' });
        // Continue without image
      }
    }
  }

  // Build page HTML from template
  let html = template;

  // Replace model number everywhere
  const modelUpper = model.toUpperCase();
  html = html.replace(/ET3-E065/g, modelUpper);
  html = html.replace(/et3-e065/g, modelLower);

  // Replace title
  const titleEn = `${modelUpper} | Bicycle Accessories | Smartware — Professional LED Lighting Solutions`;
  const titleZh = `${modelUpper} | 云智迈科技 — 专业LED照明解决方案`;
  html = html.replace(
    /<title data-en="[^"]*" data-zh="[^"]*">[^<]*<\/title>/,
    `<title data-en="${titleEn}" data-zh="${titleZh}">${titleEn}</title>`
  );

  // Replace OG title
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${titleEn}">`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${titleEn}">`
  );

  // Replace meta description
  const descEn = `${modelUpper}: ${GENERIC_DESC_EN}`.slice(0, 160);
  const descZh = `${modelUpper}: ${GENERIC_DESC_ZH}`.slice(0, 160);
  html = html.replace(
    /<meta name="description" data-en="[^"]*" data-zh="[^"]*" content="[^"]*">/,
    `<meta name="description" data-en="${descEn}" data-zh="${descZh}" content="${descEn}">`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${descEn}">`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${descEn}">`
  );

  // Replace canonical and hreflang URLs
  html = html.replace(
    /https:\/\/www\.smartware-official\.com\/product-et3-e065\.html/g,
    `https://www.smartware-official.com/product-${modelLower}.html`
  );

  // Replace JSON-LD description
  html = html.replace(
    /"description": "ET3-E065: [^"]*"/,
    `"description": "${modelUpper}: ${GENERIC_DESC_EN.replace(/"/g, '\\"')}"`
  );

  // Replace JSON-LD image
  html = html.replace(
    /"image": "https:\/\/www\.smartware-official\.com\/images\/et3-e065\.jpg"/,
    `"image": "https://www.smartware-official.com/${imgRelPath}"`
  );

  // Replace description paragraphs (EN + ZH)
  html = html.replace(
    /<span lang="en">USB fast charging[^<]*<\/span>/,
    `<span lang="en">${GENERIC_DESC_EN}</span>`
  );
  html = html.replace(
    /<span lang="zh">USB 快充[^<]*<\/span>/,
    `<span lang="zh">${GENERIC_DESC_ZH}</span>`
  );

  // Build specs table HTML
  // Find the table section and replace all rows
  const specsRows = buildSpecsTable(data.specs);
  const tbodyStart = html.indexOf('<tbody>');
  const tbodyEnd = html.indexOf('</tbody>', tbodyStart);
  if (tbodyStart >= 0 && tbodyEnd >= 0) {
    html = html.slice(0, tbodyStart + '<tbody>'.length) + specsRows + html.slice(tbodyEnd);
  }

  // Replace image src in gallery
  html = html.replace(
    /src="images\/et3-e065\.jpg"/g,
    `src="${imgRelPath}"`
  );
  html = html.replace(
    /alt="ET3-E065"/g,
    `alt="${modelUpper}"`
  );

  // Write the file
  const outPath = path.join(REPO, `product-${modelLower}.html`);
  fs.writeFileSync(outPath, html, 'utf8');

  return true;
}

async function main() {
  const models = Object.keys(parsed).sort();
  console.log(`Generating ${models.length} product pages...`);
  console.log(`Template: product-et3-e065.html`);
  console.log(`Output: D:/GIT/product-et3-eXXX.html`);
  console.log('='.repeat(60));

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    process.stdout.write(`[${i+1}/${models.length}] ${model} ... `);
    try {
      const ok = await generatePage(model);
      if (ok) {
        success++;
        console.log('OK');
      } else {
        fail++;
        console.log('SKIP');
      }
    } catch(e) {
      fail++;
      console.log(`ERROR: ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Pages generated: ${success}/${models.length}`);
  console.log(`Failed: ${fail}`);
  console.log(`Images downloaded: ${imageDownloads.filter(d => d.status === 'ok').length}`);
  console.log(`Images fallback (_s): ${imageDownloads.filter(d => d.status === 'fallback_s').length}`);
  console.log(`Images failed: ${imageDownloads.filter(d => d.status === 'failed').length}`);

  // Save image download log
  fs.writeFileSync(
    path.join(TOOLS, 'bicycle_pages_data/image_downloads.json'),
    JSON.stringify(imageDownloads, null, 2),
    'utf8'
  );
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
