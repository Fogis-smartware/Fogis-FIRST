/**
 * Smartware 产品图片批量下载工具
 *
 * 工作流程：
 * 1. 遍历所有分类页（自动处理分页直到无更多产品），收集所有产品 URL + 型号
 * 2. 访问每个产品详情页，从 Swiper gallery 中提取所有图片 URL
 * 3. 下载本地缺失的图片到 images/ 目录
 *
 * 用法: node fetch_all_product_images.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ============ 配置 ============
const IMAGES_DIR = path.resolve(__dirname, 'images');
const PROGRESS_FILE = path.resolve(__dirname, 'image_fetch_progress.json');
const CATEGORIES_LOG = path.resolve(__dirname, 'image_fetch_categories.json');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0';
const BASE_URL = 'https://www.sst-smartware.com';
const CDN_DOMAIN = 'gcdn.meidianbang.cn';

// 最大并发数（TODO: 当前未实现并发控制，使用顺序处理；后续可基于此常量引入队列/信号量）
const MAX_CONCURRENT = 3;

// 所有分类ID（从原网站导航获取）
const CATEGORY_IDS = [
  639505, // LED Rechargeable Work Light
  639513, // LED Work Light
  639458, // LED Economy Work Light
  639456, // LED Motorcycle Light
  639515, // LED Light Bar
  639520, // LED Strip Light
  639457, // LED Solar Panel Products
  639522, // Bicycle Accessories
  639461, // LED Head Light
  639469, // LED Indoor Lighting
  639459, // LED Pen Light
  639468, // LED Flash Light
  639467, // LED Search Light
  639532, // Industrial Parts
];

// ============ 工具函数 ============

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 下载文件并保存到本地
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const timeout = setTimeout(() => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(new Error(`下载超时: ${url}`));
    }, 30000);

    https.get(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 30000
    }, (response) => {
      // 处理重定向
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        clearTimeout(timeout);
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        clearTimeout(timeout);
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode}: ${url}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        clearTimeout(timeout);
        file.close();
        const stats = fs.statSync(destPath);
        if (stats.size < 100) { // 太小的文件可能是占位图
          fs.unlinkSync(destPath);
          reject(new Error(`文件太小 (${stats.size} bytes): ${url}`));
        } else {
          resolve(destPath);
        }
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/**
 * 标准化产品型号用于文件名（小写、去特殊字符）
 */
function normalizeModel(model) {
  return model.toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 获取已存在的图片的文件名列表（不含路径）
 */
function getExistingImageNames() {
  const names = new Set();
  if (fs.existsSync(IMAGES_DIR)) {
    fs.readdirSync(IMAGES_DIR).forEach(f => {
      if (f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.svg')) {
        names.add(f);
      }
    });
  }
  return names;
}

/**
 * 从CDN URL转换为大图版本 (_b.jpg)
 */
function toBigImage(url) {
  return url.replace(/_s\.jpg($|\?)/, '_b.jpg$1')
            .replace(/_m\.jpg($|\?)/, '_b.jpg$1');
}

/**
 * 检查URL是否为真实产品图片（排除占位图、透明图）
 */
function isRealProductImage(url) {
  return url &&
    !url.includes('imgbg.png') &&
    !url.includes('touming.png') &&
    !url.includes('loading') &&
    !url.includes('logo') &&
    url.includes(CDN_DOMAIN) &&
    (url.endsWith('_b.jpg') || url.endsWith('_s.jpg') || url.includes('_b.jpg') || url.includes('_s.jpg'));
}

// ============ 阶段1: 收集所有产品URL ============

async function collectAllProductUrls(page) {
  console.log('\n========== 阶段1: 收集所有产品URL ==========');
  const allProducts = [];

  for (const catId of CATEGORY_IDS) {
    console.log(`\n--- 分类ID: ${catId} ---`);

    let pageNo = 1;
    let catProducts = [];

    while (true) {
      const url = `${BASE_URL}/Product/${catId}.html${pageNo > 1 ? `?PageNo=${pageNo}&ClassID=${catId}&responseModuleId=672112394` : ''}`;

      try {
        await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
        // 等待产品列表渲染
        await page.waitForSelector('a[href*="-PG"]', { timeout: 10000 }).catch(() => {});
        await sleep(1500);

        const products = await page.evaluate(() => {
          const items = [];
          document.querySelectorAll('a[href*="-PG"]').forEach(a => {
            const href = a.href;
            const match = href.match(/\/([^/]+)-PG(\d+)/);
            if (match) {
              items.push({
                url: href,
                model: match[1],
                pgId: match[2]
              });
            }
          });
          return items;
        });

        if (products.length === 0) break;

        catProducts = catProducts.concat(products);
        console.log(`  第${pageNo}页: ${products.length}个 (累计: ${catProducts.length})`);

        // 如果少于12个，说明是最后一页
        if (products.length < 12) break;

        pageNo++;
      } catch (err) {
        console.error(`  第${pageNo}页出错: ${err.message}`);
        break;
      }
    }

    // 按model去重并入总表
    for (const p of catProducts) {
      if (!allProducts.some(existing => existing.model === p.model)) {
        allProducts.push(p);
      }
    }

    console.log(`  => 分类共 ${catProducts.length} 个产品 (去重后 ${allProducts.length})`);
  }

  console.log(`\n总计: ${allProducts.length} 个产品`);
  return allProducts;
}

// ============ 阶段2: 提取产品图片 ============

async function extractProductImages(page, productUrl) {
  try {
    await page.goto(productUrl, { timeout: 30000, waitUntil: 'domcontentloaded' });
    // 等待页面完全加载，特别是Swiper
    await page.waitForSelector('.swiper-slide', { timeout: 10000 }).catch(() => {});
    await sleep(2000);

    const images = await page.evaluate(() => {
      const imgUrls = new Set();

      // 从 Swiper 中提取所有图片（主图 + gallery）
      document.querySelectorAll('.swiper-slide img').forEach(img => {
        const src = img.getAttribute('data-src') || img.src || '';
        imgUrls.add(src);
      });

      // 如果 Swiper 没找到，从其他常见位置找
      if (imgUrls.size === 0) {
        document.querySelectorAll('.proinfo img, .pro-detail img, .product-area img, .Prodetail img, [class*="product-pic"] img, [class*="pro-pic"] img').forEach(img => {
          const src = img.getAttribute('data-src') || img.src || '';
          imgUrls.add(src);
        });
      }

      // 从 magnifier/preview 找
      if (imgUrls.size === 0) {
        document.querySelectorAll('[class*="magnifier"] img, [class*="MagicZoom"] img, .preview img').forEach(img => {
          const src = img.getAttribute('data-src') || img.src || '';
          imgUrls.add(src);
        });
      }

      return [...imgUrls].filter(u => u && !u.includes('imgbg.png') && !u.includes('touming.png'));
    });

    return images;
  } catch (err) {
    return [];
  }
}

// ============ 阶段3: 下载图片 ============

async function downloadProductImages(model, imageUrls, existingImages) {
  const modelNorm = normalizeModel(model);
  const downloaded = [];

  // 转换所有为 _b.jpg (大图) 并过滤有效图片
  const validUrls = [...new Set(imageUrls.map(toBigImage))]
    .filter(url => url && url.includes(CDN_DOMAIN) && (url.endsWith('_b.jpg') || url.endsWith('.jpg')));

  if (validUrls.length === 0) return downloaded;

  // 主图 = 第一个有效图片
  for (let j = 0; j < validUrls.length; j++) {
    let localName;
    if (j === 0) {
      localName = `${modelNorm}.jpg`;
    } else {
      localName = `${modelNorm}-${j}.jpg`;
    }

    const localPath = path.join(IMAGES_DIR, localName);

    // 已存在则跳过
    if (existingImages.has(localName) || fs.existsSync(localPath)) {
      continue;
    }

    try {
      await downloadFile(validUrls[j], localPath);
      downloaded.push(localName);
      existingImages.add(localName);
    } catch (err) {
      // 下载失败，跳过
    }

    // 下载间隔，避免限流
    await sleep(200);
  }

  return downloaded;
}

// ============ 主流程 ============

async function main() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║  Smartware 产品图片批量下载工具           ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`  图片目录: ${IMAGES_DIR}`);

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // 加载已有图片
  const existingImages = getExistingImageNames();
  console.log(`  本地已有 ${existingImages.size} 个图片文件`);

  // 加载进度
  let progress = { products: [], downloaded: {} };
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`  已处理 ${progress.products.length} 个产品`);
    } catch (e) {
      console.log('  进度文件损坏，重新开始');
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  let allProducts;

  try {
    // ===== 阶段1: 收集所有产品URL =====
    // 检查是否已有产品列表缓存
    if (fs.existsSync(CATEGORIES_LOG) && progress.products.length > 0) {
      allProducts = JSON.parse(fs.readFileSync(CATEGORIES_LOG, 'utf-8'));
      console.log(`\n从缓存加载 ${allProducts.length} 个产品`);
    } else {
      allProducts = await collectAllProductUrls(page);
      fs.writeFileSync(CATEGORIES_LOG, JSON.stringify(allProducts, null, 2), 'utf-8');
    }

    // ===== 阶段2+3: 提取并下载图片 =====
    console.log('\n========== 阶段2+3: 提取并下载图片 ==========');

    let totalNewImages = 0;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      const model = product.model;

      // 跳过已处理的产品
      if (progress.products.includes(model)) {
        continue;
      }

      process.stdout.write(`\n[${i + 1}/${allProducts.length}] ${model}`);

      // 提取图片
      const imageUrls = await extractProductImages(page, product.url);

      if (imageUrls.length === 0) {
        process.stdout.write(` ⚠️ 无有效图片`);
        progress.products.push(model);
        failCount++;
        continue;
      }

      process.stdout.write(` | ${imageUrls.length} 张`);

      // 下载
      const newImages = await downloadProductImages(model, imageUrls, existingImages);

      if (newImages.length > 0) {
        process.stdout.write(` ✅ +${newImages.length}`);
        progress.downloaded[model] = (progress.downloaded[model] || 0) + newImages.length;
        totalNewImages += newImages.length;
      } else {
        process.stdout.write(` ✓ 已有`);
      }

      progress.products.push(model);
      successCount++;

      // 每 15 个产品保存一次进度
      if (i > 0 && i % 15 === 0) {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
      }
    }

    // 最终保存
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');

    // 统计
    console.log('\n\n╔═══════════════════════════════════════════╗');
    console.log('║  完成！                                    ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log(`  总产品数:     ${allProducts.length}`);
    console.log(`  成功处理:     ${successCount}`);
    console.log(`  无图片:       ${failCount}`);
    console.log(`  新下载图片:   ${totalNewImages} 张`);

    // 统计各产品图片数
    const stats = {};
    fs.readdirSync(IMAGES_DIR).forEach(f => {
      const model = f.replace(/-\d+\.jpg$/, '').replace(/\.\w+$/, '');
      stats[model] = (stats[model] || 0) + 1;
    });
    console.log(`\n图片最多的产品:`);
    Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([model, count]) => console.log(`  ${model}: ${count} 张`));

  } catch (err) {
    console.error('\n❌ 严重错误:', err.message);
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
    console.log('进度已保存');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
