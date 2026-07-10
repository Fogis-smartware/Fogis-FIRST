/**
 * Add partial model tokens to search index:
 * - Series prefix (et1, et3, et8, etc.)
 * - Model suffix (e001, a003, f014, etc.)
 * This enables searching "E001" to find ALL products with E001 across series.
 */
const fs = require('fs');
const path = require('path');
const REPO = 'D:/GIT';

const searchFile = path.join(REPO, 'search-data.js');
let js = fs.readFileSync(searchFile, 'utf8');

// Parse current entries
const arrayMatch = js.match(/window\.__SMARTWARE_SEARCH__\s*=\s*(\[[\s\S]*\]);?\s*$/);
if (!arrayMatch) {
  console.error('Could not find search array. File size:', js.length);
  console.error('Last 50 chars:', JSON.stringify(js.slice(-50)));
  process.exit(1);
}

let entries;
try {
  entries = JSON.parse(arrayMatch[1]);
} catch(e) {
  console.error('JSON parse error:', e.message);
  process.exit(1);
}

console.log(`Original entries: ${entries.length}`);

// For each entry, add partial model tokens
let modified = 0;
entries = entries.map(entry => {
  const model = entry.model || '';
  const tokens = entry.tokens || '';
  const existingTokens = new Set(tokens.toLowerCase().split(/\s+/).filter(Boolean));

  // Parse model: e.g., "ET3-E001", "ET1-G002AC", "ET10-B060"
  const parts = model.toLowerCase().split('-');
  const series = parts[0]; // et1, et3, et8, et10
  const code = parts[1] || ''; // e001, g002ac, b060

  const newTokens = [];

  // Add series prefix
  if (series && !existingTokens.has(series)) {
    newTokens.push(series);
  }

  // Add sub-series: et3-e, et1-g, etc.
  if (series && code) {
    const subSeries = series + '-' + code[0]; // et3-e, et1-g
    if (!existingTokens.has(subSeries)) {
      newTokens.push(subSeries);
    }
  }

  // Extract numeric model suffix: e001 -> 001, g002ac -> 002
  if (code) {
    const numMatch = code.match(/[a-z](\d+)/);
    if (numMatch) {
      const suffix = numMatch[1]; // 001, 002, etc.
      // Also include the letter+number: e001, g002
      const letterNum = code[0] + suffix; // e001, g002
      if (!existingTokens.has(letterNum)) {
        newTokens.push(letterNum);
      }
      if (!existingTokens.has(suffix)) {
        newTokens.push(suffix);
      }
    }
  }

  // Add variant suffix: e001c -> c, a006-3 -> 3
  if (parts[2]) {
    const variant = parts[2].toLowerCase();
    if (!existingTokens.has(variant)) {
      newTokens.push(variant);
    }
  }

  if (newTokens.length > 0) {
    entry.tokens = tokens + ' ' + newTokens.join(' ');
    modified++;
  }

  return entry;
});

console.log(`Modified entries: ${modified}/${entries.length}`);

// Rewrite file
const newArray = JSON.stringify(entries);
const newJs = js.replace(arrayMatch[1], newArray);
fs.writeFileSync(searchFile, newJs, 'utf8');

// Verify a few
const et3e001 = entries.find(e => e.id === 'et3-e001');
const et1e001 = entries.find(e => e.id === 'et1-e001');
const et8e001 = entries.find(e => e.id === 'et8-e001');

console.log('\nSample tokens after fix:');
console.log('ET1-E001:', et1e001?.tokens);
console.log('ET3-E001:', et3e001?.tokens);
console.log('ET8-E001:', et8e001?.tokens);

// Verify E001 search would work
const e001Products = entries.filter(e => {
  const t = e.tokens.toLowerCase();
  return t.includes(' e001 ') || t.startsWith('e001 ') || t.endsWith(' e001') || t === 'e001';
});
console.log(`\nProducts matching 'e001' as standalone token: ${e001Products.length}`);
e001Products.forEach(p => console.log(`  ${p.model} (${p.categoryEn})`));

console.log('\nDone! Search index updated.');
