import re
import sys

with open('D:/GIT/catalog/Smartware_Product-Catalog.pdf', 'rb') as f:
    data = f.read()

text = data.decode('latin-1', errors='ignore')

# Count pages
pages = re.findall(r'/Type\s*/Page[^s]', text)
print(f'Page objects: {len(pages)}')

# Find page counts
counts = re.findall(r'/Count\s+(\d+)', text)
print(f'Count values: {counts}')

# Check color spaces
cmyk = len(re.findall(r'/DeviceCMYK', text))
rgb = len(re.findall(r'/DeviceRGB', text))
gray = len(re.findall(r'/DeviceGray', text))
print(f'Color spaces - CMYK: {cmyk}, RGB: {rgb}, Gray: {gray}')

# ICC profiles
icc = len(re.findall(r'/ICCBased', text))
print(f'ICC profiles: {icc}')

# Images
images = re.findall(r'/Subtype\s*/Image', text)
print(f'Total images: {len(images)}')

# Image filters
jpeg = len(re.findall(r'/DCTDecode', text))
jp2k = len(re.findall(r'/JPXDecode', text))
flate = len(re.findall(r'/FlateDecode', text))
print(f'Image filters - JPEG: {jpeg}, JPX: {jp2k}, Flate: {flate}')

# Fonts
fonts = re.findall(r'/BaseFont\s*/(\S+)', text)
unique_fonts = list(set(fonts))
print(f'Font references: {len(fonts)}')
print(f'Unique fonts: {unique_fonts[:15]}')

# Transparency
smask = len(re.findall(r'/SMask', text))
ca_ops = len(re.findall(r'/CA\s', text))
bm_ops = len(re.findall(r'/BM\s*/Normal|/BM\s*/Multiply', text))
print(f'Transparency - SMask: {smask}, CA: {ca_ops}, BM: {bm_ops}')

# Content streams
streams = len(re.findall(r'/Filter\s*/FlateDecode', text))
print(f'FlateDecode streams: {streams}')

# Try to find Pages object
cat_match = re.search(r'/Type\s*/Catalog.*?/Pages\s+(\d+)\s+0\s+R', text, re.DOTALL)
if cat_match:
    pages_ref = cat_match.group(1)
    print(f'Pages object ref: {pages_ref}')
    pages_match = re.search(rf'{pages_ref}\s+0\s+obj.*?/Count\s+(\d+)', text, re.DOTALL)
    if pages_match:
        print(f'Actual page count: {pages_match.group(1)}')

# Check for problematic patterns
print(f'\n--- Potential issues ---')
# Check if content is minimal (maybe pages are empty?)
# Check for /ExtGState (transparency blending)
extgs = len(re.findall(r'/ExtGState', text))
print(f'ExtGState (blending): {extgs}')

# Check PDF producer
producer = re.findall(r'/Producer\s*\((.*?)\)', text)
print(f'Producer: {producer}')
creator = re.findall(r'/Creator\s*\((.*?)\)', text)
print(f'Creator: {creator}')

print(f'\nFile size: {len(data):,} bytes')
