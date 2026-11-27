/* A small local intent classifier. Its answers are grounded in the current lesson. */
window.AjimiTutor=(()=>{
 const training={
  seasoning:['how many pours','how much do i pour','measure the soy sauce','which seasoning','how much mirin','どのくらい','何回 入れる','measure ladles'],
  assemble:['what should i add','ingredients in the bowl','what goes in first','how do i drag','how to cook','ingredient order','何を入れる','具材'],
  diet:['any allergies','is it vegetarian','dietary information','does it contain fish','wheat dairy soy animal alcohol gluten','アレルギー 食材'],
  place:['where is it from','why sapporo curry','tell me about the region','local history','what is hakata famous for','どこの料理','郷土料理'],
  taste:['why is my dish wrong','how does my food taste','too salty too sweet bland','taste feedback','what went wrong','なぜ まずい','味が薄い','味見'],
  study:['help me learn','how do i practise','what do I do next','help with quiz','どうやって 勉強','forgot the word','how does this work'],
  pronunciation:['say these words','how to pronounce','listen to pronunciation','play the sound','発音 読み方','romaji']
 };
 const normal=s=>s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/shou/g,'sho').replace(/kyuu/g,'kyu').trim();
 const tokens=s=>normal(s).match(/[a-z]+|[一-龯ぁ-んァ-ンー]/gu)||[];
 const stop=new Set('a an the do i is it what how my to of does me with you in'.split(' '));
 const models={},vocab=new Set();for(const [intent,examples] of Object.entries(training)){const counts=new Map();let n=0;for(const text of examples)for(const t of tokens(text).filter(t=>!stop.has(t))){vocab.add(t);counts.set(t,(counts.get(t)||0)+1);n++;}models[intent]={counts,n};}
 function classify(text){
  const words=tokens(text).filter(x=>vocab.has(x)&&!stop.has(x));if(!words.length)return null;
  return Object.entries(models).map(([k,m])=>[k,words.reduce((s,w)=>s+Math.log(((m.counts.get(w)||0)+.4)/(m.n+.4*vocab.size)),0)]).sort((a,b)=>b[1]-a[1])[0][0];
 }
 return function answer(input,r,phase,tasting){
  const q=normal(input),w=window.AJIMI_WORDS;
  if(/しょうが.*しょうゆ|しょうゆ.*しょうが|shoga.*shoyu|shoyu.*shoga|ginger.*soy|soy.*ginger/.test(q))return 'しょうが (shōga) is ginger. しょうゆ (shōyu) is soy sauce. Listen for the ending: ga or yu.';
  if(/mazui|まずい/.test(q))return 'まずい (mazui) means “it tastes bad.” It is blunt. To help the cook, name the taste: 味が薄い (aji ga usui) means the flavour is weak.';
  const intent=classify(input);
  if(intent==='diet')return r.dietary;
  if(intent==='seasoning'&&/how much|how many|pour|measure|何回|どのくらい|ladle/.test(q))return r.seasonJP+' '+r.seasonEN;
  if(intent==='taste'&&tasting)return tasting.jp+' '+tasting.en;
  for(const [k,v] of Object.entries(w)){
   if(v.some(x=>normal(x).length>1&&(q===normal(x)||q.includes(normal(x))))){
    return v[0]+' is read '+v[1]+' ('+v[2]+') and means “'+v[3]+'”.'+(r.ingredients.includes(k)?' In this lesson, put it into the '+r.vessel+'.':r.bottles.some(x=>x[0]===k)?' '+r.seasonEN:'');
   }
  }
  if(intent==='seasoning')return r.seasonJP+' '+r.seasonEN;
  if(intent==='assemble')return r.instruction+' '+r.translation+' Drag each tile, or select it and then tap the '+r.vessel+'.';
  if(intent==='place')return r.intro;
  if(intent==='pronunciation')return 'Tap the speaker next to a word. Slow replay is available in the lesson and listening questions.';
  if(intent==='taste')return 'ちょうどいい (chōdo ii) means “just right.” 塩辛い (shiokarai) means “too salty.” Taste the dish and I’ll point out which measure to change.';
  if(intent==='study')return ({quiz:'Answer each word correctly to open the kitchen. A missed word goes into your Wordbook for another try.',cook:r.translation+' Then follow the Japanese measure.',taste:'Look at the tasting note, then practise a missed word or open the next region.'})[phase]||'Open a region, listen to the words, then use them to cook. I remember which words you miss on this device.';
  return 'I can help with the words, ingredients, measures and tastes in this lesson. Try “What is shōga?” or “How many pours?”';
 };
})();
