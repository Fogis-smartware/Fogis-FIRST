/**
 * Batch fix: placeholder content in product pages
 * 1. Update meta description suffix per category (preserve original SKU casing)
 * 2. Prepend SKU (preserved casing) to JSON-LD Product description
 */

const fs = require('fs');
const path = require('path');

const categorySuffixMap = {
  'category-bicycle_accessories.html': 'bicycle accessory',
  'category-led_work_light.html': 'LED work light',
  'category-led_rechargeable_work_light.html': 'rechargeable LED work light',
  'category-led_light_bar.html': 'LED light bar',
  'category-led_tripod.html': 'LED tripod',
  'category-led_motorcycle_light.html': 'motorcycle LED light',
  'category-led_economy_work_light.html': 'economy LED work light',
  'category-led_pen_light.html': 'LED pen light',
  'category-led_head_light.html': 'LED head light',
  'category-led_strip_light.html': 'LED strip light',
  'category-led_solar_panel.html': 'LED solar panel',
  'category-led_search_light.html': 'LED search light',
  'category-led_flash_light.html': 'LED flashlight',
  'category-industrial_parts.html': 'industrial part',
};

const TARGET_DIR = 'D:/GIT';

let stats = { total: 0, metaFixed: 0, descFixed: 0, skipped: 0, errors: [] };

const files = fs.readdirSync(TARGET_DIR).filter(f =>
  f.startsWith('product-') && f.endsWith('.html'));

stats.total = files.length;

for (const filename of files) {
  const filepath = path.join(TARGET_DIR, filename);
  let html = fs.readFileSync(filepath, 'utf-8');

  // Extract SKU from existing meta description (preserves casing)
  const skuMatch = html.match(/<meta name="description" content="Smartware\s+(.+?)\s+-\s+/i);
  if (!skuMatch) {
    stats.skipped++;
    stats.errors.push(`${filename}: cannot extract SKU from meta`);
    continue;
  }
  const sku = skuMatch[1]; // e.g. "ET1-A001"

  // Extract category from existing link
  const catMatch = html.match(/category-[a-z_]+\.html/);
  if (!catMatch) {
    stats.skipped++;
    stats.errors.push(`${filename}: no category link found`);
    continue;
  }

  const catFile = catMatch[0];
  const catSuffix = categorySuffixMap[catFile];
  if (!catSuffix) {
    stats.skipped++;
    stats.errors.push(`${filename}: unknown category ${catFile}`);
    continue;
  }

  let modified = false;

  // --- Operation 1: Fix meta description suffix ---
  // Match: content="Smartware SKU - [Smartware - ]?Professional XXX product. Specifications..."
  const metaRegex = /<meta name="description" content="Smartware\s+[^"]+?Professional\s+[^"]*?\s+product\.\s+Specifications,?\s+features,?\s+and\s+purchasing\s+information\.\s*"\/?>/i;

  if (metaRegex.test(html)) {
    const newMeta = `<meta name="description" content="Smartware ${sku} - Professional ${catSuffix} product. Specifications, features, and purchasing information."/>`;
    html = html.replace(metaRegex, newMeta);
    modified = true;
    stats.metaFixed++;
  }

  // --- Operation 2: Prepend SKU to JSON-LD Product description ---
  const descRegex = /("description":\s*")((?!Smartware|sku:|[\w-]+:)[^"]{10,})(")/g;

  let descReplaced = false;
  html = html.replace(descRegex, (match, prefix, existingDesc, suffix) => {
    // Skip if already has any SKU prefix pattern (like "ET1-A001: ...")
    if (/^[\w]+[-:]\s/.test(existingDesc)) {
      return match;
    }
    descReplaced = true;
    return `${prefix}${sku}: ${existingDesc}${suffix}`;
  });

  if (descReplaced) {
    modified = true;
    stats.descFixed++;
  }

  // Write back if modified
  if (modified) {
    fs.writeFileSync(filepath, html, 'utf-8');
  } else {
    stats.skipped++;
    stats.errors.push(`${filename}: no changes applied`);
  }
}

// Report
console.log('\n========== Placeholder Content Fix Report ==========');
console.log(`Total product files scanned: ${stats.total}`);
console.log(`Meta description updated:    ${stats.metaFixed}`);
console.log(`JSON-LD description fixed:   ${stats.descFixed}`);
console.log(`Skipped:                     ${stats.skipped}`);
if (stats.errors.length > 0) {
  console.log(`\n--- Details (${stats.errors.length}) ---`);
  stats.errors.forEach(e => console.log(`  • ${e}`));
}
console.log('====================================================\n');
