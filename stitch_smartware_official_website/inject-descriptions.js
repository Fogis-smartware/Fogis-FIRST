/**
 * Inject product descriptions into all product detail pages
 * Run: node inject-descriptions.js
 */
const fs = require('fs');

// 1. Load descriptions
const descriptions = JSON.parse(fs.readFileSync('product_descriptions.json', 'utf8'));

// 2. Map category filenames to description keys
const catToDesc = {
  'category-led_work_light.html': 'LED Work Light',
  'category-led_rechargeable_work_light.html': 'LED Rechargeable Work Light',
  'category-led_economy_work_light.html': 'LED Economy Work Light',
  'category-led_motorcycle_light.html': 'LED Motorcycle Light',
  'category-led_light_bar.html': 'LED Light Bar',
  'category-led_tripod.html': 'LED Tripod',
  'category-led_head_light.html': 'LED Head Light',
  'category-led_flash_light.html': 'LED Flash Light',
  'category-led_pen_light.html': 'LED Pen Light',
  'category-led_search_light.html': 'LED Search Light',
  'category-led_solar_panel.html': 'LED Solar Panel Products',
  'category-led_strip_light.html': 'LED Strip Light',
  'category-bicycle_accessories.html': 'Bicycle Accessories',
  'category-industrial_parts.html': 'Industrial Parts',
};

// 3. Process all product pages
const prodFiles = fs.readdirSync('.').filter(f => f.startsWith('product-') && f.endsWith('.html'));

let injected = 0;
let skipped = 0;
let errors = 0;

prodFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');

    // Skip if already has a description
    if (content.includes('product-description')) {
      skipped++;
      return;
    }

    // Find the category link in this product page
    const catMatch = content.match(/category-[a-z_]+\.html/);
    if (!catMatch) {
      console.log('⚠ No category link: ' + file);
      errors++;
      return;
    }

    const catFile = catMatch[0];
    const descKey = catToDesc[catFile];
    if (!descKey || !descriptions[descKey] || !descriptions[descKey].en) {
      console.log('⚠ No description for: ' + file + ' (cat: ' + catFile + ')');
      errors++;
      return;
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    const desc = escapeHtml(descriptions[descKey].en);

    // Build the description HTML block
    // Insert between the button area and the specs section
    // Pattern: after the button flex container closing </div> tags and before <section...Technical Specifications
    const descHTML =
      '\n' +
      '    <!-- Product Description -->\n' +
      '    <div class="max-w-container-max mx-auto px-gutter md:px-margin-desktop pb-8 fade-up">\n' +
      '      <p class="text-body-lg text-secondary leading-relaxed max-w-3xl">\n' +
      '        <span lang="en">' + desc + '</span>\n' +
      '        <span lang="zh">' + desc + '</span>\n' +
      '      </p>\n' +
      '    </div>\n';

    // Insert before the specs section
    // Find: <section class="max-w-container-max mx-auto px-gutter md:px-margin-desktop pb-16"><div class="fade-up"><h2...Technical
    const specPattern = /(\s*<section class="max-w-container-max mx-auto px-gutter md:px-margin-desktop pb-16"><div class="fade-up"><h2 class="font-headline-lg text-headline-lg text-on-surface mb-8"><span lang="en">Technical Specifications)/;

    if (specPattern.test(content)) {
      content = content.replace(specPattern, descHTML + '$1');
      fs.writeFileSync(file, content);
      injected++;
    } else {
      // Try alternative pattern: just "</main>" or the specs section line
      console.log('⚠ Could not find spec section pattern in: ' + file);
      errors++;
    }

  } catch (e) {
    console.log('❌ Error processing ' + file + ': ' + e.message);
    errors++;
  }
});

console.log('\n=== Results ===');
console.log('Injected: ' + injected);
console.log('Skipped (already has): ' + skipped);
console.log('Errors: ' + errors);
console.log('Total product files: ' + prodFiles.length);
