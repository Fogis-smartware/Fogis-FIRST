const fs = require('fs');
const path = require('path');
const glob = require('fs').glob || require('path');

const websiteDir = 'D:/GIT/stitch_smartware_official_website';

const galleryCSS = `
        .product-gallery{position:relative}.gallery-main{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;overflow:hidden}.gallery-main img{max-width:100%;max-height:100%;object-fit:contain;transition:opacity .3s ease}.gallery-thumbs{display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:4px}.gallery-thumbs::-webkit-scrollbar{height:4px}.gallery-thumbs::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}.gallery-thumb{width:64px;height:64px;border:2px solid transparent;border-radius:6px;overflow:hidden;cursor:pointer;flex-shrink:0;transition:border-color .2s;background:#fff;display:flex;align-items:center;justify-content:center}.gallery-thumb:hover{border-color:#a33e00}.gallery-thumb.active{border-color:#ff6600}.gallery-thumb img{max-width:100%;max-height:100%;object-fit:contain}.gallery-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.9);border:1px solid #e3bfb1;cursor:pointer;display:none;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,0.1)}.product-gallery:hover .gallery-nav{display:flex}.gallery-nav:hover{background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.15)}.gallery-nav.prev{left:8px}.gallery-nav.next{right:8px}.gallery-nav .material-symbols-outlined{font-size:20px;color:#a33e00}
`;

const galleryJS = `
// Product Gallery
(function() {
    var mainImg = document.querySelector('.gallery-main img') || document.querySelector('.aspect-square img');
    if (!mainImg) return;
    var src = mainImg.getAttribute('src');
    var match = src.match(/images\\\\([^.-]+)/);
    if (!match) return;
    var model = match[1];
    var container = mainImg.closest('.aspect-square') || mainImg.parentNode;
    var oldParent = container.parentNode;
    var gallery = document.createElement('div');
    gallery.className = 'product-gallery';
    var mainDiv = document.createElement('div');
    mainDiv.className = 'gallery-main rounded-xl overflow-hidden shadow-soft border border-outline-variant bg-surface-container';
    var imgClone = container.cloneNode(true);
    var innerImg = imgClone.querySelector('img');
    if (innerImg) { innerImg.style.maxWidth = '100%'; innerImg.style.maxHeight = '100%'; innerImg.style.objectFit = 'contain'; }
    mainDiv.appendChild(imgClone);
    gallery.appendChild(mainDiv);
    var prevBtn = document.createElement('button');
    prevBtn.className = 'gallery-nav prev';
    prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
    var nextBtn = document.createElement('button');
    nextBtn.className = 'gallery-nav next';
    nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
    gallery.appendChild(prevBtn);
    gallery.appendChild(nextBtn);
    var thumbsContainer = document.createElement('div');
    thumbsContainer.className = 'gallery-thumbs-container';
    thumbsContainer.style.display = 'none';
    var thumbsDiv = document.createElement('div');
    thumbsDiv.className = 'gallery-thumbs';
    thumbsContainer.appendChild(thumbsDiv);
    gallery.appendChild(thumbsContainer);
    oldParent.insertBefore(gallery, container);
    oldParent.removeChild(container);
    var currentIdx = 0;
    var images = [mainImg.getAttribute('src')];
    var totalImages = 1;
    var thumbs = thumbsDiv;
    function tryLoadImage(idx) {
        var img = new Image();
        var ext = src.includes('.jpg') ? 'jpg' : (src.includes('.png') ? 'png' : 'jpg');
        var trySrc = 'images/' + model + '-' + idx + '.' + ext;
        img.onload = function() {
            images.push(trySrc);
            totalImages = images.length;
            var thumb = document.createElement('div');
            thumb.className = 'gallery-thumb' + (totalImages === 2 ? ' active' : '');
            thumb.innerHTML = '<img src="' + trySrc + '" alt="Gallery ' + idx + '">';
            thumb.onclick = function() { showImage(idx); };
            thumbs.appendChild(thumb);
            thumbsContainer.style.display = 'block';
            if (totalImages === 2) {
                var firstThumb = document.createElement('div');
                firstThumb.className = 'gallery-thumb active';
                firstThumb.innerHTML = '<img src="' + images[0] + '" alt="Main">';
                firstThumb.onclick = function() { showImage(0); };
                thumbs.insertBefore(firstThumb, thumbs.firstChild);
            }
            tryLoadImage(idx + 1);
        };
        img.onerror = function() { /* no more images */ };
        img.src = trySrc;
    }
    function showImage(idx) {
        if (idx < 0) idx = totalImages - 1;
        if (idx >= totalImages) idx = 0;
        currentIdx = idx;
        var displayImg = mainDiv.querySelector('img') || mainDiv.querySelector('.gallery-main-img');
        if (!displayImg) displayImg = mainDiv.querySelector('img');
        if (displayImg) {
            displayImg.style.opacity = '0';
            setTimeout(function() {
                displayImg.src = images[idx];
                displayImg.style.opacity = '1';
            }, 150);
        }
        var allThumbs = thumbs.querySelectorAll('.gallery-thumb');
        allThumbs.forEach(function(t, i) { t.classList.toggle('active', i === idx); });
    }
    prevBtn.onclick = function() { showImage(currentIdx - 1); };
    nextBtn.onclick = function() { showImage(currentIdx + 1); };
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') showImage(currentIdx - 1);
        if (e.key === 'ArrowRight') showImage(currentIdx + 1);
    });
    setTimeout(function() { tryLoadImage(1); }, 500);
})();
`;

// Get all product HTML files
const productFiles = fs.readdirSync(websiteDir)
    .filter(f => f.startsWith('product-') && f.endsWith('.html'))
    .sort();

console.log(`Found ${productFiles.length} product pages`);

let success = 0;
let errors = 0;

for (const file of productFiles) {
    const filepath = path.join(websiteDir, file);
    try {
        let content = fs.readFileSync(filepath, 'utf8');

        // Skip if already processed
        if (content.includes('Product Gallery')) {
            console.log(`  SKIP (already has gallery): ${file}`);
            continue;
        }

        // 1. Add gallery CSS to first <style> tag (insert before </style>)
        const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
        if (styleMatch) {
            const firstStyle = styleMatch[0];
            const newStyle = firstStyle.replace('</style>', galleryCSS + '\n        </style>');
            content = content.replace(firstStyle, newStyle);
        }

        // 2. Wrap image container
        // Find: <div class="aspect-square ..."><img ... src="images/xxx.jpg"/></div>
        const imgRegex = /<div class="aspect-square[^"]*"[^>]*>\s*<img[^>]*src="images\/[^"]*"[^>]*\/?>\s*<\/div>/;
        content = content.replace(imgRegex, function(match) {
            // Extract the img tag
            const imgMatch = match.match(/(<img[^>]*src="images\/[^"]*"[^>]*\/?>)/);
            const imgTag = imgMatch ? imgMatch[1] : match;

            return '<div class="product-gallery">\n' +
                '\t<div class="gallery-main rounded-xl overflow-hidden shadow-soft border border-outline-variant bg-surface-container">\n' +
                '\t' + imgTag + '\n' +
                '\t</div>\n' +
                '\t<button class="gallery-nav prev"><span class="material-symbols-outlined">chevron_left</span></button>\n' +
                '\t<button class="gallery-nav next"><span class="material-symbols-outlined">chevron_right</span></button>\n' +
                '\t<div class="gallery-thumbs-container" style="display:none">\n' +
                '\t\t<div class="gallery-thumbs"></div>\n' +
                '\t</div>\n' +
                '</div>';
        });

        // 3. Add gallery JS before </body>
        content = content.replace('</body>', galleryJS + '\n</body>');

        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`  OK: ${file}`);
        success++;
    } catch (err) {
        console.error(`  ERROR: ${file} - ${err.message}`);
        errors++;
    }
}

console.log(`\nDone: ${success} succeeded, ${errors} failed out of ${productFiles.length} files`);
