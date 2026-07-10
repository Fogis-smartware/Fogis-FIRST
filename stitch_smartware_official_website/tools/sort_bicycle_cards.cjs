/**
 * Reorder all product cards in category-bicycle_accessories.html
 * Sort by series (ET3-D → ET3-E → ET3-F → ET8-E → ET8-F), ascending within each.
 */
const fs = require('fs');
const path = require('path');
const REPO = 'D:/GIT';
const catFile = path.join(REPO, 'category-bicycle_accessories.html');
let html = fs.readFileSync(catFile, 'utf8');

// Extract all product card blocks
// Each card starts with <div class="product-card... or <div class="group bg-white...product-card
const cardRegex = /<div class="(?:product-card |group bg-white[^"]*product-card")[^>]*data-model="([^"]*)"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*(?=\s*<div class="(?:product-card|group bg-white))/g;

// Simpler approach: find all data-model values then extract card HTML by index
const modelRegex = /data-model="([^"]+)"/g;
const models = [];
let match;
while ((match = modelRegex.exec(html)) !== null) {
  models.push(match[1]);
}

console.log(`Found ${models.length} product cards`);

// Extract card HTML blocks
// Strategy: split by data-model markers, rebuild
const cards = [];
const parts = html.split(/(<div class="(?:product-card |group bg-white[^"]*product-card")[^>]*data-model="[^"]*")/g);

// Simpler: find each card by locating its opening div and then finding its closing
// Each card is: <div class="...product-card..." data-model="X"> ... </div>\n</div>\n</div>
// The pattern: 3 nested closing </div> at end of each card

// Let me use a different approach: find each card HTML between data-model markers
let modelIdx = 0;
const cardBlocks = [];
const cardStarts = [];
const cardRegex2 = /<div class="(?:product-card |group bg-white[^"]*product-card")[^>]*data-model="([^"]+)"/g;
while ((match = cardRegex2.exec(html)) !== null) {
  cardStarts.push({ idx: match.index, model: match[1] });
}

// For each card start, find the end (3 consecutive </div> tags at the right nesting level)
for (let i = 0; i < cardStarts.length; i++) {
  const start = cardStarts[i].idx;
  // Find end: this card's closing </div> is where the next card starts (minus whitespace)
  // or for the last card, before the grid closing </div>
  let end;
  if (i < cardStarts.length - 1) {
    end = cardStarts[i + 1].idx;
  } else {
    // Last card: find the grid closing </div>
    const afterLast = html.indexOf('</div>', start + 100);
    // Find the </div> that closes the grid (next significant </div> after last card)
    const gridEnd = html.indexOf('</div>', afterLast + 10);
    // Look for <!-- No Results --> which marks end of grid
    const noResults = html.indexOf('<!-- No Results -->', start);
    if (noResults > 0) {
      end = noResults;
    } else {
      end = html.indexOf('</div>', gridEnd + 10);
    }
  }
  cardBlocks.push({ model: cardStarts[i].model, html: html.slice(start, end) });
}

// Sort function for model numbers
function sortKey(model) {
  const parts = model.split('-');
  const series = parts[0]; // ET3 or ET8
  // parts[0]=ET3/ET8, parts[1]=D001/E067/F001B, parts[2]=optional suffix number

  // Series order: ET3-D < ET3-E < ET3-F < ET8-E < ET8-F
  const seriesOrder = { 'ET3': 1, 'ET8': 2 };
  const subOrder = { 'D': 1, 'E': 2, 'F': 3 };

  // Parse: parts[1] = D001/E067/F001B, parts[2] = optional suffix like "1" from E067-1
  const code = parts[1]; // e.g., "D001", "E067", "F001B"
  const subLetter = code[0]; // D, E, F
  const numStr = code.slice(1); // "001", "067", "001B"
  const numMatch = numStr.match(/^(\d+)([A-Za-z]*)$/);
  const base = parseInt(numMatch[1]);
  const letter = numMatch[2] || '';
  const suffix = parts[2] ? parseInt(parts[2]) : 0;

  return `${seriesOrder[series]}${subOrder[subLetter]}${String(base).padStart(4,'0')}${String(suffix).padStart(2,'0')}${letter}`;
}

cardBlocks.sort((a, b) => sortKey(a.model).localeCompare(sortKey(b.model)));

// Rebuild the grid
// Find the grid opening and closing
const gridStart = html.indexOf('<div class="grid grid-cols-2 lg:grid-cols-3');
const gridEndMarker = '<!-- No Results -->';
const gridEnd = html.indexOf(gridEndMarker);

if (gridStart < 0 || gridEnd < 0) {
  console.error('ERROR: Could not find grid boundaries');
  process.exit(1);
}

// Build new grid content
const beforeGrid = html.slice(0, gridStart);
const gridOpen = html.slice(gridStart, html.indexOf('>', gridStart) + 1);
const afterGrid = html.slice(gridEnd);

// Assemble sorted cards
const sortedCards = cardBlocks.map(c => c.html).join('\n');

html = beforeGrid + gridOpen + '\n' + sortedCards + '\n' + afterGrid;

// Write
fs.writeFileSync(catFile, html, 'utf8');

// Verify
const newModels = [];
const verifyRegex = /data-model="([^"]+)"/g;
while ((match = verifyRegex.exec(html)) !== null) {
  newModels.push(match[1]);
}

console.log(`Sorted ${newModels.length} cards`);
console.log('First 10:', newModels.slice(0, 10).join(', '));
console.log('Last 10:', newModels.slice(-10).join(', '));

// Check ET3-E are together and ascending
const et3e = newModels.filter(m => m.startsWith('ET3-E'));
const firstE = et3e[0];
const lastE = et3e[et3e.length - 1];
console.log(`ET3-E range: ${firstE} to ${lastE} (${et3e.length} products)`);
