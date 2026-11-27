# Cut-outs with no baked shadow: Vision subject mask plus small coloured pieces. The shadow is added in CSS.
# Usage: cutout_clean.py <masters dir> <masks dir> [name ...]   (masks are <name>.png from lift.swift)
import glob, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')) + '/'
masters, masks = sys.argv[1], sys.argv[2]
DESHADOW = {'mustard'}
RESCUE = {'oyster', 'dashi'}           # masters where the subject mask lost a whole piece
names = sys.argv[3:] or sorted(os.path.basename(f)[:-4] for f in glob.glob(masters + '/*.png'))
for n in names:
    if n.startswith('mochi-') or n.startswith('ref') or not os.path.exists(f'{masks}/{n}.png'): continue
    src = np.asarray(Image.open(f'{masters}/{n}.png').convert('RGB')).astype(np.float32)
    corner = np.median(src[:24, :24].reshape(-1, 3), axis=0).min()
    src = np.minimum(255, src * 255 / max(235, corner - 1))
    vis = Image.open(f'{masks}/{n}.png').convert('RGBA').getchannel('A')
    vis = np.asarray(vis.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))).astype(np.float32) / 255
    if n.startswith('dish-') or n.startswith('bowl-'):        # a plate is one round shape: open the mask to drop shadow wisps
        v = Image.fromarray((vis * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(21)).filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(1.2))
        vis = np.minimum(vis, np.asarray(v).astype(np.float32) / 255)
    mn, mx = src.min(axis=2), src.max(axis=2)
    big = n.startswith('dish-') or n.startswith('bowl-')
    extra = ((mx - mn > 34) & (not (n.startswith('dish-') or n.startswith('bowl-')))).astype(np.uint8) * 255          # coloured crumbs only; grey shadow is left out
    extra = Image.fromarray(extra).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1))
    alpha = np.maximum(vis, np.asarray(extra).astype(np.float32) / 255)
    # pieces the subject mask missed or half kept (a third oyster, dried fish): take them whole from the picture itself
    body = ndi.binary_fill_holes(ndi.binary_opening((src.mean(axis=2) < 205) | (mx - mn > 24), iterations=2))
    lab, k = ndi.label(body)
    for i in range(1, k + 1):
        part = lab == i
        if part.sum() > alpha.size * 0.001 and 0.02 < 1 - alpha[part].mean() and n in RESCUE:
            alpha = np.maximum(alpha, np.asarray(Image.fromarray((part * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))).astype(np.float32) / 255 * (alpha[part].mean() < 0.85))
    if big:                                                   # a notch the mask bit out of a rim: close it where the picture has plate
        shut = ndi.binary_fill_holes(ndi.binary_closing(np.pad(alpha > 0.5, 80), iterations=60)[80:-80, 80:-80]) & ((src.mean(axis=2) < 228) | (mx - mn > 22))
        alpha = np.maximum(alpha, np.asarray(Image.fromarray((shut * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))).astype(np.float32) / 255)
    if n in DESHADOW:                                         # a grey cast shadow the mask kept between two objects
        grey = ndi.binary_opening((mx - mn < 11) & (src.mean(axis=2) > 185), iterations=3)
        alpha = alpha * (1 - np.asarray(Image.fromarray((grey * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255)
    lab, k = ndi.label(alpha > 0.5)                           # loose crumbs go
    sizes = ndi.sum(np.ones_like(lab), lab, range(1, k + 1))
    small = np.isin(lab, [i + 1 for i, a in enumerate(sizes) if a < alpha.size * 0.0005])
    alpha = np.where(small | ((lab == 0) & (ndi.maximum_filter(~small & (lab > 0), 5) == 0)), 0, alpha)
    im = Image.fromarray(np.dstack([src, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
    ys, xs = np.where(alpha > 0.5)
    b = (xs.min(), ys.min(), xs.max(), ys.max())
    big = n.startswith('dish-') or n.startswith('bowl-')
    side = int(max(b[2] - b[0], b[3] - b[1]) * (1.06 if big else 1.1))
    cx, cy = (b[0] + b[2]) // 2, (b[1] + b[3]) // 2
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0)); sq.paste(im, (side // 2 - int(cx), side // 2 - int(cy)))
    px = 760 if big else 640
    sq.resize((px, px), Image.LANCZOS).save(R + f'app/next/img/{n}.webp', quality=76, method=4)
    print(n, end=' ')
print()
