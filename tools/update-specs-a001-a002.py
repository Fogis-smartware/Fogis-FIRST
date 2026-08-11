"""
Update ET1-A001 and ET1-A002 spec tables from add.txt data.
"""
import re

# ── Bilingual label map (EN → ZH) ──
LABELS = {
    "LED Power": "LED 功率",
    "LED Chip": "LED 芯片",
    "Input Voltage": "输入电压",
    "Working mode": "工作模式",
    "Lumens": "流明",
    "IP Rate": "防护等级",
    "Beam Angle": "光束角度",
    "Color Temperature Range": "色温范围",
    "Life Span": "使用寿命",
    "Housing Material": "外壳材质",
    "Lamp Cover Material": "灯罩材质",
    "Lens Material": "透镜材质",
    "Mounting Bracket Material": "支架材质",
    "Product Dimension": "产品尺寸",
    "Product box dimension": "包装尺寸",
    "Product weight": "产品重量",
    "Master box dimension": "外箱尺寸",
    "Master box Quantity": "装箱数量",
    "Net weight": "净重",
    "Gross weight": "毛重",
    "Warranty": "质保",
    "Application": "应用场景",
}

# ── Spec data from add.txt (label → value) ──
ET1_A001_SPECS = [
    ("LED Power", "15 w ( 5 pcs x 3 w )"),
    ("LED Chip", "Epistar"),
    ("Input Voltage", "DC 12 - 36 V"),
    ("Working mode", "High"),
    ("Lumens", "900 lm"),
    ("IP Rate", "IP 67"),
    ("Beam Angle", "Flood 60°"),
    ("Color Temperature Range", "6000 ~ 6500 K"),
    ("Life Span", "≤ 30000 h"),
    ("Housing Material", "Die - cast aluminum housing"),
    ("Lamp Cover Material", "Polycarbonate"),
    ("Lens Material", "PMMA"),
    ("Mounting Bracket Material", "Stainless steel"),
    ("Product Dimension", "11.19 x 8.4 x 3.85 cm"),
    ("Product box dimension", "9.5 x 5.5 x 11.5 cm"),
    ("Product weight", "0.4 kg"),
    ("Master box dimension", "36 x 30 x 19.5 cm"),
    ("Master box Quantity", "27 pcs"),
    ("Net weight", "10.8 kg"),
    ("Gross weight", "11.8 kg"),
    ("Warranty", "2 years"),
    ("Application", "Emergency (ex. car break down), inspection of any kind of 4 wheels vehicle and others"),
]

ET1_A002_SPECS = [
    ("LED Power", "18 w ( 6 pcs x 3 w )"),
    ("LED Chip", "Epistar"),
    ("Input Voltage", "DC 12 - 36 V"),
    ("Working mode", "High"),
    ("Lumens", "1200 lm"),
    ("IP Rate", "IP 67"),
    ("Beam Angle", "Flood 60°"),
    ("Color Temperature Range", "6000 ~ 6500 K"),
    ("Life Span", "≤ 30000 h"),
    ("Housing Material", "Die - cast aluminum housing"),
    ("Lamp Cover Material", "Polycarbonate"),
    ("Lens Material", "PMMA"),
    ("Mounting Bracket Material", "Stainless steel"),
    ("Product Dimension", "10.93 x 5.48 x 14.78 cm"),
    ("Product box dimension", "11.2 x 6.5 x 13.5 cm"),
    ("Product weight", "0.55 kg"),
    ("Master box dimension", "35 x 28.6 x 24 cm"),
    ("Master box Quantity", "20 pcs"),
    ("Net weight", "11 kg"),
    ("Gross weight", "12 kg"),
    ("Warranty", "2 years"),
    ("Application", "Emergency (ex. car break down), inspection of any kind of 4 wheels vehicle and others"),
]


def build_spec_row(label_en, value, is_odd):
    label_zh = LABELS.get(label_en, label_en)
    bg_class = "bg-surface-container-low/30 " if is_odd else ""
    row = (
        f'<tr class="{bg_class}border-b border-outline-variant/50">'
        f'<td class="py-3 px-5 font-semibold text-on-surface w-2/5 text-sm">'
        f'<span lang="en">{label_en}</span>'
        f'<span lang="zh">{label_zh}</span>'
        f'</td>'
        f'<td class="py-3 px-5 text-secondary text-sm">{value}</td>'
        f'</tr>'
    )
    return row


def build_spec_section(specs):
    rows = []
    for i, (label, value) in enumerate(specs):
        is_odd = (i % 2 == 0)  # 0-based: 0=odd, 1=even, 2=odd...
        rows.append(build_spec_row(label, value, is_odd))

    tbody = '\n'.join(rows)
    section = (
        f'<section class="max-w-container-max mx-auto px-gutter md:px-margin-desktop pb-16">'
        f'<div class="fade-up">'
        f'<h2 class="font-headline-lg text-headline-lg text-on-surface mb-8">'
        f'<span lang="en">Technical Specifications</span>'
        f'<span lang="zh">技术规格</span>'
        f'</h2>'
        f'<div class="rounded-xl shadow-soft border border-outline-variant overflow-hidden">'
        f'<div class="overflow-x-auto">'
        f'<table class="w-full"><tbody>\n'
        f'{tbody}\n'
        f'</tbody></table>'
        f'</div></div></div></section>'
    )
    return section


def replace_spec_section(filepath, new_section):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern: <section class="max-w-container-max ... Technical Specifications ... </section>
    # The section always starts right after the Product Description block
    pattern = r'<section class="max-w-container-max mx-auto px-gutter md:px-margin-desktop pb-16"><div class="fade-up"><h2 class="font-headline-lg text-headline-lg text-on-surface mb-8"><span lang="en">Technical Specifications</span><span lang="zh">技术规格</span></h2>.*?</section>'

    new_content = re.sub(pattern, new_section.replace('\\', '\\\\'), content, count=1, flags=re.DOTALL)

    if new_content == content:
        print(f"WARNING: No replacement made in {filepath}")
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"OK Updated: {filepath}")


if __name__ == '__main__':
    base = 'D:/GIT'

    new_a001 = build_spec_section(ET1_A001_SPECS)
    replace_spec_section(f'{base}/product-et1-a001.html', new_a001)

    new_a002 = build_spec_section(ET1_A002_SPECS)
    replace_spec_section(f'{base}/product-et1-a002.html', new_a002)

    print("\nDone!")
