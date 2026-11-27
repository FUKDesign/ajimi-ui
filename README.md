# Ajimi · 味見

A Japanese language-learning kitchen by Aidan McFarlane. Pick a dish, learn the words in its recipe, then use those words to cook it. Kagawa’s Sanuki udon is the most complete example to review first.

**For Fable:** Start with [the redesign brief](docs/FABLE-BRIEF.md), [the live udon lesson](https://aidanmdesign.xyz/ajimi/#lesson/kagawa) and [the current editable Figma board](https://www.figma.com/design/S8974qYNGXcMr5S6zjLtnR?node-id=66-2). The [public project chat](https://chatgpt.com/s/cx_6b08da207f188191b9507035d368eb7d) records the decisions and iterations.

[Complete project ZIP, including the Figma files](https://github.com/FUKDesign/ajimi-ui/releases/download/fable-handoff-v1/Ajimi-Fable-Handoff.zip) · [All links and individual downloads](docs/LINKS.md) · [Watch the 53-second flow with Japanese audio](https://aidanmdesign.xyz/ajimi/media/udon.mp4)

## Run it

With Node 20 or newer, run the following from this directory. There are no packages to install, API keys to supply or database to seed.

```sh
npm run dev
```

Open **http://127.0.0.1:5173**. For a hosted preview that needs to bind its own address and port, use `npm run dev -- --host 0.0.0.0 --port 3000`. For a static deployment, run `npm run build` and publish **dist/**. Run `npm run preview` to check that build locally. Keep the scheme and port consistent when testing saved progress. A normal browser session stores learning progress on this device. Use a fresh browser profile for the first-run journey.

The app registers an offline worker. During rapid visual iteration, use the browser developer tools’ option to bypass the service worker. The build command generates a new cache version when shipped UI or lesson files change. The standalone app ZIP can also be extracted and opened at `index.html`; use the local server for installation and offline testing.

## Where to edit

| Path | What lives there |
| --- | --- |
| `app/material.css` | Current glass surfaces, clay texture, English type scale, responsive menu and pantry targets |
| `app/study.js` and `app/study.css` | Word reveal, phrase parts, pantry, pronunciation, quick checks and saved vocabulary |
| `app/app.js` and `app/table.js` | App navigation, carousel, quiz, cooking gestures, measured pours, tasting and local progress |
| `app/boil.js` and `app/boil.css` | Kagawa’s interactive water, noodles, bubbles, steam and reduced-motion state |
| `app/lessons.js` and `app/regions.js` | Canonical vocabulary, dishes, quiz answers, actions, seasonings and dietary notes |
| `data/lessons.json` and `data/vocabulary.json` | Machine-readable exports of all 12 dishes and 59 vocabulary entries. Regenerate with `npm run data` after editing the source dictionaries or phrases |
| `app/assets/`, `app/fonts/`, `app/audio/`, `app/licenses/` | Runtime imagery, editable SVG marks, 3D ingredients, self-hosted fonts, Japanese speech and asset credits |
| `artwork/` | Blender and Python source for the wheel and pantry miniatures, plus the pantry render masters |
| `previews/` | Actual menu, word lesson, ingredient, boiling and desktop screenshots |
| `app/story/`, `app/media/` | Standalone portfolio case study and its recordings |
| `portfolio/app/` | The corresponding case-study component and locale data from Aidan’s portfolio. Its Next.js imports resolve inside the portfolio project. Use `app/story/index.html` for the runnable standalone study |

## Baseline

This handoff captures the 27 November 2026 site release, v246, and its production service-worker cache `ajimi-eb267fdd15f1`. The [full mobile recording](https://aidanmdesign.xyz/ajimi/media/udon.mp4) runs for 52.56 seconds and follows a real touch session through Mochi’s verdict. The current downloadable Figma prototype has 35 screens. The wider Ajimi master and the earlier Kondate explorations are available as separate release assets.

Keep Aidan McFarlane’s project attribution and each third-party asset’s credits when preparing a revised design. Font, icon, photograph and speech credits ship with the app.
