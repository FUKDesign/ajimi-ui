/* Modelled on the dimensions and light direction of Ajimi’s earthenware donabe render. */
(() => {
  const tau = Math.PI * 2;
  const cx = 210, cy = 158, rx = 133, ry = 117;
  let lastSurface;
  const mid = (a, b) => (a + b) * .5;
  const ellipse = (g, x, y, a, b) => {
    g.beginPath();
    g.ellipse(x, y, a, b, 0, 0, tau);
  };
  function pathThrough(g, points, dx = 0, dy = 0) {
    g.beginPath();
    g.moveTo(points[0][0] + dx, points[0][1] + dy);
    for (let i = 1; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1];
      g.quadraticCurveTo(a[0] + dx, a[1] + dy, mid(a[0], b[0]) + dx, mid(a[1], b[1]) + dy);
    }
    const end = points.at(-1);
    g.lineTo(end[0] + dx, end[1] + dy);
  }
  const strands = Array.from({length:13}, (_, i) => {
    const lead = i * 2.39996, length = 4.35 + .86 * Math.sin(i * 8.4);
    const radius = 87 - i * 4.55;
    return {
      index:i, depth:i / 12, width:10.3 + 1.2 * Math.sin(i * 2.45),
      points:Array.from({length:34}, (_, n) => {
        const f = n / 33, a = lead + f * length;
        return [cx + (radius * Math.cos(a + .16*Math.sin(2*a+i)) + 8 * Math.sin(2 * a - i * .41) + 4 * Math.sin(3 * a + i) + 17 * Math.cos(i)),
          cy + 5 + (.73 * radius * Math.sin(a + .12*Math.cos(a+i)) + 8 * Math.cos(2 * a + .53 * i) + 3 * Math.cos(3 * a + i) + 14 * Math.sin(2 * i)),
          a, f];
      })
    };
  });
  function noodles(g,t,heat){
    const segments=[],ends=[];
    const palette=['#978566','#b3a07d','#c4af8a','#d5c09a','#e2cea9','#e9d9ba','#f2e5c9','#f6ecd5'];
    for(const strand of strands){
      const {index,width,depth}=strand;
      const pts=strand.points.map(([x,y,a,f])=>{
        const lift=(.48+.52*Math.sin(Math.PI*f))*heat;
        const wave=Math.sin(1.6*a+index*.48+t*.96);
        const z=8+depth*7+5.8*Math.sin(a*1.35+index*.7)+2.9*Math.cos(a*2.12-.32*index)+lift*wave*2;
        return {x:x+lift*(4.8*Math.sin(t*2.4+1.8*a+index*.3)+2*Math.cos(t+a*2.2)),
          y:y+lift*(5.1*Math.cos(t*2.1+a*1.4+index*.45)+1.9*Math.sin(t*.8+a))-z*.38,z};
      });
      const outer=pts.map((p,i)=>{
        const a=pts[Math.max(i-1,0)],b=pts[Math.min(i+1,pts.length-1)];
        const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,r=width*(.46+.05*Math.sin(i*.12+index))*(1+.004*p.z);
        return {...p,nx:-dy/len,ny:dx/len,r};
      });
      g.lineJoin='round';g.lineCap='round';pathThrough(g,pts.map(p=>[p.x,p.y]),1.2,3.6);g.lineWidth=width+1;g.strokeStyle='rgba(68,71,51,.12)';g.stroke();
      for(let i=1;i<outer.length;i++)segments.push({a:outer[i-1],b:outer[i],z:mid(outer[i-1].z,outer[i].z)});
      ends.push(outer[0],outer.at(-1));
    }
    // A projected, shaded tube for each noodle. Sorting the small surface spans lets them
    // pass above and below each other; the upper-left studio light is fixed in the scene.
    for(const end of ends)segments.push({a:end,b:null,z:end.z-.02});
    segments.sort((a,b)=>a.z-b.z);
    for(const piece of segments){
      const {a,b}=piece;
      const facing=a.nx*-.59+a.ny*-.8;
      const edge=a.r, mx=b?mid(a.x,b.x):a.x,my=b?mid(a.y,b.y):a.y;
      const sheen=.5+.32*facing;
      const grad=g.createLinearGradient(mx-a.nx*edge,my-a.ny*edge,mx+a.nx*edge,my+a.ny*edge);
      const k=piece.z>14?1:0;
      grad.addColorStop(0,palette[k]);grad.addColorStop(.09,palette[2+k]);
      grad.addColorStop(Math.max(.13,sheen-.21),palette[4+k]);grad.addColorStop(sheen,palette[6+k]);
      grad.addColorStop(Math.min(.87,sheen+.21),palette[4+k]);grad.addColorStop(.92,palette[2+k]);grad.addColorStop(1,palette[k]);
      g.fillStyle=grad;
      if(!b){ellipse(g,a.x,a.y,a.r*.94,a.r*.94);g.fill();continue;}
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ox=dx/len*.48,oy=dy/len*.48;
      g.beginPath();g.moveTo(a.x+a.nx*a.r-ox,a.y+a.ny*a.r-oy);g.lineTo(b.x+b.nx*b.r+ox,b.y+b.ny*b.r+oy);
      g.lineTo(b.x-b.nx*b.r+ox,b.y-b.ny*b.r+oy);g.lineTo(a.x-a.nx*a.r-ox,a.y-a.ny*a.r-oy);g.closePath();g.fill();
    }
  }
  function convection(g,t,heat){
    // Soft reflected patches and crescents spread along the circulating water at the rim.
    for(let i=0;i<13;i++){
      const a=i*2.4+t*(.08+.016*(i%3)), w=17+4*Math.sin(i)+heat*4;
      const dist=.72+.12*Math.sin(t*.62+i);
      const x=cx+rx*dist*Math.cos(a), y=cy+ry*dist*Math.sin(a);
      g.save();g.translate(x,y);g.rotate(a+Math.PI/2);g.scale(1,.29+.10*Math.sin(i+t*.72));
      const glint=g.createRadialGradient(-w*.17,0,1,0,0,w*1.35);
      glint.addColorStop(0,'rgba(255,246,208,'+(.035+heat*(.12+.05*Math.sin(i+t)))+')');
      glint.addColorStop(.53,'rgba(220,236,207,'+(.035+heat*.09)+')');glint.addColorStop(1,'rgba(211,231,204,0)');
      g.fillStyle=glint;g.fillRect(-w*1.35,-w*1.35,w*2.7,w*2.7);g.restore();
      g.beginPath();g.ellipse(x,y,w*.66,w*.25,a+.9,3.77,5.45+.43*Math.sin(t+i));
      g.strokeStyle='rgba(246,248,214,'+(.036+heat*.17)+')';g.lineWidth=1.1;g.stroke();
    }
  }
  function drawWater(g,t,heat) {
    ellipse(g,cx,cy,rx,ry);
    const deep=g.createRadialGradient(183,127,7,218,164,143);
    deep.addColorStop(0,'rgba(160,172,150,.63)');deep.addColorStop(.69,'rgba(133,159,145,.78)');deep.addColorStop(.92,'rgba(112,139,130,.84)');deep.addColorStop(1,'rgba(143,157,138,.72)');
    g.fillStyle=deep;g.fill();
    g.save();g.clip();g.lineCap='round';convection(g,t,heat);
    for(let i=0;i<13;i++){
      const a=i*2.4, drift=(.014+.04*heat)*Math.sin(t*1.25+i), rr=.57+(i%5)*.094;
      g.beginPath();g.ellipse(cx+2*Math.sin(t*.9+i),cy+2*Math.cos(t+i),rx*rr,ry*rr,0,a+drift,a+.18+.13*Math.sin(i+1)**2+drift);
      g.lineWidth=.75+(i%3)*.45;g.strokeStyle='rgba(221,237,211,'+(.14+heat*.21)+')';g.stroke();
    }
    noodles(g,t,heat);
    const glaze=g.createLinearGradient(137,62,271,226);
    glaze.addColorStop(0,'rgba(215,237,220,.16)');glaze.addColorStop(.5,'rgba(228,240,214,0)');glaze.addColorStop(1,'rgba(83,112,100,.10)');
    g.fillStyle=glaze;g.fillRect(70,34,282,249);
    bubbles(g,t,heat);
    g.restore();
    ellipse(g,cx,cy,rx,ry);g.strokeStyle='rgba(65,73,53,.38)';g.lineWidth=2.2;g.stroke();
    g.beginPath();g.ellipse(cx,cy-1,rx-1,ry-1,0,3.35,5.25);g.strokeStyle='rgba(250,240,205,.68)';g.lineWidth=1.7;g.stroke();
  }
  function bubbles(g,t,heat){
    for(let i=0;i<32;i++){
      const a=i*2.39996, radius=.41+.50*((i*31)%29)/29, loop=(t*(.49+(i%6)*.055)+i*.61803)%1;
      const strength=Math.min(1,Math.max(0,.17+heat*1.2-i*.023));
      if (strength<.035)continue;
      const life=Math.min(1,loop/.16,(1-loop)/.23);
      const x=cx+rx*radius*Math.cos(a)+Math.sin(t*2+i)*1.75;
      const y=cy+ry*radius*Math.sin(a)-loop*4;
      const s=(1.4+(i%4)*.78+3.2*loop)*Math.max(.2,life)*(.45+.8*strength);
      g.save();g.globalAlpha=life*(.49+strength*.46);
      if(loop<.76){
        const rim=g.createRadialGradient(x-s*.42,y-s*.45,.05,x,y,s);
        rim.addColorStop(0,'rgba(253,255,229,.9)');rim.addColorStop(.27,'rgba(225,243,218,.44)');rim.addColorStop(.63,'rgba(113,145,126,.20)');rim.addColorStop(.86,'rgba(79,105,93,.48)');rim.addColorStop(1,'rgba(231,246,221,.84)');
        ellipse(g,x,y,s,s*.92);g.fillStyle=rim;g.fill();
      }else{
        const pop=s*(1.5+(loop-.76)*2.8);ellipse(g,x,y,pop,pop*.73);g.lineWidth=.76;g.strokeStyle='rgba(226,244,217,.6)';g.stroke();
      }
      g.restore();
    }
  }
  function steam(g,t,heat){
    const starts=[[167,121,0],[218,105,.37],[249,128,.72],[194,101,.18],[230,118,.59]];
    for(let i=0;i<starts.length;i++){
      const [x,y,offset]=starts[i],f=(t*.34+offset)%1;
      const alpha=Math.sin(f*Math.PI)*(.040+.25*heat)*(i>2?heat:1);
      if(alpha<.008)continue;
      // Overlapping translucent ellipses follow a rising helical plume; no hard steam outline.
      for(let j=0;j<12;j++){
        const q=j/11, rise=f*76+q*(19+heat*28), bend=Math.sin(f*6.1+q*4+i)*(1.5+f*11+q*4);
        const x1=x+bend-7*f, y1=y-rise, spread=5+f*8+q*4.2;
        g.save();g.globalAlpha=Math.min(1,Math.max(0,(y1-4)/27));g.translate(x1,y1);g.scale(1,1.35);
        const mist=g.createRadialGradient(0,0,.2,0,0,spread);
        mist.addColorStop(0,'rgba(249,248,223,'+(alpha*.49)+')');mist.addColorStop(.4,'rgba(240,245,227,'+(alpha*.36)+')');mist.addColorStop(1,'rgba(239,242,226,0)');
        g.fillStyle=mist;g.fillRect(-spread,-spread,spread*2,spread*2);g.restore();
      }
    }
  }
  class AjimiBoil extends HTMLElement{
    connectedCallback(){
      this.canvas=document.createElement('canvas');this.canvas.setAttribute('aria-hidden','true');this.replaceChildren(this.canvas);
      this.g=this.canvas.getContext('2d',{alpha:true});if(!this.g)return;
      this.board=this.closest('[data-tech-key=boil]');this.surface=this.closest('[data-act=tech-surface]');
      this.media=matchMedia('(prefers-reduced-motion: reduce)');this.clock=0;this.heat=.10;this.pulseEnd=0;
      const now=performance.now();
      if(lastSurface&&now-lastSurface.at<300){this.clock=lastSurface.clock;this.heat=lastSurface.heat;}
      this.resize=new ResizeObserver(()=>this.sizeCanvas());this.resize.observe(this);
      this.watch=new MutationObserver(()=>this.update());this.watch.observe(this.board,{attributes:true,attributeFilter:['data-tech-count','data-tech-done']});this.watch.observe(this.surface,{attributes:true,attributeFilter:['class']});
      this.motionChange=()=>this.update();this.media.addEventListener('change',this.motionChange);
      this.onVisibility=()=>this.update();document.addEventListener('visibilitychange',this.onVisibility);
      this.sizeCanvas();this.update();
    }
    sizeCanvas(){
      const rect=this.getBoundingClientRect();if(!rect.width)return;
      const ratio=Math.min(2,devicePixelRatio||1),w=Math.round(rect.width*ratio),h=Math.round(rect.height*ratio);
      if(w!==this.canvas.width||h!==this.canvas.height){this.canvas.width=w;this.canvas.height=h;}
      this.paint();
    }
    pulse(){this.pulseEnd=performance.now()+610;this.update();}
    update(){
      cancelAnimationFrame(this.frame);this.frame=0;
      if(document.hidden)return;
      this.done=this.board.dataset.techDone==='true';this.holding=this.surface.classList.contains('tech-engaged');
      if(this.media.matches){this.heat=this.done ? .08 : (this.holding ? .9 : .32);this.clock=.45+Number(this.board.dataset.techCount)*.38;this.paint();return;}
      this.prev=performance.now();this.frame=requestAnimationFrame(n=>this.tick(n));
    }
    tick(now){
      if(now-this.prev<28){this.frame=requestAnimationFrame(n=>this.tick(n));return;}
      const dt=Math.min(.085,(now-this.prev)/1000);this.prev=now;
      const target=this.done ? .045 : (this.holding||now<this.pulseEnd ? 1 : .12);
      this.heat+=(target-this.heat)*(1-Math.exp(-dt*(target>this.heat?5.4:2.95)));
      this.clock+=dt*(.35+this.heat*1.52);this.paint();
      if(!this.done||Math.abs(this.heat-target)>.009)this.frame=requestAnimationFrame(n=>this.tick(n));
    }
    paint(){
      if(!this.canvas.width||!this.canvas.height)return;
      const g=this.g;g.setTransform(this.canvas.width/420,0,0,this.canvas.height/327,0,0);
      g.clearRect(0,0,420,327);drawWater(g,this.clock,this.heat);steam(g,this.clock,this.heat);
      this.dataset.painted='';
    }
    disconnectedCallback(){
      cancelAnimationFrame(this.frame);this.resize?.disconnect();this.watch?.disconnect();
      if(!this.media)return;
      this.media.removeEventListener('change',this.motionChange);document.removeEventListener('visibilitychange',this.onVisibility);
      lastSurface={clock:this.clock,heat:this.heat,at:performance.now()};
    }
  }
  customElements.define('ajimi-boil',AjimiBoil);
})();
