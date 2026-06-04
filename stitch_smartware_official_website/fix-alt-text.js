/**
 * Fix alt text issues in product pages:
 * 1. alt="Main" → alt="MODEL Main Image"  (JS gallery)
 * 2. alt="Gallery N" → alt="MODEL - Detail N"  (JS gallery)
 */
const fs = require('fs');
const path = require('path');

const dir = 'D:/GIT';
const files = fs.readdirSync(dir).filter(f => f.startsWith('product-') && f.endsWith('.html'));

let stats = { mainFixed: 0, galleryFixed: 0, skipped: 0 };

for (const f of files) {
  const fp = path.join(dir, f);
  let html = fs.readFileSync(fp, 'utf-8');
  let modified = false;

  // --- Fix 1: alt="Main" in gallery JS ---
  const mainAltPattern = /alt="Main"/;
  // Replace: alt="Main">'; → alt="' + model.toUpperCase() + ' Main Image">';
  const mainAltRegex = /(<img src="' \+ images\[0\] \+ '" alt=")Main(">';)/;
  if (mainAltRegex.test(html)) {
    html = html.replace(mainAltRegex, '$1\' + model.toUpperCase() + \' Main Image$2');
    modified = true;
    stats.mainFixed++;
  }

  // --- Fix 2: alt="Gallery ' + idx + '" in gallery JS ---
  const galleryAltRegex = /(<img src="' \+ trySrc \+ '" alt=")Gallery ' \+ idx \+ '(">';)/;
  if (galleryAltRegex.test(html)) {
    html = html.replace(galleryAltRegex, '$1\' + model + \' - Detail \' + idx + \'$2');
    modified = true;
    stats.galleryFixed++;
  }

  if (modified) {
    fs.writeFileSync(fp, html, 'utf-8');
  } else {
    stats.skipped++;
  }
}

console.log('\n========== Alt Text Fix Report ==========');
console.log(`Total files scanned:   ${files.length}`);
console.log(`alt="Main" fixed:      ${stats.mainFixed}`);
console.log(`alt="Gallery" fixed:   ${stats.galleryFixed}`);
console.log(`Skipped:               ${stats.skipped}`);
console.log('========================================\n');
