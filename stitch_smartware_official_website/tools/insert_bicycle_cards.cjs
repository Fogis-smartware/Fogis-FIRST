/**
 * Insert 63 new ET3-E001 to E064 product cards into category-bicycle_accessories.html
 * Insert after existing ET3-E high-numbered products, before ET8-E series.
 */
const fs = require('fs');
const path = require('path');

const REPO = 'D:/GIT';
const catFile = path.join(REPO, 'category-bicycle_accessories.html');
let html = fs.readFileSync(catFile, 'utf8');

// Models to add: ET3-E001 to E064, skip E040 (doesn't exist)
const models = [];
for (let i = 1; i <= 64; i++) {
  if (i === 40) continue; // E040 doesn't exist
  models.push(`ET3-E${String(i).padStart(3, '0')}`);
}

// Build card HTML for each model
const cards = models.map((model, idx) => {
  const lower = model.toLowerCase();
  const delay = (idx % 4) + 1; // cycle delay-1 through delay-4

  return `<div class="product-card group bg-white rounded-xl overflow-hidden shadow-soft border border-outline-variant transition-all hover:-translate-y-2 fade-up delay-${delay}" data-model="${model}">
<div class="aspect-square overflow-hidden relative bg-surface-container-low">
<img alt="${model}" class="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110" src="images/${lower}.jpg"/ loading="lazy">
</div>
<div class="p-6">
<h3 class="font-bold text-xl text-on-surface mb-1">${model}</h3>
<p class="text-primary text-sm font-semibold mb-4"><span lang="en">Bicycle Accessories</span><span lang="zh">自行车配件</span></p>
<a href="product-${lower}.html" class="block w-full py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors text-center text-sm"><span lang="en">VIEW DETAILS</span><span lang="zh">查看详情</span></a>
</div>
</div>`;
});

const cardsBlock = '\n' + cards.join('\n') + '\n';

// Insert after the last ET3-E high-numbered card.
// Find the closing </div> of ET3-E087-1 card, before ET8-E012 card
// Pattern: after ET3-E087-1 card closing, before ET8-E012 opening
const insertMarker = 'data-model="ET3-E087-1"';
const markerIdx = html.indexOf(insertMarker);
if (markerIdx < 0) {
  console.error('ERROR: Could not find ET3-E087-1 marker');
  process.exit(1);
}

// Find the end of the ET3-E087-1 card div (the card's closing </div></div>)
// Each card ends with: </div></div> (close p-6 div, close product-card div)
// Then the next card starts
const afterCard = html.indexOf('data-model="ET8-E012"', markerIdx);
if (afterCard < 0) {
  console.error('ERROR: Could not find ET8-E012 marker');
  process.exit(1);
}

// Find the opening <div of ET8-E012 card
const insertPoint = html.lastIndexOf('<div class="product-card', afterCard);
if (insertPoint < 0) {
  console.error('ERROR: Could not find insertion point');
  process.exit(1);
}

// Insert cards
html = html.slice(0, insertPoint) + cardsBlock + html.slice(insertPoint);

// Write
fs.writeFileSync(catFile, html, 'utf8');
console.log(`Inserted ${models.length} product cards into category-bicycle_accessories.html`);
console.log(`Range: ${models[0]} to ${models[models.length-1]}`);
console.log(`File size: ${html.length} -> ${fs.statSync(catFile).size} bytes`);
