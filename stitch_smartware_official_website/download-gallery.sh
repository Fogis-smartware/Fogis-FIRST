#!/bin/bash
# Download gallery images from batch data files
# This script reads the JSON files and downloads all extra images

IMGDIR="D:/GIT/stitch_smartware_official_website/images"

# Process a JSON array of {model, images[]} items
process_json() {
    local file="$1"
    if [ ! -f "$file" ]; then return; fi

    # Use node to extract model|idx|url lines
    node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$file', 'utf8'));
    const items = data.completed || data;
    items.forEach(item => {
        if (!item.images || item.images.length <= 1) return;
        const model = item.model.toLowerCase();
        item.images.forEach((url, i) => {
            if (i === 0) return; // skip main image (already exists)
            console.log(model + '|' + i + '|' + url);
        });
    });
    " 2>/dev/null | while IFS='|' read model idx url; do
        local filename="${model}-${idx}.jpg"
        local filepath="${IMGDIR}/${filename}"

        if [ -f "$filepath" ] && [ -s "$filepath" ]; then
            echo "EXISTS: $filename"
        else
            echo "DL: $filename"
            curl -s -o "$filepath" "$url" &
            # Limit parallel downloads
            sleep 0.2
        fi
    done
    wait
}

echo "=== Batch 2 ==="
process_json "/c/Users/DELL/product-batch2.json"

echo ""
echo "=== Batch 3 ==="
process_json "/c/Users/DELL/product-batch3.json"

echo ""
echo "=== Checking results ==="
ls "${IMGDIR}"/*-1.jpg "${IMGDIR}"/*-2.jpg "${IMGDIR}"/*-3.jpg "${IMGDIR}"/*-4.jpg "${IMGDIR}"/*-5.jpg "${IMGDIR}"/*-6.jpg 2>/dev/null | grep -v "banner\|category-\|product-\|et3-e087-1\|et3-e088-1\|et3-e089-1\|et5-e080-1\|product-thumb" | wc -l
echo "gallery images downloaded"
