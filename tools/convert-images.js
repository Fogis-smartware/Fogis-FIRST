/**
 * Smartware 图片批量转换脚本
 * 任务 1-3: Banner + 缩略图 + 工厂轮播图 → WebP
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/GIT/images';
const results = [];

async function convert(inputPath, outputPath, options) {
    const startSize = fs.statSync(inputPath).size;
    let pipeline = sharp(inputPath);
    if (options.resize) {
        pipeline = pipeline.resize(options.resize);
    }
    await pipeline.webp({ quality: options.quality || 80 }).toFile(outputPath);
    const endSize = fs.statSync(outputPath).size;
    const reduction = ((1 - endSize / startSize) * 100).toFixed(1);
    const label = path.basename(outputPath);
    const startKB = (startSize / 1024).toFixed(1);
    const endKB = (endSize / 1024).toFixed(1);
    results.push({ label, startKB, endKB, reduction, target: options.target });
    console.log(`  ${label}: ${startKB}KB → ${endKB}KB (${reduction}%)`);
}

async function main() {
    console.log('=== Smartware Image Conversion (WebP) ===\n');

    // ── Task 1: Banner ──
    console.log('[Task 1] Banner:');
    await convert(
        path.join(ROOT, 'banner-E013.png'),
        path.join(ROOT, 'banner-E013.webp'),
        { resize: { width: 1920, withoutEnlargement: true }, quality: 80, target: 250 }
    );

    // ── Task 2: Thumbnails ──
    console.log('\n[Task 2] Product Thumbnails:');
    const thumbDir = path.join(ROOT, 'thumbnails');
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir);
    for (const f of ['et1-e001.jpg', 'et5-h009.jpg', 'et1-c030.jpg']) {
        await convert(
            path.join(ROOT, f),
            path.join(thumbDir, f.replace('.jpg', '.webp')),
            { resize: { width: 400, withoutEnlargement: true }, quality: 75, target: 60 }
        );
    }

    // ── Task 3: Factory Carousel ──
    console.log('\n[Task 3] Factory Carousel:');
    for (let i = 1; i <= 9; i++) {
        const src = path.join(ROOT, `${i}.jpg`);
        if (fs.existsSync(src)) {
            await convert(
                src,
                path.join(ROOT, `${i}.webp`),
                { resize: { width: 1080, withoutEnlargement: true }, quality: 75, target: 100 }
            );
        }
    }

    // ── Summary ──
    console.log('\n=== Summary ===');
    const totalStart = results.reduce((s, r) => s + parseFloat(r.startKB), 0);
    const totalEnd = results.reduce((s, r) => s + parseFloat(r.endKB), 0);
    const totalReduction = ((1 - totalEnd / totalStart) * 100).toFixed(1);
    const passCount = results.filter(r => parseFloat(r.endKB) <= r.target).length;
    console.log(`Total: ${totalStart.toFixed(0)}KB → ${totalEnd.toFixed(0)}KB (${totalReduction}%)`);
    console.log(`Targets met: ${passCount}/${results.length} (target ≤ KB per file)`);
}

main().catch(err => { console.error(err); process.exit(1); });
