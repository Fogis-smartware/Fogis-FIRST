/**
 * Parse extracted CDP data → structured product info for HTML generation.
 * Extracts: specs table, description, main image URL per product.
 */
const fs = require('fs');
const path = require('path');

const TOOLS = __dirname;
const raw = JSON.parse(fs.readFileSync(path.join(TOOLS, 'bicycle_pages_data/all_results.json'), 'utf8'));
const results = raw.results;

const parsed = {};

Object.entries(results).forEach(([model, data]) => {
  const text = data.innerText || '';
  const info = {
    model,
    hasData: text.length > 50,
    specs: {},
    description_en: '',
    description_zh: '',
    mainImage: '',
    galleryImages: [],
    rawTextLen: text.length,
  };

  if (!info.hasData) {
    parsed[model] = info;
    return;
  }

  // ---- Extract description (before "Product information") ----
  const prodInfoIdx = text.indexOf('Product information');
  if (prodInfoIdx > 0) {
    const before = text.slice(0, prodInfoIdx).trim();
    // Get last non-empty lines before "Product information"
    const lines = before.split('\n').filter(l => l.trim().length > 5);
    // Skip nav lines (HOME, PRODUCT, etc.) and model number lines
    const descLines = lines.filter(l => {
      const t = l.trim();
      if (t === 'English' || t === 'HOME' || t === 'PRODUCT' || t === 'CONTACT' ||
          t === 'RFQ 1' || t === 'RFQ 2' || t === 'BEAM PATTERN' || t === 'ABOUT US' ||
          t === 'Inquire Now' || t === 'share' || t === model || t === 'Cookie Preferences' ||
          t === 'Product Search' || t.startsWith('English') || t.startsWith('中国') ||
          t.includes('BEAM PATTERN') || t === 'ABOUT US') return false;
      return true;
    });
    if (descLines.length > 0) {
      info.description_en = descLines.join(' ').slice(0, 1000);
      // Chinese description - look for Chinese characters
      const zhLines = descLines.filter(l => /[一-鿿]/.test(l));
      if (zhLines.length > 0) {
        info.description_zh = zhLines.join(' ').slice(0, 1000);
      }
    }
  }

  // ---- Extract specs table ----
  if (prodInfoIdx >= 0) {
    const after = text.slice(prodInfoIdx + 'Product information'.length);
    const searchIdx = after.indexOf('Product Search');
    const specBlock = searchIdx >= 0 ? after.slice(0, searchIdx) : after;

    // Parse tab-separated key-value pairs
    const lines = specBlock.split('\n').filter(l => l.trim().length > 2);
    for (const line of lines) {
      const parts = line.split('\t').filter(s => s.trim().length > 0);
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/\s+/g, ' ').slice(0, 200);
        const val = parts.slice(1).join(' ').trim().replace(/\s+/g, ' ').slice(0, 500);
        // Skip noise
        if (key.length > 3 && val.length > 1 &&
            !key.includes('Inquire') && !key.includes('share') &&
            !key.includes('Cookie') && !key.includes('PRODUCT') &&
            !key.includes('English') && val.length < 500) {
          info.specs[key] = val;
        }
      }
    }
  }

  // ---- Extract images ----
  const images = data.images || [];
  // Find CDN product images (main product shots, not nav icons)
  const cdnImages = images.filter(img => {
    const src = img.src || '';
    return src.includes('gcdn.meidianbang.cn') ||
           src.includes('img-for-hk') ||
           (src.includes('sst-smartware.com') && src.includes('ET'));
  });

  if (cdnImages.length > 0) {
    // First CDN image is usually the main product image
    info.mainImage = cdnImages[0].src;
    // All unique CDN images
    const seen = new Set();
    info.galleryImages = cdnImages
      .filter(img => {
        const s = img.src;
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
      })
      .map(img => img.src)
      .slice(0, 12);
  }

  // ---- Check for description in text ----
  // Some products have a multi-line description before specs
  if (!info.description_en && prodInfoIdx > 0) {
    const before = text.slice(0, prodInfoIdx);
    // Find lines that look like descriptive text (not nav, not single words)
    const descCandidates = before.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 20 && !l.includes('\t') &&
             !['HOME','PRODUCT','CONTACT','RFQ 1','RFQ 2','BEAM PATTERN','ABOUT US',
               'English','Inquire Now','share','Cookie Preferences','Product Search']
              .includes(l) &&
             !l.startsWith('ET3-') && l !== model);
    if (descCandidates.length > 0) {
      info.description_en = descCandidates.join(' ').slice(0, 1000);
    }
  }

  parsed[model] = info;
});

// ---- Summary ----
let withSpecs = 0, withDesc = 0, withImages = 0, empty = 0;
Object.values(parsed).forEach(p => {
  if (Object.keys(p.specs).length > 0) withSpecs++;
  if (p.description_en.length > 10) withDesc++;
  if (p.mainImage) withImages++;
  if (!p.hasData) empty++;
});

console.log(`Total: ${Object.keys(parsed).length}`);
console.log(`With specs: ${withSpecs}`);
console.log(`With description: ${withDesc}`);
console.log(`With images: ${withImages}`);
console.log(`Empty: ${empty}`);

// Show a few examples
['ET3-E002', 'ET3-E063', 'ET3-E032', 'ET3-E001'].forEach(m => {
  const p = parsed[m];
  console.log(`\n=== ${m} ===`);
  console.log('  Specs count:', Object.keys(p.specs).length);
  console.log('  Description EN:', (p.description_en || '(none)').slice(0, 200));
  console.log('  Main image:', (p.mainImage || '(none)').slice(0, 100));
  console.log('  Gallery:', p.galleryImages.length);
});

// Save
fs.writeFileSync(
  path.join(TOOLS, 'bicycle_pages_data/parsed_products.json'),
  JSON.stringify(parsed, null, 2),
  'utf8'
);
console.log(`\nSaved to parsed_products.json`);
