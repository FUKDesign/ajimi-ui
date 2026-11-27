"""Ajimi stoneware serving wheel. Aidan McFarlane."""
import bpy, math
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parent
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=28
scene.cycles.use_denoising=True
def linear(c):
 c=c/255;return c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4
def colour(s): return [linear(int(s[i:i+2],16)) for i in (0,2,4)]+[1]
mat=bpy.data.materials.new('Thrown celadon stoneware');mat.use_nodes=True
nodes=mat.node_tree.nodes;links=mat.node_tree.links;bs=nodes.get('Principled BSDF')
bs.inputs['Roughness'].default_value=.52
noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=135;noise.inputs['Detail'].default_value=2.5
r=nodes.new('ShaderNodeValToRGB');r.color_ramp.elements[0].position=.2;r.color_ramp.elements[0].color=colour('778D80');r.color_ramp.elements[1].position=.77;r.color_ramp.elements[1].color=colour('C1CCAE')
links.new(noise.outputs['Fac'],r.inputs['Fac']);links.new(r.outputs['Color'],bs.inputs['Base Color'])
bump=nodes.new('ShaderNodeBump');bump.inputs['Distance'].default_value=.013;bump.inputs['Strength'].default_value=.22;links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bs.inputs['Normal'])
profile=[(.001,0),(1.87,0),(1.91,.015),(1.93,.05),(1.943,.105),(1.966,.123),(1.992,.148),(2,.177),(2,.196),(1.993,.224),(1.973,.238),(1.949,.241),(1.923,.235),(1.88,.216),(1.83,.203),(1.8,.206),(1.78,.205),(1.73,.2),(1.65,.195),(.001,.195)]
count=220;verts=[];faces=[]
for radius,z in profile:
 for i in range(count):
  a=i*2*math.pi/count;v=radius*(1+.0019*math.sin(3*a)+.0011*math.cos(5*a))
  verts.append((v*math.cos(a),v*math.sin(a),z))
for j in range(len(profile)-1):
 for i in range(count):faces.append((j*count+i,j*count+(i+1)%count,(j+1)*count+(i+1)%count,(j+1)*count+i))
mesh=bpy.data.meshes.new('Wheel profile');mesh.from_pydata(verts,[],faces);mesh.update();dish=bpy.data.objects.new('Wheel',mesh);bpy.context.collection.objects.link(dish);dish.data.materials.append(mat)
for f in dish.data.polygons:f.use_smooth=True
def aim(obj):obj.rotation_euler=(Vector((0,0,.12))-obj.location).to_track_quat('-Z','Y').to_euler()
for loc,power,size in [((-3,3,5),520,3.5),((3,-1,4),115,5)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;aim(l)
scene.world.color=(.27,.27,.27)
bpy.ops.object.camera_add(location=(0,-1.7,10));cam=bpy.context.object;aim(cam);cam.data.type='ORTHO';cam.data.ortho_scale=4.16;scene.camera=cam
scene.render.film_transparent=True;scene.render.resolution_x=640;scene.render.resolution_y=640;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(root/'wheel.png');bpy.ops.render.render(write_still=True)
