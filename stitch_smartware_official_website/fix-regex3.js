const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('product-') && f.endsWith('.html'));

// Old: images/([^.-]+)  -> matches only until first - or .
// New: images/([^.]+)   -> matches everything up to the dot
// In hex: need to change [^.-] to [^.]

const searchBytes = Buffer.from('/images\\/([^.-]+)');
const replaceBytes = Buffer.from('/images\\/([^.]+)');

let fixed = 0;
for (const file of files) {
    const filepath = path.join(__dirname, file);
    const content = fs.readFileSync(filepath);

    let newContent = content;
    let changed = false;
    let idx = newContent.indexOf(searchBytes);
    while (idx >= 0) {
        const before = newContent.slice(0, idx);
        const after = newContent.slice(idx + searchBytes.length);
        newContent = Buffer.concat([before, replaceBytes, after]);
        changed = true;
        idx = newContent.indexOf(searchBytes);
    }

    if (changed) {
        fs.writeFileSync(filepath, newContent);
        console.log('FIXED: ' + file);
        fixed++;
    }
}

console.log('Done. Fixed ' + fixed + ' files.');
