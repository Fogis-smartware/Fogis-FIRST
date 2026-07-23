"""Generic converter: color PNGs -> unified 500x600 JPG gallery images."""
from PIL import Image
import os, sys

base = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'images')
model = sys.argv[1]   # e.g. et1-e011
start = int(sys.argv[2])  # e.g. 6
colors = sys.argv[3:] if len(sys.argv) > 3 else ['B','R','O','Y']

for i, c in enumerate(colors):
    src = os.path.join(base, f'{model.upper()}{c}.png')
    dst = os.path.join(base, f'{model}-{start+i}.jpg')

    img = Image.open(src)
    pw, ph = img.size

    if img.mode in ('RGBA','PA') or (img.mode=='P' and 'transparency' in img.info):
        bg = Image.new('RGBA', img.size, (255,255,255,255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        img = Image.alpha_composite(bg, img).convert('RGB')
    else:
        img = img.convert('RGB')

    scale = min(500/pw, 600/ph)
    nw, nh = int(pw*scale), int(ph*scale)
    img = img.resize((nw, nh), Image.LANCZOS)

    canvas = Image.new('RGB', (800,800), (255,255,255))
    canvas.paste(img, ((800-nw)//2, (800-nh)//2))
    canvas.save(dst, 'JPEG', quality=92, optimize=True)

    print(f'{os.path.basename(src)}: {pw}x{ph} -> {nw}x{nh} ({os.path.getsize(dst)//1024}KB)')
    os.remove(src)

print('Done!')
