# Additional original pantry meshes. Called by render.py in Blender.
def noodleBowl(rice=False):
 # Half-glazed donburi; mound above the rim.
 lathe([(.02,-.44),(.34,-.44),(.42,-.36),(.70,-.25),(.87,.03),(.91,.17),(.87,.22),(.79,.11),(.59,-.16),(.01,-.22)],M['indigo'])
 torus(0,0,.176,.891,.022,M['creamglaze'])
 if rice:
  oval(0,0,.13,.85,.84,.32,M['rice2'])
  for i in range(140):
   a=i*2.39996;rad=.82*math.sqrt((i+.4)/140);x=rad*cos(a);y=rad*sin(a);z=.14+.31*math.sqrt(max(0,1-(rad/.85)**2))
   oval(x,y,z,.09,.044,.032,M['rice' if i%4 else 'rice2'],rot=(0,.1*sin(a),a*.53),seg=10)
def carrot():
 axis=[(-.84,-.36,-.16),(-.56,-.26,-.1),(-.17,-.12,.02),(.32,.075,.17),(.56,.17,.26),(.67,.23,.29)]
 tapered(axis,[.018,.105,.20,.265,.26,.17],M['carrot'],32)
 for x,y,z,r in [(-.27,-.14,.03,.15),(-.02,-.04,.09,.19),(.24,.06,.16,.235)]:
  strand([(x-.011,y-r*.85,z-r*.37),(x+.015,y-r,z+r*.16),(x+.014,y-r*.64,z+r*.70)],.009,M['carrotdark'],[.2,1,.2],bevel=2)
 for i in range(6):
  a=i*.85;base=(.63,.22,.31);tip=(.86+.25*cos(a),.44+.29*sin(a),.52+.16*sin(a+.8));strand([base,(.76,.32,.42),tip],.047,M['leaf' if i%2 else 'green'],[.75,1,.08],bevel=2)
def pepper():
 for i,(x,y,z,r) in enumerate([(-.5,-.29,.18,.29),(-.34,.32,.22,.34),(.29,.31,.24,.36),(.4,-.31,.16,.25),(.04,-.1,.50,.29)]):
  o=oval(x,y,z,r,r*.97,r*.95,M['dark'],seg=16)
  for v in o.data.vertices:v.co*=1+.054*rng.uniform(-1,1)
def protein(key):
 if key=='chicken':
  pos=[(-.85,.18,.12),(-.61,.15,.19),(-.30,.11,.23),(.03,.04,.2),(.32,-.01,.14),(.64,-.03,.085)]
  tapered(pos,[.07,.39,.47,.39,.20,.13],M['meat'],40)
  tapered([(.53,-.02,.07),(.82,-.06,.10),(.96,-.07,.12)],[.11,.075,.10],M['bone'])
  for y in [-.16,.02]:oval(.96,y,.13,.11,.09,.084,M['bone'])
  for i in range(18):
   x=rng.uniform(-.61,-.04);y=rng.uniform(-.07,.30);z=.40+.19*math.sqrt(max(0,1-((x+.3)/.55)**2))
   oval(x,y,z,.037,.028,.015,M['bark'],seg=10)
 elif key=='pork':
  for i in range(3):
   pts=[(-.78+.08*i,-.35+i*.3,.05+i*.045),(-.34,-.32+i*.3,.11+i*.035),(.3,-.27+i*.25,.12+i*.09),(.73,-.22+i*.27,.08+i*.07)]
   strand(pts,.15,M['pork'],[.74,1,.92,.8]);strand([(x,y-.07,z+.095) for x,y,z in pts],.055,M['fat'],[.7,1,1,.5])
 elif key=='cutlet':
  outline=[(-.85,-.23),(-.73,-.48),(-.28,-.54),(.04,-.48),(.04,.46),(-.26,.52),(-.67,.44),(-.88,.17)]
  flatpoly('fried cutlet',outline,-.05,.23,M['roux'],.07)
  for i in range(3):
   x=.03+i*.23;y=-.04*i;length=.92-.15*i
   o=box((x+.16,y,.11),(.215,length,.25),M['cut'],.055,(0,.15,.02));box((x+.17,y,.246),(.228,length+.05,.065),M['roux'],.04,(0,.15,.02))
  for _ in range(63):
   x=rng.uniform(-.75,.72);y=rng.uniform(-.35,.32);z=.26 if x<.09 else .29
   if x>.3 and abs(y)>.26:continue
   oval(x,y,z,.029,.021,.016,M['gold' if _%3 else 'bark'],seg=8)
 elif key=='roe':
  for i in range(2):
   y=-.22+.42*i;p=[(-.86,y+.02,.08),(-.68,y+.09,.11),(-.29,y+.14,.16),(.17,y+.08,.16),(.57,y-.06,.12),(.77,y-.02,.09)]
   tapered(p,[.018,.16,.207,.192,.11,.013],M['roe'],28)
   for j in range(78):
    x=rng.uniform(-.66,.63);dy=rng.uniform(-.12,.12);rr=.17*math.sqrt(max(.08,1-(x/.85)**2))
    z=.135+math.sqrt(max(0,rr*rr-dy*dy));oval(x,y+.10+.08*cos(x*3)+dy,z,.029,.024,.021,M['roegrain'],seg=8)
def sheet(key):
 for j in range(2 if key=='kombu' else 3):
  v=[];faces=[];nx,ny=8,11
  for y in range(ny):
   for x in range(nx):
    xx=(x/(nx-1)-.5)*(.62 if key=='kombu' else .99); yy=(y/(ny-1)-.5)*1.45
    xx+=.04*sin(y*.66+j*2);zz=.045*sin(x*.72+y*.31+j)+(.14 if key=='kombu' else .075)*y/(ny-1)+.19*j
    v.append((xx+.24*j-.2,yy+.13*j-.2,zz))
    if x<nx-1 and y<ny-1:
     a=y*nx+x;faces.append((a,a+1,a+nx+1,a+nx))
  ob=mesh('kelp leaf',v,faces,M['seaweed' if not j%2 else 'green']);ob.rotation_euler.z=(-.2+j*.33)
  m=ob.modifiers.new('thin leaf edge','SOLIDIFY');m.thickness=.016
def cabbage():
 # Cupped overlapping leaves, shape ridges and central veins following each surface.
 oval(0,0,.06,.70,.64,.65,M['cabbagelight'])
 for i in range(10):
  angle=i*2.39996;zbase=-.42+i*.043;v=[];faces=[];nx,ny=13,14
  for row in range(ny):
   t=row/(ny-1);rr=.48+.30*sin(t*pi);w=sin(t*pi)**.72
   for col in range(nx):
    u=(col/(nx-1)-.5)*2;q=angle+u*w*.89;r=rr+.09*u*u+.036*sin(t*21+u*3)*abs(u)**3;z=zbase+t*(1.02 if i<6 else 1.13)+.065*sin(q*6)*abs(u)*t
    v.append((r*cos(q),r*sin(q),z))
    if row<ny-1 and col<nx-1:
     a=row*nx+col;faces.append((a,a+1,a+1+nx,a+nx))
  mesh('ribbed cabbage leaf',v,faces,M['cabbage' if i%3 else 'cabbagelight'])
  ridge=[v[row*nx+nx//2] for row in range(1,ny-1,2)];strand(ridge,.018,M['cabbagelight'],[1,.93,.68,.5,.32,.07],bevel=2)
def bowlMix(key):
 noodleBowl()
 if key=='batter':
  oval(0,0,.13,.84,.84,.062,M['creamglaze']);strand([(-.15,-.1,.18),(.04,.13,.18),(.31,.22,.19)],.018,M['rice2'],[.2,1,.3])
  strand([(.27,.13,.19),(.54,.42,.55),(.72,.68,.77)],.045,M['wood'])
 elif key=='water':
  oval(0,0,.12,.83,.83,.032,M['water']);torus(.12,-.14,.154,.24,.008,M['creamglaze'])
 elif key=='salt':
  oval(0,0,.13,.79,.80,.22,M['salt'])
  for i in range(60):
   a=rng.random()*TAU;rr=.73*math.sqrt(rng.random());x=rr*cos(a);y=rr*sin(a);z=.14+.22*math.sqrt(1-(rr/.8)**2)
   box((x,y,z),(.05,.04,.042),M['salt' if i%3 else 'creamglaze'],.008,(i*.2,i*.15,i))
def tofu(sugar=False):
 for i,(x,y,z,angle,dim) in enumerate([(-.35,-.22,.18,-.12,.55),(.26,-.13,.17,.11,.55),(-.05,.25,.38,-.03,.54)] if sugar else [(-.23,-.14,.18,-.065,1.02),(.33,.42,.30,.16,.81)]):
  box((x,y,z),(dim,dim*.76,dim*.58),M['white' if sugar else 'tofu'],.055 if sugar else .037,(0,0,angle))
def sesame():
 for i in range(44):
  a=rng.random()*TAU;r=rng.random()**.6;oval(r*cos(a),r*sin(a)*.56,.05+i*.001,.088,.053,.029,M['sesame' if i%3 else 'gingercut'],rot=(.07*i,.14,i*.58),seg=14)
def bean(ed=False):
 for j in range(2):
  co=[(-.68,-.32+j*.5,.12),(-.42,-.31+j*.5,.15),(-.07,-.22+j*.5,.21),(.25,-.13+j*.5,.18),(.62,.05+j*.5,.14)]
  strand(co,.185,M['leaf'],[.10,1,.81,1,.13]);strand([(x,y-.105,z+.015) for x,y,z in co],.024,M['spring'],[.14,1,1,1,.21],bevel=2)
 for i in range(3):oval(.04+.26*i,-.58+.11*sin(i),.10,.17,.126,.1,M['springlight'],rot=(0,.13,i))
def mochi():
 for x,y,z,rot in [(-.38,-.13,.16,.18),(.30,.21,.23,-.10),(.25,-.43,.13,.08)]:
  oval(x,y,z,.43,.36,.23,M['tofu'],rot=(0,.09,rot))
def squeeze(key):
 o=lathe([(.02,-.66),(.34,-.66),(.37,-.61),(.39,-.35),(.34,.0),(.27,.28),(.12,.45),(.115,.5),(.01,.5)],M['yellow' if key=='mustard' else 'white'])
 lathe([(.01,.48),(.14,.48),(.14,.57),(.075,.63),(.04,.79),(.01,.79)],M['green' if key=='mustard' else 'red'])
 lathe([(.37,-.45),(.383,-.42),(.372,-.24),(.37,-.22)],M['gold' if key=='mustard' else 'paper'])
def mound(key):
 if key=='miso':
  # A single irregular spoonful, with parallel scrape marks from a wooden spatula.
  lathe([(.02,-.35),(.28,-.35),(.50,-.24),(.71,-.05),(.79,.015),(.77,.055),(.68,-.015),(.52,-.13),(.01,-.15)],M['indigo'])
  o=oval(-.06,.02,.08,.68,.56,.36,M['miso'],seg=40)
  for v in o.data.vertices:v.co*=1+.06*sin(v.co.x*8+v.co.y*6)*sin(v.co.z*3)
  for i in range(5):
   y=-.22+.12*i
   strand([(-.53,y,.22),(-.26,y+.05,.358),(.10,y+.06,.445),(.40,y+.10,.35),(.58,y+.13,.20)],.028,M['roux'],[.10,.86,1,.76,.08],bevel=2)
 elif key=='rawrice':
  for i in range(83):
   a=i*2.399;r=math.sqrt((i+.3)/83);x=r*cos(a)*.9;y=r*sin(a)*.6;z=.12*(1-r*r)
   oval(x,y,z,.105,.04,.031,M['rice' if i%3 else 'rice2'],rot=(.06,i*.03,a),seg=12)
def shell(key):
 def single(offset,size,rot):
  if key=='clam':
   # Asari are rounded triangular shells patterned with alternating dark growth bands.
   o=oval(offset[0],offset[1],offset[2],.64*size,.51*size,.26*size,M['gingercut'],rot=(.12,.09,rot),seg=42)
   for j in range(5):
    a=.22+j*.15
    pts=[]
    for n in range(13):
     th=-.04*pi+1.11*pi*n/12
     x=.63*a*cos(th);y=(.60*a*sin(th)-.21);z=.26*math.sqrt(max(.02,1-(x/.64)**2-(y/.51)**2))
     pts.append((offset[0]+(x*cos(rot)-y*sin(rot))*size,offset[1]+(x*sin(rot)+y*cos(rot))*size,offset[2]+(z+.013)*size))
    strand(pts,.014*size,M['bark'],[.2]+[1]*11+[.2],bevel=2)
   return
  nx,ny=28,15;v=[];f=[]
  for j in range(ny):
   r=j/(ny-1)
   for i in range(nx):
    u=i/(nx-1);th=.14*pi+u*.74*pi;w=sin(th);x=r*cos(th)*(1.0 if key=='clam' else .78);y=r*sin(th)*1.06;ridge=.036*cos(th*43)*r
    z=-.27*sin(r*pi)*w+ridge+.09*r**4;v.append(((x*cos(rot)-y*sin(rot))*size+offset[0],(x*sin(rot)+y*cos(rot))*size+offset[1],z*size+offset[2]))
    if j<ny-1 and i<nx-1:
     a=j*nx+i;f.append((a,a+1,a+nx+1,a+nx))
  o=mesh('shell folds',v,f,M['shell']);m=o.modifiers.new('shell wall','SOLIDIFY');m.thickness=.045
  if key=='oyster':
   oval(offset[0]-.13,offset[1]+.42,offset[2]-.06,.37,.27,.15,M['pearls'],rot=(.1,.12,-.51))
   strand([(offset[0]-.32,offset[1]+.3,offset[2]),(offset[0]-.14,offset[1]+.55,offset[2]+.06),(offset[0]+.07,offset[1]+.51,offset[2])],.035,M['creamglaze'])
 if key=='oyster':single((0,-.48,.14),1.45,-.33)
 else:single((-.36,-.41,.12),1.02,-.23);single((.23,-.21,.27),.82,.64)
def dough():
 for i in range(4):
  p=[]
  for j in range(44):
   a=j*TAU/44;r=.68+.033*sin(3*a+i*.41)+.014*cos(6*a+i);p.append((r*cos(a)+.07*i, .76*r*sin(a)+.07*i))
  flatpoly('dumpling wrapper',p,.045*i,.045*i+.035,M['white' if i%2 else 'rice2'],.012)
def eggplant():
 pts=[(-.84,-.24,.06),(-.68,-.22,.17),(-.43,-.17,.22),(-.14,-.04,.2),(.24,.12,.19),(.55,.29,.28)]
 tapered(pts,[.07,.33,.39,.356,.23,.13],M['eggplant'],40)
 for i in range(5):
  a=TAU*i/5;strand([(.61,.32,.33),(.50+.07*cos(a),.30+.13*cos(a),.29+.12*sin(a)),(.32,.20+.16*cos(a),.22+.14*sin(a))],.084,M['leaf'],[.75,1,.02])
 strand([(.51,.26,.28),(.64,.39,.40),(.74,.42,.56)],.072,M['green'],[1,.8,.45])
def egg():
 for x,y,z,s in [(-.38,-.04,.31,.60),(.36,.2,.34,.55)]:
  o=oval(x,y,z,s*.72,s*.69,s,M['egg'],rot=(.13,-.45,-.2))
  for v in o.data.vertices:
   f=1-.16*v.co.z;v.co.x*=f;v.co.y*=f
def bitter():
 pts=[(-.93,-.14,.09),(-.66,-.12,.14),(-.3,-.09,.16),(.2,.02,.17),(.55,.12,.2),(.89,.18,.21)]
 tapered(pts,[.06,.19,.28,.27,.21,.055],M['green'],30)
 # Raised knobbled ridges run along the fruit. One cut ring exposes the pale pith.
 for j in range(10):
  a=TAU*j/10;path=[]
  for i in range(18):
   t=(i+.45)/18;rr=.30*sin(pi*t)**.64+.025*sin(pi*t);c=Vector((-.88+1.72*t,-.14+.31*t,.09+.12*t));rad=Vector((0,cos(a),sin(a)));at=c+rad*rr
   path.append(tuple(at));oval(*at,.068,.058,.055,M['leaf' if (i+j)%4 else 'spring'],rot=(0,.12,.23*i),seg=10)
  strand(path,.034,M['leaf'],[.12]+[.59+.27*cos(i*2) for i in range(16)]+[.12],bevel=2)
 ring=torus(.56,-.55,.07,.245,.077,M['green'],(.24,.24,-.1));inner=torus(.56,-.55,.093,.211,.044,M['springlight'],(.24,.24,-.1))
 for i in range(16):
  a=TAU*i/16;oval(.56+.268*cos(a),-.55+.258*sin(a),.08,.064,.051,.055,M['leaf'],seg=12)
builders.update({'chicken':lambda:protein('chicken'),'carrot':carrot,'pepper':pepper,'rice':lambda:noodleBowl(True),'roe':lambda:protein('roe'),'seaweed':lambda:sheet('seaweed'),'cabbage':cabbage,'batter':lambda:bowlMix('batter'),'pork':lambda:protein('pork'),'tofu':tofu,'mayo':lambda:squeeze('mayo'),'cutlet':lambda:protein('cutlet'),'sesame':sesame,'mustard':lambda:squeeze('mustard'),'edamame':bean,'sugar':lambda:tofu(True),'mochi':mochi,'water':lambda:bowlMix('water'),'salt':lambda:bowlMix('salt'),'egg':egg,'rawrice':lambda:mound('rawrice'),'oyster':lambda:shell('oyster'),'bittergourd':bitter,'dough':dough,'eggplant':eggplant,'miso':lambda:mound('miso'),'clam':lambda:shell('clam'),'kombu':lambda:sheet('kombu')})
