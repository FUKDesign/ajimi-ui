/* Short dictionary-form phrases, each with a tappable noun, particle and verb. */
const studyPhrases = {
  hokkaido: ['chicken', 'Simmer the chicken.'],
  fukuoka: ['stock', 'Pour on the stock.'],
  osaka: ['pancake', 'Flip the okonomiyaki.'],
  aichi: ['misosauce', 'Spread the miso sauce.'],
  miyagi: ['edamame', 'Mash the green soybeans.'],
  niigata: ['cutlet', 'Dip the cutlet briefly.'],
  hiroshima: ['rawrice', 'Cook the rice.'],
  nagano: ['eggplant', 'Wrap the aubergine filling.'],
  kagawa: ['udon', 'Boil the udon noodles.'],
  tokyo: ['stock', 'Stir the stock.'],
  okinawa: ['bittergourd', 'Stir-fry the bitter melon.'],
  kyoto: ['tofu', 'Warm the tofu through.']
};
Object.assign(window.AJIMI_WORDS, {
  pancake: ['お好み焼き','おこのみやき','okonomiyaki','savoury pancake'],
  'particle-o': ['を','を','o','marks the object of a verb']
});
const studyStages = ['Word','Phrase','Pantry'];
let studyTest = null;

function studyKeys(r, stage) {
  const verb = 'tech-' + r.technique.key;
  if (stage === 0) return [verb];
  if (stage === 1) return [studyPhrases[r.id][0], 'particle-o', verb];
  return [...new Set([...r.ingredients, ...r.bottles.map(b=>b[0]), ...r.words])];
}
function studier(g) {
  if (!g.study || typeof g.study !== 'object') g.study = { stage:0, open:{} };
  if (!Number.isInteger(g.study.stage) || g.study.stage < 0 || g.study.stage > 2) g.study.stage = 0;
  if (!g.study.open || typeof g.study.open !== 'object') g.study.open = {};
  return g.study;
}
function studyChip(k, active, big = false) {
  const w=W[k];
  return button('<mark lang="ja">'+html(w[0])+'</mark>'+(big?'<span class="reveal-hint">'+(active?'Hide meaning':'Tap to reveal')+'</span>':''),
    'study-reveal','study-chip'+(big?' large':'')+(active?' revealed':''),'data-key="'+k+'" aria-expanded="'+active+'" aria-label="'+html((active?'Hide meaning of ':'Reveal meaning of ')+w[0])+'"');
}
function saveStudyButton(k) {
  const saved=state.saved.includes(k);
  return button(icon(saved?'check':'book',16)+(saved?'Saved':'Save word'),'study-save','study-save','data-key="'+k+'" aria-pressed="'+saved+'" aria-label="'+html((saved?'Unsave ':'Save ')+W[k][0])+'"');
}
function wordCheckOptions(r,k) {
  const pool=[...new Set([...studyKeys(r,2), ...studyKeys(r,1),...regions.map(id=>'tech-'+R[id].technique.key)])];
  const alt=pool.filter(v=>v!==k&&W[v][3]!==W[k][3]);
  const n=Array.from(k).reduce((sum,c)=>sum+c.charCodeAt(0),0);
  const options=[alt[n%alt.length],alt[(n+1)%alt.length]];
  options.splice(n%3,0,k);
  return options;
}
function studyDefinition(r,k) {
  if(!k||!W[k])return '';
  const w=W[k], test=studyTest?.id===r.id&&studyTest?.key===k?studyTest:null;
  const pronunciation='<p class="word-reading">'+(w[0]!==w[1]?'<span lang="ja">'+html(w[1])+'</span> · ':'')+html(w[2])+'</p>';
  if(test){
    const correct=test.choice===k;
    return '<div class="word-detail mini-check"><h3>What does <span lang="ja">'+html(w[0])+'</span> mean?</h3><div class="mini-answers">'+wordCheckOptions(r,k).map(v=>button(html(W[v][3]),'study-answer','mini-answer'+(test.choice===v?(correct?' correct':' incorrect'):''),'data-key="'+v+'" '+(correct?'disabled':''))).join('')+'</div><p role="status">'+(test.choice?(correct?'Correct.':'Try another meaning.'):'')+'</p>'+button(correct?'Back to lesson':'Show meaning','study-test-close','study-minor')+'</div>';
  }
  return '<div class="word-detail">'+pronunciation+'<h3>'+html(w[3])+'</h3><div class="word-tools">'+speak(k,'Hear word')+saveStudyButton(k)+button('Test me','study-test','study-minor','data-key="'+k+'"')+'</div></div>';
}
function studyPage(id) {
  const r=R[id], g=run(id), s=studier(g), stage=s.stage;
  const keys=studyKeys(r,stage),open=keys.includes(s.open[stage])?s.open[stage]:null, t=r.technique;
  const tabs='<nav class="study-tabs" aria-label="Learning stages">'+studyStages.map((name,i)=>button('<span>'+(i+1)+'</span>'+name,'study-stage','study-tab','data-stage="'+i+'" '+(i===stage?'aria-current="step"':''))).join('')+'</nav>';
  let panel;
  if(stage===0){
    const noun=studyPhrases[id][0];
    const material=r.ingredients.includes(noun)?noun:r.ingredients[0];
    panel='<h2>Learn the verb</h2><div class="verb-field">'+studyChip(keys[0],!!open,true)+'<div class="verb-miniature" aria-hidden="true">'+tileArt(material,r)+'</div></div>'+studyDefinition(r,open)+(open?'<p class="use-note">'+html(t.english)+'</p>':speak(keys[0],'Hear the Japanese'));
  }else if(stage===1){
    const parts=keys.map(k=>studyChip(k,k===open)).join('');
    panel='<h2>Put it in a phrase</h2><div class="phrase-field"><div class="phrase-parts">'+parts+'</div><p>'+html(studyPhrases[id][1])+'</p>'+speak('phrase-'+id,'Hear the phrase')+'</div>'+studyDefinition(r,open)+'<p class="use-note">Tap a highlighted part to see how the phrase fits together.</p>';
  }else{
    const pantry = (title,items)=>'<div class="pantry-group"><h3>'+title+'</h3><div class="pantry-chips">'+items.map(k=>studyChip(k,k===open)).join('')+'</div></div>';
    panel='<h2>Words for the recipe</h2>'+pantry('Ingredients',r.ingredients)+pantry('Seasoning & measures',keys.filter(k=>!r.ingredients.includes(k)))+studyDefinition(r,open);
  }
  const next=stage<2?button((stage===0?'Build the phrase':'Explore ingredients')+icon('arrow',18),'study-stage','study-next','data-stage="'+(stage+1)+'"'):button((g.q>0&&g.q<r.quiz.length?'Resume quiz':'Start quiz')+icon('arrow',18),'start-quiz','study-next');
  return '<div class="study-top"><a class="lesson-back" href="#dishes">← All dishes</a>'+button((g.season||g.added.length||g.skippedQuiz)&&!g.tasting?'Resume recipe':'Skip to recipe','skip-recipe','study-shortcut')+'</div>'+
    '<section class="study-shell"><aside class="study-poster"><div class="study-photo">'+plate(id)+'</div><div class="study-name"><p>'+html(r.name)+'</p><h1>'+html(r.dish)+'</h1><span lang="ja">'+html(r.jp)+'</span></div></aside>'+
    '<div class="study-work">'+tabs+'<div class="study-panel stage-'+stage+'">'+panel+'<div class="study-next-row">'+next+(stage===2?'<span>4 questions</span>':'')+'</div></div></div></section>';
}
function handleStudy(act,b,id) {
  const r=R[id],g=run(id),s=studier(g),k=b.dataset.key;
  if(act==='study-save'){
    if(!W[k])return;
    const saved=state.saved.includes(k);
    if(saved)state.saved=state.saved.filter(word=>word!==k);
    else{unique(state.saved,k);unique(state.seen,k)}
    persist();render();
    const same=main.querySelector('[data-act="study-save"][data-key="'+k+'"]');
    (same||main.querySelector('[data-act=review-words]'))?.focus({preventScroll:true});
    announce.textContent=W[k][3]+(saved?' removed from saved words.':' saved to your wordbook.');
    return;
  }
  if(act==='study-stage'){
    const stage=Number(b.dataset.stage);if(!Number.isInteger(stage)||stage<0||stage>2)return;
    s.stage=stage;studyTest=null;persist();render();setFocus('.study-tab[aria-current]');
    return;
  }
  if(act==='study-reveal'){
    if(!studyKeys(r,s.stage).includes(k))return;
    s.open[s.stage]=s.open[s.stage]===k?null:k;studyTest=null;
    if(s.open[s.stage])unique(state.seen,k);
    persist();render();setFocus('.study-chip[data-key="'+k+'"]');
    if(s.open[s.stage])announce.textContent=W[k][2]+', '+W[k][3];
    return;
  }
  const opened=s.open[s.stage];if(!opened||!W[opened])return;
  if(act==='study-test'){
    studyTest={id,key:opened,choice:null};render();setFocus('[data-act=study-answer]');
  }else if(act==='study-answer'&&studyTest?.id===id&&studyTest.key===opened&&wordCheckOptions(r,opened).includes(k)){
    studyTest.choice=k;if(k!==opened){unique(state.missed,opened);persist()}
    render();setFocus(k===opened?'[data-act=study-test-close]':'[data-act=study-answer][data-key="'+k+'"]');
  }else if(act==='study-test-close'){
    studyTest=null;render();setFocus('[data-act=study-test]');
  }
}
