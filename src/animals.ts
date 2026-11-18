// The animals that the Quran names: "how many animals are mentioned in the Quran?", "which animals ...?".
//
// The LIST OF KINDS and their words are chosen by hand. The AYAHS are not: they are found in the data.
// An ayah counts for an animal only if BOTH are true:
//   - the Arabic text (simple-clean) has a word that begins with one of its Arabic stems
//     (after the usual prefixes و ف ب ل ك ال), and
//   - the English translation of the SAME ayah (Saheeh International) has its English word.
// The two checks catch each other's mistakes: ابل is in "Iblis" (no "camel" in English), حمر also means
// "red" (no "donkey"), جان also means "jinn" (no "snake"), عجل also means "haste" (no "calf").
// A word the translator added in [brackets] has no Arabic word under it, so it is not counted either.
//
// Rules for the count: each kind is counted once (a calf with the cow, a ewe with the sheep, a she-camel with
// the camel); general words (birds, livestock, creatures, beasts) are not kinds and are not counted.
// HAVE THIS LIST CHECKED by a person who knows the Quran (`npm run check-themes animals` prints every ayah).
// The Bengali and Arabic names need a native reader too, like the sentences in templates.ts.
import type { Quran } from './data.js';
import type { Lang } from './types.js';
import { normAr } from './text.js';

export interface AnimalKind {
  id: string;
  name: Record<Lang, string>;
  /** Arabic stems, written as normAr writes them (ة -> ه, ى -> ي, no hamza on alif) */
  ar: string[];
  /** the English word(s) in the Saheeh International translation */
  en: RegExp;
}

export const ANIMALS: AnimalKind[] = [
  { id: 'cow', name: { en: 'cow', bn: 'গরু', ar: 'البقرة' }, ar: ['بقر', 'عجل'], en: /\b(?:cows?|cattle|heifer|calf)\b/i },
  { id: 'camel', name: { en: 'camel', bn: 'উট', ar: 'الإبل' }, ar: ['ناقه', 'جمل', 'ابل', 'بعير', 'جمالت', 'عشار', 'بدن', 'هيم', 'ضامر', 'ركاب'], en: /\bcamels?\b|she-camel/i },
  { id: 'horse', name: { en: 'horse', bn: 'ঘোড়া', ar: 'الخيل' }, ar: ['خيل', 'جياد'], en: /\b(?:race)?horses?\b|\bsteeds?\b/i },
  { id: 'mule', name: { en: 'mule', bn: 'খচ্চর', ar: 'البغال' }, ar: ['بغال'], en: /\bmules?\b/i },
  { id: 'donkey', name: { en: 'donkey', bn: 'গাধা', ar: 'الحمار' }, ar: ['حمار', 'حمير', 'حمر'], en: /\bdonkeys?\b|\basses?\b/i },
  { id: 'dog', name: { en: 'dog', bn: 'কুকুর', ar: 'الكلب' }, ar: ['كلب'], en: /\bdogs?\b/i },
  { id: 'wolf', name: { en: 'wolf', bn: 'নেকড়ে', ar: 'الذئب' }, ar: ['ذئب'], en: /\bwolf\b/i },
  { id: 'elephant', name: { en: 'elephant', bn: 'হাতি', ar: 'الفيل' }, ar: ['فيل'], en: /\belephants?\b/i },
  { id: 'ant', name: { en: 'ant', bn: 'পিঁপড়া', ar: 'النمل' }, ar: ['نمل'], en: /\bants?\b/i },
  { id: 'bee', name: { en: 'bee', bn: 'মৌমাছি', ar: 'النحل' }, ar: ['نحل'], en: /\bbees?\b/i },
  { id: 'spider', name: { en: 'spider', bn: 'মাকড়সা', ar: 'العنكبوت' }, ar: ['عنكبوت'], en: /\bspiders?\b/i },
  { id: 'fly', name: { en: 'fly', bn: 'মাছি', ar: 'الذباب' }, ar: ['ذباب'], en: /\bfly\b|\bflies\b/i },
  { id: 'mosquito', name: { en: 'mosquito', bn: 'মশা', ar: 'البعوضة' }, ar: ['بعوض'], en: /\bmosquito(?:es)?\b/i },
  { id: 'locust', name: { en: 'locust', bn: 'পঙ্গপাল', ar: 'الجراد' }, ar: ['جراد'], en: /\blocusts?\b/i },
  { id: 'louse', name: { en: 'louse', bn: 'উকুন', ar: 'القمل' }, ar: ['قمل'], en: /\blice\b|\blouse\b/i },
  { id: 'frog', name: { en: 'frog', bn: 'ব্যাঙ', ar: 'الضفادع' }, ar: ['ضفادع'], en: /\bfrogs?\b/i },
  { id: 'ape', name: { en: 'ape', bn: 'বানর', ar: 'القردة' }, ar: ['قرده', 'قرد'], en: /\bapes?\b|\bmonkeys?\b/i },
  { id: 'pig', name: { en: 'pig', bn: 'শূকর', ar: 'الخنزير' }, ar: ['خنزير', 'خنازير'], en: /\bswine\b|\bpigs?\b/i },
  { id: 'fish', name: { en: 'fish', bn: 'মাছ', ar: 'الحوت' }, ar: ['حوت', 'حيتان', 'نون'], en: /\bfish\b|\bwhale\b/i },
  { id: 'snake', name: { en: 'snake', bn: 'সাপ', ar: 'الحية' }, ar: ['حيه', 'ثعبان', 'جان'], en: /\bsnakes?\b|\bserpents?\b/i },
  { id: 'crow', name: { en: 'crow', bn: 'কাক', ar: 'الغراب' }, ar: ['غراب'], en: /\bcrows?\b|\braven\b/i },
  { id: 'hoopoe', name: { en: 'hoopoe', bn: 'হুদহুদ পাখি', ar: 'الهدهد' }, ar: ['هدهد'], en: /\bhoopoe\b/i },
  { id: 'quail', name: { en: 'quail', bn: 'সালওয়া (বটের পাখি)', ar: 'السلوى' }, ar: ['سلوي'], en: /\bquails?\b/i },
  { id: 'moth', name: { en: 'moth', bn: 'পতঙ্গ', ar: 'الفراش' }, ar: ['فراش'], en: /\bmoths?\b/i },
  { id: 'sheep', name: { en: 'sheep', bn: 'মেষ (ভেড়া)', ar: 'الضأن' }, ar: ['ضان', 'نعجه', 'نعاج', 'غنم'], en: /\bsheep\b|\bewes?\b/i },
  { id: 'goat', name: { en: 'goat', bn: 'ছাগল', ar: 'المعز' }, ar: ['معز'], en: /\bgoats?\b/i },
  { id: 'lion', name: { en: 'lion', bn: 'সিংহ', ar: 'الأسد (القسورة)' }, ar: ['قسوره'], en: /\blions?\b/i },
];

/**
 * The words a PERSON uses to ask about one animal ("how many times is the cow mentioned?"). English and Banglish:
 * whole words. Bengali: the start of a word (গরুর, হাতির). Arabic: a whole word after و ف ب ل ك ال (written as normAr writes it).
 * Not here on purpose: the names of surahs in English letters (baqarah, naml, nahl, ankabut, fil), and "cattle" (in the
 * translation it is mostly the general word for livestock).
 */
export const ASK_WORDS: Record<string, string[]> = {
  cow: ['cow', 'cows', 'calf', 'heifer', 'goru', 'gorur', 'gabhi', 'bachur', 'গরু', 'গাভী', 'গাভি', 'বাছুর', 'بقره', 'بقر', 'عجل'],
  camel: ['camel', 'camels', 'she-camel', 'uter', 'উট', 'উটনী', 'ناقه', 'جمل', 'ابل', 'بعير'],
  horse: ['horse', 'horses', 'ghora', 'ghoda', 'ঘোড়া', 'ঘোড়', 'خيل', 'حصان'],
  mule: ['mule', 'mules', 'khochor', 'khochchor', 'খচ্চর', 'بغل', 'بغال'],
  donkey: ['donkey', 'donkeys', 'gadha', 'গাধা', 'حمار', 'حمير'],
  dog: ['dog', 'dogs', 'kukur', 'kukurer', 'কুকুর', 'كلب'],
  wolf: ['wolf', 'wolves', 'nekre', 'nekde', 'নেকড়ে', 'ذئب'],
  elephant: ['elephant', 'elephants', 'hati', 'hatir', 'haati', 'হাতি', 'فيل'],
  ant: ['ant', 'ants', 'pipra', 'pipre', 'pipda', 'পিঁপড়', 'পিপড়', 'نمل', 'نمله'],
  bee: ['bee', 'bees', 'honeybee', 'moumachi', 'mowmachi', 'মৌমাছি', 'نحل', 'نحله'],
  spider: ['spider', 'spiders', 'makorsha', 'makorsa', 'মাকড়সা', 'মাকড়শা', 'عنكبوت'],
  fly: ['fly', 'flies', 'housefly', 'machi', 'মাছি', 'ذباب', 'ذبابه'],
  mosquito: ['mosquito', 'mosquitoes', 'gnat', 'mosha', 'মশা', 'بعوضه', 'بعوض'],
  locust: ['locust', 'locusts', 'pongopal', 'পঙ্গপাল', 'جراد', 'جراده'],
  louse: ['louse', 'lice', 'ukun', 'উকুন', 'قمل', 'قمله'],
  frog: ['frog', 'frogs', 'byang', 'ব্যাঙ', 'ضفدع', 'ضفادع'],
  ape: ['ape', 'apes', 'monkey', 'monkeys', 'banor', 'bandor', 'বানর', 'বাঁদর', 'قرد', 'قرده'],
  pig: ['pig', 'pigs', 'swine', 'shukor', 'sukor', 'শূকর', 'শুকর', 'خنزير', 'خنازير'],
  fish: ['fish', 'whale', 'machh', 'timi', 'মাছ', 'তিমি', 'حوت', 'سمك'],
  snake: ['snake', 'snakes', 'serpent', 'serpents', 'shap', 'সাপ', 'حيه', 'ثعبان', 'افعي'],
  crow: ['crow', 'crows', 'raven', 'কাক', 'غراب'],
  hoopoe: ['hoopoe', 'hudhud', 'হুদহুদ', 'هدهد'],
  quail: ['quail', 'quails', 'salwa', 'বটের', 'সালওয়া', 'সাল্ওয়া', 'سلوي'],
  moth: ['moth', 'moths', 'পতঙ্গ', 'فراش', 'فراشه'],
  sheep: ['sheep', 'ewe', 'ewes', 'lamb', 'bhera', 'vera', 'ভেড়া', 'মেষ', 'ضان', 'غنم', 'نعجه', 'خروف'],
  goat: ['goat', 'goats', 'chagol', 'chagal', 'ছাগল', 'معز', 'ماعز'],
  lion: ['lion', 'lions', 'singho', 'shingho', 'সিংহ', 'اسد', 'قسوره'],
};

export interface AnimalHit { kind: AnimalKind; ayahs: Array<{ s: number; a: number; times: number }> }

const AR_LETTER = '\\u0600-\\u06FF';
/** A word that begins with the stem: optional و/ف, then ب/ل/ك, then ال/لل; at most 3 more letters (ه، ها، ات، ين ...). */
export const stemRe = (stems: string[], flags = '') =>
  new RegExp(`(?<![${AR_LETTER}])(?:و|ف)?(?:ب|ل|ك)?(?:ال|لل)?(?:${stems.join('|')})[${AR_LETTER}]{0,3}(?![${AR_LETTER}])`, flags);

// "surah al-baqarah", "সূরা নামল", "سورة البقرة": the name of a surah is not a question about the animal
const SURAH_NAME = /(?:\bsurah|\bsura|সূরা|سوره|سورة)\s+(?:(?:al|an|as|at|ar|ash|ad|az|ath|ul)[\s-]+)?\S+/gi;
/** The question without "surah X" in it (the word surah and the name that follows). */
export const withoutSurahName = (question: string) => question.normalize('NFC').replace(SURAH_NAME, ' ');

/** The animal kinds a question asks about by name ("how many times is the COW mentioned?"), in the order of the list. */
export function animalKindsIn(question: string): AnimalKind[] {
  const text = normAr(question.normalize('NFC')).replace(SURAH_NAME, ' ').toLowerCase();
  const latin = new Set(text.match(/[a-z]+(?:-[a-z]+)?/g) ?? []);
  const arabic = (text.match(/[؀-ۿ]+/g) ?? []).flatMap((w) => {
    const out = [w];
    for (const re of [/^(?:و|ف)/, /^(?:ب|ل|ك)/, /^(?:ال|لل)/]) { const last = out[out.length - 1]; if (re.test(last) && last.length > 3) out.push(last.replace(re, '')); }
    return out;
  });
  return ANIMALS.filter((kind) => (ASK_WORDS[kind.id] ?? []).some((w) => {
    if (/^[a-z-]+$/.test(w)) return latin.has(w);
    if (/[ঀ-৿]/.test(w)) return new RegExp(`(?<![\\u0980-\\u09FF])${w.normalize('NFC')}`).test(text);
    return arabic.includes(w);
  }));
}

let cache: { q: Quran; hits: AnimalHit[] } | null = null;

/** Every animal kind with the ayahs that name it, in the order of the Quran (by the first ayah). Computed once. */
export function animalHits(q: Quran): AnimalHit[] {
  if (cache?.q === q) return cache.hits;
  const arabic = q.ayahs.map((y) => normAr(y.arc));
  const hits = ANIMALS.map((kind) => {
    const re = stemRe(kind.ar);
    const every = stemRe(kind.ar, 'g');
    const ayahs = q.ayahs.flatMap((y, i) => (re.test(arabic[i]) && kind.en.test(y.en)
      ? [{ s: y.s, a: y.a, times: arabic[i].match(every)?.length ?? 1 }] : []));
    return { kind, ayahs };
  }).filter((h) => h.ayahs.length > 0);
  const first = (h: AnimalHit) => h.ayahs[0].s * 1000 + h.ayahs[0].a;
  hits.sort((x, y) => first(x) - first(y));
  cache = { q, hits };
  return hits;
}

/** The animals named in one surah (in the order that surah names them), or in the whole Quran. */
export function animalsIn(q: Quran, surah?: number): AnimalHit[] {
  const all = animalHits(q);
  if (!surah) return all;
  return all.map((h) => ({ kind: h.kind, ayahs: h.ayahs.filter((x) => x.s === surah) })).filter((h) => h.ayahs.length > 0)
    .sort((x, y) => x.ayahs[0].a - y.ayahs[0].a);   // stable: a tie keeps the order of the whole Quran
}
