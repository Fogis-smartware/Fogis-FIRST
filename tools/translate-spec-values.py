"""
Add Chinese translations to spec values for ET1-A001 and ET1-A002.
Skip LED Chip row.
"""
import re

# Map: English value → Chinese translation
# Keys must exactly match the value text in the HTML
TRANSLATIONS = {
    # LED Power (values differ between A001/A002)
    '15 w ( 5 pcs x 3 w )': '15W（5颗 × 3W）',
    '18 w ( 6 pcs x 3 w )': '18W（6颗 × 3W）',
    # Input Voltage
    'DC 12 - 36 V': '直流 12-36V',
    # Working mode
    'High': '高亮',
    # Lumens
    '900 lm': '900 流明',
    '1200 lm': '1200 流明',
    # IP Rate - keep (universal)
    # Beam Angle
    'Flood 60°': '泛光 60°',
    # Color Temperature - keep (universal)
    # Life Span
    '≤ 30000 h': '≤ 30000 小时',
    # Housing Material
    'Die - cast aluminum housing': '压铸铝合金外壳',
    # Lamp Cover Material
    'Polycarbonate': '聚碳酸酯（PC）',
    # Lens Material
    'PMMA': '亚克力（PMMA）',
    # Mounting Bracket Material
    'Stainless steel': '不锈钢',
    # Product Dimension - keep (pure numbers)
    # Product box dimension - keep
    # Product weight - keep
    # Master box dimension - keep
    # Master box Quantity
    '27 pcs': '27 个/箱',
    '20 pcs': '20 个/箱',
    # Net weight - keep
    # Gross weight - keep
    # Warranty
    '2 years': '2 年',
}


def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the spec section
    spec_start = content.find('Technical Specifications')
    if spec_start == -1:
        print(f'ERROR: Spec section not found in {filepath}')
        return

    # Find end of spec section
    spec_end = content.find('</section>', spec_start)
    if spec_end == -1:
        print(f'ERROR: </section> not found in {filepath}')
        return

    spec_section = content[spec_start:spec_end]
    original_spec = spec_section
    modified = False

    for en_val, zh_val in TRANSLATIONS.items():
        # Match: <td class="py-3 px-5 text-secondary text-sm">VALUE</td>
        # But only if the value is NOT already inside a <span> tag
        pattern = re.compile(
            r'(<td class="py-3 px-5 text-secondary text-sm">)'
            + re.escape(en_val)
            + r'(</td>)'
        )
        replacement = (
            r'\1'
            + f'<span lang="en">{en_val}</span>'
            + f'<span lang="zh">{zh_val}</span>'
            + r'\2'
        )
        new_section, count = pattern.subn(replacement, spec_section)
        if count > 0:
            spec_section = new_section
            modified = True
            print(f'  Translated: {en_val} -> {zh_val}')

    if modified:
        new_content = content.replace(original_spec, spec_section)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'OK: {filepath}')
    else:
        print(f'No changes: {filepath}')


if __name__ == '__main__':
    process_file('D:/GIT/product-et1-a001.html')
    print('---')
    process_file('D:/GIT/product-et1-a002.html')
    print('\nDone!')
