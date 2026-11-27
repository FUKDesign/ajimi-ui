# Ajimi UI redesign brief for Fable

**Aidan McFarlane · 27 November 2026**

Improve the look and usability of Ajimi, a Japanese language-learning app built around cooking. Start with a first-time learner on a phone. They should know which dish they have chosen, which word they are learning and when it is their turn to do something in the kitchen. Show the working design in the portfolio as someone would actually use it.

## Start with the udon

1. Open the regional table and swipe from Nagano’s oyaki to Kagawa’s Sanuki udon. The plate should follow the finger. The arrow buttons offer the same choice.
2. Choose **Learn recipe**. The alternative **Skip to recipe** should be just as easy to find for someone who has been here before.
3. Tap **ゆでる**. Reveal *yuderu* and “boil”. Play the Japanese, save the word and try the short meaning check.
4. Open the phrase **うどん / を / ゆでる**. Each part has a reading and a role. Teach the ingredient, object particle and action before the four-question recipe quiz.
5. In the kitchen, add the ingredients, hold the pot to boil the noodles, then season with two ladles of dashi and one pour of soy sauce. Mochi tastes the bowl and responds. Keep the dietary notes available with the finished dish.

Watch the [recording of the full session](https://aidanmdesign.xyz/ajimi/media/udon.mp4). Try it again with a keyboard and with reduced motion enabled. The 11 other kitchens have their own actions and timings. Use the lesson data for each one.

## Visual direction

- Keep the background white. The food, the learning word and the next action should carry the page. Use a single light direction across the ceramics, glass and shadows.
- Use textured 3D clay for the food and pot. Let the frosted recipe card pass over the edge of the celadon wheel so the glass reads as translucent. Use dark, opaque type on top. Keep grain subtle at phone size.
- Keep the regional food photography, gentle rotation, mochi character and stamp illustrations. Use the teal, apricot and muted pink palette deliberately. Group related controls with solid blocks and spacing.
- Keep Japanese and English together where they help someone learn, cook or check a pronunciation. Remove duplicate labels and decorative words that slow the choice. The app opens on the dish table. Its portfolio case study is a separate destination.
- Review the free self-hosted Atkinson Hyperlegible Next for Latin text and BIZ UDPGothic for Japanese. On the current phone layout the ingredient translations are about 15 px, cooking guidance about 17 px and primary controls at least 44 px high. Check the longest dish name and long Japanese words before finalising the type scale.
- For motion, give the learner a cause and an effect. Holding the pot should build a rolling boil. Releasing it should let the water settle. Keep keyboard and tap alternatives, explicit progress, visible focus and static reduced-motion feedback.

## What to deliver back to Aidan

A working mobile and desktop version, an editable Figma proposal, a before-and-after view of the dish table and the lesson, and one honest recording of the complete udon flow. Concentrate the first pass on the dish picker, bilingual word card, ingredient tray and cooking feedback. The useful question is whether someone can recognise the next action before the interface explains it.

Use a fork or a working copy to develop the proposal. The live site and Figma links in this package provide the review baseline.

## How to judge a change

At 320 and 390 px wide, read the English instruction and Japanese word, select an ingredient without covering its name, and complete the boil using touch and keyboard. At tablet and desktop widths, check that the food and instructions read as one activity. Check that saved words survive a reload, that an incorrect quiz answer can be retried and that skipping the quiz opens the correct regional recipe.

For a later usability comparison, ask first-time participants to find **Learn recipe** and **Skip to recipe**, then use ゆでる in the udon kitchen. Record the first control they choose, where they hesitate and whether they can complete the boil. Existing verification covers software behaviour across the 12 recipes. No participant results are claimed for these design hypotheses.
