/* Ajimi's practice bowls. Each pour is a game measure for the named preparation. */
window.AJIMI_WORDS = {
 chicken:['鶏肉','とりにく','toriniku','chicken'], carrot:['にんじん','にんじん','ninjin','carrot'],
 ginger:['しょうが','しょうが','shōga','ginger'], soy:['しょうゆ','しょうゆ','shōyu','soy sauce'],
 mirin:['みりん','みりん','mirin','sweet rice seasoning'], pepper:['こしょう','こしょう','koshō','pepper'],
 rice:['ご飯','ごはん','gohan','cooked rice'], roe:['明太子','めんたいこ','mentaiko','spicy pollock roe'],
 seaweed:['のり','のり','nori','dried seaweed'], stock:['だし','だし','dashi','stock'],
 little:['少し','すこし','sukoshi','a little'], twice:['二回','にかい','nikai','twice'],
 salty:['塩辛い','しおからい','shiokarai','too salty'], mild:['味が薄い','あじがうすい','aji ga usui','light or weak in flavour'],
 tasty:['おいしい','おいしい','oishii','delicious'], bland:['うま味が足りない','うまみがたりない','umami ga tarinai','it needs more umami']
};
window.AJIMI_REGIONS = {
 hokkaido:{
 id:'hokkaido',name:'Hokkaidō',kanji:'北海道',city:'Sapporo',cityJP:'札幌',dish:'Soup curry',jp:'スープカレー',read:'sūpu karē',
 focus:'Tell ginger from soy sauce, then season a bowl of Sapporo soup curry.',intro:'In Sapporo, soup curry has a thin, aromatic broth and large pieces of vegetables. Rice is usually served alongside. Your practice pot starts with a hot, spiced broth.',
 words:['chicken','carrot','ginger','soy','mirin','twice'],ingredients:['chicken','carrot','ginger'],odd:'pepper',vessel:'pot',
 instruction:'鶏肉、にんじん、しょうがを入れて。',translation:'Add chicken, carrot and ginger to the spiced broth.',seasonJP:'しょうゆを二回、みりんを一回。',seasonEN:'Two small pours of soy sauce and one of mirin.',bottles:[['soy',2,'pours'],['mirin',1,'pour']],
 quiz:[{word:'ginger',mode:'hear',options:['soy','ginger','pepper']},{word:'chicken',mode:'read',options:['chicken','rice','roe']},{word:'soy',mode:'reverse',options:['ginger','mirin','soy']},{word:'twice',mode:'count',options:['Once','Twice','Three times'],answer:1}],
 dietary:'Chicken, vegetables and a curry-spiced chicken broth. This practice bowl uses ordinary soy sauce containing soy and wheat, and hon-mirin, an alcohol-containing seasoning. The broth and curry blend vary by maker.',
 dietTags:['Contains chicken','Soy & wheat','Uses mirin'],
 missHigh:['塩辛い。','Shiokarai.','Too salty. Check the number of soy pours.'],missLow:['うま味が足りない。','Umami ga tarinai.','It needs more umami. Check the soy measure.'],
 source:'https://www.visit-hokkaido.jp/en/spot/detail_12826.html'
 },
 fukuoka:{
 id:'fukuoka',name:'Fukuoka',kanji:'福岡',city:'Hakata',cityJP:'博多',dish:'Mentaiko rice',jp:'明太子ご飯',read:'mentaiko gohan',
 focus:'Build a bowl of mentaiko rice, then turn it into ochazuke with warm dashi.',intro:'Hakata is known for karashi mentaiko, chilli-seasoned pollock roe. It is often eaten with rice. In this lesson, finish the bowl ochazuke-style by pouring warm kombu dashi over it.',
 words:['rice','roe','seaweed','stock','little','twice'],ingredients:['rice','roe','seaweed'],odd:'carrot',vessel:'bowl',
 instruction:'ご飯、明太子、のりを入れて。',translation:'Add rice, mentaiko and dried seaweed.',seasonJP:'だしを二回。しょうゆは入れないで。',seasonEN:'Two ladles of dashi. Leave out the soy sauce.',bottles:[['stock',2,'ladles'],['soy',0,'pours']],
 quiz:[{word:'roe',mode:'read',options:['seaweed','chicken','roe']},{word:'stock',mode:'hear',options:['stock','soy','mirin']},{word:'seaweed',mode:'reverse',options:['rice','seaweed','ginger']},{word:'twice',mode:'count',options:['Three times','Once','Twice'],answer:2}],
 dietary:'Rice, seasoned Alaska pollock roe, nori and kombu dashi. Contains fish. The roe marinade can contain soy and wheat. Check the product label. This version uses kelp stock and adds no extra soy sauce.',
 dietTags:['Contains fish roe','Check marinade','Kombu stock'],
 missHigh:['味が薄い。','Aji ga usui.','The broth has diluted the roe. Try two ladles.'],missLow:['だしが足りない。','Dashi ga tarinai.','There is too little broth. Listen for nikai, twice.'],
 source:'https://www.crossroadfukuoka.jp/en/articles/mentaiko'
 }
};
