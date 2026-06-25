#!/usr/bin/env python3
"""Batch SEO update for 14 category pages."""
import os, re

BASE = r'D:\GIT'

MAPPING = {
    'category-bicycle_accessories.html': {
        'zh_name': '自行车配件',
        'desc_en': 'Smartware bicycle accessories — LED lights, mounts and parts for cycling. Durable, waterproof designs for road and mountain bikes. CE, RoHS certified.',
        'desc_zh': '云智迈科技自行车配件 — LED车灯、支架及骑行零件。耐用防水设计，适合公路与山地自行车。CE、RoHS认证。',
    },
    'category-industrial_parts.html': {
        'zh_name': '工业零件',
        'desc_en': 'Smartware industrial LED parts and components — precision-engineered for industrial applications. Reliable performance, CE, RoHS, FCC certified.',
        'desc_zh': '云智迈科技工业LED零件与组件 — 为工业应用精密打造。性能可靠，CE、RoHS、FCC认证。',
    },
    'category-led_economy_work_light.html': {
        'zh_name': 'LED经济型工作灯',
        'desc_en': 'Smartware economy LED work lights — affordable, reliable lighting for workshops and job sites. Compact design, IP67 waterproof, CE/RoHS/FCC certified.',
        'desc_zh': '云智迈科技经济型LED工作灯 — 车间与工地的高性价比可靠照明。紧凑设计，IP67防水，CE/RoHS/FCC认证。',
    },
    'category-led_flash_light.html': {
        'zh_name': 'LED手电筒',
        'desc_en': 'Smartware LED flash lights — high-performance portable torches for professional, outdoor, and emergency use. IP67 rated, CE and RoHS certified.',
        'desc_zh': '云智迈科技LED手电筒 — 高性能便携手电，适用于专业、户外及应急场景。IP67防护等级，CE、RoHS认证。',
    },
    'category-led_head_light.html': {
        'zh_name': 'LED头灯',
        'desc_en': 'Smartware LED head lights — hands-free portable lighting for outdoor, fishing, camping, and industrial use. Waterproof, rechargeable, CE/RoHS certified.',
        'desc_zh': '云智迈科技LED头灯 — 免提便携照明，适用于户外、钓鱼、露营及工业场景。防水可充电，CE/RoHS认证。',
    },
    'category-led_light_bar.html': {
        'zh_name': 'LED长条灯',
        'desc_en': 'Smartware LED light bars — powerful off-road, automotive, and marine lighting. High-lumen output for trucks, SUVs, boats. IP67 rated, CE/RoHS/FCC certified.',
        'desc_zh': '云智迈科技LED长条灯 — 强劲越野、汽车及船用照明。高流明输出，适用于卡车、SUV、船只。IP67防护等级，CE/RoHS/FCC认证。',
    },
    'category-led_motorcycle_light.html': {
        'zh_name': 'LED摩托车灯',
        'desc_en': 'Smartware LED motorcycle lights — auxiliary and replacement lighting for motorcycles, ATVs, and powersports. High brightness, durable. CE, RoHS certified.',
        'desc_zh': '云智迈科技LED摩托车灯 — 摩托车、ATV及动力运动的辅助与替换照明。高亮度、耐用。CE、RoHS认证。',
    },
    'category-led_pen_light.html': {
        'zh_name': 'LED笔灯',
        'desc_en': 'Smartware LED pen lights — compact inspection lights for professional and industrial use. Pocket-sized, high CRI, CE and RoHS certified.',
        'desc_zh': '云智迈科技LED笔灯 — 紧凑型检测灯，适用于专业与工业场景。口袋尺寸，高显色指数，CE、RoHS认证。',
    },
    'category-led_rechargeable_work_light.html': {
        'zh_name': 'LED充电工作灯',
        'desc_en': 'Smartware rechargeable LED work lights — cordless lighting with long battery life. IP67 waterproof, foldable stand, magnetic base. CE/RoHS/FCC certified.',
        'desc_zh': '云智迈科技充电LED工作灯 — 无线照明，长续航电池。IP67防水，可折叠支架，磁性底座。CE/RoHS/FCC认证。',
    },
    'category-led_search_light.html': {
        'zh_name': 'LED搜索灯',
        'desc_en': 'Smartware LED search lights — high-power, long-range portable spotlights for marine, outdoor, and emergency use. Rechargeable, waterproof, CE/RoHS certified.',
        'desc_zh': '云智迈科技LED搜索灯 — 高功率远射便携探照灯，适用于航海、户外及应急场景。可充电防水，CE/RoHS认证。',
    },
    'category-led_solar_panel.html': {
        'zh_name': 'LED太阳能板产品',
        'desc_en': 'Smartware LED solar panel products — solar-powered lighting solutions and panels. Energy-efficient, eco-friendly. CE, RoHS certified. Shenzhen manufacturer.',
        'desc_zh': '云智迈科技LED太阳能板产品 — 太阳能照明方案与面板。高效节能、环保设计。CE、RoHS认证。中国深圳制造商。',
    },
    'category-led_strip_light.html': {
        'zh_name': 'LED灯条',
        'desc_en': 'Smartware LED strip lights — flexible, high-brightness strips for automotive and marine applications. IP67 waterproof options, CE/RoHS/FCC certified.',
        'desc_zh': '云智迈科技LED灯条 — 柔性高亮灯带，适用于汽车与船舶应用。IP67防水可选，CE/RoHS/FCC认证。',
    },
    'category-led_tripod.html': {
        'zh_name': 'LED三脚架灯',
        'desc_en': 'Smartware LED tripod lights — portable, height-adjustable lighting stands for job sites, workshops, and outdoor events. IP67 rated, CE/RoHS/FCC certified.',
        'desc_zh': '云智迈科技LED三脚架灯 — 便携高度可调照明灯架，适用于工地、车间及户外活动。IP67防护，CE/RoHS/FCC认证。',
    },
    'category-led_work_light.html': {
        'zh_name': 'LED工作灯',
        'desc_en': 'Smartware LED work lights — high-performance IP67 work lights for professional, industrial, and automotive use. Foldable, portable. CE, RoHS, FCC certified.',
        'desc_zh': '云智迈科技LED工作灯 — 高性能IP67工作灯，适用于专业、工业及汽车场景。可折叠便携。CE、RoHS、FCC认证。',
    },
}


def main():
    # Verify all descriptions are within 160 chars
    for name, data in MAPPING.items():
        l = len(data['desc_en'])
        if l > 160:
            print(f'ERROR: {name} description is {l} chars (max 160)')
            return

    ok, fail = 0, 0
    for name, data in MAPPING.items():
        path = os.path.join(BASE, name)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract page topic from current title
        de = re.search(r'data-en="([^"]*)"', content)
        if not de:
            print(f'FAIL  {name} — cannot find data-en in title')
            fail += 1
            continue
        old_topic = de.group(1).replace(' - Smartware', '')

        new_title_en = f'{old_topic} | Smartware — Professional LED Lighting Solutions'
        new_title_zh = f'{data["zh_name"]} | 云智迈科技 — 专业LED照明解决方案'

        # Replace title
        old_title = re.search(r'<title[^>]*>.*?</title>', content)
        if not old_title:
            print(f'FAIL  {name} — cannot find title tag')
            fail += 1
            continue
        new_title = f'<title data-en="{new_title_en}" data-zh="{new_title_zh}">{new_title_en}</title>'
        content = content.replace(old_title.group(0), new_title)

        # Replace meta description
        old_desc = re.search(r'<meta name="description" content="[^"]*"\s*/>', content)
        if not old_desc:
            print(f'FAIL  {name} — cannot find meta description')
            fail += 1
            continue
        new_desc = f'<meta name="description" data-en="{data["desc_en"]}" data-zh="{data["desc_zh"]}" content="{data["desc_en"]}"/>'
        content = content.replace(old_desc.group(0), new_desc)

        # Replace og:title
        old_og = re.search(r'<meta property="og:title" content="[^"]*"\s*/>', content)
        if old_og:
            content = content.replace(old_og.group(0), f'<meta property="og:title" content="{new_title_en}"/>')

        # Replace og:description
        old_ogd = re.search(r'<meta property="og:description" content="[^"]*"\s*/>', content)
        if old_ogd:
            content = content.replace(old_ogd.group(0), f'<meta property="og:description" content="{data["desc_en"]}"/>')

        # Replace twitter:title
        old_twt = re.search(r'<meta name="twitter:title" content="[^"]*"\s*/>', content)
        if old_twt:
            content = content.replace(old_twt.group(0), f'<meta name="twitter:title" content="{new_title_en}"/>')

        # Replace twitter:description
        old_twd = re.search(r'<meta name="twitter:description" content="[^"]*"\s*/>', content)
        if old_twd:
            content = content.replace(old_twd.group(0), f'<meta name="twitter:description" content="{data["desc_en"]}"/>')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'OK  {name}  [{len(data["desc_en"])} chars]')
        ok += 1

    print(f'\n---\n{ok} OK, {fail} FAIL out of {len(MAPPING)} category pages')


if __name__ == '__main__':
    main()
