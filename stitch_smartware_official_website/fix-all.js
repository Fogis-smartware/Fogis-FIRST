const fs = require('fs');
const path = require('path');

const BASE = 'D:/GIT/stitch_smartware_official_website';

// ---- Helpers ----

function findMatchingBrace(str, openPos) {
    // str[openPos] must be '{'
    let depth = 1;
    let i = openPos + 1;
    while (i < str.length && depth > 0) {
        if (str[i] === '{') depth++;
        else if (str[i] === '}') depth--;
        i++;
    }
    return i - 1; // position of matching '}'
}

// ---- Fix 1: Tailwind config nesting ----
function fixTailwindConfig(content, counts) {
    const twStart = content.indexOf('<script id="tailwind-config">');
    if (twStart === -1) return content;

    const twEnd = content.indexOf('</script>', twStart);
    if (twEnd === -1) return content;

    const scriptTagEnd = twStart + '<script id="tailwind-config">'.length;
    const before = content.substring(0, twStart);
    const scriptTag = content.substring(twStart, scriptTagEnd);
    const scriptContent = content.substring(scriptTagEnd, twEnd);
    const after = content.substring(twEnd);

    let fixed = scriptContent;
    let wasFixed = false;

    // ---- Minified bicycle variant: fontFamily INSIDE spacing ----
    const bicycleAnchor = '"margin-mobile":"20px","fontFamily"';
    if (fixed.includes(bicycleAnchor)) {
        const anchorIdx = fixed.indexOf(bicycleAnchor);
        const beforeAnchor = fixed.substring(0, anchorIdx + '"margin-mobile":"20px"'.length);
        // After "margin-mobile":"20px" comes ,"fontFamily":{...},"fontSize":{...},"borderRadius":{...}
        let pos = anchorIdx + '"margin-mobile":"20px",'.length; // points to "fontFamily"

        // Extract three segments using brace counting
        const segments = [];
        const names = ['"fontFamily"', '"fontSize"', '"borderRadius"'];
        for (const name of names) {
            const nameIdx = fixed.indexOf(name, pos);
            const openBrace = fixed.indexOf('{', nameIdx);
            const closeBrace = findMatchingBrace(fixed, openBrace);
            segments.push(fixed.substring(nameIdx, closeBrace + 1));
            pos = closeBrace + 1;
            if (pos < fixed.length && fixed[pos] === ',') pos++;
        }
        // pos now points to the first '}' that closes spacing (after all three segments)
        // The remaining is spacing-close + extend-close + theme-close + config-close => 4 '}'s
        // We want to skip the spacing close (1 '}'), keeping 3 '}'s for extend/theme/config
        const closingBraces = '}}}'; // extend, theme, config
        fixed = beforeAnchor + '},' + segments.join(',') + closingBraces + '\n';
        wasFixed = true;
    }

    // ---- Formatted product/category variant: fontFamily at ROOT level ----
    if (!wasFixed && fixed.includes('\n') && fixed.includes('"fontFamily"')) {
        // Pattern: extend close(12sp) + theme close(8sp) + comma(4sp) then font blocks
        const brokenClose = '\n            }\n        }\n    ,\n';
        if (fixed.includes(brokenClose)) {
            const idx = fixed.indexOf(brokenClose);
            const beforeClose = fixed.substring(0, idx);
            const afterClose = fixed.substring(idx + brokenClose.length);

            // Find the last config close: \n followed by 12 spaces then }
            const configCloseIdx = afterClose.lastIndexOf('\n            }');
            if (configCloseIdx !== -1) {
                const fontBlocks = afterClose.substring(0, configCloseIdx);
                const newEnding = '\n            }\n        }\n    }';
                fixed = ',\n' + fontBlocks + newEnding + '\n';
                fixed = beforeClose + fixed;
                wasFixed = true;
            }
        }
    }

    // ---- Minified non-bicycle variant: fontFamily at ROOT level ----
    if (!wasFixed && !fixed.includes('\n') && fixed.includes('"fontFamily"') && !fixed.includes(bicycleAnchor)) {
        // Pattern: ...}},"fontFamily":{...},"fontSize":{...},"borderRadius":{...}}
        // fontFamily at config root, not inside spacing
        const ffIdx = fixed.indexOf(',"fontFamily"');
        if (ffIdx !== -1) {
            // Find where extend closes (it has }} before the comma)
            // Structure: extend:{colors:{...},spacing:{...}},"fontFamily":...
            // We need to move fontFamily/fontSize/borderRadius inside extend
            let pos = ffIdx + 1; // points to "fontFamily"
            const segments = [];
            const names = ['"fontFamily"', '"fontSize"', '"borderRadius"'];
            for (const name of names) {
                const nameIdx = fixed.indexOf(name, pos);
                const openBrace = fixed.indexOf('{', nameIdx);
                const closeBrace = findMatchingBrace(fixed, openBrace);
                segments.push(fixed.substring(nameIdx, closeBrace + 1));
                pos = closeBrace + 1;
                if (pos < fixed.length && fixed[pos] === ',') pos++;
            }
            // Remove them from root level and insert into extend
            // Original: ...spacing:{...}},"fontFamily":...},...borderRadius}:{...}}}
            // The "}}," before fontFamily closes extend and theme
            const beforeRoot = fixed.substring(0, ffIdx); // includes closing }}
            // Remove the closing }} of extend/theme
            const beforeExtend = beforeRoot.substring(0, beforeRoot.length - 3); // remove "}},"
            // Add the segments at extend level, then close extend/theme/config
            const closing = '}}}'; // extend, theme, config
            fixed = beforeExtend + ',' + segments.join(',') + ',' + closing + '\n';
            wasFixed = true;
        }
    }

    if (wasFixed) {
        counts.fix1_tailwind++;
        return before + scriptTag + fixed + after;
    }
    return content;
}

// ---- Main ----

const allFiles = fs.readdirSync(BASE).filter(f => {
    return (f.startsWith('product-') || f.startsWith('category-')) && f.endsWith('.html');
});

console.log(`Found ${allFiles.length} files: ${allFiles.filter(f=>f.startsWith('product-')).length} product, ${allFiles.filter(f=>f.startsWith('category-')).length} category\n`);

const counts = {
    fix1_tailwind: 0, fix2_spec_table: 0, fix3_lang_css: 0,
    fix4_surface_low: 0, fix5_full_width: 0, fix6_delay_css: 0,
    fix7_rosh: 0, fix8_meansurement: 0, fix9_currente: 0,
    fix10_body_md: 0, fix11_container_queries: 0,
};
let filesChanged = 0;

for (const file of allFiles) {
    const filePath = path.join(BASE, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // ---- FIX 1: Tailwind config nesting ----
    content = fixTailwindConfig(content, counts);

    // ---- FIX 2: Broken spec table HTML ----
    // Pattern: </h2> rounded-xl... (missing <div class=")
    if (content.includes('</h2> rounded-xl')) {
        content = content.replace(
            /(<\/h2>) rounded-xl shadow-soft border border-outline-variant overflow-hidden">/g,
            '$1<div class="rounded-xl shadow-soft border border-outline-variant overflow-hidden">'
        );
        counts.fix2_spec_table++;
    }

    // ---- FIX 3: Language-switch CSS ----
    // Minified pattern (ALL product + category files)
    const oldLangMin = 'body:not(.show-zh) [lang="zh"]{display:none!important}body.show-zh [lang="zh"]{display:inline!important}body.show-zh [lang="zh"].block,body.show-zh [lang="zh"].flex,body.show-zh [lang="zh"].inline-flex{display:inline-flex!important}body.show-zh [lang="en"]{display:none!important}';
    const newLangMin = 'body:not(.show-zh) [lang="zh"]{display:none!important}body.show-zh [lang="zh"].block{display:block!important}body.show-zh [lang="zh"].flex{display:flex!important}body.show-zh [lang="zh"].grid{display:grid!important}body.show-zh [lang="zh"].inline-flex{display:inline-flex!important}body.show-zh [lang="en"]{display:none!important}';

    if (content.includes(oldLangMin)) {
        content = content.replace(oldLangMin, newLangMin);
        counts.fix3_lang_css++;
    } else {
        // Try formatted multi-line pattern
        const formattedOld = /body\.show-zh \[lang="zh"\]\{display:inline!important\}\s*\n\s*body\.show-zh \[lang="zh"\]\.block,\s*\n\s*body\.show-zh \[lang="zh"\]\.flex,\s*\n\s*body\.show-zh \[lang="zh"\]\.inline-flex\{display:inline-flex!important\}/;
        if (formattedOld.test(content)) {
            content = content.replace(formattedOld,
                'body.show-zh [lang="zh"].block{display:block!important}\n' +
                'body.show-zh [lang="zh"].flex{display:flex!important}\n' +
                'body.show-zh [lang="zh"].grid{display:grid!important}\n' +
                'body.show-zh [lang="zh"].inline-flex{display:inline-flex!important}'
            );
            counts.fix3_lang_css++;
        }
    }

    // ---- FIX 4: Add surface-container-low color ----
    if (content.includes('"surface-container":"#eeeeee"') && !content.includes('"surface-container-low"')) {
        content = content.replace(
            /"surface-container":"#eeeeee"/g,
            '"surface-container-low":"#f3f3f3","surface-container":"#eeeeee"'
        );
        counts.fix4_surface_low++;
    }

    // ---- FIX 5: Replace full-width with w-full in header ----
    if (content.includes('full-width')) {
        content = content.replace(/full-width/g, 'w-full');
        counts.fix5_full_width++;
    }

    // ---- FIX 6: Add .delay-3 and .delay-4 CSS (category files only) ----
    if (file.startsWith('category-') &&
        content.includes('.delay-1{transition-delay:0.1s}.delay-2{transition-delay:0.2s}') &&
        !content.includes('.delay-3{transition-delay:0.35s}')) {
        content = content.replace(
            '.delay-1{transition-delay:0.1s}.delay-2{transition-delay:0.2s}',
            '.delay-1{transition-delay:0.1s}.delay-2{transition-delay:0.2s}.delay-3{transition-delay:0.35s}.delay-4{transition-delay:0.5s}'
        );
        counts.fix6_delay_css++;
    }

    // ---- FIX 7: Rosh -> RoHS ----
    const roshCount = (content.match(/Rosh/g) || []).length;
    if (roshCount > 0) {
        content = content.replace(/Rosh/g, 'RoHS');
        counts.fix7_rosh += roshCount;
    }

    // ---- FIX 8: Meansurement -> Measurement ----
    const measCount = (content.match(/Meansurement/g) || []).length;
    if (measCount > 0) {
        content = content.replace(/Meansurement/g, 'Measurement');
        counts.fix8_meansurement += measCount;
    }

    // ---- FIX 9: Currente -> Current ----
    const curreCount = (content.match(/Currente/g) || []).length;
    if (curreCount > 0) {
        content = content.replace(/Currente/g, 'Current');
        counts.fix9_currente += curreCount;
    }

    // ---- FIX 10: body-md without prefix ----
    // In footer: class="text-secondary body-md max-w-md" -> class="text-secondary text-body-md max-w-md"
    if (content.includes('class="text-secondary body-md max-w-md"')) {
        content = content.replace(
            /class="text-secondary body-md max-w-md"/g,
            'class="text-secondary text-body-md max-w-md"'
        );
        counts.fix10_body_md++;
    }

    // ---- FIX 11: Remove container-queries from CDN ----
    if (content.includes('container-queries')) {
        content = content.replace(
            /<script src="https:\/\/cdn\.tailwindcss\.com\?plugins=forms,container-queries"><\/script>/g,
            '<script src="https://cdn.tailwindcss.com?plugins=forms"></script>'
        );
        counts.fix11_container_queries++;
    }

    // ---- Write back if changed ----
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesChanged++;
        // Print which fixes applied to this file
        const applied = [];
        if (content !== fixTailwindConfig(original, {fix1_tailwind:0}) && original.includes('"fontFamily"')) applied.push('F1');
        if (original.includes('</h2> rounded-xl')) applied.push('F2');
        if (original.includes(oldLangMin)) applied.push('F3');
        if (original.includes('"surface-container":"#eeeeee"') && !original.includes('"surface-container-low"')) applied.push('F4');
        if (original.includes('full-width')) applied.push('F5');
        if (file.startsWith('category-') && original.includes('.delay-1') && !original.includes('.delay-3')) applied.push('F6');
        if (original.includes('Rosh')) applied.push('F7');
        if (original.includes('Meansurement')) applied.push('F8');
        if (original.includes('Currente')) applied.push('F9');
        if (original.includes('class="text-secondary body-md max-w-md"')) applied.push('F10');
        if (original.includes('container-queries')) applied.push('F11');
        if (applied.length === 0) {
            // Fix1 detection (complex)
            if (original.includes('"fontFamily"')) applied.push('F1');
        }
        console.log(`  ${file}: ${applied.join(' ')}`);
    }
}

// ---- Summary ----
console.log(`\n========== SUMMARY ==========`);
console.log(`Files processed: ${allFiles.length}`);
console.log(`Files changed:  ${filesChanged}`);
console.log(``);
console.log(`Fix  1 (tailwind config nesting):        ${counts.fix1_tailwind} files`);
console.log(`Fix  2 (broken spec table HTML):          ${counts.fix2_spec_table} files`);
console.log(`Fix  3 (language-switch CSS):             ${counts.fix3_lang_css} files`);
console.log(`Fix  4 (surface-container-low color):     ${counts.fix4_surface_low} files`);
console.log(`Fix  5 (full-width -> w-full):            ${counts.fix5_full_width} files`);
console.log(`Fix  6 (delay-3/delay-4 CSS):             ${counts.fix6_delay_css} files`);
console.log(`Fix  7 (Rosh -> RoHS):                    ${counts.fix7_rosh} occurrences`);
console.log(`Fix  8 (Meansurement -> Measurement):     ${counts.fix8_meansurement} occurrences`);
console.log(`Fix  9 (Currente -> Current):             ${counts.fix9_currente} occurrences`);
console.log(`Fix 10 (body-md -> text-body-md):         ${counts.fix10_body_md} files`);
console.log(`Fix 11 (remove container-queries):        ${counts.fix11_container_queries} files`);
console.log(`========================================`);
