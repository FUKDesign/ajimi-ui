'use strict';
const R=window.AJIMI_REGIONS,W=window.AJIMI_WORDS,regions=Object.keys(R);
const main=document.querySelector('main'),announce=document.querySelector('#announce'),coach=document.querySelector('#coach');
const html=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jp=s=>'<span lang="ja">'+html(s)+'</span>';
const img=(name,cls='',alt='')=>'<img class="'+cls+'" src="assets/'+name+'" alt="'+html(alt)+'" draggable="false">';
function icon(key, size = 20) {
  return '<svg aria-hidden="true" focusable="false" width="'+size+'" height="'+size+'" viewBox="0 0 256 256" fill="currentColor">'+window.AjimiIconPaths[key]+'</svg>';
}
const button=(text,act,cls='cta',extra='')=>'<button type="button" class="'+cls+'" data-act="'+act+'" '+extra+'>'+text+'</button>';
const link=(text,path,cls='cta')=>'<a class="'+cls+'" href="'+path+'">'+text+'</a>';
const speak=(key,label='Listen',speed=1)=>button(icon('sound',17)+'<span>'+label+'</span>','sound','sound','data-key="'+key+'" data-speed="'+speed+'" aria-label="'+html(label)+'"');
const key='ajimi-lesson-v1';const blank=()=>({selected:'hokkaido',runs:{},stamps:{},seen:[],missed:[]});
let state;try{state={...blank(),...JSON.parse(localStorage.getItem(key)||'{}')};}catch{state=blank()}
if(!regions.includes(state.selected))state.selected='hokkaido';
for(const prop of ['runs','stamps'])if(!state[prop]||typeof state[prop]!=='object')state[prop]={};
for(const prop of ['seen','missed','saved'])if(!Array.isArray(state[prop]))state[prop]=[];
const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
const unique=(a,v)=>{if(!a.includes(v))a.push(v)};
function fresh(){return {started:false,q:0,answer:null,correct:false,strikes:0,added:[],pours:{},season:false,tasting:null};}
function run(id){if(!state.runs[id]||!Array.isArray(state.runs[id].added))state.runs[id]=fresh();return state.runs[id]}
let selectedIngredient='',player=null,rehearsal=null,reviewFinished=false,viewerDispose=null,lastFocus=null;
function route(){const [page,id]=location.hash.slice(1).split('/');return {page:['dishes','lesson','quiz','cook','taste','book','about'].includes(page)?page:'atlas',id:regions.includes(id)?id:state.selected}}
function go(page,id){location.hash=page+(id?'/'+id:'')}
function soundPlay(k,speed,el){if(!/^[a-zA-Z-]+$/.test(k))return;if(player)player.pause();player=new Audio('audio/'+k+'.mp3');player.playbackRate=speed;const current=player;if(el){el.classList.add('playing');const stop=()=>el.classList.remove('playing');current.onended=stop;current.onpause=stop}current.play().catch(()=>{announce.textContent='Audio is unavailable. The reading is printed on the card.'})}
function isRecipeOpen(g,r){return !!g.skippedQuiz||g.q>=r.quiz.length}
function stagePath(id){const g=state.runs[id];if(!g)return 'lesson';if(g.tasting)return 'taste';if(isRecipeOpen(g,R[id]))return 'cook';return g.started?'quiz':'lesson'}
function photo(id,alt,cls=''){return '<div class="photo-shell '+cls+'"><img src="assets/'+id+'.webp" alt="'+html(alt)+'" fetchpriority="high" decoding="async"></div>'}
function rail(id,active){
 const g=run(id),steps=[['quiz','Quiz'],['cook','Recipe'],['taste','Taste']];
 const current=steps.findIndex(([name])=>name===active);
 return '<div class="lesson-bar"><a href="#dishes">All dishes</a><ol aria-label="Lesson progress">'+steps.map(([name,label],i)=>{
   const available=name==='quiz'||(name==='cook'?isRecipeOpen(g,R[id]):!!g.tasting);
   const content='<b>'+String(i+1)+'</b> '+label;
   return '<li class="'+(i<current&&(name!=='quiz'||g.q>=R[id].quiz.length)?'past':'')+'" '+(i===current?'aria-current="step"':'')+'>'+(available&&i!==current?link(content,'#'+name+'/'+id,'stage-link'):'<span>'+content+'</span>')+'</li>';
 }).join('')+'</ol></div>';
}
const soundChecks = {
 hokkaido: [{key:'ginger', choices:['ginger','soy']},{key:'soy',choices:['ginger','soy']}],
 fukuoka: [{key:'rice',choices:['roe','rice']},{key:'roe',choices:['roe','rice']}]
};
let sampleRound=0, sampleGuess='', heardSample=false;
function plate(id,cls=''){
 return '<img class="food-plate '+cls+'" src="assets/'+id+'-plate.webp" alt="" draggable="false" decoding="async">';
}
function samples(id){
 if(soundChecks[id])return soundChecks[id];
 const [first,second]=R[id].ingredients;return [{key:first,choices:[first,second]},{key:second,choices:[first,second]}];
}
function homeCheck(id){
 const items=samples(id),item=items[sampleRound%items.length],word=W[item.key];
 const correct=sampleGuess===item.key, hasGuess=!!sampleGuess;
 const message=correct?word[2]+' means '+word[3]+'.':hasGuess?'Listen once more. Try the other word.':'What ingredient did you hear?';
 return '<div class="ear-panel"><div class="ear-label"><span class="sound-mark" aria-hidden="true">'+icon('sound',24)+'</span><div><h2>Sound check</h2><p role="status">'+message+'</p></div></div><div class="ear-tools">'+button(icon('sound',17)+'<span>Play word</span>','sample-audio','listen-sample','aria-label="Play Japanese word"')+'<div class="ear-choices">'+(correct?button('Next word '+icon('arrow',15),'sample-next','ear-answer'):item.choices.map(k=>button(W[k][3],'sample-guess','ear-answer'+(sampleGuess===k?' missed':''),'data-key="'+k+'"')).join(''))+'</div></div><details class="sample-reading"><summary>Reading</summary><span lang="ja">'+word[0]+'</span> / '+word[2]+'</details></div>';
}
function dishes(){
 return '<section class="dish-library"><div class="library-heading"><h1>All dishes</h1><span>'+regions.length+' regional kitchens</span></div><div class="dish-grid">'+regions.map((k,i)=>{
   const dish=R[k],done=!!state.stamps[k],inProgress=state.runs[k]?.started&&!done;
   const src=inProgress?stagePath(k):'lesson';
   return '<a class="dish-tile tone-'+(i%5)+'" href="#'+src+'/'+k+'"><span class="library-region">'+dish.name+'</span><span class="library-art">'+plate(k)+'</span><strong>'+dish.dish+'</strong><span class="library-action">'+(done?'Cook again':inProgress?'Continue':'Open lesson')+icon('arrow',17)+'</span></a>';
 }).join('')+'</div></section>';
}
function atlas(){
 const id=state.selected,r=R[id],other=regions[(regions.indexOf(id)+1)%regions.length],next=R[other];
 const active=state.runs[id]?.started&&!state.stamps[id];
 const focus=id==='hokkaido'?'Learn ginger and soy sauce by ear, then season the curry.':id==='fukuoka'?'Learn rice, roe and dashi by ear, then finish the bowl.':r.focus;
 return '<section class="kitchen-menu" aria-label="Regional kitchens"><div class="menu-band"><span>'+icon('pin',15)+' Regional kitchens</span><a class="all-dishes" href="#dishes">All '+regions.length+' dishes '+icon('arrow',16)+'</a></div><div class="poster-pair"><article class="dish-poster" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Dish table. Swipe or use the left and right arrow keys." data-region="'+id+'"><div class="paper-arc" aria-hidden="true"></div><div class="poster-art table-stage" aria-hidden="true"><div class="turn-disc">'+plate(id)+'</div></div><div class="ticket-text poster-copy"><p class="region-name">'+r.name+'</p><h1 class="'+(r.dish.split(/\s+/).some(w=>w.length>=10)?'single-long':r.dish.length>12?'long-name':'')+'">'+r.dish+'</h1><p class="poster-focus">'+focus+'</p><div class="menu-actions">'+link((active?'Continue':'Learn recipe')+icon('arrow',18),'#'+(active?stagePath(id):'lesson')+'/'+id)+button('Skip to recipe','skip-recipe','menu-shortcut')+'</div></div><div class="table-controls" role="group" aria-label="Turn the dish table">'+button(icon('arrow',18),'table-prev','turn-prev','aria-label="Previous dish"')+'<span><span class="turn-hint">Swipe to turn</span> '+(regions.indexOf(id)+1)+' / '+regions.length+'</span>'+button(icon('arrow',18),'table-next','turn-next','aria-label="Next dish"')+'</div></article><button type="button" class="other-poster" data-act="region" data-id="'+other+'" data-region="'+other+'" aria-label="Switch to '+next.dish+' in '+next.name+'"><span class="other-top">'+next.name+icon('arrow',20)+'</span><span class="other-disc">'+plate(other)+'</span><strong>'+next.dish+'</strong></button></div>'+homeCheck(id)+'</section>';
}
function lesson(id){return studyPage(id)}
function prompt(q){if(q.mode==='hear')return 'What did you hear?';if(q.mode==='reverse')return 'Which word means '+W[q.word][3]+'?';if(q.mode==='count')return 'How many times?';return 'What does this word mean?'}
function quiz(id){
 const r=R[id],g=run(id);g.started=true;if(g.q>=r.quiz.length)return rail(id,'quiz')+'<section class="complete-quiz">'+img('mochi-happy.svg','','')+'<h1>Ready to cook</h1><p>Your recipe is ready.</p>'+link('Cook '+r.dish.toLowerCase()+' '+icon('arrow'),'#cook/'+id)+'</section>';
 const q=r.quiz[g.q],w=W[q.word];
 // Embedded vectors keep the tutor visible on the first frame after each answer.
 const expressions={
   neutral: `<g fill="#213b35"><ellipse cx="94" cy="110" rx="5.1" ry="6.7"/><ellipse cx="148" cy="100" rx="5.1" ry="6.7"/></g><path d="M112 117q7 11 17-3" fill="none" stroke="#213b35" stroke-width="4.5" stroke-linecap="round"/>
<g fill="#213b35" opacity=".53"><path d="m68 145 4-4 2 2-4 4Zm8 4 4-4 2 2-4 4Zm100-19 3-4 2 1-3 5Z"/></g>`,
   unsure: `<g fill="#213b35"><ellipse cx="94" cy="110" rx="5.1" ry="6.7"/><ellipse cx="148" cy="100" rx="5.1" ry="6.7"/></g><path d="M115 121q4-7 11-3" fill="none" stroke="#213b35" stroke-width="4.2" stroke-linecap="round"/><path d="m84 101 9 2m49-15 9-3" fill="none" stroke="#213b35" stroke-width="3.3" stroke-linecap="round"/>
<g fill="#213b35" opacity=".53"><path d="m68 145 4-4 2 2-4 4Zm8 4 4-4 2 2-4 4Zm100-19 3-4 2 1-3 5Z"/></g>
<path fill="#264754" d="M182 78c1 8 8 12 7 18s-8 8-11 2 1-14 4-20Z"/>`,
   happy: `<path d="M87 112q6-12 13-2m42-9q6-11 13-2" fill="none" stroke="#213b35" stroke-width="5.6" stroke-linecap="round"/><path d="M110 116q10 2 23-4c-1 16-14 21-20 12Z" fill="#213b35"/><path d="M118 124q5-4 9-3-4 6-9 3Z" fill="#df8a76"/>
<g fill="#213b35" opacity=".53"><path d="m68 145 4-4 2 2-4 4Zm8 4 4-4 2 2-4 4Zm100-19 3-4 2 1-3 5Z"/></g>
<g transform="translate(4 8)" fill="#ad402e"><path d="m205 79 4-11 4 9 9 3-10 3-4 9-2-10-7-3Z"/><path d="m217 61 2-6 2 5 5 1-5 3-2 5-2-5-4-2Z"/></g>`,
 };
 const guide=`<svg class="aside-mochi" aria-hidden="true" viewBox="0 0 230 196" width="230" height="196">
<g stroke="#213b35" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round">
<g fill="#c99768"><path d="M47 144 30 94C17 93 9 79 10 68c1-8 8-11 16-7 11 6 19 22 13 31l16 49Z"/><path d="M17 68q-1 10 10 17" fill="none" stroke-width="2.4"/></g>
<g fill="#fff8e8"><path d="M80 162q-14 10-12 17c3 7 21 4 32-10m48-4q10 18 22 15c8-2 4-10-4-19"/><path d="M53 136c-1-16 7-43 18-61 13-22 36-34 58-34 28-1 46 15 56 38 6 13 11 30 12 47 8-8 16-9 18-3 3 10-9 21-16 23-4 16-19 24-44 27-17 2-38 2-60 0-25-2-41-10-42-24-12 3-22-5-23-15-1-7 6-12 11-8Z"/></g>
<g fill="#ad402e"><path d="M169 58c2-16 12-26 29-30 0 13-5 24-17 31 10-3 20-2 30 2l-8 14-29-11Z"/><path d="M57 101c4-24 16-45 33-58 15-11 32-15 48-12 18 2 33 13 42 28-38 1-75 16-123 42Z"/></g>
</g>
<g fill="#f7f1e5"><path d="M74 78c12-18 26-30 45-36-13 9-24 18-33 31Z"/><path d="m140 39 8 3-3 4-8-3Z"/><path d="m153 45 5 3-3 4-5-4Z"/></g>
<path d="m181 51 9-12m-9 23 13 3" fill="none" stroke="#213b35" stroke-width="2.3" stroke-linecap="round"/>
<g fill="#df8a76"><ellipse cx="79" cy="126" rx="10" ry="5" transform="rotate(-10 79 126)"/><ellipse cx="164" cy="111" rx="9" ry="4.8" transform="rotate(-10 164 111)"/></g>
 ${expressions[g.answer===null?'neutral':g.correct?'happy':'unsure']}</svg>`;
 const numeral=g.q+1,finished=numeral===r.quiz.length;
 const audio=q.mode==='reverse'?'':('<div class="listen-pair">'+speak(q.word,'Listen')+speak(q.word,'Slow',.76)+'</div>');
 const showWord=q.mode==='hear'?'<div class="wave" aria-hidden="true">'+[15,28,16,37,26,49,38,57,43,62,36,46,22,32,18,25,10].map(h=>'<i style="--h:'+h+'px"></i>').join('')+'</div>':q.mode==='reverse'?'':'<strong lang="ja">'+w[0]+'</strong>';
 const reading=q.mode==='hear'?'<details class="transcript"><summary>Show reading</summary>'+jp(w[1])+'</details>':'';
 const answers=q.options.map((k,i)=>{
   const selected=g.answer===i, label=q.mode==='count'?k:q.mode==='reverse'?W[k][0]:W[k][3];
   return button('<span'+(q.mode==='reverse'?' lang="ja"':'')+'>'+label+'</span>'+(selected?icon(g.correct?'check':'cross',18):''),'answer','answer '+(selected?(g.correct?'right':'wrong'):''),'data-index="'+i+'" '+(g.answer!==null?'disabled':''));
 }).join('');
 const tip=g.correct?w[0]+' · '+w[2]+' · '+w[3]:q.word==='ginger'?'Listen for ga in shōga.':q.word==='twice'?'Ni means two.':'Listen again for '+w[2]+'.';
 const feedback=g.answer===null?'':'<div class="answer-feedback '+(g.correct?'yes':'no')+'" role="status"><p><strong>'+(g.correct?'Correct':'Try again')+'</strong>'+tip+'</p>'+button((g.correct?(finished?'Cook '+r.dish.toLowerCase():'Next question'):'Try again')+icon(g.correct?'arrow':'repeat',16),'next-answer','cta small')+'</div>';
 return rail(id,'quiz')+'<section class="activity quiz" data-mode="'+q.mode+'"><aside class="activity-aside"><span class="quiz-dish">'+r.dish+'</span><div class="quiz-guide">'+guide+'</div><div class="progress-track" aria-hidden="true">'+r.quiz.map((_,i)=>'<i class="'+(i<g.q?'done':i===g.q?'now':'')+'"></i>').join('')+'</div><span>Question '+numeral+' of '+r.quiz.length+'</span></aside><div class="quiz-paper"><h1>'+prompt(q)+'</h1>'+(showWord||audio?'<div class="quiz-word">'+showWord+audio+reading+'</div>':'')+'<div class="answers">'+answers+'</div>'+feedback+(finished&&g.correct?'':button('Skip to recipe','skip-recipe','quiz-skip'))+'</div></section>';
}
const turningIngredients=new Set(['udon','scallion','ginger']);
function tileArt(k,region=R[route().id]){
 const name=region?.tileSymbols?.[k]||k;
 const path='assets/pantry/'+name;
 const animation=turningIngredients.has(name)?'<source media="(prefers-reduced-motion: no-preference)" srcset="'+path+'-turn.webp">':'';
 return '<picture class="food-icon ingredient-mini" aria-hidden="true">'+animation+'<img src="'+path+'.webp" alt="" draggable="false"></picture>';
}
function pantryText(k){return '<span class="pantry-label"><strong lang="ja">'+html(W[k][0])+'</strong><small>'+html(pantryLabel(k))+'</small></span>'}
const originalKitchen = new Set(['hokkaido','fukuoka']);
const servingLayers = new Set('chicken carrot ginger rice roe seaweed batter cabbage pork cutlet sesame sugar mochi edamame oyster rawrice dough eggplant miso udon scallion clam bittergourd tofu egg kombu'.split(' '));
const pantryNames = {rice:'Cooked rice',roe:'Spicy pollock roe',seaweed:'Nori seaweed',soy:'Soy sauce',mirin:'Mirin',stock:'Dashi stock'};
function pantryLabel(k){const text=pantryNames[k]||W[k][3];return text.charAt(0).toUpperCase()+text.slice(1)}
function regionalTitle(r){return r.dish.toLowerCase().includes(r.city.toLowerCase())?r.dish:r.city+' '+r.dish[0].toLowerCase()+r.dish.slice(1)}
function kitchenStamp(id){return originalKitchen.has(id)?id+'-stamp.svg':R[id].stamp||'mark.svg'}
const techniqueGestures={
 hold:{hint:'Press and hold the vessel, or use the button below.',unit:'beats',target:3,button:'Hold for one beat'},
 stir:{hint:'Trace a circle in the vessel, or use the button below.',unit:'turns',target:2,button:'Make one turn'},
 flip:{hint:'Swipe up across the griddle, or use the button below.',unit:'flip',target:1,button:'Flip the pancake'},
 press:{hint:'Press the food in the vessel, or use the button below.',unit:'presses',target:2,button:'Press once'}
};
function techniqueSpec(t){
 const base=techniqueGestures[t.method]||techniqueGestures.press;
 if(t.key==='dip')return {...base,unit:'dip',target:1,button:'Dip the cutlet'};
 if(t.key==='wrap')return {...base,unit:'folds',button:'Fold one edge'};
 if(t.key==='mash')return {...base,button:'Mash once'};
 if(t.key==='spread')return {...base,unit:'passes',button:'Spread once'};
 return base;
}
const measureBeforeTechnique=r=>r.measureBeforeTechnique??['fukuoka','aichi','niigata','tokyo'].includes(r.id);
const measuredAmount=g=>Object.values(g.pours).reduce((total,n)=>total+Number(n||0),0);
function techniqueTarget(r){return techniqueSpec(r.technique).target}
function techniqueTool(t){
 const frame=content=>'<svg class="tech-utensil" viewBox="0 0 280 218" aria-hidden="true">'+content+'</svg>';
 if(t.key==='pour')return frame('<g stroke="#3d4737" stroke-width="3" stroke-linejoin="round"><path d="m173 46 38-30q7-3 9 1l-42 37Z" fill="#be865a"/><path d="M147 55q7-18 24-17 11 0 14 8 1 9-13 15-11 5-25-1Z" fill="#d6a16b"/><path d="M151 56q12-12 27-10-1 6-16 10Z" fill="#efc36f"/></g>');
 if(t.method==='stir'||t.method==='flip')return frame(t.method==='flip'?'<g stroke="#253f36" stroke-width="3" stroke-linejoin="round"><path d="m160 122 63-65 10 8-59 65Z" fill="#a77a52"/><path d="m149 109 28 17-15 23q-7 3-23-9-9-7-7-13Z" fill="#a4b6a9"/><path d="m142 129 12-11m-5 16 12-11" fill="none"/></g>':'<g stroke="#704f38" stroke-width="3" stroke-linejoin="round"><path d="m145 118 46-74q5-5 9 1l-48 78Z" fill="#c59866"/><path d="M124 120q11-16 21-13 11 4 6 15-9 17-23 16-11-4-4-18Z" fill="#d6aa78"/></g>');
 return '';
}
function techniquePractice(r,g){
 const t=r.technique,spec=techniqueSpec(t),count=Number(g.techniqueCount||0),done=count>=spec.target;
 const title=t.en.charAt(0).toUpperCase()+t.en.slice(1);
 const term='<div class="tech-word"><strong lang="ja">'+html(t.word)+'</strong>'+speak('tech-'+t.key,'Hear technique')+saveStudyButton('tech-'+t.key)+'</div>';
 const learn='<details class="recipe-transcript tech-transcript"><summary>Reading &amp; Japanese instruction</summary><p>'+html(t.roman)+' · '+jp(t.kana)+'</p><p>'+jp(t.instruction)+'</p></details>';
 const controls=done?(g.techniqueOrder==='after'?button('Taste the dish '+icon('arrow'),'taste'):button('Continue to seasoning '+icon('arrow'),'season')) : button(html(spec.button),'tech-step','cta');
 return '<div class="kitchen-instructions recipe-tray technique-tray"><h2>'+html(title)+'</h2>'+term+learn+'<p class="tech-guidance">'+html(done?t.done:t.english)+'</p>'+(done?'':'<p class="tech-gesture">'+html(spec.hint)+'</p>')+'<div class="tech-meter" style="--filled:'+count/spec.target+'"><i aria-hidden="true"></i><span role="status" class="tech-progress">'+(done?'Technique complete':count+' / '+spec.target+' '+spec.unit)+'</span></div>'+controls+'</div>';
}
function recordTechniqueStep(id){
 const r=R[id],g=run(id);
 if(!r.technique||!g.techniqueActive||g.season||!isRecipeOpen(g,r)||route().page!=='cook'||route().id!==id)return;
 const spec=techniqueSpec(r.technique),next=Math.min(spec.target,Number(g.techniqueCount||0)+1);
 if(next===g.techniqueCount)return;
 if(r.technique.key==='boil'&&!techniqueGesture)main.querySelector('ajimi-boil')?.pulse?.();
 g.techniqueCount=next;if(next===spec.target)unique(state.seen,'tech-'+r.technique.key);persist();
 if(next===spec.target){
   stopTechniqueGesture();render();announce.textContent=r.technique.done;setFocus(g.techniqueOrder==='after'?'[data-act=taste]':'[data-act=season]');return;
 }
 const meter=main.querySelector('.tech-meter'),board=main.querySelector('.worktop');
 meter?.style.setProperty('--filled',next/spec.target);
 if(meter)meter.querySelector('.tech-progress').textContent=next+' / '+spec.target+' '+spec.unit;
 if(board){board.dataset.techCount=next;board.classList.remove('tech-pulse');void board.offsetWidth;board.classList.add('tech-pulse')}
}
function cook(id){
 const r=R[id],g=run(id);if(!isRecipeOpen(g,r))return locked(id);
 const ready=r.ingredients.every(k=>g.added.includes(k)),season=g.season,added=r.ingredients.filter(k=>g.added.includes(k));
 const practice=Boolean(r.technique&&g.techniqueActive&&!season),techDone=practice&&Number(g.techniqueCount||0)>=techniqueTarget(r);
 const poured=r.bottles.reduce((total,[k])=>total+Number(g.pours[k]||0),0);
 const choices=[r.ingredients[1],r.odd,r.ingredients[0],...r.ingredients.slice(2)].filter((k,i,all)=>k&&all.indexOf(k)===i);
 const activeVessel=practice&&r.technique.key==='boil'?'pot':r.vessel;
 const vessel={pot:'pantry/donabe.webp',bowl:'pantry/chawan-m.webp',pan:'servings/pan.svg',griddle:'servings/griddle.svg',plate:'servings/plate.svg'}[activeVessel]||'servings/plate.svg';
 const layer=k=>img('servings/'+k+'.svg','serving serving-'+k,'');
 const artMapping=r.artNames||{};
 const servingOrder=r.servingKeys||r.ingredients;
 const serving=servingOrder.filter(k=>added.includes(k)).map(k=>{
   const name=artMapping[k]||k;
   const topping=r.id==='kagawa'?{udon:'udon',scallion:'scallion-rings',ginger:'ginger-slivers'}[name]:null;
   if(topping)return img('pantry/'+topping+'.webp','serving miniature-serving serving-'+name,'');
   if(servingLayers.has(name))return layer(name);
   return '<span class="plated-piece slot-'+r.ingredients.indexOf(k)+'">'+tileArt(k)+'</span>';
 }).join('');
 const prompt=id+(season?'-pour':'-add');
 const unitHint=season?(r.measureNote|| (id==='hokkaido'?'One tap adds half a teaspoon.':id==='fukuoka'?'One tap adds a ladle of dashi or a small pour of soy sauce.':'')):'';
 const transcripts='<div class="recipe-assists"><details class="recipe-transcript"><summary>Japanese transcript</summary><p lang="ja">'+html(season?r.seasonJP:r.instruction)+'</p></details><details class="translation"><summary>English hint</summary><p>'+html(season?r.seasonEN:r.translation)+(unitHint?' '+html(unitHint):'')+'</p></details></div>';
 const measureFirst=measureBeforeTechnique(r),after=Boolean(season&&g.techniqueOrder==='after');
 const progress=season?(after?'Measuring':'Seasoning'):practice?'Cooking technique':added.length+' / '+r.ingredients.length+' ingredients';
 const caption=practice&&r.technique.key==='boil'?(techDone?'Ready to drain':'Hold to boil'):season||practice?'':ready?'Ready to season':selectedIngredient?'Tap to add '+pantryLabel(selectedIngredient).toLowerCase():'Drop ingredients here';
 const counter='<div class="worktop" data-region="'+id+'" data-added="'+added.length+'" data-pours="'+poured+'" data-measure-first="'+Boolean(after||practice&&g.techniqueOrder==='after')+'" data-tech-method="'+(practice?html(r.technique.method):'')+'" data-tech-key="'+(practice?html(r.technique.key):'')+'" data-tech-count="'+Number(g.techniqueCount||0)+'" data-tech-done="'+Boolean(techDone)+'"><div class="worktop-label"><h1>'+html(r.dish)+'</h1><span class="ingredient-total">'+progress+'</span></div><button type="button" class="pot-zone" data-act="'+(practice?'tech-surface':'pot')+'" '+(season||techDone?'disabled ':'')+'aria-label="'+(practice?'Practise '+html(r.technique.en):'Add selected ingredient to '+html(r.vessel))+'"><span class="game-vessel" aria-hidden="true">'+img(vessel,'pot-art','')+'<span class="pot-contents">'+(id==='hokkaido'?layer('curry'):'')+serving+'</span>'+(after?'<span class="measuring-cup" style="--level:'+Math.min(1,poured/5)+'" aria-hidden="true"><i></i></span>':'')+'<i class="liquid"></i>'+(practice?'<span class="tech-effect" aria-hidden="true"><i></i><i></i><i></i>'+techniqueTool(r.technique)+'</span>':'')+(practice&&r.technique.key==='boil'?'<ajimi-boil aria-hidden="true"></ajimi-boil>':'')+'</span></button><p class="board-caption" aria-live="off">'+html(caption)+'</p></div>';
 const ingredientTiles='<div class="tiles">'+choices.map(k=>button(tileArt(k)+pantryText(k)+(added.includes(k)?icon('check',14):''),'tile','tile','data-key="'+k+'" aria-pressed="'+(k===selectedIngredient)+'" '+(added.includes(k)?'disabled':''))).join('')+'</div>';
 const bottles='<div class="bottles">'+r.bottles.map(([k])=>button('<span class="bottle-ink">'+tileArt(k)+'</span>'+pantryText(k)+'<b>'+Number(g.pours[k]||0)+'</b>','pour','bottle','data-key="'+k+'" aria-label="Add '+html(pantryLabel(k))+' ('+html(W[k][0])+'), '+Number(g.pours[k]||0)+' measures"')).join('')+'</div>';
 const techniqueAction={pour:'Pour over the rice',spread:'Spread the sauce',dip:'Dip the cutlet',stir:'Stir the broth'}[r.technique?.key]||'Use the seasoning';
 const move=season?'<div class="row-actions">'+(after?button(html(techniqueAction)+' '+icon('arrow'),'tech-start','cta',poured?'':'disabled'):button('Taste the dish '+icon('arrow'),'taste'))+button('Reset measures','reset-pours','quiet')+'</div>':ready?button((measureFirst?'Measure the seasoning':r.technique?'Practise '+html(r.technique.en):'Season the '+r.vessel)+' '+icon('arrow'),measureFirst||!r.technique?'season':'tech-start'):'';
 return rail(id,'cook')+'<section class="kitchen-stage recipe-stage" data-phase="'+(season?'season':practice?'technique':'fill')+'" data-kitchen="'+id+'">'+counter+(practice?techniquePractice(r,g):'<div class="kitchen-instructions recipe-tray"><h2>'+(season?(after?'Measure the seasoning':'Season the '+r.vessel):'Add the ingredients')+'</h2>'+speak(prompt,'Play cooking instruction')+transcripts+'<p class="action-hint">'+(season?(after?'Tap a seasoning to measure it into the cup.':'Tap a seasoning to add one measure.'):'Drag an ingredient in, or select it and tap the '+r.vessel+'.')+'</p>'+(season?bottles:ingredientTiles)+'<p id="kitchen-note" role="status"></p>'+move+'</div>')+'</section>'
}
function locked(id){return '<section class="empty-sheet">'+img('mochi.svg','','')+'<h1>Practise the words first</h1><p>Answer four prompts to open this kitchen.</p>'+link('Go to word practice','#quiz/'+id)+'</section>'}
function verdict(id){
 const r=R[id],g=run(id);
 const wrong=r.bottles.filter(([k,n])=>Number(g.pours[k]||0)!==n);
 if(!wrong.length)return {ok:true,jp:'ちょうどいい味！',roman:'Chōdo ii aji!',en:'Just the right flavour. Your measures matched the Japanese instruction.',audio:'balanced'};
 const [k,needed]=wrong.find(([k,n])=>n===0&&Number(g.pours[k]||0)>0)||wrong[0],above=Number(g.pours[k]||0)>needed;
 const second=k!==r.bottles[0][0];
 let note;
 if(second&&r[above?'missSecondHigh':'missSecondLow'])note=r[above?'missSecondHigh':'missSecondLow'];
 else if(id==='fukuoka'&&k==='soy')note=['塩辛い。','Shiokarai.','Too salty. The roe is already seasoned. Leave out the soy sauce.','salty'];
 else if(id==='hokkaido'&&k==='mirin')note=above?['甘すぎる。','Amasugiru.','Too sweet. Use just one pour of mirin.','sweet']:['みりんが足りない。','Mirin ga tarinai.','It needs mirin. Listen for ikkai, once.','needMirin'];
 else if(!second)note=[...r[above?'missHigh':'missLow'],r[above?'missHighAudio':'missLowAudio']||(id==='hokkaido'?(above?'salty':'bland'):id==='fukuoka'?(above?'mild':'noStock'):null)];
 else note=['もう一度。','Mō ichido.',above?'Too much '+pantryLabel(k).toLowerCase()+'. Replay the instruction and check the measure.':'It needs more '+pantryLabel(k).toLowerCase()+'. Replay the instruction and check the measure.',null];
 return {ok:false,jp:note[0],roman:note[1],en:note[2],audio:note[3]};
}
function taste(id){
 const r=R[id],g=run(id),t=g.tasting;
 if(!t)return isRecipeOpen(g,r)?'<section class="empty-sheet"><h1>Taste after cooking</h1>'+link('Return to the recipe','#cook/'+id)+'</section>':locked(id);
 const hasModel=originalKitchen.has(id),isPhoto=hasModel||Boolean(r.photo);
 const mediaFile=r.photo||(hasModel?id+'.webp':r.plate||id+'-plate.webp');
 const media='<div class="photo-shell '+(isPhoto?'finished-photo':'finished-illustration')+'"><img src="assets/'+html(mediaFile.replace(/^assets\//,''))+'" alt="'+(isPhoto?'Photograph':'Illustration')+' of '+html(r.dish)+'" decoding="async"></div>';
 const [verdictTitle,...words]=t.en.split(/(?<=[.!?])\s+/);
 const tip=t.ok?'':words.join(' ');
 const stamp=t.ok?'<div class="stamp-won">'+img(kitchenStamp(id),'','')+'<span>'+html(r.name)+' stamp earned</span></div>':'';
 const repeat=t.audio?speak(t.audio,'Hear Mochi'):'';
 const details='<details class="taste-language"><summary>Japanese &amp; pronunciation</summary><p lang="ja">'+html(t.jp)+'</p><p>'+html(t.roman)+'</p></details>';
 const goal=t.ok?link('Open my wordbook '+icon('book'),'#book'):button('Adjust seasoning '+icon('repeat'),'adjust');
 return rail(id,'taste')+'<section class="tasting recipe-taste" data-outcome="'+(t.ok?'earned':'retry')+'"><div class="taste-photo">'+media+'<div class="dish-caption"><strong>'+html(regionalTitle(r))+'</strong></div>'+(hasModel?button(icon('cube')+' Inspect in 3D','view3d','view3d'):'')+'</div><div class="taste-note"><div class="verdict-author"><div class="mochi-reaction '+(t.ok?'delighted':'thinking')+'">'+img(t.ok?'mochi-happy.svg':'mochi-unsure.svg','','Mochi')+'<i class="crumb" aria-hidden="true">'+tileArt(r.ingredients[0])+'</i></div><span>Mochi’s verdict</span></div><h1>'+html(verdictTitle.replace(/\.$/,''))+'</h1>'+(tip?'<p class="verdict-tip">'+html(tip)+'</p>':'')+'<div class="verdict-audio">'+repeat+details+'</div>'+stamp+'<div class="row-actions">'+goal+'</div></div></section><details class="diet recipe-diet"><summary>Ingredients &amp; dietary notes</summary><p>'+html(r.dietary)+'</p><ul>'+r.dietTags.map(x=>'<li>'+html(x)+'</li>').join('')+'</ul>'+(isPhoto?'<p class="photo-note">The photograph shows the regional dish. These notes describe the practice version.</p>':'')+'</details>'
}
function book(){
 const seen=state.seen.filter(k=>W[k]),missed=state.missed.filter(k=>W[k]),earned=regions.filter(id=>state.stamps[id]),remaining=regions.filter(id=>!state.stamps[id]);
 const stamp=id=>'<a href="#lesson/'+id+'" class="passport-region '+(state.stamps[id]?'earned':'')+'">'+img(kitchenStamp(id),'','')+'<span><strong>'+html(R[id].name)+'</strong><small>'+html(R[id].dish)+'</small></span>'+icon('arrow',15)+'</a>';
 const visible=[...earned,...remaining.slice(0,Math.max(0,2-earned.length))],other=regions.filter(id=>!visible.includes(id));
 const stamps='<div class="stamp-grid">'+visible.map(stamp).join('')+'</div>'+(other.length?'<details class="remaining-stamps"><summary>See '+other.length+' more kitchens</summary><div class="stamp-grid">'+other.map(stamp).join('')+'</div></details>':'');
 const practice=button('Practise '+(missed.length?'missed words':state.saved.length?'saved words':'my words'),'review-words','secondary');
 const wordItem=k=>'<div class="word-row book-word"><strong lang="ja">'+html(W[k][0])+'</strong><details class="book-meaning"><summary>Meaning</summary><p>'+html(W[k][3])+' · '+html(W[k][2])+'</p></details>'+button(icon('sound',17),'sound','sound circle','data-key="'+k+'" aria-label="Hear '+html(W[k][3])+'"')+'</div>';
 const saved=state.saved.filter(k=>W[k]),recent=seen.filter(k=>!saved.includes(k));
 const savedPanel=saved.length?'<section class="saved-words"><h3>Saved words</h3>'+saved.map(k=>'<div class="saved-row">'+wordItem(k)+saveStudyButton(k)+'</div>').join('')+'</section>':'';
 const rows=savedPanel+(recent.length&&saved.length?'<details class="seen-words"><summary>Recently seen ('+recent.length+')</summary>'+recent.map(wordItem).join('')+'</details>':recent.map(wordItem).join(''));
 return '<section class="book recipe-book"><div class="atlas-heading"><h1>My wordbook</h1></div><div class="book-grid"><div class="passport"><h2>Region stamps <span class="vocab-count">'+earned.length+' of '+regions.length+'</span></h2>'+stamps+'</div><div class="book-words"><h2>Your vocabulary <span class="vocab-count">'+seen.length+'</span></h2>'+(seen.length?'<div class="book-actions">'+practice+'</div>'+(rehearsal?reviewCard():reviewFinished?'<p class="review-done" role="status">Practice complete.</p>':'')+rows:'<p>Your first lesson adds words here.</p>'+link('Choose a kitchen','#atlas','secondary'))+'</div></div></section>'
}
function reviewCard(){const w=W[rehearsal.k];return '<div class="review-card"><strong lang="ja">'+w[0]+'</strong>'+speak(rehearsal.k,'Listen')+(rehearsal.flipped?'<p>'+w[2]+' — '+w[3]+'</p>'+button('Remembered','remember','secondary')+button('Practise again','again','quiet'):button('Reveal meaning','reveal','secondary'))+'</div>'}
function about(){return '<article class="about"><a href="#atlas">← Kitchens</a><h1>About Ajimi</h1><p>味見 (ajimi) means tasting food as you cook. Listen to Japanese kitchen words, then use them to cook a regional dish. The measures belong to the game’s practice bowls.</p><h2>Mochi’s kitchen</h2><p>Mochi uses an on-device intent classifier and lesson-specific explanations. Questions, stamps and progress stay on this browser. The food models are original illustrations in 3D.</p><h2>Regional references</h2><p><a href="'+R.hokkaido.source+'">Hokkaidō tourism on soup curry</a> · <a href="'+R.fukuoka.source+'">Visit Fukuoka on karashi mentaiko</a></p><ul>'+regions.slice(2).map(k=>'<li><a href="'+html(R[k].source)+'">'+html(R[k].dish)+'</a></li>').join('')+'</ul><h2>Food imagery</h2><p>The menu uses generated overhead dish illustrations. The tasting screens show the following photographs.</p><p><a href="https://commons.wikimedia.org/wiki/File:A_soup_curry_dish_in_Sapporo_-_Flickr_-_odako1.jpg">Sapporo soup curry, Koichi Oda</a>, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA 2.0</a>. Resized and cropped for display. The photo adaptation uses the same licence.</p><p><a href="https://commons.wikimedia.org/wiki/File:Mentai-don.jpg">Mentai-don, Masahiko OHKUBO</a>, <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>. Resized and cropped for display.</p><p><a href="licenses/regional-photographs.html">Credits and licences for the ten additional dish photographs</a></p><h2>Lettering &amp; sound</h2><p>The interface uses <a href="licenses/atkinson-hyperlegible-next-OFL.txt">Atkinson Hyperlegible Next by Braille Institute</a> and <a href="licenses/phosphor-MIT.txt">Phosphor Icons</a>.</p><p><a href="https://github.com/syakuzen/DelaGothic">Dela Gothic One</a>, <a href="https://github.com/googlefonts/zen-oldmincho">Zen Old Mincho by Yoshimichi Ohira</a> and <a href="https://github.com/googlefonts/morisawa-biz-ud-gothic">BIZ UDPGothic by Morisawa</a>. Font licences are included with the app. Japanese pronunciation is synthesised with Open JTalk and the <a href="licenses/mei-voice.txt">Mei voice by the MMDAgent Project Team</a>.</p><p>Design and development — Aidan McFarlane.</p></article>'}
function render(){
 const {page,id}=route(),content={atlas,dishes,lesson,quiz,cook,taste,book,about};document.body.dataset.screen=page;
 main.innerHTML=content[page](id);document.title=(page==='atlas'?'Regional kitchens':page==='dishes'?'All dishes':page==='book'?'My wordbook':page==='about'?'About':R[id].dish+' / '+page)+' — Ajimi';
 document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(page==='book'?'book':page==='about'?'':'atlas'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 for(const image of main.querySelectorAll('.photo-shell img')){
  const ready=()=>image.parentElement?.classList.add('loaded');if(image.complete&&image.naturalWidth)ready();else{image.addEventListener('load',ready,{once:true});image.addEventListener('error',()=>{ready();image.parentElement.classList.add('unavailable')},{once:true})}
 }
}
function setFocus(selector){main.querySelector(selector)?.focus({preventScroll:true})}
function startReview(){
 const queue=(state.missed.length?state.missed:state.saved.length?state.saved:state.seen).filter(k=>W[k]);reviewFinished=false;
 rehearsal=queue.length?{k:queue[0],queue:queue.slice(1),flipped:false}:null;
}
function advanceReview(again){
 const entry=rehearsal;if(!entry)return;
 if(again){unique(state.missed,entry.k);entry.queue.push(entry.k)}
 else state.missed=state.missed.filter(k=>k!==entry.k);
 const k=entry.queue.shift();rehearsal=k?{k,queue:entry.queue,flipped:false}:null;reviewFinished=!rehearsal;
}
function addIngredient(k){
 const {id,page}=route();if(page!=='cook'||!k)return;const r=R[id],g=run(id);if(g.season||g.techniqueActive||!isRecipeOpen(g,r))return;
 if(!r.ingredients.includes(k)){unique(state.missed,k);persist();document.querySelector('#kitchen-note').textContent=pantryLabel(k)+' is not in this instruction. Listen again and choose another ingredient.';selectedIngredient='';const caption=main.querySelector('.board-caption');if(caption)caption.textContent='Drop ingredients here';main.querySelectorAll('.tile').forEach(b=>b.setAttribute('aria-pressed','false'));return}
 if(g.added.includes(k))return;g.added.push(k);selectedIngredient='';persist();render();main.querySelector('.pot-zone')?.classList.add('landed');announce.textContent=W[k][3]+' added. '+g.added.length+' of '+r.ingredients.length+'.';setFocus(g.added.length===r.ingredients.length?'.recipe-tray>.cta':'.tile:not([disabled])');
}
function openTutor(){
 const {id,page}=route();lastFocus=document.activeElement;
 const hello='I’m Mochi. Ask me about '+R[id].dish.toLowerCase()+', a word, or the next step.';document.querySelector('#conversation').innerHTML='<div class="message mochi-msg">'+img('mochi.svg','','')+'<p>'+hello+'</p></div>';
 document.querySelector('#prompts').innerHTML=(page==='cook'?['What should I add?','How many pours?']:['What is '+W[R[id].words[0]][2]+'?','How do I practise?','Any allergies?']).map(q=>button(q,'ask-preset','chip','data-text="'+html(q)+'"')).join('');coach.showModal();document.querySelector('#question').focus()
}
function ask(text){text=text.trim().slice(0,240);if(!text)return;const {id,page}=route();const response=window.AjimiTutor(text,R[id],page,run(id).tasting);const log=document.querySelector('#conversation');
 log.insertAdjacentHTML('beforeend','<p class="message user-msg">'+html(text)+'</p><div class="message mochi-msg">'+img('mochi.svg','','')+'<p>'+html(response)+'</p></div>');log.scrollTop=log.scrollHeight;document.querySelector('#question').value='';
}
let viewerLoad=null;
function showModel(id){
 if(document.querySelector('#model-dialog'))return;
 const d=document.createElement('dialog');d.id='model-dialog';d.setAttribute('aria-labelledby','model-title');d.innerHTML='<div class="dialog-head"><h2 id="model-title">'+R[id].dish+' in 3D</h2><button type="button" aria-label="Close 3D view">×</button></div><div class="model-stage"><div class="skeleton">Opening the model…</div></div><p>Drag to turn the dish. Use the arrow keys when the model is focused.</p>';
 document.body.append(d);d.querySelector('button').onclick=()=>d.close();d.onclose=()=>{viewerDispose?.();viewerDispose=null;d.remove();setFocus('[data-act=view3d]')};d.showModal();
 if(!viewerLoad){viewerLoad=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='viewer.js';s.onload=resolve;s.onerror=reject;document.head.append(s)}).catch(err=>{viewerLoad=null;throw err})}
 viewerLoad.then(()=>{if(!d.isConnected)return;const holder=d.querySelector('.model-stage');holder.replaceChildren();viewerDispose=window.Ajimi3D.mount(holder,id)}).catch(()=>{if(d.isConnected)d.querySelector('.model-stage').innerHTML=photo(id,R[id].dish)+'<p>3D is unavailable here. The dish photograph is shown.</p>'})
}
document.addEventListener('click',ev=>{
 const b=ev.target.closest('[data-act]');if(!b||b.disabled)return;const {page,id}=route(),r=R[id],g=run(id),act=b.dataset.act;
 if(act.startsWith('study-')){handleStudy(act,b,id);return}
 switch(act){
 case 'region':case 'table-next':case 'table-prev':window.AjimiTable.turn(act==='table-prev'?-1:1,b);break;
 case 'sample-audio':heardSample=true;soundPlay(samples(id)[sampleRound%2].key,1,b);break;
 case 'sample-guess':{const item=samples(id)[sampleRound%2];sampleGuess=b.dataset.key;if(!heardSample)soundPlay(item.key,1);heardSample=true;unique(state.seen,item.key);if(sampleGuess!==item.key)unique(state.missed,item.key);persist();render();setFocus(sampleGuess===item.key?'[data-act=sample-next]':'[data-act=sample-audio]');break;}
 case 'sample-next':sampleRound++;sampleGuess='';heardSample=false;render();setFocus('[data-act=sample-audio]');break;
 case 'sound':if(W[b.dataset.key]){unique(state.seen,b.dataset.key);persist()}soundPlay(b.dataset.key,Number(b.dataset.speed||1),b);break;
 case 'skip-recipe':{
   if(g.tasting&&(page==='lesson'||page==='atlas'))state.runs[id]=fresh();
   const recipe=run(id);recipe.skippedQuiz=recipe.q<r.quiz.length;recipe.started=true;persist();go('cook',id);break;
 }
 case 'start-quiz':if(g.q>=r.quiz.length||g.tasting)state.runs[id]=fresh();run(id).started=true;persist();go('quiz',id);break;
 case 'answer':{if(page!=='quiz'||g.answer!==null||g.q>=r.quiz.length)break;const q=r.quiz[g.q],i=Number(b.dataset.index);g.answer=i;g.correct=i===(q.answer??q.options.indexOf(q.word));if(!g.correct){g.strikes++;unique(state.missed,q.word)}unique(state.seen,q.word);persist();render();setFocus('[data-act=next-answer]');break}
 case 'next-answer':if(g.answer!==null){if(g.correct)g.q++;g.answer=null;g.correct=false;persist();if(g.q===r.quiz.length){go('cook',id)}else{render();setFocus('.answers button')}}break;
 case 'tile':selectedIngredient=selectedIngredient===b.dataset.key?'':b.dataset.key;render();setFocus('[data-key="'+b.dataset.key+'"].tile');break;
 case 'pot':addIngredient(selectedIngredient);break;
 case 'tech-start':if(r.technique&&isRecipeOpen(g,r)&&r.ingredients.every(k=>g.added.includes(k))&&(!measureBeforeTechnique(r)&&!g.season||g.season&&g.techniqueOrder==='after'&&measuredAmount(g)>0)){g.techniqueOrder=measureBeforeTechnique(r)?'after':'before';g.season=false;g.techniqueActive=true;g.techniqueCount=Number(g.techniqueCount||0);persist();render();setFocus('[data-act=tech-step]')}break;
 case 'tech-step':recordTechniqueStep(id);break;
 case 'tech-surface':if(ev.detail===0)recordTechniqueStep(id);break;
 case 'season':if(r.ingredients.every(k=>g.added.includes(k))&&(!r.technique||g.season||measureBeforeTechnique(r)&&!g.techniqueActive||g.techniqueActive&&g.techniqueOrder!=='after'&&Number(g.techniqueCount||0)>=techniqueTarget(r))){if(!g.season&&measureBeforeTechnique(r))g.techniqueOrder='after';g.techniqueActive=false;g.season=true;persist();render();setFocus('.bottle')}break;
 case 'pour':if(g.season&&r.bottles.some(([k])=>k===b.dataset.key)){const k=b.dataset.key;g.pours[k]=Math.min(8,(g.pours[k]||0)+1);g.tasting=null;persist();render();setFocus('.bottle[data-key="'+k+'"]');main.querySelector('.worktop').classList.add('pouring');announce.textContent=pantryLabel(k)+', '+g.pours[k]+(g.pours[k]===1?' measure.':' measures.');}break;
 case 'reset-pours':g.pours={};g.tasting=null;persist();render();setFocus('.bottle');break;
 case 'taste':if(isRecipeOpen(g,r)&&r.ingredients.every(k=>g.added.includes(k))&&(g.season&&g.techniqueOrder!=='after'||g.techniqueOrder==='after'&&g.techniqueActive&&g.techniqueCount>=techniqueTarget(r))){g.tasting=verdict(id);if(g.tasting.ok){state.stamps[id]=true;unique(state.seen,'tasty')}else{const word=g.tasting.audio;if(W[word])unique(state.seen,word)}persist();go('taste',id)}break;
 case 'adjust':g.tasting=null;g.pours={};g.season=true;if(g.techniqueOrder==='after'){g.techniqueActive=false;g.techniqueCount=0}persist();go('cook',id);break;
 case 'review-words':startReview();render();setFocus('[data-act=reveal]');break;
 case 'reveal':if(rehearsal)rehearsal.flipped=true;render();setFocus('[data-act=remember]');break;
 case 'remember':case 'again':if(rehearsal){advanceReview(act==='again');persist();render();setFocus(rehearsal?'[data-act=reveal]':'[data-act=review-words]')}break;
 case 'tutor':openTutor();break;case 'close':coach.close();break;case 'ask-preset':ask(b.dataset.text);break;case 'view3d':showModel(id);break;
 }
});
document.querySelector('#ask').addEventListener('submit',e=>{e.preventDefault();ask(document.querySelector('#question').value)});
coach.addEventListener('close',()=>lastFocus?.focus({preventScroll:true}));
let techniqueGesture=null;
function stopTechniqueGesture(){
 const gesture=techniqueGesture;if(!gesture)return;
 techniqueGesture=null;clearInterval(gesture.timer);gesture.surface.classList.remove('tech-engaged');
 if(gesture.method==='hold'&&gesture.surface.querySelector('ajimi-boil')){const note=gesture.surface.parentElement?.querySelector('.board-caption');if(note)note.textContent='Hold to boil'}
 if(gesture.pointer!=null&&gesture.surface.hasPointerCapture(gesture.pointer))gesture.surface.releasePointerCapture(gesture.pointer);
}
main.addEventListener('pointerdown',e=>{
 const surface=e.target.closest('[data-act=tech-surface]:not(:disabled)');
 if(!surface||e.button!==0||techniqueGesture)return;
 const {id}=route(),t=R[id].technique,rect=surface.querySelector('.game-vessel').getBoundingClientRect();
 const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 const gesture={id,method:t.method,pointer:e.pointerId,surface,cx,cy,x:e.clientX,y:e.clientY,angle:Math.atan2(e.clientY-cy,e.clientX-cx),distance:0,minRadius:Math.max(10,rect.width*.1),timer:0};
 techniqueGesture=gesture;surface.setPointerCapture(e.pointerId);surface.classList.add('tech-engaged');
 if(t.key==='boil'){const note=surface.parentElement.querySelector('.board-caption');if(note)note.textContent='Rolling boil'}
 if(t.method==='hold')gesture.timer=setInterval(()=>recordTechniqueStep(id),t.key==='boil'?635:540);
});
main.addEventListener('keydown',e=>{
 const surface=e.target.closest('[data-act=tech-surface]:not(:disabled)');
 if(!surface?.querySelector('ajimi-boil')||(e.key!==' '&&e.key!=='Enter'))return;
 e.preventDefault();if(e.repeat||techniqueGesture)return;
 const {id}=route();
 const gesture={id,method:'hold',pointer:null,surface,count:run(id).techniqueCount||0,timer:0};
 techniqueGesture=gesture;surface.classList.add('tech-engaged');
 surface.parentElement.querySelector('.board-caption').textContent='Rolling boil';
 gesture.timer=setInterval(()=>recordTechniqueStep(id),635);
});
main.addEventListener('keyup',e=>{
 const d=techniqueGesture;
 if(!d||d.pointer!==null||(e.key!==' '&&e.key!=='Enter'))return;
 e.preventDefault();stopTechniqueGesture();
 if(run(d.id).techniqueCount===d.count)recordTechniqueStep(d.id);
});
main.addEventListener('focusout',e=>{if(techniqueGesture?.pointer===null&&techniqueGesture.surface===e.target)stopTechniqueGesture()});
main.addEventListener('pointermove',e=>{
 const d=techniqueGesture;if(!d||d.pointer!==e.pointerId||d.method!=='stir')return;
 const x=e.clientX-d.cx,y=e.clientY-d.cy,a=Math.atan2(y,x);
 if(Math.hypot(x,y)<d.minRadius){d.angle=a;return}
 const delta=Math.atan2(Math.sin(a-d.angle),Math.cos(a-d.angle));d.angle=a;
 if(Math.abs(delta)>1.4)return;
 d.surface.style.setProperty('--stir-angle',(Math.sin(a)*24)+'deg');
 d.distance+=delta;
 if(Math.abs(d.distance)>=Math.PI*1.82){d.distance=0;recordTechniqueStep(d.id)}
});
main.addEventListener('pointerup',e=>{
 const d=techniqueGesture;if(!d||d.pointer!==e.pointerId)return;
 const dx=e.clientX-d.x,dy=e.clientY-d.y;
 const complete=d.method==='press'&&Math.hypot(dx,dy)<34||d.method==='flip'&&dy<-25&&Math.abs(dy)>.62*Math.abs(dx);
 stopTechniqueGesture();if(complete)recordTechniqueStep(d.id);
});
main.addEventListener('pointercancel',e=>{if(techniqueGesture?.pointer===e.pointerId)stopTechniqueGesture()});
main.addEventListener('lostpointercapture',e=>{if(techniqueGesture?.pointer===e.pointerId)stopTechniqueGesture()});
window.addEventListener('blur',stopTechniqueGesture);
window.addEventListener('hashchange',stopTechniqueGesture);
let drag=null,suppressClickUntil=0;
main.addEventListener('pointerdown',e=>{const b=e.target.closest('.tile:not([disabled])');if(!b||e.button!==0)return;drag={key:b.dataset.key,x:e.clientX,y:e.clientY,pointer:e.pointerId,tile:b,ghost:null};b.setPointerCapture(e.pointerId)});
main.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7&&!drag.ghost)return;
 if(!drag.ghost){drag.ghost=document.createElement('div');drag.ghost.className='drag-ghost';drag.ghost.innerHTML=tileArt(drag.key)+html(pantryLabel(drag.key));document.body.append(drag.ghost);main.querySelector('.pot-zone')?.classList.add('target')}
 drag.ghost.style.transform='translate('+e.clientX+'px,'+e.clientY+'px) translate(-50%,-60%)';
});
function endDrag(e,drop){if(!drag||e.pointerId!==drag.pointer)return;const d=drag;drag=null;d.ghost?.remove();const target=main.querySelector('.pot-zone');target?.classList.remove('target');if(d.tile.hasPointerCapture(e.pointerId))d.tile.releasePointerCapture(e.pointerId);if(d.ghost){suppressClickUntil=performance.now()+350;const rect=target?.getBoundingClientRect();if(drop&&rect&&e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom)addIngredient(d.key)}}
main.addEventListener('pointerup',e=>endDrag(e,true));main.addEventListener('pointercancel',e=>endDrag(e,false));main.addEventListener('click',e=>{if(performance.now()<suppressClickUntil&&e.target.closest('.tile,.pot-zone')){e.preventDefault();e.stopPropagation()}},true);
document.querySelector('.skip').onclick=e=>{e.preventDefault();main.focus()};
window.addEventListener('hashchange',()=>{window.AjimiTable?.cancel();studyTest=null;player?.pause();selectedIngredient='';if(coach.open)coach.close();document.querySelector('#model-dialog')?.close();const {id}=route();state.selected=id;persist();render();scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true})});
const firstDish=new Image();firstDish.src='assets/'+route().id+(route().page==='taste'?'.webp':'-plate.webp');
Promise.allSettled([document.fonts.load('400 40px "Dela Gothic One"'),firstDish.decode()]).then(()=>{if(main.querySelector('.boot'))render()});
setTimeout(()=>{if(main.querySelector('.boot'))render()},1800);
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
