/**
 * Replace Tailwind CDN with static CSS in all HTML files
 * Phase 2 of performance optimization
 */
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/GIT';
const CSS_LINK = '<link rel="stylesheet" href="/tailwind-static.css">';

function processFile(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if already done
    if (html.includes('tailwind-static.css')) return false;

    // 1. Add static CSS link after Google Fonts stylesheet
    if (!html.includes(CSS_LINK)) {
        html = html.replace(
            /(fonts\.googleapis\.com[^<]*<\/link>)/,
            '$1\n' + CSS_LINK
        );
        modified = true;
    }

    // 2. Remove CDN tailwind script line
    html = html.replace(
        /<script src="https:\/\/cdn\.tailwindcss\.com\?plugins=forms"><\/script>\n?/g,
        ''
    );
    if (html.includes('cdn.tailwindcss.com')) {
        html = html.replace(
            /<script src="https:\/\/cdn\.tailwindcss\.com\?plugins=forms"><\/script>/g,
            ''
        );
    }

    // 3. Remove tailwind.config block
    html = html.replace(
        /<script id="tailwind-config">[\s\S]*?tailwind\.config\s*=\s*\{[\s\S]*?\}[\s\S]*?<\/script>/g,
        ''
    );

    if (modified) {
        fs.writeFileSync(filePath, html, 'utf8');
    }
    return modified;
}

// Recursively find all HTML files
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

console.log(`Modified ${count} files`);

// Verify
const remaining = htmlFiles.filter(f => {
    try { return fs.readFileSync(f, 'utf8').includes('cdn.tailwindcss.com'); }
    catch { return false; }
});
if (remaining.length > 0) {
    console.log(`\nWARNING: ${remaining.length} files still have CDN:`);
    remaining.forEach(f => console.log('  ' + f));
} else {
    console.log('\nAll CDN references removed successfully.');
}
