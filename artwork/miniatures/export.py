"""Make transparent web assets from the original Blender renders. Requires Pillow."""
from PIL import Image
from pathlib import Path
import sys
src=Path(__file__).resolve().parent/'renders'
dest=Path(__file__).resolve().parents[2]/'app/assets/pantry'
dest.mkdir(parents=True,exist_ok=True)
names=sys.argv[1:] or sorted(p.stem for p in src.glob('*.png') if '-angle' not in p.stem)
rotating={'udon','scallion','ginger'}
def bbox(im):return im.getchannel('A').point(lambda a:255 if a>=8 else 0).getbbox()
def thumb(im,rect,size):
 im=im.crop(rect)
 # Transparent RGB is cleared by compositing after resizing to prevent fringing on dark counters.
 out=Image.new('RGBA',(size,size));im.thumbnail((size-6,size-6),Image.Resampling.LANCZOS)
 out.alpha_composite(im,((size-im.width)//2,(size-im.height)//2))
 return out
for k in names:
 f=src/(k+'.png')
 if not f.is_file():continue
 image=Image.open(f).convert('RGBA');rect=bbox(image)
 if k in ['donabe','chawan-m']:
  im=image.crop(rect);target=(394,290) if k=='donabe' else (307,271);im.thumbnail(target,Image.Resampling.LANCZOS)
  out=Image.new('RGBA',(420,327));out.alpha_composite(im,(210-im.width//2,161-im.height//2));out.save(dest/(k+'.webp'),quality=84,alpha_quality=78,method=6)
  continue
 frames=[Image.open(src/(k+'-angle'+str(i)+'.png')).convert('RGBA') for i in range(4)] if k in rotating else []
 if frames:
  boxes=[rect]+[bbox(im) for im in frames];rect=(min(x[0] for x in boxes)-2,min(x[1] for x in boxes)-2,max(x[2] for x in boxes)+2,max(x[3] for x in boxes)+2)
 size=164 if k in ('udon','ginger-slivers','scallion-rings') else 112
 thumb(image,rect,size).save(dest/(k+'.webp'),quality=80,alpha_quality=78,method=6)
 if frames:
  sequence=[image,frames[3],image,frames[0]]
  anim=[thumb(im,rect,94) for im in sequence]
  anim[0].save(dest/(k+'-turn.webp'),save_all=True,append_images=anim[1:],duration=[720,580,720,580],loop=0,quality=73,method=6,minimize_size=True)
print('Pantry files:',len(list(dest.glob('*.webp'))),'bytes:',sum(x.stat().st_size for x in dest.glob('*.webp')))
