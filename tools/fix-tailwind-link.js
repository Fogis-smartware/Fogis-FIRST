/**
 * Fix: Add tailwind-static.css link after Google Fonts in all pages
 * The original script's regex didn't match the <link> tag format
 */
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/GIT';
const CSS_LINK = '\n<link rel="stylesheet" href="/tailwind-static.css">';

function processFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if already done
    if (html.includes('tailwind-static.css')) return false;

    // Add static CSS link after Google Fonts stylesheet
    // The Google Fonts line ends with the first > after "fonts.googleapis.com"
    if (html.includes('fonts.googleapis.com')) {
        html = html.replace(
            /(fonts\.googleapis\.com[^>]*>)/,
            '$1' + CSS_LINK
        );
        modified = true;
    } else {
        // Fallback: add after the first <link rel="stylesheet" href="/shared.css">
        html = html.replace(
            'rel="stylesheet" href="/shared.css">',
            'rel="stylesheet" href="/shared.css">\n<link rel="stylesheet" href="/tailwind-static.css">'
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, html, 'utf8');
    }
    return modified;
}

const htmlFiles = [];
function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (!['node_modules', '.git', '.bak', 'TEXT'].includes(e.name)) {
                walkDir(full);
            }
        } else if (e.name.endsWith('.html')) {
            htmlFiles.push(full);
        }
    }
}

walkDir(ROOT);
console.log(`Found ${htmlFiles.length} HTML files`);

let count = 0;
for (const f of htmlFiles) {
    if (processFile(f)) count++;
}

console.log(`Fixed ${count} files`);

// Final verification
const without = htmlFiles.filter(f => {
    try { return !fs.readFileSync(f, 'utf8').includes('tailwind-static.css'); }
    catch { return true; }
});
if (without.length > 0) {
    console.log(`\nStill missing: ${without.length} files`);
    without.slice(0, 5).forEach(f => console.log('  ' + f));
} else {
    console.log('\nAll files have tailwind-static.css.');
}
