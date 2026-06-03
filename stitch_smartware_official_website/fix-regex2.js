const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('product-') && f.endsWith('.html'));

// We need to replace: /images\( -> /images\/
// In hex: 2f 69 6d 61 67 65 73 5c 5c 28 -> 2f 69 6d 61 67 65 73 5c 2f 28
// Simple: replace the two bytes 5c 5c with 5c 2f within the context /images\

const searchBytes = Buffer.from('/images\\(', 'ascii');
// Wait, that won't work because \( is escape for ( in string
// Let's build it differently
const searchPattern = Buffer.from([0x2f, 0x69, 0x6d, 0x61, 0x67, 0x65, 0x73, 0x5c, 0x5c, 0x28]);
const replacePattern = Buffer.from([0x2f, 0x69, 0x6d, 0x61, 0x67, 0x65, 0x73, 0x5c, 0x2f, 0x28]);

let fixed = 0;
for (const file of files) {
    const filepath = path.join(__dirname, file);
    const content = fs.readFileSync(filepath);

    const idx = content.indexOf(searchPattern);
    if (idx >= 0) {
        // Build new buffer
        const newContent = Buffer.alloc(content.length - searchPattern.length + replacePattern.length);
        content.copy(newContent, 0, 0, idx);
        replacePattern.copy(newContent, idx);
        content.copy(newContent, idx + replacePattern.length, idx + searchPattern.length);
        fs.writeFileSync(filepath, newContent);
        console.log('FIXED: ' + file);
        fixed++;
    }
}

console.log('Done. Fixed ' + fixed + ' files.');
