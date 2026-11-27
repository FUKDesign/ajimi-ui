# Writes the case study page. The twelve-kitchen wheel and the clay parade are filled from the lesson data.
import json, html, os
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'app', 'next')) + '/'
L = json.load(open(R + 'data/lessons.json'))
V = json.load(open(R + 'data/vocabulary.json'))
e = html.escape
dish = lambda i: '../img/bowl-3.webp' if i == 'kagawa' else f'../img/dish-{i}.webp'
n = len(L)
plates = ''.join(f'<li style="--a:{i * 360 / n:.0f}deg"><img src="{dish(l["id"])}" alt="" width="760" height="760" loading="lazy"></li>' for i, l in enumerate(L))
labels = ''.join(
    f'<li{" class=on" if i == 0 else ""}><p class="where">{e(l["name"])} <span lang="ja">{e(l["kanji"])}</span></p>'
    f'<h3>{e(l["dish"])} <span lang="ja">{e(l["jp"])}</span></h3>'
    f'<p class="verb-line"><b lang="ja">{e(l["technique"]["word"])}</b> {e(l["technique"]["roman"])}, to {e(l["technique"]["en"])}</p>'
    f'<a class="link" href="../index.html#lesson/{l["id"]}/ingredients">Cook this one</a></li>' for i, l in enumerate(L))
clay = {'scallion': 'negi', 'ginger': 'shoga', 'stock': 'dashi'}
keys = []
for l in L:
    for k in l['ingredients'] + [b[0] for b in l['bottles']]:
        if k not in keys: keys.append(k)
parade = ''.join(f'<img src="../img/{clay.get(k, k)}.webp" alt="Clay {e(V[k]["english"])}" width="640" height="640" loading="lazy">' for k in keys)
models = len(keys) + n

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="author" content="Aidan McFarlane">
<meta name="description" content="Ajimi teaches the Japanese in a recipe, then has you cook with it. Product design case study by Aidan McFarlane.">
<title>Ajimi | Aidan McFarlane</title>
<link rel="icon" href="../../assets/mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://use.typekit.net/rvl7tbk.css">
<link rel="stylesheet" href="story.css">
</head>
<body>
<a class="skip" href="#main">Skip to the case study</a>
<main id="main">

<section class="card hero" id="top">
  <header class="mast">
    <a class="name" href="https://aidanmdesign.xyz/">Aidan McFarlane</a>
    <nav aria-label="Case study">
      <a href="#flows">Flows</a>
      <a href="#kitchens">Kitchens</a>
      <a href="#mochi">Mochi</a>
      <a class="btn go" href="../index.html#table">Open the app</a>
    </nav>
  </header>
  <div class="hero-grid">
    <div class="hero-copy">
      <h1>Learn Japanese by cooking dinner</h1>
      <p>Ajimi teaches the words in a recipe, then you cook with them. Twelve regional dishes share one lesson.</p>
      <div class="actions">
        <a class="btn go" href="../index.html#lesson/kagawa/ingredients">Cook the udon</a>
        <a class="link" href="#flows">See the flows</a>
      </div>
      <dl class="facts">
        <div><dt>Client</dt><dd>Ajimi</dd></div>
        <div><dt>Scope</dt><dd>Product design, UI, art direction, build</dd></div>
        <div><dt>Delivered</dt><dd>{n} kitchens, {models} clay models, Figma file</dd></div>
        <div><dt>Year</dt><dd>2026</dd></div>
      </dl>
    </div>
    <div class="hero-stage">
      <figure class="hero-pic" role="img" aria-label="A clay bowl fills with udon, then broth, then spring onion and ginger">
        <div class="bowl-stack"><img src="../img/bowl-0.webp" alt="" width="760" height="760"><img src="../img/bowl-1.webp" alt="" width="760" height="760"><img src="../img/bowl-2.webp" alt="" width="760" height="760"><img src="../img/bowl-3.webp" alt="" width="760" height="760"></div>
        <span class="tag t1" lang="ja">うどん<small lang="en">udon</small></span>
        <span class="tag t2" lang="ja">だし<small lang="en">dashi</small></span>
        <span class="tag t3" lang="ja">ねぎ<small lang="en">negi</small></span>
        <img class="hero-mochi" src="../img/mochi-happy.webp" alt="" width="520" height="520">
      </figure>
    </div>
  </div>
</section>

<section class="card brief" id="brief">
  <div class="wrap">
    <h2 data-reveal>Give every word a job</h2>
    <div class="cols">
      <div data-reveal>
        <p>Ajimi came with twelve regional recipes, recorded Japanese audio and a prototype that worked. It also taught words the way most apps do: show one, test it, move on.</p>
        <p>The brief was a lesson people finish on a phone. You learn うどん and ゆでる because the next screen asks you to boil the noodles.</p>
      </div>
      <figure class="job-fig" data-scrub aria-label="Five Japanese words drop into an empty bowl and it fills with udon">
        <div class="chips" lang="ja"><span style="--i:0">うどん</span><span style="--i:1">ゆでる</span><span style="--i:2">だし</span><span style="--i:3">ねぎ</span><span style="--i:4">しょうが</span></div>
        <div class="job-bowl"><img src="../img/bowl-0.webp" alt="" width="760" height="760" loading="lazy"><img src="../img/bowl-3.webp" alt="" width="760" height="760" loading="lazy"></div>
      </figure>
      <ul class="figures">
        <li data-reveal><b data-count="4000750">4,000,750</b><span>people study Japanese at institutions outside Japan. Self-taught learners are not counted.</span><a href="https://www.jpf.go.jp/j/about/press/2025/dl/2025-031-03.pdf">Japan Foundation, 2024 survey</a></li>
        <li data-reveal><b data-count="42.7" data-suffix=" million">42.7 million</b><span>people visited Japan in 2025, a record.</span><a href="https://www.jnto.go.jp/news/press/20260121_monthly.html">JNTO, January 2026</a></li>
      </ul>
    </div>
    <div class="people">
      <article data-reveal><h3>The learner at home</h3><p>Knows kana, has tried an app or two, and stops when lessons feel like filing. Wants Japanese that turns up in ordinary life.</p></article>
      <article data-reveal><h3>The visitor who came for the food</h3><p>Has a trip booked and a list of dishes. Wants to read a menu and follow what the cook is saying.</p></article>
    </div>
  </div>
</section>

<section class="card reason" id="research">
  <div class="wrap">
    <h2 data-reveal>Three findings the lesson is built on</h2>
    <ol class="findings">
      <li data-reveal><h3>Doing the action helps the phrase stick</h3><p>A review of 145 studies found people remember an action phrase better after performing it than after reading it. So you hold the pot.</p><a href="https://uwaterloo.ca/memory-attention-cognition-lab/sites/default/files/uploads/files/enact22.pdf">Roberts, MacLeod and Fernandes, 2022</a></li>
      <li data-reveal><h3>Being tested beats rereading</h3><p>Recalling a word a little later holds it longer than seeing it again. So the review comes after the cooking.</p><span class="src">Roediger and Karpicke, 2006</span></li>
      <li data-reveal><h3>Context matters more than repetition</h3><p>A word met in a clear setting is learned better than one met often. So every word arrives with its ingredient.</p><a href="https://nflrc.hawaii.edu/rfl/item/178">Webb, 2008</a></li>
    </ol>
    <p class="note" data-reveal>These are reasons for the design. Ajimi has not been tested with learners yet.</p>
  </div>
</section>

<section class="card journey pinned" id="journey">
  <div class="pin">
    <div class="wrap">
      <h2>One dish, four steps</h2>
      <ol class="steps">
        <li style="--i:0">
          <div class="phone"><img src="media/word.webp" alt="Ingredient screen showing clay udon noodles and the word うどん" width="780" height="1688" loading="lazy"><div class="wire" aria-hidden="true"><i class="w-bar"></i><i class="w-pic"></i><i class="w-word"></i><i class="w-dots"></i><i class="w-btn"></i></div></div>
          <h3><span lang="ja">材料</span> Ingredients</h3>
          <p>Meet each word with its ingredient. Save the ones you do not know.</p>
        </li>
        <li style="--i:1">
          <div class="phone"><img src="media/boil.webp" alt="Method screen with a clay pot of noodles and the sentence うどんをゆでる" width="780" height="1688" loading="lazy"><div class="wire" aria-hidden="true"><i class="w-bar"></i><i class="w-pic round"></i><i class="w-line"></i><i class="w-line"></i><i class="w-btn"></i></div></div>
          <h3><span lang="ja">作り方</span> Method</h3>
          <p>Read the sentence, then do the verb. The verb is the only thing highlighted.</p>
        </li>
        <li style="--i:2">
          <div class="phone"><img src="media/quiz.webp" alt="Review screen with a missing word and four answers" width="780" height="1688" loading="lazy"><div class="wire" aria-hidden="true"><i class="w-bar"></i><i class="w-pic"></i><i class="w-word"></i><i class="w-grid"></i></div></div>
          <h3><span lang="ja">復習</span> Review</h3>
          <p>Fill the missing word. Saved words come first.</p>
        </li>
        <li style="--i:3">
          <div class="phone"><img src="media/taste.webp" alt="Finished bowl of udon with the words learned listed below" width="780" height="1688" loading="lazy"><div class="wire" aria-hidden="true"><i class="w-bar"></i><i class="w-pic round big"></i><i class="w-chips"></i><i class="w-btn"></i></div></div>
          <h3><span lang="ja">味見</span> Taste</h3>
          <p>The finished bowl, Mochi’s verdict and every word you used.</p>
        </li>
      </ol>
    </div>
  </div>
</section>

<section class="card flows" id="flows">
  <div class="wrap">
    <h2 data-reveal>The flows, recorded from the working app</h2>
    <div class="flow lead" data-reveal>
      <video class="clip" src="media/flow-boil.mp4" poster="media/boil.webp" width="390" height="844" muted playsinline loop controls preload="none" aria-label="Holding the pot brings the water to a rolling boil and fills the progress bar"></video>
      <div><h3>Hold the pot to boil</h3><p>Pressing builds a rolling boil. Letting go lets the water settle. With reduced motion on, three presses do the same job.</p></div>
    </div>
    <div class="flow-row">
      <figure data-reveal><video class="clip" src="media/flow-table.mp4" poster="media/table.webp" width="390" height="844" muted playsinline loop controls preload="none" aria-label="Swiping the table turns it from one dish to the next"></video><figcaption><b>Turn the table.</b> The plate follows the finger. Learn recipe and Skip to recipe sit side by side.</figcaption></figure>
      <figure data-reveal><video class="clip" src="media/flow-words.mp4" poster="media/word.webp" width="390" height="844" muted playsinline loop controls preload="none" aria-label="Swiping through ingredient words, revealing a meaning and saving a word"></video><figcaption><b>Save what you do not know.</b> The meaning stays hidden until you ask for it.</figcaption></figure>
      <figure data-reveal><video class="clip" src="media/flow-season.mp4" poster="media/pour.webp" width="390" height="844" muted playsinline loop controls preload="none" aria-label="Two ladles of dashi and one pour of soy sauce fill the bowl, then toppings are added"></video><figcaption><b>Count in Japanese.</b> Two ladles, one pour. A third ladle gets a reaction.</figcaption></figure>
      <figure data-reveal><video class="clip" src="media/flow-quiz.mp4" poster="media/wrong.webp" width="390" height="844" muted playsinline loop controls preload="none" aria-label="A wrong answer makes Mochi puff up, then the right answer fills the gap"></video><figcaption><b>Get one wrong.</b> Mochi puffs up like a rice cake on a grill, and you try again.</figcaption></figure>
    </div>
    <p class="film" data-reveal><a class="btn soft" href="media/speedrun.mp4">Watch the speedrun</a></p>
  </div>
</section>

<section class="card kitchens pinned" id="kitchens">
  <div class="pin">
    <div class="wrap kitchen-grid">
      <div class="kitchen-copy">
        <h2>Twelve kitchens, one lesson</h2>
        <p>Every dish keeps the four steps and changes the verb. Sapporo simmers, Osaka flips, Sendai mashes.</p>
        <ol class="kitchen-labels" aria-live="off">{labels}</ol>
      </div>
      <div class="wheel-box" aria-hidden="true"><ul class="story-wheel">{plates}</ul></div>
    </div>
  </div>
</section>

<section class="card mochi pinned" id="mochi">
  <div class="pin">
    <div class="wrap mochi-grid">
      <div class="mochi-head">
        <h2>What the mochi is for</h2>
        <p>The first version had a character and no job for it. Ajimi means tasting as you cook, so Mochi became the taster. Two more jobs followed from that.</p>
      </div>
      <div class="mochi-stage" aria-hidden="true"><img src="../img/mochi-happy.webp" alt="" width="520" height="520" loading="lazy"><img src="../img/mochi-puff.webp" alt="" width="520" height="520" loading="lazy"><img src="../img/mochi-idle.webp" alt="" width="520" height="520" loading="lazy"></div>
      <ul class="jobs">
        <li class="on"><h3>Taster</h3><p>There is no score. Mochi tastes the bowl and tells you, in Japanese, how it went.</p></li>
        <li><h3>Keeper of misses</h3><p>A wrong answer puffs Mochi up. It also keeps that word and asks you first next time.</p></li>
        <li><h3>Hint on request</h3><p>Tap Mochi on any screen. It says the word aloud, or removes one wrong answer.</p></li>
      </ul>
    </div>
  </div>
</section>

<section class="card compare" id="before">
  <div class="wrap">
    <h2 data-reveal>Before and after</h2>
    <div class="pairs">
      <figure><div class="wipe" data-scrub><img src="media/before-mobile-menu.webp" alt="Earlier dish menu with a website header and stacked cards" width="390" height="844" loading="lazy"><img class="after" src="media/table.webp" alt="New dish table with one glass card over the wheel" width="780" height="1688" loading="lazy"><i></i></div><figcaption>The dish table lost its website header and its footer. One card now carries the choice.</figcaption></figure>
      <figure><div class="wipe" data-scrub><img src="media/before-mobile-boil.webp" alt="Earlier boil screen with a pink instruction card" width="390" height="1080" loading="lazy"><img class="after" src="media/boil.webp" alt="New boil screen with the recipe as three sentences" width="780" height="1688" loading="lazy"><i></i></div><figcaption>The boil screen fits one screen. The instruction is the Japanese sentence itself.</figcaption></figure>
    </div>
  </div>
</section>

<section class="card system" id="system">
  <div class="wrap">
    <h2 data-reveal>Clay, cloth and one light</h2>
    <div class="sys">
      <div class="swatches" aria-label="Colour palette" data-scrub>
        <span style="--c:var(--paper);--i:0">Paper</span><span style="--c:var(--rice);--i:1">Rice</span><span style="--c:var(--celadon);--i:2">Celadon</span><span style="--c:var(--dashi);--i:3">Dashi</span><span class="dark" style="--c:var(--vermilion);--i:4">Kerchief</span><span class="dark" style="--c:var(--ink);--i:5">Ink</span>
      </div>
      <p data-reveal>Every colour comes from the kitchen: the glaze on the wheel, the broth, Mochi’s headscarf. Vermilion is kept for the one thing you should press next.</p>
      <div class="type" data-reveal>
        <p class="t1" lang="ja">ゆでる <span>Kiwi Maru</span></p>
        <p class="t2">Boil the udon noodles. <span>Atkinson Hyperlegible Next</span></p>
        <p class="t3" lang="ja">だしを二杯かける <span lang="en">BIZ UDPGothic</span></p>
      </div>
      <p data-reveal>The food is clay, lit from the upper left, and it sits on patterned cloth: shippo circles, waves and dots. Glass appears only where a panel passes over food.</p>
    </div>
  </div>
  <div class="parade" data-scrub><div class="parade-row">{parade}</div></div>
</section>

<section class="card next" id="handover">
  <div class="wrap">
    <h2 data-reveal>What was handed over</h2>
    <ul class="handover">
      <li data-reveal>The working lesson for all twelve kitchens, built phone first.</li>
      <li data-reveal>A Figma file with the user flow, five wireframes, five editable screens and a clickable prototype.</li>
      <li data-reveal>{models} clay models as cut-outs that keep their own shadows.</li>
      <li data-reveal>One switch that turns romaji on or off everywhere.</li>
    </ul>
    <h2 data-reveal>What is not done</h2>
    <ul class="open">
      <li data-reveal>No learner outside the project has used it. The first test is whether a new learner finds Learn recipe, then completes the boil without being told how.</li>
      <li data-reveal>Only udon has its own cooking animation, the rolling boil. The other eleven share four simpler motions.</li>
      <li data-reveal>The clay images were generated with an image model and cut out afterwards. They should be remodelled in Blender before release.</li>
    </ul>
    <a class="btn go" href="../index.html#table" data-reveal>Open the app</a>
  </div>
  <footer class="foot">
    <a class="name" href="https://aidanmdesign.xyz/">Aidan McFarlane</a>
    <nav aria-label="Footer"><a href="https://aidanmdesign.xyz/">Portfolio</a><a href="../../licenses/regional-photographs.html">Photo credits</a><a href="../index.html#table">Ajimi</a></nav>
  </footer>
</section>
</main>
<script src="story.js" defer></script>
</body>
</html>
'''
open(R + 'story/index.html', 'w').write(page)
print('ok', n, 'kitchens', len(keys), 'ingredients', models, 'models')
