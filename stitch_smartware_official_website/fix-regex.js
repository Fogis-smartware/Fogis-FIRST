const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('product-') && f.endsWith('.html'));

let fixed = 0;
for (const file of files) {
    const filepath = path.join(__dirname, file);
    let content = fs.readFileSync(filepath, 'utf8');

    // The broken pattern: var match = src.match(/images\([^.-]+)/);
    // Use string literal that preserves backslashes
    const searchStr = 'var match = src.match(/images' + String.raw`\([^.-]+\)` + '/);';
    const replaceStr = 'var match = src.match(/images\\/([^.-]+)/);';

    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replaceStr);
        fs.writeFileSync(filepath, content, 'utf8');
        console.log('FIXED: ' + file);
        fixed++;
    }
}

console.log('Done. Fixed ' + fixed + ' files.');
