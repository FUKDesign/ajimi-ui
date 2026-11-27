# Transparent cut-outs for the clay-v3 set: Vision subject mask + coloured pieces + the soft shadow kept as translucent dark.
import glob, os
import numpy as np
from PIL import Image, ImageFilter
S = os.path.dirname(os.path.abspath(__file__))
R = os.path.abspath(os.path.join(S, '..', '..')) + '/'  # repo root; Vision masks (from lift.swift) sit beside this script as <name>.png
def cut(n):
    src = np.asarray(Image.open(R + f'artwork/clay-v3/{n}.png').convert('RGB')).astype(np.float32)
    corner = np.median(src[:24, :24].reshape(-1, 3), axis=0).min()
    src = np.minimum(255, src * 255 / max(235, corner - 1))
    vis = Image.open(f'{S}/{n}.png').convert('RGBA').getchannel('A')
    vis = np.asarray(vis.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
    mn, mx = src.min(axis=2), src.max(axis=2)
    extra = ((mx - mn > 30) | (mn < 150)).astype(np.uint8) * 255
    extra = Image.fromarray(extra).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1))
    op = np.maximum(vis, np.asarray(extra).astype(np.float32) / 255)
    a = np.clip((1 - mn / 255 - 0.02) / 0.98, 0, 1)
    c2a = np.where(a[..., None] > 0.004, (src - (1 - a[..., None]) * 255) / np.maximum(a[..., None], 0.004), 0)
    rgb = src * op[..., None] + np.clip(c2a, 0, 255) * (1 - op[..., None])
    alpha = op + (1 - op) * a
    return Image.fromarray(np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA'), alpha
names = sorted(os.path.basename(f)[:-4] for f in glob.glob(R + 'artwork/clay-v3/*.png') if os.path.basename(f) not in ('bowl-3.png', 'shoga.png'))
for n in names:
    im, alpha = cut(n)
    ys, xs = np.where(alpha > 0.12)
    b = (xs.min(), ys.min(), xs.max(), ys.max())
    dish = n.startswith('dish-')
    side = int(max(b[2] - b[0], b[3] - b[1]) * (1.06 if dish else 1.12))
    cx, cy = (b[0] + b[2]) // 2, (b[1] + b[3]) // 2
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.paste(im, (side // 2 - int(cx), side // 2 - int(cy)))
    px = 960 if dish else 880
    sq = sq.resize((px, px), Image.LANCZOS)
    sq.save(R + f'app/next/img/{n}.webp', quality=88); sq.save(f'{S}/out-{n}.png')
W = 220; cols = 9; rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGB', (W * cols, W * rows), (169, 205, 185))
for i, n in enumerate(names):
    c = Image.open(f'{S}/out-{n}.png').resize((W, W)); sheet.paste(c, ((i % cols) * W, (i // cols) * W), c)
sheet.save(f'{S}/sheet.png')
print('ok', len(names))
