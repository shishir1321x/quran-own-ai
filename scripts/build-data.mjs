// Builds data/quran.json from public files. Run once: `npm run build-data`.
// Sources (all from the open dataset https://github.com/risan/quran-json):
//   Arabic (display)  tanzil/uthmani.json       Tanzil, CC BY 3.0, verbatim only
//   Arabic (matching) tanzil/simple-clean.json  Tanzil, used ONLY to search (never shown)
//   English           quranenc/english_saheeh.json   Saheeh International via QuranEnc
//   Bengali           quranenc/bengali_zakaria.json  Dr. Abu Bakr Muhammad Zakaria via QuranEnc
//   Chapters          tanzil/chapters.json
// The translation TEXT is stored as published (nothing inside it is edited). Footnotes are not
// stored (they are a separate field and very large). The bismillah welded to ayah 1 of surahs 2-114 (except 9)
// is cut off the Arabic (see withoutBismillah below); nothing else in the Arabic is touched. QuranEnc and Tanzil have conditions
// (credit, version, no changes): see README "Licences" and have the supervisor confirm them.
//
// Usage:  node scripts/build-data.mjs                 download from GitHub
//         node scripts/build-data.mjs --local <dir>   read from a local copy of the repo's data/ folder
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RAW = 'https://raw.githubusercontent.com/risan/quran-json/main/data';
const FILES = {
  uthmani: 'tanzil/uthmani.json',
  clean: 'tanzil/simple-clean.json',
  en: 'quranenc/english_saheeh.json',
  bn: 'quranenc/bengali_zakaria.json',
  chapters: 'tanzil/chapters.json',
};
const COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

const localIdx = process.argv.indexOf('--local');
const localDir = localIdx > 0 ? process.argv[localIdx + 1] : null;

async function load(name) {
  if (localDir) return JSON.parse(readFileSync(join(localDir, FILES[name]), 'utf8'));
  const res = await fetch(`${RAW}/${FILES[name]}`);
  if (!res.ok) throw new Error(`${FILES[name]}: HTTP ${res.status}`);
  return await res.json();
}

const [uth, clean, en, bn, ch] = await Promise.all(['uthmani', 'clean', 'en', 'bn', 'chapters'].map(load));

// Tanzil puts the bismillah in front of the FIRST ayah of every surah (2 to 114, except 9). It is not part of
// that ayah, so showing it there is wrong ("2:1" is only "الٓمٓ"), and it would skew searches and word counts.
// Only the bismillah that is welded to ayah 1 is cut off; surah 1 keeps it, because there it IS ayah 1.
const plain = (s) => s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[أإآٱ]/g, 'ا');
const BISMILLAH = 'بسم الله الرحمن الرحيم';
let stripped = 0;
function withoutBismillah(text, s, a) {
  if (a !== 1 || s === 1 || s === 9) return text;
  const words = text.split(' ');
  if (plain(words.slice(0, 4).join(' ')) !== BISMILLAH) throw new Error(`surah ${s}: ayah 1 does not start with the bismillah`);
  stripped++;
  return words.slice(4).join(' ');
}

const ayahs = [];
for (let s = 1; s <= 114; s++) {
  const n = COUNTS[s - 1];
  for (const [name, src] of [['uthmani', uth], ['clean', clean], ['en', en], ['bn', bn]]) {
    if (!Array.isArray(src[String(s)]) || src[String(s)].length !== n) {
      throw new Error(`${name}: surah ${s} has ${src[String(s)]?.length} ayahs, expected ${n}`);
    }
  }
  for (let a = 1; a <= n; a++) {
    const row = (src) => {
      const r = src[String(s)][a - 1];
      if (r.chapter !== s || r.verse !== a) throw new Error(`order problem at ${s}:${a}`);
      return String(r.text ?? '');
    };
    ayahs.push([s, a, withoutBismillah(row(uth), s, a), withoutBismillah(row(clean), s, a), row(en), row(bn)]);
  }
}
if (ayahs.length !== 6236) throw new Error(`expected 6236 ayahs, got ${ayahs.length}`);
if (stripped !== 224) throw new Error(`expected to cut 112 + 112 bismillahs, cut ${stripped}`);
if (ayahs.some((r) => !r[2] || !r[3])) throw new Error('an Arabic ayah became empty');

const chapters = ch.chapters.map((c) => ({
  id: c.id, ar: c.name, tr: c.transliteration, en: c.translation, type: c.type, n: c.total_verses,
}));
if (chapters.length !== 114 || chapters.some((c, i) => c.n !== COUNTS[i])) throw new Error('chapters do not match the ayah counts');

const juz = (ch.indexes?.juzs ?? []).map((j) => [j.sura, j.aya]);   // Tanzil's own list: where each of the 30 juz (para) starts
if (juz.length !== 30 || juz.some(([s, a], i) => !(s >= 1 && s <= 114 && a >= 1 && a <= COUNTS[s - 1]) || (i > 0 && (s < juz[i - 1][0] || (s === juz[i - 1][0] && a <= juz[i - 1][1]))))) {
  throw new Error('juz list from Tanzil is not 30 increasing, valid positions');
}

// More of Tanzil's own structure data: the 604 pages of the Madani mushaf, the 240 hizb quarters, the 15 sajdah ayahs.
const startList = (list) => (list ?? []).map((x) => [x.sura, x.aya]);
const pages = startList(ch.indexes?.pages);
const hizbs = startList(ch.indexes?.hizbs);
const sajdas = (ch.indexes?.sajdas ?? []).map((x) => [x.sura, x.aya, x.type]);
if (pages.length !== 604 || hizbs.length !== 240 || sajdas.length !== 15) throw new Error('Tanzil pages, hizbs or sajdas do not have the expected size');
for (const [s, a] of [...pages, ...hizbs, ...sajdas]) if (!(s >= 1 && s <= 114 && a >= 1 && a <= COUNTS[s - 1])) throw new Error(`bad position ${s}:${a} in Tanzil structure data`);

const out = {
  meta: {
    built: new Date().toISOString().slice(0, 10),
    columns: ['surah', 'ayah', 'arabic (Uthmani, shown)', 'arabic (simple-clean, search only)', 'english', 'bengali'],
    sources: [
      { what: 'Arabic text', name: 'Tanzil Quran Text (Uthmani, simple-clean)', terms: 'Creative Commons Attribution 3.0; verbatim copies only', url: 'https://tanzil.net' },
      { what: 'English translation', name: 'Saheeh International, QuranEnc english_saheeh v1.1.2', terms: 'QuranEnc re-publication conditions: credit, version, no changes', url: 'https://quranenc.com' },
      { what: 'Bengali translation', name: 'Dr. Abu Bakr Muhammad Zakaria, QuranEnc bengali_zakaria v1.1.1', terms: 'QuranEnc re-publication conditions: credit, version, no changes', url: 'https://quranenc.com' },
      { what: 'Open dataset the files came from', name: 'risan/quran-json', terms: 'CC BY-SA 4.0 for the dataset; each source keeps its own terms', url: 'https://github.com/risan/quran-json' },
    ],
  },
  chapters,
  juz,
  pages,
  hizbs,
  sajdas,
  ayahs,
};
mkdirSync('data', { recursive: true });
writeFileSync('data/quran.json', JSON.stringify(out));

// The translators' own explanatory notes (footnotes), word for word. Shown only when the person asks for an explanation.
// Only the <b> </b> tags are taken out (they are formatting); nothing else in a note is changed.
const noteOf = (src, s, a) => String(src[String(s)][a - 1].footnotes ?? '').replace(/<\/?b>/g, '').trim();
const notes = { meta: {
  en: 'Saheeh International footnotes, via QuranEnc.com (english_saheeh v1.1.2)',
  bn: 'Dr. Abu Bakr Muhammad Zakaria footnotes, via QuranEnc.com (bengali_zakaria v1.1.1)',
}, en: {}, bn: {} };
for (let s = 1; s <= 114; s++) {
  for (let a = 1; a <= COUNTS[s - 1]; a++) {
    const e = noteOf(en, s, a), n = noteOf(bn, s, a);
    if (e) notes.en[`${s}:${a}`] = e;
    if (n) notes.bn[`${s}:${a}`] = n;
  }
}
writeFileSync('data/notes.json', JSON.stringify(notes));
console.log(`data/notes.json written: ${Object.keys(notes.en).length} English notes, ${Object.keys(notes.bn).length} Bengali notes`);
console.log(`data/quran.json written: ${ayahs.length} ayahs, ${chapters.length} chapters`);
