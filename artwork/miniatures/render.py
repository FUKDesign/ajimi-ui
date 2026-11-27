"""Ajimi miniature pantry, modeled and lit in Blender. Author: Aidan McFarlane.
Node-free production: blender --background --python render.py -- udon scallion ginger ...
"""
import bpy, sys, math, random, os
from mathutils import Vector
from pathlib import Path
from math import pi, sin, cos
ROOT=Path(__file__).resolve().parent
RENDERS=ROOT/'renders'; RENDERS.mkdir(exist_ok=True)
TAU=pi*2
rng=random.Random(19)
def linear(v):
 v=v/255
 return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def rgb(code):
 return tuple(linear(int(code.lstrip('#')[i:i+2],16)) for i in [0,2,4])+(1,)
def material(label,color,rough=.5,speck=0,noise=18,metal=0):
 m=bpy.data.materials.new(label);m.use_nodes=True;t=m.node_tree;bs=t.nodes.get('Principled BSDF')
 bs.inputs['Base Color'].default_value=rgb(color);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 if speck:
  n=t.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=noise;n.inputs['Detail'].default_value=3.5
  b=t.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=speck;b.inputs['Distance'].default_value=.028;t.links.new(n.outputs['Fac'],b.inputs['Height']);t.links.new(b.outputs['Normal'],bs.inputs['Normal'])
  ramp=t.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.22;ramp.color_ramp.elements[1].position=.8;c=rgb(color)
  ramp.color_ramp.elements[0].color=tuple(v*.73 for v in c[:3])+(1,);ramp.color_ramp.elements[1].color=tuple(min(1,v*1.15+.012) for v in c[:3])+(1,);t.links.new(n.outputs['Fac'],ramp.inputs['Fac']);t.links.new(ramp.outputs['Color'],bs.inputs['Base Color'])
 return m
def paint(obj,mat,smooth=True):
 obj.data.materials.append(mat)
 if smooth and obj.type=='MESH':
  for p in obj.data.polygons:p.use_smooth=True
 return obj
def oval(x,y,z,a,b,c,mat,rot=(0,0,0),seg=28):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=max(8,seg//2),location=(x,y,z));o=bpy.context.object;o.scale=(a,b,c);o.rotation_euler=rot;return paint(o,mat)
def mesh(name,verts,faces,mat,smooth=True):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);return paint(o,mat,smooth)
def box(loc,dim,mat,bevel=.07,rot=(0,0,0)):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.rotation_euler=rot
 if bevel:
  mod=o.modifiers.new('soft cut edge','BEVEL');mod.width=bevel;mod.segments=3
  n=o.modifiers.new('face normals','WEIGHTED_NORMAL')
 return paint(o,mat,False)
def strand(points,r,mat,rad=None,cyclic=False,bevel=3):
 c=bpy.data.curves.new('hand-shaped curve','CURVE');c.dimensions='3D';c.resolution_u=5;c.bevel_depth=r;c.bevel_resolution=bevel;c.resolution_u=6;c.use_fill_caps=True
 sp=c.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for i,(p,pos) in enumerate(zip(sp.bezier_points,points)):
  p.co=pos;p.handle_left_type=p.handle_right_type='AUTO'
  if rad:p.radius=rad[i]
 sp.use_cyclic_u=cyclic;o=bpy.data.objects.new('sweep',c);bpy.context.collection.objects.link(o);return paint(o,mat)
def lathe(profile,mat,n=60):
 vs=[];fs=[]
 for rr,z in profile:
  for j in range(n):a=TAU*j/n;vs.append((rr*cos(a),rr*sin(a),z))
 for i in range(len(profile)-1):
  for j in range(n):a=i*n+j;b=i*n+(j+1)%n;fs.append((a,b,b+n,a+n))
 return mesh('turned vessel',vs,fs,mat)
def flatpoly(name,points,z0,z1,mat,bevel=.03):
 n=len(points);vs=[(x,y,z) for z in [z0,z1] for x,y in points];fs=[tuple(reversed(range(n))),tuple(n+i for i in range(n))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
 o=mesh(name,vs,fs,mat,False)
 if bevel:
  b=o.modifiers.new('irregular edge','BEVEL');b.width=bevel;b.segments=3;n=o.modifiers.new('flat normals','WEIGHTED_NORMAL')
 return o
def torus(x,y,z,r,tube,mat,rot=(0,0,0)):
 bpy.ops.mesh.primitive_torus_add(major_segments=44,minor_segments=10,major_radius=r,minor_radius=tube,location=(x,y,z),rotation=rot);return paint(bpy.context.object,mat)
def tapered(points,radii,mat,n=22):
 centers=[Vector(p) for p in points];vs=[];fs=[]
 for i,c in enumerate(centers):
  tangent=(centers[min(len(centers)-1,i+1)]-centers[max(0,i-1)]).normalized()
  ref=Vector((0,0,1)) if abs(tangent.z)<.92 else Vector((0,1,0));u=tangent.cross(ref).normalized();v=tangent.cross(u).normalized()
  for j in range(n):a=j*TAU/n;vs.append(c+(cos(a)*u+sin(a)*v)*radii[i])
 for i in range(len(points)-1):
  for j in range(n):k=i*n+j;l=i*n+(j+1)%n;fs.append((k,l,l+n,k+n))
 fs+=[tuple(reversed(range(n))),tuple((len(points)-1)*n+j for j in range(n))]
 return mesh('tapered form',vs,fs,mat)
def ceramic(bowl=True,handles=False):
 global M
 if bowl:
  prof=[(.01,-.70),(.49,-.70),(.50,-.56),(.79,-.46),(1.00,-.33),(1.20,-.08),(1.35,.24),(1.39,.40),(1.38,.45),(1.33,.45),(1.29,.35),(1.19,.12),(.98,-.13),(.71,-.32),(.33,-.41),(.01,-.41)]
 else:
  prof=[(.01,-.55),(.68,-.55),(.75,-.44),(1.05,-.32),(1.27,-.05),(1.36,.24),(1.38,.37),(1.37,.44),(1.30,.44),(1.24,.34),(1.17,.09),(1.03,-.10),(.85,-.21),(.45,-.30),(.01,-.30)]
 o=lathe(prof,M['ceramic'] if bowl else M['clay']);inside=M['creamglaze'] if bowl else M['clayinner'];o.data.materials.append(inside)
 for idx,p in enumerate(o.data.polygons):
  if idx//60>=(8 if bowl else 7):p.material_index=1
 torus(0,0,.43,1.353,.030,M['indigo'] if bowl else M['rimbrown'])
 if bowl:
  torus(0,0,.305,1.275,.016,M['indigo']);torus(0,0,.43,1.337,.013,M['creamglaze']);torus(0,0,.295,1.365,.025,M['indigo']);torus(0,0,.22,1.34,.009,M['indigo'])
  for j in range(19):
   a=TAU*j/19; pts=[((1.265+t*.07)*cos(a+t*.06),(1.265+t*.07)*sin(a+t*.06),.035+t*.135) for t in [0,.36,.7,1]]
   strand(pts,.022,M['indigo'],[.2,.85,1,.17],bevel=2)
 if handles:
  for sign in [-1,1]:strand([(sign*1.22,-.38,.08),(sign*1.56,-.36,.12),(sign*1.66,0,.16),(sign*1.54,.34,.14),(sign*1.21,.36,.10)],.11,M['clay'])
def udon():
 # Thick, gently irregular kudzu-coloured noodle strands turn over and cross in a loose nest.
 for i in range(15):
  theta=i*2.38;rr=1.10-.036*i;pts=[]
  for j in range(14):
   t=j/13;a=theta+TAU*(.63+.14*sin(i))*(t-.5);x=rr*(cos(a)+.16*sin(3*a+i*.7));y=.68*rr*(sin(a)+.13*cos(2*a+i));z=.075+i*.027+.10*sin(t*pi)+.065*cos(2*a+i)
   x+=.08*sin(theta*.5);pts.append((x,y,z))
  strand(pts,.077+(.012 if i%3 else 0),M['noodle'+str(i%3)],rad=[.76]+[1]*12+[.75],bevel=4)
def scallions(rings=False):
 for i in range(8):
  x=[-.20,.12,.44,.64,.82,-.06,.38,.72][i];y=[-.34,-.49,-.36,-.64,-.27,-.67,-.74,-.03][i];r=.16 if i%3 else .124
  shade=M[['spring','springlight','leaf'][i%3]]
  o=lathe([(r*.68,0),(r,0),(r,.12),(r*.65,.12),(r*.68,0)],shade,n=36);o.location=(x,y,.01);o.rotation_euler=(.12 if i%3 else .06,-.1 if i%2 else .23,i*.2);o.scale.x=1.1
 if rings:return
 for i in range(3):
  x=-.91+i*.14;y=.22+i*.22;shade=M[['green','leaf','spring'][i]]
  start=Vector((x-.13,y+.73,.09+i*.075));end=Vector((x+1.12,y-.46,.07+i*.07));axis=end-start
  o=lathe([(.08,0),(.121,0),(.13,axis.length*.80),(.13,axis.length),(.082,axis.length),(.08,0)],shade,n=32);o.location=start;o.rotation_euler=axis.to_track_quat('Z','Y').to_euler()
def ginger(slivers=False):
 if slivers:
  for i in range(13):
   x=rng.uniform(-.66,.4);y=rng.uniform(-.23,.28);z=.035*i
   strand([(x,y,z),(x+.35,y+.12,z+.09),(x+.76,y+.20,z+.055)],.044,M['gingercut'],[.58,1,.45],bevel=2)
  return
 # The irregular tuber swells at its joints. Grooves follow each lobe's surface.
 starts=[((-.76,.15,.16),(.26,.10,.33),.34),((-.09,.10,.29),(.49,.80,.56),.265),((.13,.08,.26),(.76,-.06,.18),.245),((-.48,.12,.25),(-.66,-.49,.34),.22)]
 for i,(a,b,r) in enumerate(starts):
  A,B=Vector(a),Vector(b);d=B-A
  obj=oval(*((A+B)/2),r,r*.94,d.length*.66,M['ginger'],seg=36);obj.rotation_euler=d.to_track_quat('Z','Y').to_euler()
  for k in [.31,.74]:
   center=A+d*k;o=torus(*center,r*(.88 if k<.4 else .94),.011,M['gingerskin']);o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
 for i in range(2):
  o=oval(.61+i*.18,-.50+i*.08,.035+i*.09,.32,.24,.045,M['gingerskin']);o.rotation_euler.z=-.35
  o=oval(.61+i*.18,-.50+i*.08,.06+i*.09,.295,.223,.035,M['gingercut']);o.rotation_euler.z=-.35
def bottle(key):
 body,cap,tag={'stock':('amber','indigo','creamglaze'),'soy':('darksoy','red','creamglaze'),'mirin':('lightamber','gold','paper'),'oil':('oil','leaf','paper'),'ponzu':('amberdark','green','yellow'),'okonomisauce':('brown','red','creamglaze'),'misosauce':('sauce','navy','creamglaze')}[key]
 profile=[(.012,-.76),(.32,-.76),(.37,-.69),(.37,.21),(.35,.31),(.21,.48),(.163,.55),(.16,.72),(.012,.72)]
 lathe(profile,M[body]);lathe([(.01,.68),(.175,.68),(.176,.77),(.18,.80),(.164,.855),(.01,.855)],M[cap])
 for i in range(18):
  a=TAU*i/18;strand([(.177*cos(a),.177*sin(a),.71),(.176*cos(a),.176*sin(a),.792)],.006,M[cap],bevel=1)
 lathe([(.370,-.46),(.374,-.45),(.374,-.01),(.371,0)],M[tag]);torus(0,0,-.377,.374,.011,M[cap]);torus(0,0,-.094,.375,.008,M[cap])
 # Legible pictographic drop seal. Each bottle keeps its distinct palette.
 a=-1.10;pos=(.371*cos(a),.371*sin(a),-.226)
 o=oval(*pos,.089,.012,.091,M[cap]);o.rotation_euler.z=a+pi/2
def setup():
 global M
 bpy.ops.wm.read_factory_settings(use_empty=True)
 palette={'noodle0':'f8e5b6','noodle1':'f1dca7','noodle2':'fff1c8','spring':'8fb953','springlight':'b9c86a','leaf':'538c4e','green':'487847','ginger':'bf8959','gingerskin':'a7764d','gingercut':'f2cc76','ceramic':'8faeac','creamglaze':'e4e6d6','indigo':'2e5864','navy':'324b58','clay':'a86747','clayinner':'cf9669','rimbrown':'76452e','amber':'a6672d','amberdark':'84512d','darksoy':'51372b','lightamber':'cf9b4d','oil':'cdab51','gold':'b8833e','paper':'e9d4a5','red':'a44f43','sauce':'976144','brown':'714736','yellow':'ddbd63','rice':'fff2d4','rice2':'e8d5ab','seaweed':'294939','meat':'c27b49','bark':'955e37','roux':'bd7c3d','cut':'e7c0a0','pork':'cb827d','fat':'f3d5c0','carrot':'df7728','carrotdark':'bb5b23','bone':'dfc294','roe':'d97762','roegrain':'eb8a6b','eggplant':'59435e','cabbage':'86a665','cabbagelight':'bed78a','chalk':'f0e7ca','shell':'bbb194','pearls':'d3c8ad','tofu':'ede5c9','egg':'e8bc8e','dark':'433d35','sesame':'d8b677','salt':'ecebdc','water':'8bb5b1','wood':'a9774e','miso':'a06c42','white':'f2e3bd'}
 M={}
 for k,c in palette.items():
  gloss=k in ['amber','darksoy','lightamber','oil','sauce','amberdark','clay','clayinner','indigo','ceramic','creamglaze','noodle0','noodle1','noodle2','leaf','spring','roe','eggplant','water']
  grain=k in ['ginger','rimbrown','clay','wood','meat','bark','sauce','cabbage','tofu','eggplant','shell','miso','cut','seaweed','dark','roux']
  M[k]=material(k,c,.31 if gloss else .54,.19 if grain else 0,15 if k=='wood' else 27)
def studio(objects,name,yaw=0):
 from mathutils import Euler
 sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=20;sc.cycles.use_denoising=True;sc.cycles.transparent_max_bounces=3
 sc.cycles.max_bounces=4;sc.render.threads_mode='FIXED';sc.render.threads=5
 sc.render.film_transparent=True;sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA'
 sc.render.resolution_x=sc.render.resolution_y=224;sc.render.resolution_percentage=100
 sc.view_settings.view_transform='AgX'; sc.view_settings.look='AgX - Medium High Contrast';sc.view_settings.exposure=.22
 world=bpy.data.worlds.new('Warm reflected light');sc.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.74,.78,.79,1);world.node_tree.nodes['Background'].inputs[1].default_value=.48
 def area(loc,power,size,color):
  bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
 area((-3.0,-4.4,6.4),480,4.2,(1,.93,.83));area((3.8,.9,5.0),270,3.7,(.84,.94,1));area((1.6,-4,1.4),55,3.6,(1,.88,.78))
 ispot=name in ['donabe','chawan-m']
 bpy.ops.object.camera_add();cam=bpy.context.object;sc.camera=cam;cam.data.type='ORTHO'
 a=(0 if ispot else .47)+yaw;dist=9;direction=Vector((sin(a),-cos(a),2.02 if ispot else .73)).normalized()
 cam.rotation_euler=(-direction).to_track_quat('-Z','Y').to_euler()
 bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
 local=cam.rotation_euler.to_matrix().inverted();coords=[]
 for o in objects:
  ev=o.evaluated_get(dg);coords += [local @ (ev.matrix_world @ Vector(co)) for co in ev.bound_box]
 lo=[min(v[i] for v in coords) for i in range(3)];hi=[max(v[i] for v in coords) for i in range(3)]
 center=cam.rotation_euler.to_matrix() @ Vector([(lo[i]+hi[i])/2 for i in range(3)])
 cam.location=center+direction*dist;cam.data.ortho_scale=max(hi[0]-lo[0],hi[1]-lo[1])*1.055
 if ispot:sc.render.resolution_x=sc.render.resolution_y=546;sc.cycles.samples=28
 return sc,cam
builders={'udon':udon,'scallion':scallions,'ginger':ginger,'scallion-rings':lambda:scallions(True),'ginger-slivers':lambda:ginger(True),'chawan-m':lambda:ceramic(True),'donabe':lambda:ceramic(False,True)}
for k in ['stock','soy','mirin','oil','ponzu','okonomisauce','misosauce']:builders[k]=lambda k=k:bottle(k)
exec((ROOT/'extra_geometry.py').read_text())
wanted=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else list(builders)
for key in wanted:
 setup();rng.seed(sum(map(ord,key)));builders[key]();objects=list(bpy.context.scene.objects);sc,cam=studio(objects,key)
 sc.render.filepath=str(RENDERS/(key+'.png'));bpy.ops.render.render(write_still=True)
 if key in ['udon','ginger','scallion']:
  at=cam.rotation_euler.to_matrix() @ Vector((0,0,-9))+cam.location;offset=cam.location-at
  for i,degrees in enumerate([-6,-3,3,6]):
   a=math.radians(degrees);pos=Vector((offset.x*cos(a)-offset.y*sin(a),offset.x*sin(a)+offset.y*cos(a),offset.z));cam.location=at+pos;cam.rotation_euler=(-pos).to_track_quat('-Z','Y').to_euler()
   sc.cycles.samples=16;sc.render.filepath=str(RENDERS/(key+'-angle'+str(i)+'.png'));bpy.ops.render.render(write_still=True)
 print('AJIMI_RENDERED',key,flush=True)
