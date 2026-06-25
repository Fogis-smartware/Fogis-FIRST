#!/usr/bin/env python3
"""Batch SEO update for 260 product pages."""
import os, re, glob

BASE = r'D:\GIT'

def main():
    products = sorted(glob.glob(os.path.join(BASE, 'product-et*.html')))
    print(f'Found {len(products)} product pages\n')

    ok, fail = 0, 0
    lengths = []

    for path in products:
        name = os.path.basename(path)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract current title data-en
        de = re.search(r'data-en="([^"]*)"', content)
        if not de:
            print(f'FAIL  {name} — no data-en in title')
            fail += 1
            continue

        old_topic = de.group(1)  # e.g. "ET1-C026 - Smartware" or "ET1-D006AC | LED Tripod - Smartware"
        old_topic_base = old_topic.replace(' - Smartware', '')  # Strip suffix only

        # Extract SKU for description
        sku_match = re.search(r'(ET\d+-[A-Z]?\d+[a-z]*)', old_topic)
        sku = sku_match.group(1) if sku_match else old_topic.split(' ')[0]

        new_title_en = f'{old_topic_base} | Smartware — Professional LED Lighting Solutions'
        new_title_zh = f'{sku} | 云智迈科技 — 专业LED照明解决方案'

        desc_en = f'Smartware {sku} — professional LED lighting product. Specifications, features, and purchasing information. CE, RoHS certified. Shenzhen manufacturer.'
        desc_zh = f'云智迈科技 {sku} — 专业LED照明产品。规格参数、功能特性与采购信息。CE、RoHS认证。中国深圳制造商。'

        lengths.append(len(desc_en))

        # Replace title tag
        old_title = re.search(r'<title[^>]*>.*?</title>', content)
        if not old_title:
            print(f'FAIL  {name} — no title tag')
            fail += 1
            continue
        new_title = f'<title data-en="{new_title_en}" data-zh="{new_title_zh}">{new_title_en}</title>'
        content = content.replace(old_title.group(0), new_title)

        # Replace meta description
        old_desc = re.search(r'<meta name="description" content="[^"]*"\s*/>', content)
        if not old_desc:
            print(f'FAIL  {name} — no meta description')
            fail += 1
            continue
        new_desc = f'<meta name="description" data-en="{desc_en}" data-zh="{desc_zh}" content="{desc_en}"/>'
        content = content.replace(old_desc.group(0), new_desc)

        # Replace og:title
        old_og = re.search(r'<meta property="og:title" content="[^"]*"\s*/>', content)
        if old_og:
            content = content.replace(old_og.group(0), f'<meta property="og:title" content="{new_title_en}"/>')

        # Replace og:description
        old_ogd = re.search(r'<meta property="og:description" content="[^"]*"\s*/>', content)
        if old_ogd:
            content = content.replace(old_ogd.group(0), f'<meta property="og:description" content="{desc_en}"/>')

        # Replace twitter:title
        old_twt = re.search(r'<meta name="twitter:title" content="[^"]*"\s*/>', content)
        if old_twt:
            content = content.replace(old_twt.group(0), f'<meta name="twitter:title" content="{new_title_en}"/>')

        # Replace twitter:description
        old_twd = re.search(r'<meta name="twitter:description" content="[^"]*"\s*/>', content)
        if old_twd:
            content = content.replace(old_twd.group(0), f'<meta name="twitter:description" content="{desc_en}"/>')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        ok += 1

    print(f'\n---')
    print(f'{ok} OK, {fail} FAIL out of {len(products)} product pages')
    if lengths:
        print(f'Description length range: {min(lengths)}–{max(lengths)} chars')
        over = [l for l in lengths if l > 160]
        if over:
            print(f'WARNING: {len(over)} descriptions over 160 chars (max: {max(over)})')
        else:
            print(f'All descriptions within 160 chars limit')


if __name__ == '__main__':
    main()
