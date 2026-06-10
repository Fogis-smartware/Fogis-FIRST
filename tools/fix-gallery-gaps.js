/**
 * Fix product gallery image numbering gaps
 * Renames images to close gaps so gallery JS loads all files
 * Uses git mv to preserve git tracking
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const IMG = 'D:/GIT/images';
const REPORT = [];

// Find all products that have at least one gallery image
const productFiles = fs.readdirSync('D:/GIT')
    .filter(f => f.startsWith('product-') && f.endsWith('.html'))
    .map(f => f.replace('product-', '').replace('.html', ''));

const modelsWithGaps = [];

for (const model of productFiles) {
    // Find all gallery images: model-N.jpg
    const pattern = new RegExp(`^${model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.jpg$`);
    const existing = fs.readdirSync(IMG)
        .filter(f => pattern.test(f))
        .map(f => ({
            file: f,
            num: parseInt(f.match(pattern)[1])
        }))
        .sort((a, b) => a.num - b.num);

    if (existing.length === 0) continue; // no gallery images

    // Check for gaps
    const nums = existing.map(e => e.num);
    const expected = Array.from({ length: nums[nums.length - 1] }, (_, i) => i + 1);
    const hasGap = nums.some((n, i) => n !== i + 1) || nums[0] !== 1;

    if (!hasGap) continue;

    modelsWithGaps.push({ model, existing });
}

console.log(`Found ${modelsWithGaps.length} products with gaps\n`);

// Fix each product: rename to sequential 1..N
for (const { model, existing } of modelsWithGaps) {
    console.log(`Fixing: ${model} (${existing.length} images)`);

    const sorted = existing.sort((a, b) => a.num - b.num);
    console.log(`  Before: ${sorted.map(e => e.num).join(', ')}`);

    // Phase 1: Rename all to temp names (avoids collision)
    const tempNames = [];
    for (let i = 0; i < sorted.length; i++) {
        const oldFile = sorted[i].file;
        const tempFile = `${model}-_tmp_${i}.jpg`;
        const oldPath = path.join(IMG, oldFile);
        const tempPath = path.join(IMG, tempFile);
        try {
            execSync(`git mv "${oldPath}" "${tempPath}"`, { stdio: 'pipe' });
        } catch {
            // If git mv fails (file not tracked), use regular rename
            fs.renameSync(oldPath, tempPath);
        }
        tempNames.push({ tempFile, targetNum: i + 1 });
        REPORT.push({ model, oldName: oldFile, newName: `${model}-${i + 1}.jpg` });
    }

    // Phase 2: Rename from temp to final names
    for (const { tempFile, targetNum } of tempNames) {
        const tempPath = path.join(IMG, tempFile);
        const finalName = `${model}-${targetNum}.jpg`;
        const finalPath = path.join(IMG, finalName);
        try {
            execSync(`git mv "${tempPath}" "${finalPath}"`, { stdio: 'pipe' });
        } catch {
            fs.renameSync(tempPath, finalPath);
        }
    }

    console.log(`  After:  1..${sorted.length}`);
    console.log('');
}

console.log(`\n=== Summary ===`);
console.log(`Fixed ${modelsWithGaps.length} products, renamed ${REPORT.length} files.`);

// Print the report table
console.log(`\n| Product | Old → New |`);
console.log(`|---------|-----------|`);
for (const r of REPORT) {
    console.log(`| ${r.model} | ${r.oldName} → ${r.newName} |`);
}
