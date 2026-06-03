#!/usr/bin/env python3
"""
Add product image gallery to all product-*.html pages.
This script:
1. Adds gallery CSS to the first <style> tag
2. Wraps the image container in a gallery div
3. Adds gallery JavaScript for dynamic thumbnail loading
"""

import os
import re
import glob

WEBSITE_DIR = "D:/GIT/stitch_smartware_official_website"

# Gallery CSS to inject into the first <style> tag
GALLERY_CSS = """
        .product-gallery{position:relative}.gallery-main{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;overflow:hidden}.gallery-main img{max-width:100%;max-height:100%;object-fit:contain;transition:opacity .3s ease}.gallery-thumbs{display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:4px}.gallery-thumbs::-webkit-scrollbar{height:4px}.gallery-thumbs::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px}.gallery-thumb{width:64px;height:64px;border:2px solid transparent;border-radius:6px;overflow:hidden;cursor:pointer;flex-shrink:0;transition:border-color .2s;background:#fff;display:flex;align-items:center;justify-content:center}.gallery-thumb:hover{border-color:#a33e00}.gallery-thumb.active{border-color:#ff6600}.gallery-thumb img{max-width:100%;max-height:100%;object-fit:contain}.gallery-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.9);border:1px solid #e3bfb1;cursor:pointer;display:none;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,0.1)}.product-gallery:hover .gallery-nav{display:flex}.gallery-nav:hover{background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.15)}.gallery-nav.prev{left:8px}.gallery-nav.next{right:8px}.gallery-nav .material-symbols-outlined{font-size:20px;color:#a33e00}
"""

# Gallery JavaScript to inject before the closing </body> tag
GALLERY_JS = """
// Product Gallery
(function() {
    var mainImg = document.querySelector('.gallery-main img') || document.querySelector('.aspect-square img');
    if (!mainImg) return;

    var src = mainImg.getAttribute('src');
    var match = src.match(/images\\/([^.-]+)/);
    if (!match) return;
    var model = match[1];

    var container = mainImg.closest('.aspect-square') || mainImg.parentNode;
    var oldParent = container.parentNode;

    // Create gallery wrapper
    var gallery = document.createElement('div');
    gallery.className = 'product-gallery';

    // Create main display area
    var mainDiv = document.createElement('div');
    mainDiv.className = 'gallery-main rounded-xl overflow-hidden shadow-soft border border-outline-variant bg-surface-container';
    mainDiv.appendChild(container.cloneNode(true));
    // Fix the inner img
    var imgClone = mainDiv.querySelector('img');
    if (imgClone) {
        imgClone.style.maxWidth = '100%';
        imgClone.style.maxHeight = '100%';
        imgClone.style.objectFit = 'contain';
    }

    gallery.appendChild(mainDiv);

    // Create nav buttons
    var prevBtn = document.createElement('button');
    prevBtn.className = 'gallery-nav prev';
    prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
    var nextBtn = document.createElement('button');
    nextBtn.className = 'gallery-nav next';
    nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
    gallery.appendChild(prevBtn);
    gallery.appendChild(nextBtn);

    // Create thumbs container
    var thumbsContainer = document.createElement('div');
    thumbsContainer.className = 'gallery-thumbs-container';
    thumbsContainer.style.display = 'none';
    var thumbsDiv = document.createElement('div');
    thumbsDiv.className = 'gallery-thumbs';
    thumbsContainer.appendChild(thumbsDiv);
    gallery.appendChild(thumbsContainer);

    // Replace original container with gallery
    oldParent.insertBefore(gallery, container);
    oldParent.removeChild(container);

    // Current image index
    var currentIdx = 0;
    var images = [mainImg.getAttribute('src')];
    var totalImages = 1;

    // Try loading additional images
    function tryLoadImage(idx) {
        var img = new Image();
        var ext = src.includes('.jpg') ? 'jpg' : (src.includes('.png') ? 'png' : 'jpg');
        var trySrc = 'images/' + model + '-' + idx + '.' + ext;
        img.onload = function() {
            images.push(trySrc);
            totalImages = images.length;
            // Add thumbnail
            var thumb = document.createElement('div');
            thumb.className = 'gallery-thumb' + (idx === 1 ? ' active' : '');
            thumb.innerHTML = '<img src="' + trySrc + '" alt="Gallery ' + idx + '">';
            thumb.onclick = function() { showImage(idx); };
            thumbsDiv.appendChild(thumb);
            thumbsContainer.style.display = 'block';
            // Try next
            tryLoadImage(idx + 1);
        };
        img.onerror = function() {
            // No more images
            if (totalImages > 1) {
                // Center thumbs for first image
                var firstThumb = document.createElement('div');
                firstThumb.className = 'gallery-thumb active';
                firstThumb.innerHTML = '<img src="' + images[0] + '" alt="Main">';
                firstThumb.onclick = function() { showImage(0); };
                thumbsDiv.insertBefore(firstThumb, thumbsDiv.firstChild);
            }
        };
        img.src = trySrc;
    }

    function showImage(idx) {
        if (idx < 0) idx = totalImages - 1;
        if (idx >= totalImages) idx = 0;
        currentIdx = idx;

        // Update main image with fade
        var displayImg = mainDiv.querySelector('img');
        if (displayImg) {
            displayImg.style.opacity = '0';
            setTimeout(function() {
                displayImg.src = images[idx];
                displayImg.style.opacity = '1';
            }, 150);
        }

        // Update thumbnails
        var thumbs = thumbsDiv.querySelectorAll('.gallery-thumb');
        thumbs.forEach(function(t, i) {
            t.classList.toggle('active', i === idx);
        });
    }

    // Setup nav buttons
    prevBtn.onclick = function() { showImage(currentIdx - 1); };
    nextBtn.onclick = function() { showImage(currentIdx + 1); };

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') showImage(currentIdx - 1);
        if (e.key === 'ArrowRight') showImage(currentIdx + 1);
    });

    // Start trying to load additional images
    setTimeout(function() { tryLoadImage(1); }, 500);
})();
"""

def process_file(filepath):
    """Add gallery to a single product page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    basename = os.path.basename(filepath)

    # 1. Add gallery CSS to first <style> tag
    # Insert before </style> in the first style block
    css_inserted = False
    style_count = 0
    def add_css(match):
        nonlocal css_inserted, style_count
        style_count += 1
        if style_count == 1 and not css_inserted:
            css_inserted = True
            return match.group(0).rstrip() + GALLERY_CSS + "\n        "
        return match.group(0)

    content = re.sub(r'<style>.*?</style>', add_css, content, count=1, flags=re.DOTALL)

    if not css_inserted:
        print(f"  WARNING: Could not add CSS to {basename}")

    # 2. Wrap the image container in gallery div
    # Pattern: <div class="aspect-square ..."><img ... src="images/xxx.jpg"/></div>
    img_pattern = r'(<div class="aspect-square[^"]*"[^>]*>)\s*(<img[^>]*src="images/[^"]*"[^>]*/>)\s*</div>'

    def wrap_gallery(match):
        div_open = match.group(1)
        img_tag = match.group(2)

        # Extract the src to use as main gallery image
        src_match = re.search(r'src="([^"]+)"', img_tag)
        img_src = src_match.group(1) if src_match else ''

        # Create gallery HTML
        gallery_html = (
            '<div class="product-gallery">\n'
            '\t<div class="gallery-main rounded-xl overflow-hidden shadow-soft border border-outline-variant bg-surface-container">\n'
            f'\t{img_tag}\n'
            '\t</div>\n'
            '\t<button class="gallery-nav prev"><span class="material-symbols-outlined">chevron_left</span></button>\n'
            '\t<button class="gallery-nav next"><span class="material-symbols-outlined">chevron_right</span></button>\n'
            '\t<div class="gallery-thumbs-container" style="display:none">\n'
            '\t<div class="gallery-thumbs"></div>\n'
            '\t</div>\n'
            '</div>'
        )
        return gallery_html

    content = re.sub(img_pattern, wrap_gallery, content, count=1)

    # 3. Add gallery JS before </body>
    # But avoid adding if already present
    if 'Product Gallery' not in content:
        content = content.replace('</body>', GALLERY_JS + '\n</body>', 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  OK: {basename}")

def main():
    # Get all product pages
    pattern = os.path.join(WEBSITE_DIR, "product-*.html")
    files = sorted(glob.glob(pattern))

    print(f"Found {len(files)} product pages to process")

    for i, filepath in enumerate(files, 1):
        process_file(filepath)
        if i % 20 == 0:
            print(f"  Progress: {i}/{len(files)}")

    print(f"\nDone! Processed {len(files)} product pages.")

if __name__ == '__main__':
    main()
