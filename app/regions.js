/* Regional practice recipes. Each tap adds one of the listed game measures. */
(() => {
  const words = window.AJIMI_WORDS;
  Object.assign(words, {
    cabbage: ['キャベツ', 'きゃべつ', 'kyabetsu', 'cabbage'],
    batter: ['生地', 'きじ', 'kiji', 'batter'],
    pork: ['豚肉', 'ぶたにく', 'butaniku', 'pork'],
    okonomisauce: ['お好みソース', 'おこのみそーす', 'okonomi sōsu', 'okonomiyaki sauce'],
    mayo: ['マヨネーズ', 'まよねーず', 'mayonēzu', 'mayonnaise'],
    cutlet: ['とんかつ', 'とんかつ', 'tonkatsu', 'breaded pork cutlet'],
    sesame: ['ごま', 'ごま', 'goma', 'sesame seeds'],
    misosauce: ['みそだれ', 'みそだれ', 'miso dare', 'miso sauce'],
    mustard: ['からし', 'からし', 'karashi', 'Japanese mustard'],
    edamame: ['枝豆', 'えだまめ', 'edamame', 'green soybeans'],
    sugar: ['砂糖', 'さとう', 'satō', 'sugar'],
    mochi: ['餅', 'もち', 'mochi', 'rice cake'],
    water: ['水', 'みず', 'mizu', 'water'],
    salt: ['塩', 'しお', 'shio', 'salt'],
    rawrice: ['米', 'こめ', 'kome', 'uncooked rice'],
    oyster: ['かき', 'かき', 'kaki', 'oyster'],
    dough: ['皮', 'かわ', 'kawa', 'dumpling wrapper'],
    eggplant: ['なす', 'なす', 'nasu', 'aubergine'],
    miso: ['みそ', 'みそ', 'miso', 'miso paste'],
    oil: ['油', 'あぶら', 'abura', 'oil'],
    udon: ['うどん', 'うどん', 'udon', 'wheat noodles'],
    scallion: ['ねぎ', 'ねぎ', 'negi', 'spring onion'],
    clam: ['あさり', 'あさり', 'asari', 'short-neck clam'],
    bittergourd: ['ゴーヤー', 'ごーやー', 'gōyā', 'bitter melon'],
    tofu: ['豆腐', 'とうふ', 'tōfu', 'tofu'],
    egg: ['卵', 'たまご', 'tamago', 'egg'],
    kombu: ['昆布', 'こんぶ', 'konbu', 'kelp'],
    ponzu: ['ポン酢', 'ぽんず', 'ponzu', 'citrus dipping sauce'],
    once: ['一回', 'いっかい', 'ikkai', 'once']
  });

  const maff = n => 'https://www.maff.go.jp/e/policies/market/k_ryouri/search_menu/' + n + '/index.html';
  const recipes = [
    {
      id:'osaka', name:'Osaka', kanji:'大阪', city:'Osaka', cityJP:'大阪', dish:'Okonomiyaki', jp:'お好み焼き', read:'okonomiyaki', vessel:'griddle',
      focus:'Listen for cabbage, then dress the pancake with two sauces.',
      intro:'In Osaka, chopped cabbage is mixed into the batter. Slices of pork brown against the griddle.',
      ingredients:['cabbage','batter','pork'], odd:'tofu',
      instruction:'キャベツを生地に混ぜて、豚肉をのせて焼いて。', translation:'Mix cabbage into the batter. Top with pork and cook on the griddle.',
      bottles:[['okonomisauce',2,'brushfuls'],['mayo',1,'squeeze']], seasonJP:'お好みソースを二回ぬって、マヨネーズを一回かけて。', seasonEN:'Brush on the okonomiyaki sauce twice. Squeeze mayonnaise over it once.',
      measureNote:'One tap adds one brushful of sauce or one squeeze of mayonnaise.',
      dietary:'The batter contains wheat flour, egg and bonito stock. This pancake has pork, egg mayonnaise and a soy-based finishing sauce.',
      dietTags:['Wheat & egg','Pork & fish','Contains soy'], source:maff(5798)
    },
    {
      id:'aichi', name:'Aichi', kanji:'愛知', city:'Nagoya', cityJP:'名古屋', dish:'Miso katsu', jp:'みそかつ', read:'miso katsu', vessel:'plate',
      focus:'Plate a pork cutlet and measure out Nagoya’s dark miso sauce.',
      intro:'Nagoya serves crisp breaded pork with a rich soybean miso sauce. Shredded cabbage sits alongside.',
      ingredients:['cutlet','cabbage','sesame'], odd:'ginger',
      instruction:'とんかつとキャベツを盛って、ごまをふって。', translation:'Plate the cutlet and cabbage. Sprinkle with sesame seeds.',
      bottles:[['misosauce',2,'spoonfuls'],['mustard',1,'dab']], seasonJP:'みそだれを二杯かけて、からしを少し添えて。', seasonEN:'Spoon over two measures of miso sauce. Put one dab of mustard on the side.',
      measureNote:'One tap adds a spoonful of sauce or a small dab of mustard.',
      dietary:'The pork cutlet is coated in flour, egg and wheat breadcrumbs. The red miso sauce contains soy. Sesame and mustard finish this plate.',
      dietTags:['Pork, wheat & egg','Soy & sesame','Contains mustard'], source:'https://www.nagoya-info.jp/en/nagoya//1000'
    },
    {
      id:'miyagi', name:'Miyagi', kanji:'宮城', city:'Sendai', cityJP:'仙台', dish:'Zunda mochi', jp:'ずんだ餅', read:'zunda mochi', vessel:'bowl',
      focus:'Mash sweet green soybeans for Sendai’s zunda mochi.',
      intro:'The green coating on zunda mochi is made by crushing edamame. A little texture is part of its character.',
      ingredients:['edamame','sugar','mochi'], odd:'seaweed',
      instruction:'枝豆をつぶして砂糖を混ぜ、餅を用意して。', translation:'Mash the edamame with sugar. Set the rice cake aside for coating.',
      bottles:[['water',1,'spoonful'],['salt',1,'pinch']], seasonJP:'水を一杯、塩をひとつまみ加えて、餅にからめて。', seasonEN:'Loosen the paste with one spoonful of water. Add one pinch of salt and coat the rice cake.',
      measureNote:'One tap adds a spoonful of water or a pinch of salt.',
      dietary:'This sweet combines glutinous rice cake, green soybeans, sugar, water and salt. The green coating contains soy.',
      dietTags:['Contains soy','Glutinous rice'], source:'https://www.maff.go.jp/e/policies/market/dento_syoku/menu/zunda.html'
    },
    {
      id:'niigata', name:'Niigata', kanji:'新潟', city:'Niigata', cityJP:'新潟', dish:'Tare katsudon', jp:'タレかつ丼', read:'tare katsudon', vessel:'bowl',
      focus:'Dip a thin pork cutlet in sweet soy glaze and serve it over rice.',
      intro:'In Niigata City, thin cutlets are dipped in a sweet soy sauce while still hot. They go straight onto the rice.',
      ingredients:['rice','cutlet','sugar'], odd:'egg',
      instruction:'ご飯をよそって、とんかつと、たれ用の砂糖を用意して。', translation:'Fill the bowl with rice. Set out the cutlet and the sugar for the glaze.',
      bottles:[['soy',2,'pours'],['mirin',1,'pour']], seasonJP:'しょうゆを二回、みりんを一回入れて煮て。とんかつをくぐらせて。', seasonEN:'Simmer the sugar with two pours of soy and one of mirin. Dip the cutlet and lay it on the rice.',
      measureNote:'One tap adds a small pour to the glaze.',
      dietary:'This bowl uses pork, wheat breadcrumbs, flour and egg in the coating. The glaze contains wheat-brewed soy sauce, sugar and hon-mirin.',
      dietTags:['Pork, wheat & egg','Contains soy','Uses mirin'], source:maff(4246)
    },
    {
      id:'hiroshima', name:'Hiroshima', kanji:'広島', city:'Etajima', cityJP:'江田島', dish:'Kaki gohan', jp:'かきご飯', read:'kaki gohan', vessel:'pot',
      focus:'Season oysters and carrot for a pot of Hiroshima oyster rice.',
      intro:'In Etajima, oyster cooking liquor flavours the rice. Local versions of kaki meshi may also include burdock or shiitake.',
      ingredients:['rawrice','oyster','carrot'], odd:'bittergourd',
      instruction:'米を用意して、かきとにんじんを鍋に入れて。', translation:'Set the rinsed rice aside. Put the oysters and carrot in the pot.',
      bottles:[['soy',1,'pour'],['mirin',1,'pour']], seasonJP:'しょうゆとみりんを一回ずつ入れて煮て。煮汁で米を炊いて。', seasonEN:'Simmer with one pour each of soy and mirin. Cook the rice in the liquid and fold in the oysters and carrot.',
      measureNote:'One tap adds one small pour to the cooking liquor.',
      dietary:'Oyster liquor seasons the rice. The oysters are molluscs. This version uses wheat-brewed soy sauce and hon-mirin.',
      dietTags:['Contains oysters','Soy & wheat','Uses mirin'], source:maff(7029)
    },
    {
      id:'nagano', name:'Nagano', kanji:'長野', city:'Ogawa', cityJP:'小川', dish:'Oyaki', jp:'おやき', read:'oyaki', vessel:'pan',
      focus:'Make the aubergine and miso filling for a Shinshū dumpling.',
      intro:'Nagano’s oyaki wrap seasonal fillings in thin dough. This version uses aubergine and miso.',
      ingredients:['dough','eggplant','miso'], odd:'roe',
      instruction:'皮を広げて、なすを切って、みそを用意して。', translation:'Flatten the wrapper. Slice the aubergine and set out the miso.',
      bottles:[['oil',1,'spoonful'],['sugar',1,'spoonful']], seasonJP:'油を一杯入れてなすを炒め、みそと砂糖一杯を混ぜて。皮で包んで焼いて。', seasonEN:'Fry the aubergine in one spoonful of oil. Mix in miso and one spoonful of sugar. Wrap and griddle the dumpling.',
      measureNote:'One tap adds a small spoonful of oil or sugar.',
      dietary:'The wrapper is wheat flour and water. The filling uses aubergine, soybean miso, oil and sugar.',
      dietTags:['Wheat wrapper','Contains soy'], source:maff(6480)
    },
    {
      id:'kagawa', name:'Kagawa', kanji:'香川', city:'Takamatsu', cityJP:'高松', dish:'Sanuki udon', jp:'讃岐うどん', read:'Sanuki udon', vessel:'bowl',
      focus:'Boil the udon, then finish with hot broth and fresh toppings.',
      intro:'Sanuki is the old name for Kagawa. For hot kake udon, boil the noodles, rinse them in cold water and warm them again before adding broth.',
      ingredients:['udon','scallion','ginger'], odd:'cabbage',
      instruction:'うどんを用意して、ねぎとしょうがを別にしておいて。', translation:'Set out the noodles. Keep the spring onion and ginger aside for topping.',
      bottles:[['stock',2,'ladles'],['soy',1,'pour']], seasonJP:'温め直したうどんに、だしを二杯、しょうゆを一回。ねぎとしょうがをのせて。', seasonEN:'Add two ladles of broth and one pour of soy to the rewarmed noodles. Top with spring onion and ginger.',
      measureNote:'One tap adds one ladle of anchovy stock or one small pour of soy.',
      dietary:'The udon is made from wheat flour. The broth uses dried anchovies and soy sauce brewed with wheat.',
      dietTags:['Wheat noodles','Contains fish','Contains soy'], source:'https://www.my-kagawa.jp/udon/feature/sanukiudon/mainmenu'
    },
    {
      id:'tokyo', name:'Tokyo', kanji:'東京', city:'Fukagawa', cityJP:'深川', dish:'Fukagawa meshi', jp:'深川めし', read:'Fukagawa meshi', vessel:'bowl',
      focus:'Season a clam broth to spoon over rice, Fukagawa-style.',
      intro:'Fukagawa’s fishermen ate clams and spring onion in miso broth over rice. A second local version cooks the clams with the rice.',
      ingredients:['rice','clam','scallion'], odd:'mayo',
      instruction:'ご飯をよそって、あさりとねぎを鍋に入れて。', translation:'Fill the bowl with rice. Put the clams and spring onion in a pot.',
      bottles:[['stock',2,'ladles'],['miso',1,'spoonful']], seasonJP:'だしを二杯入れて煮て。みそを一杯溶いて、ご飯にかけて。', seasonEN:'Simmer with two ladles of stock. Dissolve one spoonful of miso and pour the broth over the rice.',
      measureNote:'One tap adds one ladle of kombu stock or a spoonful of miso.',
      dietary:'This version uses short-neck clams, rice, spring onion, kombu stock and soybean miso. Clams are molluscs.',
      dietTags:['Contains clams','Contains soy'], source:maff(1105)
    },
    {
      id:'okinawa', name:'Okinawa', kanji:'沖縄', city:'Naha', cityJP:'那覇', dish:'Gōyā chanpurū', jp:'ゴーヤーチャンプルー', read:'gōyā chanpurū', vessel:'pan',
      focus:'Stir-fry bitter melon with tofu and egg in an Okinawan pan.',
      intro:'Firm tofu keeps its shape beside the ridged slices of bitter melon. The beaten egg coats both as it sets.',
      ingredients:['bittergourd','tofu','egg'], odd:'mochi',
      instruction:'ゴーヤーと豆腐を炒めて、溶いた卵を入れて。', translation:'Stir-fry the bitter melon and tofu. Pour in the beaten egg.',
      bottles:[['soy',1,'pour'],['salt',1,'pinch']], seasonJP:'しょうゆを一回、塩をひとつまみ入れて。', seasonEN:'Season with one small pour of soy and a pinch of salt.',
      measureNote:'One tap adds one small pour of soy or one pinch of salt.',
      dietary:'This practice pan uses tofu, egg, bitter melon, oil and salt. Its soy sauce contains wheat. Other versions may include pork or bonito flakes.',
      dietTags:['Soy & egg','Contains wheat'], source:maff(3951)
    },
    {
      id:'kyoto', name:'Kyoto', kanji:'京都', city:'Kyoto', cityJP:'京都', dish:'Yudōfu', jp:'湯豆腐', read:'yudōfu', vessel:'pot',
      focus:'Warm tofu with kelp and measure the citrus dip on the side.',
      intro:'Kyoto’s yudōfu gently warms tofu in water with kombu. The seasoning belongs in a small dipping bowl.',
      ingredients:['kombu','tofu','scallion'], odd:'carrot',
      instruction:'昆布を敷いて豆腐を温めて。ねぎは小皿に入れて。', translation:'Line the pot with kelp and warm the tofu. Put the spring onion in a small dipping bowl.',
      bottles:[['ponzu',2,'pours'],['soy',0,'pours']], seasonJP:'小皿にポン酢を二回。しょうゆは入れないで。', seasonEN:'Pour ponzu into the dipping bowl twice. Leave out the extra soy sauce.',
      measureNote:'Each tap is one small pour into the dipping bowl.',
      dietary:'Tofu is warmed in kombu water. This version uses a citrus and soy dip made with wheat-brewed soy sauce and no fish stock.',
      dietTags:['Contains soy','Wheat in the dip'], source:'https://www.kyototourism.org/en/localgoods/japanesefood/'
    }
  ];

  const countWords = ['Once','Twice','Three times'];
  function question(word, mode, other, last, correctAt) {
    const options = [other, last];
    options.splice(correctAt, 0, word);
    return {word, mode, options};
  }
  function feedback(key, count, high) {
    const [ja,,romaji,english] = words[key];
    const target = count === 0 ? 'Leave it out this time.' : 'Listen for the measure again.';
    return high
      ? [ja+'が多すぎる。', romaji+' ga ōsugiru.', 'Too much '+english+'. '+target, 'more-'+key]
      : [ja+'が足りない。', romaji+' ga tarinai.', 'Add a little more '+english+'. '+target, 'less-'+key];
  }
  recipes.forEach((r, i) => {
    const [a,b,c] = r.ingredients;
    const [[first,n],[second,m]] = r.bottles;
    const count = n === 1 ? 'once' : 'twice';
    r.words = [a,b,c,first,second,count];
    r.quiz = [
      question(a, 'hear', b, r.odd, (i+1)%3),
      question(b, 'read', a, c, (i+2)%3),
      question(first, 'reverse', second, c, i%3),
      {word:count, mode:'count', options:[...countWords], answer:n-1}
    ];
    r.photo = r.id + '.webp';
    r.servingKeys = [...r.ingredients];
    r.tileSymbols = Object.fromEntries([...r.ingredients,r.odd].map(k => [k,k]));
    const high = feedback(first,n,true), low = feedback(first,n,false);
    r.missHigh = high.slice(0,3);
    r.missLow = low.slice(0,3);
    r.missHighAudio = high[3];
    r.missLowAudio = low[3];
    r.missSecondHigh = feedback(second,m,true);
    if (m > 0) r.missSecondLow = feedback(second,m,false);
    window.AJIMI_REGIONS[r.id] = r;
  });
})();

// Each gesture rehearses the verb used to finish this regional dish.
(() => {
  const techniques = {
    hokkaido: ['simmer','煮込む','にこむ','nikomu','simmer','弱火で煮込んで。','Hold a low heat to simmer the curry.','hold','The broth has soaked into the vegetables.'],
    fukuoka: ['pour','かける','かける','kakeru','pour over','温かいだしをご飯にかけて。','Pour the warm dashi over the rice.','hold','The warm dashi surrounds the rice.'],
    osaka: ['flip','ひっくり返す','ひっくりかえす','hikkurikaesu','flip over','へらでお好み焼きをひっくり返して。','Flip the pancake with the spatula.','flip','Both sides are golden.'],
    aichi: ['spread','広げる','ひろげる','hirogeru','spread','みそだれをとんかつの上に広げて。','Spread the miso sauce across the cutlet.','stir','The miso sauce coats the cutlet.'],
    miyagi: ['mash','つぶす','つぶす','tsubusu','mash','枝豆をつぶして。少し粒を残して。','Mash the beans and leave a little texture.','press','The green bean paste is ready to coat the mochi.'],
    niigata: ['dip','くぐらせる','くぐらせる','kuguraseru','dip briefly','とんかつをたれにくぐらせて。','Dip the hot cutlet briefly in the glaze.','press','A thin soy glaze clings to the crust.'],
    hiroshima: ['cookrice','炊く','たく','taku','cook rice','かきの煮汁で米を炊いて。','Cook the rice in the oyster liquor.','hold','The rice has absorbed the oyster liquor.'],
    nagano: ['wrap','包む','つつむ','tsutsumu','wrap','具を皮で包んで、とじ目を押さえて。','Wrap the filling and press the seam closed.','press','The wrapper holds the aubergine filling.'],
    kagawa: ['boil','ゆでる','ゆでる','yuderu','boil','うどんだけを別の鍋でゆでて、湯を切って。','Boil just the noodles in a separate pot, then drain.','hold','The noodles are drained. Rinse and rewarm them for the broth.'],
    tokyo: ['stir','混ぜる','まぜる','mazeru','stir','みそが溶けるまで、だしを混ぜて。','Stir the clam broth until the miso dissolves.','stir','The miso has dissolved into the broth.'],
    okinawa: ['stirfry','炒める','いためる','itameru','stir-fry','卵が固まるまで軽く炒めて。','Stir-fry gently until the egg sets.','stir','The egg coats the bitter melon and tofu.'],
    kyoto: ['warm','温める','あたためる','atatameru','warm through','昆布だしで豆腐を静かに温めて。','Warm the tofu gently in the kelp broth.','hold','The tofu is warm through.']
  };
  const {AJIMI_REGIONS:regions,AJIMI_WORDS:words} = window;
  const verbs = Object.values(techniques).map(([key]) => 'tech-' + key);
  Object.entries(techniques).forEach(([id, fields], i) => {
    const [key,word,kana,roman,en,instruction,english,method,done]=fields;
    regions[id].technique = {key,word,kana,roman,en,instruction,english,method,done};
    const wordKey='tech-'+key;
    words[wordKey] = [word,kana,roman,en];
    const oldQuestion=regions[id].quiz[2];
    const answerIndex=oldQuestion.answer ?? oldQuestion.options.indexOf(oldQuestion.word);
    const options=[verbs[(i+3)%verbs.length], verbs[(i+7)%verbs.length]];
    options.splice(answerIndex, 0, wordKey);
    regions[id].quiz[2] = {word:wordKey, mode:'read', options};
  });
})();
