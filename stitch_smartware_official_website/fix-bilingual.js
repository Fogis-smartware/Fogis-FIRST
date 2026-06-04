/**
 * Add missing English translations to category page product card subtitles
 */
const fs = require('fs');
const path = require('path');

const dir = 'D:/GIT';

// Chinese → English translation map
const zh2en = {
  '多功能骑行灯': 'Multi-function Cycling Light',
  '自行车灯带喇叭': 'Bicycle Light with Horn',
  '三合一骑行配件': '3-in-1 Cycling Accessories',
  '自行车打气筒': 'Bicycle Pump',
  '自行车配件': 'Bicycle Accessories',
  '工业配件': 'Industrial Parts',
  'LED 经济型工作灯': 'LED Economy Work Light',
  'LED 手电筒': 'LED Flashlight',
  'LED 头灯': 'LED Head Light',
  'LED 灯条': 'LED Light Bar',
  'LED 摩托车灯': 'LED Motorcycle Light',
  'LED 笔灯': 'LED Pen Light',
  'LED 可充电工作灯': 'LED Rechargeable Work Light',
  'LED 探照灯': 'LED Search Light',
  'LED 太阳能产品': 'LED Solar Panel',
  'LED 灯带': 'LED Strip Light',
  'LED 三脚灯': 'LED Tripod Light',
  'LED 工作灯': 'LED Work Light',
};

const files = fs.readdirSync(dir).filter(f => f.startsWith('category-') && f.endsWith('.html'));

let stats = { files: 0, fixes: 0 };

for (const f of files) {
  let html = fs.readFileSync(path.join(dir, f), 'utf-8');
  let fileFixes = 0;

  for (const [zh, en] of Object.entries(zh2en)) {
    // Match: <span lang="zh">菊花配件</span> (without preceding lang="en" on same line)
    // Target pattern in the product card subtitle area
    const pattern = `<span lang="zh">${zh}</span>`;
    const replacement = `<span lang="en">${en}</span><span lang="zh">${zh}</span>`;

    // Only replace if the line doesn't already have lang="en"
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern) && !lines[i].includes('lang="en"')) {
        lines[i] = lines[i].replace(pattern, replacement);
        fileFixes++;
      }
    }
    html = lines.join('\n');
  }

  if (fileFixes > 0) {
    fs.writeFileSync(path.join(dir, f), html, 'utf-8');
    stats.files++;
    stats.fixes += fileFixes;
    console.log(f + ': ' + fileFixes + ' fixed');
  }
}

console.log('\nTotal: ' + stats.files + ' files, ' + stats.fixes + ' translations added');
