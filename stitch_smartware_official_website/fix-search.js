/**
 * Inject search.js and search-data.js into all product pages
 */
const fs = require('fs');
const path = require('path');

const dir = 'D:/GIT';
const files = fs.readdirSync(dir).filter(f => f.startsWith('product-') && f.endsWith('.html'));

let fixed = 0, skipped = 0;

for (const f of files) {
  const fp = path.join(dir, f);
  let html = fs.readFileSync(fp, 'utf-8');

  if (html.includes('search-data.js')) {
    skipped++;
    continue;
  }

  const oldStr = '<style id="lang-style">';
  if (!html.includes(oldStr)) {
    console.log('No lang-style in', f);
    skipped++;
    continue;
  }

  // Find </style> after lang-style and insert scripts before </head>
  // Strategy: find lang-style block's </style>, then find next </head>
  const langStyleIdx = html.indexOf(oldStr);
  const styleCloseIdx = html.indexOf('</style>', langStyleIdx) + '</style>'.length;
  const headCloseIdx = html.indexOf('</head>', styleCloseIdx);

  if (styleCloseIdx > 0 && headCloseIdx > styleCloseIdx) {
    html = html.substring(0, headCloseIdx) +
      '\n<script src="search-data.js"></script>\n<script src="search.js"></script>\n' +
      html.substring(headCloseIdx);
    fs.writeFileSync(fp, html, 'utf-8');
    fixed++;
  } else {
    console.log('Cannot find insertion point in', f);
    skipped++;
  }
}

console.log('Search fix: ' + fixed + ' updated, ' + skipped + ' skipped');
