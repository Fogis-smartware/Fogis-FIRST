/**
 * Add 63 new ET3-E products to search-data.js
 */
const fs = require('fs');
const path = require('path');
const REPO = 'D:/GIT';

// Read existing search index
const searchFile = path.join(REPO, 'search-data.js');
let searchJs = fs.readFileSync(searchFile, 'utf8');

// Find the closing bracket of the array
const arrayEnd = searchJs.lastIndexOf(']');
if (arrayEnd < 0) {
  console.error('Could not find end of search array');
  process.exit(1);
}

// Generate entries for ET3-E001 to E064 (skip E040)
const entries = [];
for (let i = 1; i <= 64; i++) {
  if (i === 40) continue;
  const num = String(i).padStart(3, '0');
  const model = `ET3-E${num}`;
  const id = model.toLowerCase();
  const entry = {
    id: id,
    model: model,
    categoryEn: 'Bicycle Accessories',
    categoryZh: '自行车配件',
    url: `product-${id}.html`,
    image: `images/${id}.jpg`,
    tokens: `${id} ${model} bicycle accessories 自行车配件`.toLowerCase()
  };
  entries.push(JSON.stringify(entry));
}

// Insert entries before the closing bracket
const newEntries = ',\n' + entries.join(',\n');
searchJs = searchJs.slice(0, arrayEnd) + newEntries + '\n]';

// Update product count in comment
searchJs = searchJs.replace(
  /Products: \d+/,
  `Products: ${260 + 63}`
);

fs.writeFileSync(searchFile, searchJs, 'utf8');
console.log(`Added ${entries.length} entries to search-data.js`);
console.log(`Total products: ${260 + 63}`);
