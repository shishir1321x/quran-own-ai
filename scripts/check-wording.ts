// For a NATIVE READER of Bengali and Arabic: every sentence of the animal answers, in English, Bengali and Arabic
// side by side, with real numbers from the data: `npm run check-wording`.
// Read each Bengali and Arabic line against the English one; change what reads wrong in src/templates.ts
// (the sentences) or src/animals.ts (the names), then run `npm test`.
// The Arabic lines show every number form on purpose (1, 2, 3-10, 11 and more), because the noun changes with it.
import { loadQuran } from '../src/data.js';
import { ANIMALS, animalHits, animalsIn, type AnimalHit } from '../src/animals.js';
import { MSG, STAT_TEXT, SUGGEST } from '../src/templates.js';
import { prophetsIn } from '../src/prophets.js';
import { isAllahForm, wordFrequency } from '../src/wordfreq.js';
import type { Lang } from '../src/types.js';

const LANGS: Lang[] = ['en', 'bn', 'ar'];
const q = loadQuran();
const all = animalHits(q);
const names = (l: Lang, list: AnimalHit[]) => list.map((h) => h.kind.name[l]).join(l === 'ar' ? '، ' : ', ');
const show = (title: string, pick: (l: Lang) => string) => {
  console.log(`\n## ${title}`);
  for (const l of LANGS) console.log(`  ${l}: ${pick(l)}`);
};
const mention = (id: string, surah?: number) => {
  const h = animalsIn(q, surah).find((x) => x.kind.id === id);
  const kind = ANIMALS.find((k) => k.id === id)!;
  return { name: kind.name, times: h ? h.ayahs.reduce((n, y) => n + y.times, 0) : 0, ayahs: h?.ayahs.length ?? 0 };
};

console.log('# The names of the animals (English | Bengali | Arabic)');
for (const k of ANIMALS) console.log(`  ${k.name.en.padEnd(9)} | ${k.name.bn} | ${k.name.ar}`);

const surahName = (s: number) => ({ tr: q.chapters[s - 1].tr, ar: q.chapters[s - 1].ar });
const n = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;

show(`Which animals / how many, the whole Quran (${n(all.length, 'kind', 'kinds')})`, (l) => STAT_TEXT.animals(all.length, names(l, all), null)[l]);
for (const s of [2, 105, 1]) {
  const list = animalsIn(q, s);
  show(`The same for one surah: ${q.chapters[s - 1].tr} (${n(list.length, 'kind', 'kinds')})`, (l) => STAT_TEXT.animals(list.length, names(l, list), surahName(s))[l]);
}
for (const id of ['elephant', 'spider', 'dog', 'cow']) {
  const m = mention(id);
  show(`How many times: ${id} (${n(m.times, 'time', 'times')} in ${n(m.ayahs, 'ayah', 'ayahs')})`, (l) => STAT_TEXT.animalMentions([m], null, Math.min(m.ayahs, 10), m.ayahs)[l]);
}
show('How many times, in one surah: dog in Al-Kahf', (l) => STAT_TEXT.animalMentions([mention('dog', 18)], surahName(18), 2, 2)[l]);
show('Not in that surah: elephant in Al-Baqara', (l) => STAT_TEXT.animalMentions([mention('elephant', 2)], surahName(2), 0, 0)[l]);
show('Two animals in one question: horse and mule', (l) => STAT_TEXT.animalMentions([mention('horse'), mention('mule')], null, 6, 6)[l]);
show('A number was asked, but there is nothing to count', (l) => MSG.dataNotUnderstood[l]);
show('The hint under "ayahs about animals"', (l) => MSG.animalsHint[l]);

// the sajdah answers (they name the places where scholars differ, and decide nothing)
show('How many sajdah ayahs (15 places in the Tanzil list)', (l) => STAT_TEXT.sajdaCount(q.sajdas.length)[l]);
show('The list of the sajdah ayahs', (l) => STAT_TEXT.sajdaList[l]);

// the most used words, and the name Allah (src/wordfreq.ts)
{
  const wf = wordFrequency(q);
  const content = wf.content.filter((w) => w.n === wf.content[0].n);
  const next = wf.content.filter((w) => !isAllahForm(w.word)).slice(1, 9);
  show('The most used word in the Quran', (l) => STAT_TEXT.wordFreq({ surah: null, total: wf.total, most: [wf.ranked[0]], content, allah: { alone: wf.allah.alone, all: wf.allah.all }, next })[l]);
  const ik = wordFrequency(q, 112);
  show('The most used words in one surah, with a tie (Al-Ikhlas)', (l) => STAT_TEXT.wordFreq({ surah: surahName(112), total: ik.total, most: ik.ranked.filter((w) => w.n === 2), content: ik.content.filter((w) => w.n === 2), allah: null, next: [] })[l]);
  show('How many times the name Allah is there', (l) => STAT_TEXT.allahCount({ surah: null, ...wf.allah })[l]);
}

// the prophets (src/prophets.ts), talking to the assistant, follow-ups, and the suggestions under an answer
{
  const ph = prophetsIn(q);
  show(`The prophets named in the Quran (${ph.length})`, (l) => STAT_TEXT.prophets(ph.length, ph.map((h) => h.prophet.name[l]).join(l === 'ar' ? '، ' : ', '), null)[l]);
  const one = ph.find((h) => h.prophet.id === 'musa')!;
  show('How many times a prophet is named: Musa', (l) => STAT_TEXT.prophetMentions([{ name: one.prophet.name, times: one.ayahs.reduce((n, y) => n + y.times, 0), ayahs: one.ayahs.length }], null, 10, one.ayahs.length)[l]);
  for (const k of ['myName', 'personal', 'compliment', 'chat', 'moreSearch', 'noMore'] as const) show(`Message: ${k}`, (l) => MSG[k][l]);
  show('Message: endOfSurah', (l) => MSG.endOfSurah('Al-Ikhlaas')[l]);
  for (const w of ['en', 'bn', 'none'] as const) show(`Message: sameAyahs (${w})`, (l) => MSG.sameAyahs(w)[l]);
  show('Suggestions: examples', (l) => SUGGEST.starters[l].join(' | '));
  show('Suggestions: numbers', (l) => SUGGEST.facts[l].join(' | '));
  show('Suggestions: after ayahs', (l) => [SUGGEST.more[l], SUGGEST.nextAyah[l], SUGGEST.nextSurah[l], SUGGEST.explain('2:255')[l], SUGGEST.inEnglish[l], SUGGEST.inBengali[l], SUGGEST.arabicOnly[l]].join(' | '));
}
