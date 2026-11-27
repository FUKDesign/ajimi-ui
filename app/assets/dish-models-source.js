// Original Ajimi geometric food studies. Creator: Aidan McFarlane.
// Renderer: three.js, MIT. See assets/three-LICENSE.txt.
import * as T from 'three';

const TAU = Math.PI * 2;
const assetBase = new URL('assets/', document.currentScript?.src || document.baseURI);
const active = new WeakMap();
const swatches = new Map();
const vec = (x, y, z) => new T.Vector3(x, y, z);
function randomSource(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
function canvasTexture(width, height, paint) {
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  paint(c.getContext('2d'), width, height);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
function ceramicTexture(rice, rand) {
  return canvasTexture(1024, 256, (c,w,h) => {
    const ground=c.createLinearGradient(0,0,0,h);
    const stops=rice ? ['#e1e7db','#abc1c1','#ecebdb'] : ['#3f3431','#674837','#674533'];
    stops.forEach((s,i)=>ground.addColorStop(i/2,s)); c.fillStyle=ground;c.fillRect(0,0,w,h);
    for(let i=0;i<7400;i++) {
      c.fillStyle=rice ? (i%3?'#faf2d52a':'#34516b21') : (i%3?'#c3a2836a':'#1b17174a');
      c.beginPath(); c.ellipse(rand()*w,rand()*h,.35+rand()*1.1,.3+rand()*1.3,0,0,TAU);c.fill();
    }
    // A brush-painted repeating petal border on the porcelain rice chawan.
    if(rice) {
      const line=(y,a,color)=>{c.strokeStyle=color;c.lineWidth=a;c.beginPath();for(let x=0;x<=w;x+=4)c.lineTo(x,y+Math.sin(x*TAU/w*3)*1.15);c.stroke();};
      line(32,5,'#244960');line(41,2,'#476579');line(115,2.2,'#49697f');
      c.fillStyle='#385971';c.strokeStyle='#385971';
      for(let j=0;j<32;j++) {
        let x=j*w/32+3;
        c.beginPath(); c.moveTo(x,103); c.bezierCurveTo(x+2,87,x+6,77,x+10,70);c.bezierCurveTo(x+13,85,x+9,96,x,103);c.fill();
        c.beginPath();c.moveTo(x+10,78);c.bezierCurveTo(x+10,64,x+15,58,x+22,50);c.bezierCurveTo(x+23,66,x+19,74,x+10,78);c.fill();
      }
    } else {
      for(let i=0;i<190;i++){let x=rand()*w,y=rand()*h;c.fillStyle=i%3?'#e9c18e5e':'#281b1b65';c.fillRect(x,y,1+rand()*2,.65+rand()*1.4);}
    }
  });
}
function foodTexture(base, marks, rand, size=256, count=2700) {
  return canvasTexture(size,size,(c,w,h)=>{
    c.fillStyle=base;c.fillRect(0,0,w,h);
    for(let i=0;i<count;i++) {
      c.fillStyle=marks[i%marks.length];const x=rand()*w,y=rand()*h,rx=.45+rand()*1.55;
      c.beginPath();c.ellipse(x,y,rx,rx*(.55+rand()*.8),rand()*Math.PI,0,TAU);c.fill();
    }
  });
}
function surfaceFromRings(rings, radial=60) {
  const vs=[],uv=[],ids=[];
  rings.forEach((ring,i)=>{
    for(let j=0;j<=radial;j++){
      const u=j/radial,p=ring(u*TAU); vs.push(...p);uv.push(u,i/(rings.length-1));
      if(i<rings.length-1&&j<radial){const a=i*(radial+1)+j,b=a+radial+1;ids.push(a,a+1,b,a+1,b+1,b);}
    }
  });
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vs,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();return g;
}
function interp(knots,t) {
  for(let i=1;i<knots.length;i++) if(t<=knots[i][0]) {
    const [a,x]=knots[i-1],[b,y]=knots[i];let f=(t-a)/(b-a);f=f*f*(3-2*f);return x+(y-x)*f;
  }
  return knots.at(-1)[1];
}
function makeDish(rice) {
  const rand=randomSource(rice?13917:604381);
  const group=new T.Group(), geometries=new Set(),materials=new Set(),textures=new Set();
  const material=(color,extras={})=>{const m=new T.MeshStandardMaterial({color,roughness:.61,...extras});materials.add(m);if(m.map)textures.add(m.map);return m;};
  const ge=(g)=>{geometries.add(g);return g;};
  const mesh=(geo,mat,parent=group)=>{
    const m=new T.Mesh(ge(geo),mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  const sphere=ge(new T.SphereGeometry(1,22,13));
  function oval(x,y,z,sx,sy,sz,mat,parent=group) {
    const m=mesh(sphere,mat,parent);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;
  }
  function line(points,width,mat,parent=group) {
    return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(10,points.length*4),width,5,false),mat,parent);
  }
  function batch(points,geo,mat,parent=group) {
    const inst=new T.InstancedMesh(ge(geo),mat,points.length),o=new T.Object3D();inst.castShadow=false;inst.receiveShadow=true;
    points.forEach(([x,y,z,sx,sy,sz,rx,ry,rz,color],i)=>{
      o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);o.updateMatrix();inst.setMatrixAt(i,o.matrix);
      if(color){if(!swatches.has(color))swatches.set(color,new T.Color(color));inst.setColorAt(i,swatches.get(color));}
    });
    parent.add(inst);inst.computeBoundingSphere();
  }
  function vessel(profile,mat){ const obj=mesh(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),100),mat);obj.receiveShadow=true;return obj;}
  function porcelainRing(radius,y,thick,mat) {
    const m=mesh(new T.TorusGeometry(radius,thick,10,100),mat);m.rotation.x=Math.PI/2;m.position.y=y;
  }
  const wall=material('white',{map:ceramicTexture(rice,rand),roughness:.34,side:T.DoubleSide});
  const inside=material(rice?'#ece9d9':'#5c4435',{roughness:.36,side:T.DoubleSide});
  const trim=material(rice?'#294d67':'#634839',{roughness:.34});
  const foot=material(rice?'#e2d3b3':'#b79776',{roughness:.88});
  const rimY=rice?1.02:.85, rim=1.70;
  vessel(rice?[[.01,.045],[.54,.045],[.6,.07],[.61,.16],[.78,.19],[1.04,.23],[1.27,.34],[1.47,.49],[1.60,.70],[1.68,.91],[rim,1.02]] :
    [[.01,.045],[.68,.045],[.73,.09],[.90,.15],[1.22,.20],[1.42,.30],[1.58,.46],[1.67,.65],[rim,.85]],wall);
  vessel([[.01,.18],[.55,.18],[1.06,.35],[1.39,.56],[1.57,rimY-.15],[rim-.045,rimY+.005]],inside);
  porcelainRing(rim-.020,rimY,.034,trim);
  porcelainRing(rice?.580:.697,.065,.018,foot);
  if(!rice) porcelainRing(1.667,.746,.013,trim);
  // Organics loft along their local X axis. Radius and asymmetry vary over the length.
  function organic(length,width,height,knots,mat,options={}) {
    const rings=[];const long=40;
    for(let i=0;i<=long;i++) {const t=i/long,r=interp(knots,t);
      rings.push(a=>{const wobble=1+(options.irregular||0)*(Math.sin(3*a+5*t)+.36*Math.cos(7*a-8*t)+.23*Math.sin(13*a+31*t));
        return [(t-.5)*length, Math.sin(a)*height*r*wobble+(options.arch||0)*Math.sin(t*Math.PI),
          Math.cos(a)*width*r*wobble+(options.bend||0)*Math.sin(t*Math.PI)];});
    }
    return mesh(surfaceFromRings(rings,38),mat);
  }
  if(rice) {
    const riceCore=material('#e9ddba',{roughness:.60});
    const riceGrain=material('white',{roughness:.5});
    const riceY=(x,z)=>.964+.25*Math.sqrt(Math.max(0,1-(x*x+z*z)/(1.52*1.52)));
    oval(0,.955,0,1.52,.247,1.52,riceCore);
    const broth=material('#bba156',{roughness:.22});
    oval(0,.963,0,1.624,.025,1.624,broth);
    const grains=[],whites=['#f4ebd7','#eee1bd','#fff4df','#f9edd0','#e5d8bc'];
    // Stratified visible grains cover the curved rice mound without overlapping as clumps.
    for(let i=0;i<1950;i++){const r=1.515*Math.sqrt((i+.38)/1950),a=i*2.3999632+rand()*.042,x=r*Math.cos(a),z=r*Math.sin(a);
      grains.push([x,riceY(x,z)-.006+rand()*.012,z,.033+rand()*.011,.018+rand()*.008,.052+rand()*.015,(rand()-.5)*.44,rand()*Math.PI,(rand()-.5)*.4,whites[i%5]]);}
    batch(grains,new T.SphereGeometry(1,10,6),riceGrain);
    const nori=material('#203b2a',{roughness:.82,side:T.DoubleSide});
    for(let i=0;i<18;i++){
      const a=rand()*TAU,r=Math.sqrt(rand())*1.34,x=r*Math.cos(a),z=r*Math.sin(a),len=.27+rand()*.44,w=.036+rand()*.05,rot=(rand()-.5)*2.45;
      const rows=[];for(let j=0;j<=7;j++){const t=j/7,along=(t-.5)*len,bend=.04*Math.sin(t*2.8+i);for(const side of [-1,1]){
        const cross=bend+side*w*.5,xx=x+along*Math.cos(rot)-cross*Math.sin(rot),zz=z+along*Math.sin(rot)+cross*Math.cos(rot);
        rows.push(xx,riceY(xx,zz)+.033+.027*Math.sin(t*Math.PI+i)+side*.013,zz);
      }}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(rows,3));const ix=[];for(let j=0;j<7;j++){const a=j*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}g.setIndex(ix);g.computeVertexNormals();mesh(g,nori);
    }
    const roeMat=material('white',{map:foodTexture('#df8172',['#e9927b','#e38974','#c4665f','#e4a088','#d17665'],rand,256,5800),side:T.DoubleSide,roughness:.56});
    const roeGrain=material('white',{roughness:.57});
    const sizes=[[0,.015],[.06,.48],[.22,.88],[.47,1],[.73,.91],[.89,.65],[.97,.32],[1,.014]];
    function roe(x,z,len,w,h,rot,y) {
      const obj=organic(len,w,h,sizes,roeMat,{bend:.10,arch:.04,irregular:.019});
      obj.position.set(x,y,z);obj.rotation.y=rot;
      const dots=[],colors=['#e78d71','#e99278','#d7856c','#ed967a','#e28670'];
      for(let i=0;i<720;i++){const t=.025+rand()*.95,a=rand()*Math.PI,r=interp(sizes,t),grain=.007+rand()*.006;
        dots.push([(t-.5)*len,Math.sin(a)*h*r+.04*Math.sin(t*Math.PI),Math.cos(a)*w*r+.1*Math.sin(t*Math.PI),
          grain,grain*.80,grain,rand(),rand(),0,colors[i%5]]);}
      batch(dots,new T.IcosahedronGeometry(1,0),roeGrain,obj);
    }
    roe(-.18,-.44,1.68,.285,.236,-.22,1.272);
    // The opened sac is flatter, with loose grains spilling onto the rice.
    const openProfile=[[0,.007],[.06,.63],[.26,.98],[.49,1],[.73,.97],[.94,.63],[1,.007]];
    const opened=organic(1.53,.366,.158,openProfile,roeMat,{bend:.074,arch:.017,irregular:.05});
    opened.position.set(.29,1.240,.22);opened.rotation.y=-.31;
    const loose=[],corals=['#f98d63','#f2986f','#eb815d','#e57958','#e98769','#db7159'];
    for(let i=0;i<1620;i++){const t=.03+.94*rand(),a=.06+rand()*(Math.PI-.12),r=interp(openProfile,t);
      const wobble=1+.05*(Math.sin(3*a+5*t)+.36*Math.cos(7*a-8*t)+.23*Math.sin(13*a+31*t)),g=.010+rand()*.011;
      loose.push([(t-.5)*1.53,Math.sin(a)*.158*r*wobble+.017*Math.sin(t*Math.PI)+.005,Math.cos(a)*.366*r*wobble+.074*Math.sin(t*Math.PI),g,g*.79,g,0,rand(),0,corals[i%6]]);}
    batch(loose,new T.IcosahedronGeometry(1,0),roeGrain,opened);
    for(let i=0;i<18;i++){const a=rand()*TAU,x=(rand()-.5)*.68,z=(rand()-.5)*.30,long=.34+rand()*.49,w=.012+rand()*.017;const p=[],idx=[];
      for(let j=0;j<=8;j++){const t=j/8-.5,xx=x+t*long*Math.cos(a),zz=z+t*long*Math.sin(a)+.035*Math.sin(t*4+i),h=1.426+.075*Math.cos(t*Math.PI*1.8)+.022*Math.sin(j*.8+i);p.push(xx-w*Math.sin(a),h,zz+w*Math.cos(a),xx+w*Math.sin(a),h+.012*Math.sin(j),zz-w*Math.cos(a));if(j<8){let v=j*2;idx.push(v,v+1,v+2,v+1,v+3,v+2);}}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();mesh(g,nori);
    }
  } else {
    // Oil spotting and red spice flecks float on a single thin amber surface.
    const broth=material('white',{roughness:.34,map:canvasTexture(512,512,(c,w,h)=>{
      const base=c.createRadialGradient(w*.40,h*.32,5,w/2,h/2,w*.52);base.addColorStop(0,'#ba6626');base.addColorStop(.64,'#a95322');base.addColorStop(1,'#90431e');c.fillStyle=base;c.fillRect(0,0,w,h);
      for(let i=0;i<68;i++){let x=rand()*w,y=rand()*h,rad=3+rand()*12,start=rand()*TAU;c.beginPath();c.ellipse(x,y,rad,rad*(.3+rand()*.40),rand()*TAU,start,start+1.2+rand()*1.9);c.strokeStyle=i%2?'#e2984047':'#71321b29';c.lineWidth=.3+rand()*.8;c.stroke();}
      for(let i=0;i<6300;i++){let x=rand()*w,y=rand()*h,r=.22+Math.pow(rand(),9)*2.2;c.fillStyle=['#dd8b394e','#c36d2744','#dc802d49','#80401e68','#a9592038'][i%5];c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
    })});
    const soup=mesh(new T.CircleGeometry(1.616,100),broth);soup.rotation.x=-Math.PI/2;soup.position.y=.755;
    const skin=material('white',{map:canvasTexture(384,256,(c,w,h)=>{
      const shade=c.createLinearGradient(0,0,w,h);shade.addColorStop(0,'#bc793d');shade.addColorStop(.33,'#c78a45');shade.addColorStop(.50,'#ce9050');shade.addColorStop(.75,'#ba7537');shade.addColorStop(1,'#a96635');c.fillStyle=shade;c.fillRect(0,0,w,h);
      for(let i=0;i<2800;i++){const x=rand()*w,y=rand()*h,r=.35+rand()*1.35;c.fillStyle=['#6e391d42','#efbc7c72','#8a542b3c','#ca864e66'][i%4];c.beginPath();c.ellipse(x,y,r*.65,r,rand(),0,TAU);c.fill();}
      for(let i=0;i<95;i++){const x=rand()*w,y=rand()*h;c.strokeStyle=i%2?'#854c294c':'#edbb7c59';c.lineWidth=.6+rand();c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+2,y+3,x+4,y+4,x+3+rand()*2,y+6+rand()*6);c.stroke();}
    }),side:T.DoubleSide,roughness:.59});
    const bone=material('#e4c49a',{roughness:.75});
    const bird=organic(1.72,.405,.277,[[0,.005],[.065,.52],[.18,.96],[.33,1.06],[.49,.91],[.60,.68],[.74,.44],[.90,.34],[.97,.26],[1,.02]],skin,{bend:.105,arch:.075,irregular:.064});
    bird.position.set(-.33,.92,.17);bird.rotation.y=-.65;
    oval(.92,.011,.004,.19,.078,.085,bone,bird);
    oval(1.05,.037,.042,.075,.07,.066,bone,bird);oval(1.04,-.012,-.077,.084,.085,.071,bone,bird);
    const skinScuffs=material('#925229',{roughness:.72});
    for(let i=0;i<5;i++){const x=-.47+i*.13;
      line([vec(x-.02,.284,.13),vec(x+.02,.315,.065),vec(x+.052,.33,-.004)],.008,skinScuffs,bird);}
    const carrot=material('white',{map:foodTexture('#ed751e',['#f48c2e','#ea7621','#d86820','#bd552252'],rand,128,430),roughness:.71,side:T.DoubleSide});
    const cut=material('#e88b40',{roughness:.73,side:T.DoubleSide});
    for(const [x,z,l,r,rot,tilt] of [[.79,.28,.94,.186,-.89,-.10],[.85,-.23,.79,.158,-.74,.11],[-.32,-.78,.76,.16,-.1,-.07]]) {
      const c=organic(l,r,r*.86,[[0,.81],[.025,.98],[.16,1],[.78,.78],[.98,.58],[1,.02]],carrot,{irregular:.031,bend:.028});
      c.position.set(x,.866,z);c.rotation.set(0,rot,tilt);
      oval(-l*.498,0,0,.009,r*.70,r*.83,cut,c);
    }
    const purple=material('white',{map:foodTexture('#472843',['#623749','#38253b','#58324c'],rand,128,500),roughness:.46,side:T.DoubleSide});
    const flesh=material('white',{map:foodTexture('#bca15f',['#e0bc74','#ac8d53','#cbb07a'],rand,128,1200),roughness:.67,side:T.DoubleSide});
    const eggplant=new T.Group();group.add(eggplant);eggplant.position.set(.28,.984,-.79);eggplant.rotation.y=-.51;
    const eggProfile=[[0,.015],[.08,.52],[.25,.92],[.49,1],[.76,.85],[.93,.47],[1,.015]];
    const eLen=1.21,eW=.265;
    const skinRows=[],fleshRows=[];
    for(let i=0;i<=32;i++){const t=i/32,r=interp(eggProfile,t);skinRows.push(a=>[(t-.5)*eLen,-Math.abs(Math.sin(a/2))*.24*r,Math.cos(a/2)*r*eW]);fleshRows.push(a=>[(t-.5)*eLen,.027*r*Math.sin(a/2),-Math.cos(a/2)*r*eW]);}
    eggplant.add(mesh(surfaceFromRings(skinRows,26),purple));eggplant.add(mesh(surfaceFromRings(fleshRows,18),flesh));eggplant.rotation.x=.34;
    const char=material('#896938',{roughness:.85});
    for(const x of [-.25,-.075,.105,.28]){line([vec(x-.06,.012,-.14),vec(x,.029,0),vec(x+.07,.012,.14)],.011,char,eggplant);}
    const potatoSkin=material('white',{map:foodTexture('#c79d65',['#b38953','#d7b67d','#aa7e4c'],rand,128,600),roughness:.81});
    const potatoCut=material('white',{map:foodTexture('#ead093',['#e7c58a','#dbb880','#eed398'],rand,128,400),roughness:.76});
    const potato=new T.Group();group.add(potato);potato.position.set(-.77,.863,.78);potato.rotation.set(-.08,.05,.24);
    const halfPotato=mesh(new T.SphereGeometry(1,32,13,0,TAU,Math.PI/2,Math.PI/2),potatoSkin,potato);halfPotato.scale.set(.32,.23,.27);
    const potatoFace=mesh(new T.CircleGeometry(1,32),potatoCut,potato);potatoFace.rotation.x=-Math.PI/2;potatoFace.scale.set(.32,.27,1);
    const green=material('white',{map:foodTexture('#4b712e',['#557e34','#6d8c3c','#496733','#8b9a4a'],rand,128,500),roughness:.47,side:T.DoubleSide});
    const pith=material('#93a455',{roughness:.71});
    for(const [x,z,rx,rz,rot] of [[-.87,-.56,.30,.19,.36],[.18,.98,.24,.18,.1]]) {
      const rows=[];for(let i=0;i<=12;i++){const b=i/12*TAU;rows.push(a=>{const r=1+.13*Math.cos(3*a)-.07*Math.sin(4*a);return [(rx+.061*Math.cos(b))*r*Math.cos(a),.086*Math.sin(b)+.068*Math.sin(2*a),(rz+.049*Math.cos(b))*r*Math.sin(a)];});}
      const pepper=mesh(surfaceFromRings(rows,49),green);pepper.position.set(x,.831,z);pepper.rotation.y=rot;
      line([vec(-rx*.74,.005,-.02),vec(-rx*.52,.008,-.005),vec(-rx*.38,.012,.016)],.014,pith,pepper);
    }
    // A few fine chopped herbs give scale to the broth and toppings.
    const herbs=[],herb=material('white',{roughness:.83});
    for(let i=0;i<66;i++){const flat=rand()*TAU,r=1.52*Math.sqrt(rand());herbs.push([r*Math.cos(flat),.765,r*Math.sin(flat),.010+rand()*.019,.005,.017+rand()*.024,0,rand()*TAU,0,['#516b34','#5f7540','#867732'][i%3]]);}
    batch(herbs,new T.IcosahedronGeometry(1,0),herb);
  }
  return {group,dispose(){group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());textures.forEach(x=>x.dispose());}};
}

function mount(element,regionId) {
  active.get(element)?.();
  const rice=regionId==='fukuoka',name=rice?'mentaiko rice':'Sapporo soup curry';
  const shell=document.createElement('div');
  Object.assign(shell.style,{position:'relative',width:'100%',height:'100%',minHeight:'260px',overflow:'hidden',background:'#f7f1e5'});
  element.appendChild(shell);
  let renderer,scene,model,plane,texture,shadowMat,light,observer,dead=false,disposeEvents=()=>{};
  function cleanup() {
    disposeEvents();observer?.disconnect();model?.dispose();
    plane?.geometry.dispose();shadowMat?.dispose();texture?.dispose();light?.shadow.map?.dispose();
    if(renderer){renderer.dispose();renderer.forceContextLoss();renderer=null;}
  }
  function dispose(){if(dead)return;dead=true;cleanup();shell.remove();if(active.get(element)===dispose)active.delete(element);}
  active.set(element,dispose);
  function fallback() {
    cleanup();shell.replaceChildren();
    const img=document.createElement('img');img.src=new URL((rice?'fukuoka':'hokkaido')+'.webp',assetBase);
    img.alt='Photograph of '+name;Object.assign(img.style,{width:'100%',height:'100%',minHeight:'260px',objectFit:'contain',display:'block'});shell.appendChild(img);
    const msg=document.createElement('span');msg.textContent='Photo view · 3D is unavailable on this device.';
    Object.assign(msg.style,{position:'absolute',bottom:'10px',left:'10px',padding:'5px 9px',background:'#f7f1e5',color:'#213b35',font:'12px system-ui'});shell.appendChild(msg);
  }
  try {
    renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
    renderer.setClearColor(0xf7f1e5,1);
    const c=renderer.domElement;shell.appendChild(c);c.tabIndex=0;c.setAttribute('role','img');
    c.setAttribute('aria-label','Interactive 3D model of '+name+'. Drag or use the arrow keys to rotate. Home resets the view.');
    Object.assign(c.style,{width:'100%',height:'100%',display:'block',touchAction:'none',cursor:'grab',outlineOffset:'-3px'});
    scene=new T.Scene();
    model=makeDish(rice);scene.add(model.group);
    const camera=new T.PerspectiveCamera(34,1,.05,40);
    scene.add(new T.HemisphereLight(0xfff8eb,0xc9b6a5,1.75));
    light=new T.DirectionalLight(0xffefd9,2.32);light.position.set(-3,6,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);
    Object.assign(light.shadow.camera,{left:-2.25,right:2.25,top:2.25,bottom:-2.25,near:.1,far:13});light.shadow.radius=2.0;light.shadow.bias=-.00055;light.shadow.normalBias=.014;scene.add(light);
    const kicker=new T.DirectionalLight(0xe8efff,.85);kicker.position.set(3,2.5,-3);scene.add(kicker);
    texture=canvasTexture(128,128,(ctx,w,h)=>{const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(45,36,29,.32)');g.addColorStop(.33,'rgba(45,36,29,.27)');g.addColorStop(.66,'rgba(45,36,29,.11)');g.addColorStop(1,'rgba(45,36,29,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});
    shadowMat=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});plane=new T.Mesh(new T.PlaneGeometry(4.29,4.29),shadowMat);plane.rotation.x=-Math.PI/2;plane.position.set(.055,.013,-.065);scene.add(plane);
    let azimuth=rice?.22:.16,elevation=rice?.56:.62,dist=5.55,pointer=null,lastX=0,lastY=0;
    // Static by default. Each input draws a frame, with no spin, inertia or animation.
    function draw(){if(dead||!renderer)return;camera.position.set(dist*Math.cos(elevation)*Math.sin(azimuth),.61+dist*Math.sin(elevation),dist*Math.cos(elevation)*Math.cos(azimuth));camera.lookAt(0,.61,0);renderer.render(scene,camera);}
    function size(){if(dead||!renderer)return;const {width,height}=shell.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;dist=6.68/Math.min(1,camera.aspect);camera.updateProjectionMatrix();draw();}
    function rotate(x,y){azimuth+=x;elevation=Math.min(1.43,Math.max(.19,elevation+y));draw();}
    function down(e){if(pointer!==null||e.button!==0)return;pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;c.setPointerCapture(pointer);c.style.cursor='grabbing';c.focus({preventScroll:true});}
    function move(e){if(e.pointerId!==pointer)return;rotate(-(e.clientX-lastX)*.010,(e.clientY-lastY)*.008);lastX=e.clientX;lastY=e.clientY;}
    function up(e){if(e.pointerId!==pointer)return;pointer=null;c.style.cursor='grab';}
    function key(e){const dirs={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,.104],ArrowDown:[0,-.104]};if(dirs[e.key]){e.preventDefault();rotate(...dirs[e.key]);}else if(e.key==='Home'){e.preventDefault();azimuth=rice?.22:.16;elevation=rice?.56:.62;draw();}}
    function lost(e){e.preventDefault();if(!dead)fallback();}
    const handlers={pointerdown:down,pointermove:move,pointerup:up,pointercancel:up,lostpointercapture:up,keydown:key,webglcontextlost:lost};
    for(const [event,fn] of Object.entries(handlers))c.addEventListener(event,fn);
    disposeEvents=()=>{for(const [event,fn] of Object.entries(handlers))c.removeEventListener(event,fn);window.removeEventListener('resize',size);};
    if(window.ResizeObserver){observer=new ResizeObserver(size);observer.observe(shell);}else window.addEventListener('resize',size);
    size();
  } catch {fallback();}
  return dispose;
}
window.Ajimi3D={mount};
