/**
 * inject-shared.js
 * Batch-processes all HTML files in D:/GIT to:
 *   - Inject <link> to shared.css and <script> to shared.js
 *   - Remove duplicate shared code (CSS blocks, JS snippets)
 *   - Preserve all page-specific code
 */

const fs = require('fs');
const path = require('path');

const ROOT = 'D:/GIT';
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.bak', 'TEXT', '.claude', 'tools', 'images', 'downloads', 'videos']);

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------
function findHtmlFiles(dir) {
    let results = [];
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return results; // skip unreadable dirs
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!EXCLUDE_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
                results = results.concat(findHtmlFiles(full));
            }
        } else if (entry.name.endsWith('.html')) {
            results.push(full);
        }
    }
    return results;
}

// ---------------------------------------------------------------------------
// Process a single file – returns modified content or null if unchanged
// ---------------------------------------------------------------------------
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // a) Inject shared.css right before </head>
    //    Some pages have \n before </head>, some don't. Use exact replace.
    if (!content.includes('/shared.css')) {
        content = content.replace('</head>', '    <link rel="stylesheet" href="/shared.css">\n</head>');
    }

    // b) Inject shared.js right before </body>
    //    Similarly, some pages have \n before </body>.
    if (!content.includes('/shared.js')) {
        content = content.replace('</body>', '    <script src="/shared.js" defer></script>\n</body>');
    }

    // c) Remove the entire <style id="lang-style"> block (multiline, non-greedy)
    content = content.replace(/<style\s+id="lang-style">[\s\S]*?<\/style>/g, '');

    // d) Remove back-to-top scroll listener (two variants)
    content = content.replace(
        /<script>window\.addEventListener\('scroll',function\(\)\{var b=document\.getElementById\('back-to-top'\);b\.classList\.toggle\('show',window\.scrollY>400\)\}\);<\/script>/g,
        ''
    );
    content = content.replace(
        /<script>window\.addEventListener\('scroll',function\(\)\{document\.getElementById\('back-to-top'\)\.classList\.toggle\('show',window\.scrollY>400\)\}\);<\/script>/g,
        ''
    );

    // e) Remove cookie banner init script (exact string match)
    const cookieInitStr = "<script>(function(){if(!localStorage.getItem('cookie-consent')){var b=document.getElementById('cookie-banner');setTimeout(function(){b.classList.add('show')},500)}})();</script>";
    content = content.replaceAll(cookieInitStr, '');

    // f1) Remove STANDALONE language switch <script> blocks
    //     Matches <script> containing only // Language switch dropdown ... })();
    content = content.replace(
        /<script>\s*\n?\s*\/\/\s*Language switch dropdown[\s\S]*?}\)\s*\(\s*\)\s*;?\s*\n?\s*<\/script>/g,
        ''
    );

    // f2) Remove EMBEDDED language switch code (inside larger <script> blocks)
    //     Matches from comment through the IIFE closing
    content = content.replace(
        /\/\/\s*Language switch dropdown[\s\S]*?var saved\s*=\s*localStorage\.getItem\(["']lang["']\)\s*;\s*upd\s*\(\s*saved\s*===\s*["']zh["']\s*\)\s*;\s*\n?\s*}\)\s*\(\s*\)\s*;/g,
        ''
    );

    // f3) Handle contact.html variant — language switch has extra placeholder update code
    content = content.replace(
        /\/\/\s*Language switch dropdown[\s\S]*?var saved\s*=\s*localStorage\.getItem\(["']lang["']\)\s*;\s*upd\s*\(\s*saved\s*===\s*["']zh["']\s*\)\s*;\s*\n?\s*}\)\s*\(\s*\)\s*;\s*\n/g,
        '\n'
    );

    // g) Remove mobile menu block — from // Mobile menu through closing } of if-block
    //    The if(menuBtn) closing } is the only } on its own line in this section.
    content = content.replace(
        /\/\/\s*Mobile menu[\s\S]*?\n\s*\}\n/g,
        ''
    );

    // h) Remove copyright year updater line (inside DOMContentLoaded)
    content = content.replace(
        /document\.getElementById\(['"]copyright-year['"]\)\.textContent\s*=\s*new Date\(\)\.getFullYear\(\)\s*;?\s*\n?/g,
        ''
    );

    // i) Remove shared IntersectionObserver block (for fade-up/scale-in animations)
    //    This is the observer that watches .fade-up / .scale-in elements.
    //    We match by checking that the querySelectorAll includes .fade-up
    content = content.replace(
        /(?:const|var|let)\s+\w+\s*=\s*new\s+IntersectionObserver\s*\([\s\S]*?querySelectorAll\s*\(\s*['"]\.fade-up[\s\S]*?\.observe\s*\(\s*\w+\s*\)\s*\)\s*;?\s*/g,
        ''
    );

    // Clean up: remove empty <script></script> blocks (caused by removing all code inside)
    content = content.replace(/<script>\s*<\/script>\n?/g, '');

    // Clean up: merge consecutive blank lines into at most two
    content = content.replace(/\n{4,}/g, '\n\n\n');

    return content !== original ? content : null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
    console.log('Scanning for HTML files...');
    const files = findHtmlFiles(ROOT);
    console.log(`Found ${files.length} HTML files.`);

    let modified = 0;
    let errors = 0;

    for (const filePath of files) {
        try {
            const newContent = processFile(filePath);
            if (newContent !== null) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                modified++;
            }
        } catch (err) {
            console.error(`ERROR processing ${filePath}: ${err.message}`);
            errors++;
        }
    }

    console.log(`\nDone.`);
    console.log(`  Files found:   ${files.length}`);
    console.log(`  Files modified: ${modified}`);
    console.log(`  Errors:         ${errors}`);
}

main();
