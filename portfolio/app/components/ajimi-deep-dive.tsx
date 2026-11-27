/* eslint-disable @next/next/no-img-element -- Local app art and recordings of the working lesson. */
import { preinit } from "react-dom";
import CaseSummary, { CaseBackLink } from "./case-summary";
import SiteFooter from "./site-footer";
import SiteMotionDirector from "./site-motion-director";
import { siteContent } from "../site-content";
import kitchens from "../data/ajimi-kitchens.json";
import regions from "../data/ajimi-regions.json";

const story = "/ajimi/story/";
const media = "/ajimi/next/story/media/";
const kitchen = "/ajimi/next/index.html";
const study = "/ajimi/next/story/index.html";
const outlines = regions as Record<string, string>;
const dish = (id: string) => "/ajimi/next/img/" + (id === "kagawa" ? "bowl-3" : "dish-" + id) + ".webp";

const sayIcon = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" /><path d="M15.5 9a4.2 4.2 0 010 6M18 6.5a8 8 0 010 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;

const goals = [
  { title: "Read and say the language of a recipe", body: "Ingredient names, counters and the verbs a cook uses. Lower-intermediate learners know kana and basic grammar; this is the specialised vocabulary a textbook leaves out.", say: "うどんをゆでる", audio: "say-boil.mp3", label: "Hear “boil the udon”" },
  { title: "Cook the dish the way it is cooked there", body: "Each lesson follows the real method. Sanuki udon is boiled, rinsed and rewarmed before the broth goes on, so the lesson teaches it in that order.", say: "だしを二杯、しょうゆを一回", audio: "say-season.mp3", label: "Hear “two ladles of dashi, one pour of soy”" },
  { title: "Know where it comes from", body: "Every dish sits on the outline of its prefecture with the name written on it. Twelve regions, twelve dishes, and the local name is kept: Sanuki for Kagawa, Hakata for Fukuoka.", say: "おいしい！", audio: "say-taste.mp3", label: "Hear Mochi’s verdict" },
];

const evidence = [
  { clip: "flow-boil", poster: "boil", alt: "Holding the pot until the water reaches a rolling boil.", title: "You do the verb", body: "People remember an action phrase better when they perform it than when they read it. A 2022 review pooled 145 behavioural studies and found a large effect. So ゆでる is taught by holding the pot until it boils.",
    cites: [["Roberts, MacLeod & Fernandes (2022), Psychological Bulletin 148", "https://doi.org/10.1037/bul0000360"], ["Macedonia, Müller & Friederici (2011), Human Brain Mapping 32. Foreign words learned with meaningful gestures were kept longer.", "https://doi.org/10.1002/hbm.21084"]] },
  { clip: "flow-season", poster: "pour", alt: "Adding two ladles of dashi and one pour of soy sauce, counted in Japanese.", title: "The lesson is a task with an end", body: "Teaching a language through tasks has a good record: a meta-analysis of 52 classroom programmes found a strong overall effect. Newcastle University has tested cooking itself as the task. In its Linguacuisine study, 72 learners of Chinese scored higher on 27 kitchen words after one cooking session.",
    cites: [["Bryfonski & McKay (2019), Language Teaching Research 23(5)", "https://doi.org/10.1177/1362168817744389"], ["Seedhouse et al. (2019), The EuroCALL Review 27(2). No control group, and the test came straight after the session.", "https://doi.org/10.4995/eurocall.2019.13663"]] },
  { clip: "flow-words", poster: "word", alt: "Swiping through clay ingredients, each with its Japanese name.", title: "What you already know does half the work", body: "A cook already knows what boiling looks like and why the noodles are rinsed. In a classic study, children who knew baseball remembered a baseball text better whatever their reading level. Ajimi leans on that: the kitchen is familiar, so only the Japanese is new.",
    cites: [["Recht & Leslie (1988), Journal of Educational Psychology 80(1)", "https://doi.org/10.1037/0022-0663.80.1.16"], ["Pulido (2004), Language Learning 54(3). In a second language, topic familiarity changed how new words were taken in.", "https://doi.org/10.1111/j.0023-8333.2004.00263.x"]] },
  { clip: "flow-quiz", poster: "wrong", alt: "A fill-the-gap question answered wrongly, then correctly.", title: "The review makes you recall, not reread", body: "Being tested holds a memory longer than studying it again. With foreign vocabulary, repeated testing produced a large gain in delayed recall and repeated study produced none. So the review comes after the cooking, and the words you saved or missed come first.",
    cites: [["Roediger & Karpicke (2006), Psychological Science 17", "https://doi.org/10.1111/j.1467-9280.2006.01693.x"], ["Karpicke & Roediger (2008), Science 319", "https://doi.org/10.1126/science.1152408"]] },
  { clip: "../../../story/motion-table", poster: "table", alt: "The table turns and the chosen dish zooms in over the outline of its prefecture.", title: "Every word arrives with its setting", body: "Learners who met new words in informative contexts scored higher on meaning than those who met them in vague ones. Pictures help too: students remembered translations better with both a picture and text. So a word never appears alone. It comes with its ingredient, its dish and its region.",
    cites: [["Webb (2008), Reading in a Foreign Language 20(2)", "https://doi.org/10.64152/10125/66826"], ["Plass, Chun, Mayer & Leutner (1998), Journal of Educational Psychology 90(1)", "https://doi.org/10.1037/0022-0663.90.1.25"]] },
];

const cycle = [
  ["Research", "Read the studies and the earlier prototype. Write down who it is for."],
  ["Sketch", "Five screens in pencil. Decide what each one is for before how it looks."],
  ["Wireframe", "Grey boxes at real size. Check the thumb can reach every control."],
  ["Prototype", "Clickable screens in Figma, with the real words and clay art."],
  ["Build", "The working lesson in HTML, CSS and JavaScript, phone first."],
  ["Check", "Run every kitchen end to end. What fails goes back to the sketch."],
];

const stages: [string, string, (name: string) => string][] = [
  ["Sketch", "pencil sketch", name => story + "sketch-" + name + ".webp"],
  ["Wireframe", "wireframe", name => story + "wire-" + name + ".webp"],
  ["Built", "working screen", name => media + ({ table: "table", ingredients: "word", method: "boil", review: "quiz", taste: "taste" } as Record<string, string>)[name] + ".webp"],
];
const screens = ["table", "ingredients", "method", "review", "taste"];
const screenNames: Record<string, string> = { table: "Dish table", ingredients: "Ingredients", method: "Method", review: "Review", taste: "Taste" };

const motion = [
  { clip: story + "motion-table", poster: media + "table.webp", title: "Turn the table", body: "The plate follows the finger. The chosen dish zooms in large over its prefecture." },
  { clip: media + "flow-words", poster: media + "word.webp", title: "Swipe the ingredients", body: "Cards snap one at a time. The progress bar fills as each word is met." },
  { clip: media + "flow-boil", poster: media + "boil.webp", title: "Hold to boil", body: "Pressing builds the boil. Letting go lets the water settle." },
  { clip: media + "flow-season", poster: media + "pour.webp", title: "Pour and count", body: "Each pour rocks the bowl and raises the counter in Japanese." },
  { clip: media + "flow-quiz", poster: media + "wrong.webp", title: "Get one wrong", body: "Mochi puffs up like a rice cake on a grill, then you try again." },
];

export default function AjimiDeepDive() {
  preinit("/case-journey.20261125.css?v=4", { as: "style", precedence: "case-navigation" });
  preinit(story + "deep.css?v=1", { as: "style", precedence: "ajimi-deep" });
  const copy = siteContent.en;
  return (
    <div id="top" className="site-shell case-study-page" data-locale="en" lang="en-GB">
      <main id="main-content">
        <header className="case-hero" data-page-header="full-bleed">
          <CaseBackLink locale="en" />
          <div className="case-heading"><h1>Ajimi, a Japanese lesson you cook</h1></div>
          <dl className="case-essential-meta">
            <div><dt>{copy.caseStudy.relationship}</dt><dd>Client: Ajimi / 味見</dd></div>
            <div><dt>{copy.caseStudy.contribution}</dt><dd>Product design, UI, art direction and build</dd></div>
          </dl>
          <div className="case-cover"><picture><img src={story + "specimen.webp"} width="1760" height="1100" alt="Ajimi on a desktop screen and a phone, both set in clay frames. The dish table shows Sanuki udon." fetchPriority="high" /></picture></div>
        </header>

        <CaseSummary locale="en"
          brief="Ajimi had twelve regional recipes, recorded Japanese audio and a prototype that taught words as a list. The brief was a lesson that lower-intermediate and intermediate learners would finish on a phone, and that taught them the food as well as the words."
          outcome="One four-step lesson that runs for all twelve dishes, live on the web. No learner outside the project has tested it yet."
          deliverables={["Working lesson for 12 kitchens, phone first", "49 clay models and a character with three jobs", "Figma file: flow, sketches, wireframes, screens, prototype", "Scroll case study and this page"]} />

        <div className="ajd">
          <section aria-labelledby="ajd-who">
            <div className="ajd-split">
              <div>
                <h2 id="ajd-who">Who it is for and what they leave with</h2>
                <p className="ajd-lead">Ajimi is for people past the beginner stage who want Japanese they can use in a kitchen.</p>
                <p>Most apps stop at general vocabulary. A learner at lower-intermediate level can order a meal but cannot follow a recipe, because the verbs and counters of cooking are specialist words. Ajimi teaches those words by having you cook with them, and it teaches where each dish belongs.</p>
              </div>
              <ol className="ajd-goals">
                {goals.map(goal => <li key={goal.audio}>
                  <h3>{goal.title}</h3>
                  <p>{goal.body}</p>
                  <button type="button" className="ajd-say" data-audio={story + goal.audio} aria-pressed="false" aria-label={goal.label}>{sayIcon}<span lang="ja">{goal.say}</span></button>
                </li>)}
              </ol>
            </div>
          </section>

          <section aria-labelledby="ajd-persona">
            <h2 id="ajd-persona">The person it was designed around</h2>
            <div className="ajd-persona">
              <div className="ajd-persona-id">
                <h3>Maya, 29</h3>
                <dl>
                  <div><dt>Japanese</dt><dd>Lower-intermediate, 18 months of study</dd></div>
                  <div><dt>Cooking</dt><dd>Cooks most nights, follows recipes in English</dd></div>
                  <div><dt>Why now</dt><dd>A trip to Shikoku in spring</dd></div>
                </dl>
              </div>
              <div className="ajd-persona-body">
                <div><h3>Wants</h3><ul><li>To read a Japanese recipe without a dictionary</li><li>To make the dish properly, not a shortcut version</li><li>To know which region a dish belongs to before she travels</li></ul></div>
                <div><h3>Stops when</h3><ul><li>A lesson is a list of words with no use for them</li><li>The app scores her like a test</li><li>A screen needs explaining</li></ul></div>
                <div><h3>So Ajimi</h3><ul><li>Gives every word a job in the next step</li><li>Replaces the score with Mochi’s taste of the dish</li><li>Puts one action on each screen</li></ul></div>
              </div>
            </div>
            <p className="ajd-note">Maya is a proto-persona. She is built from the brief and from published learner surveys, not from interviews.</p>
          </section>

          <section aria-labelledby="ajd-science">
            <h2 id="ajd-science">The research behind each step</h2>
            <p>Each design decision below follows a published finding. The clip beside it is the app doing that thing.</p>
            <div className="ajd-evidence">
              {evidence.map(item => <article key={item.title}>
                <video width="390" height="844" src={item.clip.startsWith("..") ? story + "motion-table.mp4" : media + item.clip + ".mp4"} poster={media + item.poster + ".webp"} aria-label={item.alt} muted playsInline loop controls preload="none" />
                <div><h3>{item.title}</h3><p>{item.body}</p></div>
                <div>{item.cites.map(([text, href]) => <cite key={href}><a href={href} rel="noreferrer">{text}</a></cite>)}</div>
              </article>)}
            </div>
            <p className="ajd-note">These studies are reasons for the design, not proof that Ajimi works. Most were run in labs or classrooms, several on first-language material.</p>
          </section>

          <section aria-labelledby="ajd-process">
            <h2 id="ajd-process">From pencil to working app</h2>
            <ol className="ajd-cycle">{cycle.map(([name, body]) => <li key={name}><b>{name}</b>{body}</li>)}</ol>
            <div className="ajd-stages">
              {stages.map(([label, kind, src]) => <div className="ajd-stage" key={label}>
                <span>{label}</span>
                {screens.map(name => <img key={name} src={src(name)} width="390" height="844" loading="lazy" alt={screenNames[name] + ", " + kind} />)}
              </div>)}
            </div>
            <figure className="ajd-wide">
              <div className="ajd-frame"><img src={story + "figma.webp"} width="1600" height="1174" loading="lazy" alt="The Figma file: twelve dish-table screens, one for each kitchen, each with its clay dish and its verb." /></div>
              <figcaption>The Figma file holds the flow, the sketches, the wireframes and one editable screen for each of the twelve kitchens.</figcaption>
            </figure>
          </section>

          <section aria-labelledby="ajd-motion">
            <h2 id="ajd-motion">Motion that tells you what happened</h2>
            <p>Nothing moves for decoration. Each animation is the answer to something you just did.</p>
            <div className="ajd-motion">
              {motion.map(item => <figure key={item.title}>
                <video width="390" height="844" src={item.clip + ".mp4"} poster={item.poster} aria-label={item.title + ". " + item.body} muted playsInline loop controls preload="none" />
                <figcaption><b>{item.title}.</b> {item.body}</figcaption>
              </figure>)}
            </div>
          </section>

          <section aria-labelledby="ajd-kitchens">
            <h2 id="ajd-kitchens">Twelve dishes, each in its own prefecture</h2>
            <p>The outline behind each dish is its prefecture, drawn from public map data. Each kitchen keeps the four steps and teaches its own verb.</p>
            <ul className="ajd-kitchens">
              {kitchens.map(item => <li key={item.id}>
                <div className="ajd-kitchen-art">
                  <svg viewBox="-6 -6 112 112" aria-hidden="true"><path d={outlines[item.id]} /><text x="50" y="16" textAnchor="middle" lang="ja">{item.kanji}</text></svg>
                  <img src={dish(item.id)} width="880" height="880" loading="lazy" alt={"Clay model of " + item.dish} />
                </div>
                <b>{item.dish}</b>
                <span>{item.name}: <span lang="ja">{item.verb}</span> {item.roman}, to {item.en}</span>
              </li>)}
            </ul>
          </section>

          <section aria-labelledby="ajd-mochi">
            <div className="ajd-split">
              <div>
                <h2 id="ajd-mochi">Mochi, the character pack</h2>
                <p>The first version had a mascot with nothing to do. Ajimi means tasting as you cook, so Mochi became the taster, and two more jobs followed.</p>
                <ul className="ajd-jobs">
                  <li><b>Taster.</b> There is no score. Mochi tastes the dish and tells you in Japanese how it went.</li>
                  <li><b>Keeper of misses.</b> A wrong answer puffs Mochi up. That word comes back first next time.</li>
                  <li><b>Hint on request.</b> Tap Mochi on any screen to hear the word or lose one wrong answer.</li>
                </ul>
              </div>
              <figure className="ajd-frame"><img src={story + "character.webp"} width="1760" height="990" loading="lazy" alt="Mochi in three poses: standing with a spoon, puffed up with a toasted patch, and jumping with joy. Below are the six colours of the app and three clay props." /></figure>
            </div>
          </section>

          <section aria-labelledby="ajd-run">
            <div className="ajd-end">
              <video width="390" height="844" src={media + "speedrun.mp4"} poster={media + "table.webp"} aria-label="A speedrun: the table turns through all twelve kitchens, then okonomiyaki is cooked from ingredients to tasting." muted playsInline loop controls preload="none" />
              <div>
                <h2 id="ajd-run">The whole app in 18 seconds</h2>
                <p>All twelve kitchens, then one dish cooked from the first word to Mochi’s verdict. The recording is sped up; nothing is staged.</p>
                <div className="ajd-actions hero-actions">
                  <a className="button button-primary" href={kitchen}>Open the kitchen</a>
                  <a className="button button-secondary" href={study}>Scroll the case study</a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter locale="en" compact suppressContactTrigger labels={{
        eyebrow: copy.contact.eyebrow, title: copy.contact.title, body: copy.contact.body, email: copy.contact.email,
        linkedin: copy.contact.linkedIn, behance: "Behance", originalPortfolio: copy.contact.originalPortfolio, backToTop: copy.contact.backToTop,
      }} />
      <SiteMotionDirector />
      <script type="module" src={story + "deep.js"} async />
    </div>
  );
}
