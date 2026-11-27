import vm from 'node:vm';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const app = new URL('../app/', import.meta.url);
const data = new URL('../data/', import.meta.url);
const context = vm.createContext({});
context.window = context;
for (const name of ['lessons.js', 'regions.js', 'study.js']) {
  vm.runInContext(await readFile(new URL(name, app), 'utf8'), context, { filename: name });
}
const phrases = vm.runInContext('studyPhrases', context);
const dictionary = context.AJIMI_WORDS;
const vocabulary = Object.fromEntries(Object.entries(dictionary).map(([key, [japanese, kana, romaji, english]]) =>
  [key, { japanese, kana, romaji, english }]));
const lessons = Object.values(context.AJIMI_REGIONS).map(lesson => {
  const [noun, english] = phrases[lesson.id];
  const parts = [noun, 'particle-o', 'tech-' + lesson.technique.key];
  return { ...lesson, phrase: { parts, japanese: parts.map(k => vocabulary[k].japanese).join(''), english, audio: 'audio/phrase-' + lesson.id + '.mp3' } };
});
await mkdir(data, { recursive:true });
for (const [file, value] of [['lessons.json', lessons], ['vocabulary.json', vocabulary]]) {
  await writeFile(new URL(file, data), JSON.stringify(value, null, 2) + '\n');
}
console.log(lessons.length + ' regional lessons and ' + Object.keys(vocabulary).length + ' vocabulary entries');
