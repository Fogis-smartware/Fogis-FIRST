/**
 * Fix spec labels to be bilingual (EN+ZH) in all 63 new product pages.
 * Uses the same format as existing ET3-E065 template.
 */
const fs = require('fs');
const path = require('path');
const REPO = 'D:/GIT';

const EN_TO_ZH = {
  'AC voltage': '交流电压',
  'Battery capacity': '电池容量',
  'Battery life': '电池寿命',
  'Certified Product': '认证产品',
  'Charging method': '充电方式',
  'Charging time': '充电时间',
  'Color': '颜色',
  'Dimension': '尺寸',
  'Discharge time': '放电时间',
  'Features': '特性',
  'Flood angle': '光照角度',
  'Function': '功能',
  'Gross weight': '毛重',
  'Input voltage': '输入电压',
  'Irradiation distance': '照射距离',
  'LED Power': 'LED 功率',
  'Lamp beads': '灯珠',
  'Light source': '光源',
  'Lumens': '流明',
  'Main material': '主要材质',
  'Material': '材质',
  'Meansurement': '外箱尺寸',
  'Net weight': '净重',
  'Packaging dimension': '包装尺寸',
  'Product': '产品',
  'Protection level': '防护等级',
  'Qty / carton': '装箱数量',
  'Qty/carton': '装箱数量',
  'Shell material': '外壳材质',
  'Shell material:': '外壳材质',
  'Use time': '使用时间',
  'Voltage frequency': '电压频率',
  'Volume decibel': '音量分贝',
  'Waterproof': '防水',
  'Waterproof grade': '防水等级',
  'Waterproof rating': '防水等级',
  'Weight': '重量',
  'Weight(kg)': '重量(kg)',
};

const parsed = JSON.parse(fs.readFileSync(path.join(__dirname, 'bicycle_pages_data/parsed_products.json'), 'utf8'));

let fixed = 0;
for (const [model, data] of Object.entries(parsed)) {
  const modelLower = model.toLowerCase();
  const file = path.join(REPO, `product-${modelLower}.html`);
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, 'utf8');

  // Replace each spec label with bilingual version
  for (const [en, zh] of Object.entries(EN_TO_ZH)) {
    // Match the td containing the label text
    // Pattern: <td class="py-3 px-5 font-semibold...">Label</td>
    const pattern = new RegExp(
      `(<td class="py-3 px-5 font-semibold text-on-surface w-2/5 text-sm">)${en.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')}(</td>)`,
      'g'
    );
    html = html.replace(pattern, `$1<span lang="en">${en}</span><span lang="zh">${zh}</span>$2`);
  }

  fs.writeFileSync(file, html, 'utf8');
  fixed++;
}

console.log(`Fixed ${fixed} product pages with bilingual spec labels`);
