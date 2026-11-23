// Turning text into comparable words, for English, Bengali and Arabic. The SAME functions are used
// for the Quran texts and for the question, so they always agree.
import { BANGLISH_TO_EN, NAME_TO_EN } from './lexicon.js';
import { editDistance, latinSkeleton, makeSkeletonIndex, phoneticFirstClass, phoneticTermKeyFlex } from './fuzzy.js';

/** Remove a footnote marker like [2] or [১] and a leading verse number like (1), for DISPLAY only. */
export function cleanTranslation(t: string): string {
  return t.replace(/^\s*\(\d+\)\s*/, '').replace(/\[[0-9০-৯]+\]/g, '').replace(/\s{2,}/g, ' ').replace(/\s+([,.;:!?।])/g, '$1').trim();
}

const PUNCT = /[\s.,;:!?"'“”‘’()[\]{}<>\/\\|\-–—_*&^%$#@~`+=।॥؟،؛…0-9০-৯]+/gu;

// ---- English
export function normEn(s: string): string {
  return s.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase();
}
export const STOP_EN = new Set(('a an the of in on at to for from by with and or but not no nor is are was were be been being am do does did done have has had will would shall should can could may might must ' +
  'i me my we us our you your he him his she her it its they them their this that these those there here ' +
  'what which who whom whose when where why how whether if then than so as about into over under again further more most some any each both all such only own same too very just ' +
  'say says said tell show give gives please quran koran ayah ayat verse verses surah sura mention mentioned mentions ' +
  'also let lets get got go goes going want wants need needs like likes think know').split(/\s+/));
/** Irregular English plurals and past-tense verbs mapped to their Quran-text stem. */
const IRREGULAR_EN: Record<string, string> = {
  children: 'child', women: 'woman', men: 'man', wives: 'wife', lives: 'life', thieves: 'thief', wolves: 'wolf',
  feet: 'foot', teeth: 'tooth', mice: 'mous', geese: 'goos', oxen: 'ox',
  forgave: 'forgiv', forgiven: 'forgiv', spoke: 'speak', spoken: 'speak', taught: 'teach', fought: 'fight',
  built: 'build', brought: 'bring', thought: 'think', sought: 'seek', caught: 'catch', wept: 'weep',
  slept: 'sleep', kept: 'keep', felt: 'feel', dealt: 'deal', left: 'leav', lost: 'los', sent: 'send',
  spent: 'spend', lent: 'lend', bent: 'bend', went: 'go', gone: 'go', saw: 'see', seen: 'see',
  knew: 'know', known: 'know', grew: 'grow', grown: 'grow', threw: 'throw', thrown: 'throw',
  blew: 'blow', blown: 'blow', flew: 'fly', flown: 'fly', drew: 'draw', drawn: 'draw',
  wrote: 'writ', written: 'writ', broke: 'break', broken: 'break', chose: 'choos', chosen: 'choos',
  stole: 'steal', stolen: 'steal', swore: 'swear', sworn: 'swear', tore: 'tear', torn: 'tear',
  wore: 'wear', worn: 'wear', bore: 'bear', borne: 'bear', forbade: 'forbid', forbidden: 'forbid',
  ate: 'eat', eaten: 'eat', drank: 'drink', drunk: 'drink', began: 'begin', begun: 'begin',
  ran: 'run', sat: 'sit', stood: 'stand', understood: 'understand', held: 'hold', told: 'tell',
  sold: 'sell', paid: 'pay', laid: 'lay', made: 'mak', gave: 'giv', given: 'giv', took: 'tak',
  taken: 'tak', shook: 'shak', shaken: 'shak', forsook: 'forsak', forsaken: 'forsak',
  arose: 'aris', arisen: 'aris', rose: 'ris', risen: 'ris', drove: 'driv', driven: 'driv',
  rode: 'rid', ridden: 'rid', hid: 'hid', hidden: 'hid', fell: 'fall', fallen: 'fall',
  came: 'com', became: 'becom',
};

/** A light stemmer: patients -> patient, praying -> pray, children -> child, forgave -> forgiv. */
export function stemEn(w: string): string {
  if (w.length <= 3) return w;
  if (IRREGULAR_EN[w]) return IRREGULAR_EN[w];
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ves') && w.length > 4) return w.slice(0, -3) + 'f';
  if (w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('es') && w.length > 4 && /(s|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && w.length > 3) return w.slice(0, -1);
  return w;
}
/** British "-our" spellings to American ("neighbour" -> "neighbor"), because the English text is American. */
export function americanize(w: string): string {
  if (/^(hour|four|pour|tour|your|flour|sour|our|devour|scour)s?$/.test(w)) return w;
  return w.replace(/([a-z]{3,})our(s|ed|ing|able)?$/, '$1or$2');
}
export function tokensEn(s: string): string[] {
  return normEn(s).split(PUNCT).filter((w) => w && /^[a-z]+$/.test(w)).map(americanize).filter((w) => !STOP_EN.has(w)).map(stemEn);
}
/** English words of a question, without stop words and WITHOUT stemming (for the lookup tables). */
export function wordsEn(s: string): string[] {
  // Join Arabic-style internal apostrophes ("ma'al", "Al-A'raf", "qur'an", "muʾminūn") while keeping English contractions ("Allah's", "don't") split.
  const joined = s.replace(/([A-Za-z\u00C0-\u024F\u1E00-\u1EFF])['’‘`ʼʾʿ]+(?!(?:s|t|d|m|ll|re|ve)\b)([A-Za-z\u00C0-\u024F\u1E00-\u1EFF])/gi, '$1$2');
  return normEn(joined).split(PUNCT).filter((w) => w && /^[a-z]+$/.test(w));
}

// ---- Bengali
export function normBn(s: string): string {
  return s
    .normalize('NFC')
    // Join internal apostrophes inside Bengali transliterations ("মা’ওয়া", "লা’নত") so index.bn does not split them.
    .replace(/([\u0980-\u09FF])['’‘`ʼʾʿ]+([\u0980-\u09FF])/g, '$1$2')
    // Remove non-conjunct virama/hasant (trailing "আল্লাহ্" or ZWNJ-separated "আল্লাহ্‌র") before stripping ZWNJ/ZWJ.
    .replace(/\u09CD(?=[\u200c\u200d]|[^\u0995-\u09B9\u09DC-\u09DF]|$)/g, '')
    .replace(/[\u200c\u200d]/g, '')
    .replace(/\[[0-9০-৯]+\]/g, ' ');
}
const STOP_BN = new Set(('আমি আমার আমাকে আমরা তুমি তোমার আপনি আপনার সে তার তারা তাদের এই ওই এটা ওটা এটি কি কী কে কেন কোন কোনো কোথায় কখন কীভাবে কিভাবে কত কতটি কয়টি কয়টা ' +
  'আছে আছি আছেন নেই নাই না হয় হয়ে হয়েছে হবে হল হলো করা করে করতে করুন করেন করি বলা বলে বলো বলেছে বলা হয়েছে জন্য সম্পর্কে নিয়ে থেকে সাথে সঙ্গে ও এবং বা কিন্তু যদি তবে ' +
  'কুরআন কোরআন কুরান কোর আন আয়াত আয়াতে আয়াতগুলো সূরা সুরা দাও দিন দেন দেখাও দেখান বল বলুন একটা একটি কিছু খুব ভাই দাদা কথা বিষয়ে ব্যাপারে ' +
  'রেফারেন্স রেফারেন্সসহ অনুবাদ অনুবাদসহ সহ বাংলা বাংলায় বাংলাতে আরবি আরবী ইংরেজি ইংরেজিতে শব্দ শব্দটি শব্দটা থাকা বাক্য বাক্যটি সংখ্যা কাছে উল্লেখ নির্দেশ রয়েছে ' +
  'আর যে যার হলে নিজে বিধান যোগ করবেন').split(/\s+/));
const BN_SUFFIX = [
  'গুলোকে', 'গুলোর', 'গুলোতে', 'গুলো', 'গুলির', 'গুলি', 'দেরকে', 'দেরও', 'দের', 'গণের', 'গণকে', 'গণ',
  'সমূহের', 'সমূহ', 'টাকে', 'টিকে', 'টার', 'টির', 'খানা', 'খানি', 'য়ের', 'য়ে', 'েরা', 'ের', 'কে', 'রা',
  'তে', 'য়', 'ে', 'র', 'টি', 'টা', 'ও',
];
export function stemBn(w: string): string {
  let cur = w;
  for (let pass = 0; pass < 2; pass++) {
    let changed = false;
    for (const suf of BN_SUFFIX) {
      if (cur.length - suf.length >= 3 && cur.endsWith(suf)) {
        cur = cur.slice(0, -suf.length);
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }
  return cur;
}
/** Spelling-tolerant Bengali form: unifies শ/ষ/স, য/জ, ণ/ন, ী/ি, ূ/ু, ৎ/ত, ড়/ঢ়/র, strips ঁ/ঃ ("সূর্য"=="সুর্য", "চাঁদ"=="চাদ", "ভালোবাসা"=="ভালবাসা"). */
export function bnLooseNorm(w: string): string {
  return normBn(w)
    .replace(/\u09AF\u09BC/g, 'Y')
    .replace(/\u09A1\u09BC|\u09A2\u09BC|\u09DC|\u09DD/g, 'র')
    .replace(/[শষ]/g, 'স')
    .replace(/য/g, 'জ')
    .replace(/ণ/g, 'ন')
    .replace(/ৎ/g, 'ত')
    .replace(/ী/g, 'ি')
    .replace(/ূ/g, 'ু')
    .replace(/ঈ/g, 'ই')
    .replace(/ঊ/g, 'উ')
    .replace(/[ঁঃ]/g, '')
    .replace(/ভালো/g, 'ভাল')
    .replace(/Y/g, '\u09AF\u09BC');
}
export function tokensBn(s: string): string[] {
  const out: string[] = [];
  for (const w of normBn(s).split(PUNCT)) {
    if (!w || !/[\u0980-\u09FF]/.test(w) || STOP_BN.has(w)) continue;
    const stem = stemBn(w);
    if (!STOP_BN.has(stem)) out.push(stem);   // "কুরআনে" -> "কুরআন" is a stop word too
  }
  return out;
}
/** Spelling-tolerant Bengali tokens (so "সুর্য", "চাদ", "পাহার", "ইমান", "নবি", "রসুল", "ভালবাসা" match Dr. Zakaria's text). */
export function tokensBnLoose(s: string): string[] {
  const out: string[] = [];
  for (const w of normBn(s).split(PUNCT)) {
    if (!w || !/[\u0980-\u09FF]/.test(w) || STOP_BN.has(w)) continue;
    const stem = stemBn(w);
    if (STOP_BN.has(stem)) continue;
    const loose = bnLooseNorm(stem);
    if (loose.length >= 2) out.push(loose);
  }
  return out;
}
/** Bengali words of a question as written (no stemming), for the lookup tables. */
export function wordsBn(s: string): string[] {
  return normBn(s).split(PUNCT).filter((w) => w && /[\u0980-\u09FF]/.test(w));
}

// ---- Arabic
export function normAr(s: string): string {
  return s
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
}
const STOP_AR = new Set('ذكر ذكرت يقول يقولون قران قرآن القران القرآن هل ماذا من في على الى إلى عن ما هو هي هل ماذا كيف لماذا اين أين كم هذا هذه ذلك التي الذي ان أن إن لا و ثم او أو يا قال'.split(' ').map((w) => normAr(w)));
export function tokensAr(s: string): string[] {
  return normAr(s).split(PUNCT).filter((w) => w && /[\u0600-\u06FF]/.test(w) && !STOP_AR.has(w)).map((w) => (w.length > 4 && w.startsWith('ال') ? w.slice(2) : w));
}

// Words typed in many spellings ("dhairjo" / "dhoirjo" / "dhorjo"): the consonants decide, guarded by initial sound,
// length proximity, and phonetic distance so unrelated words like "pork", "bilqis", or "sahabir" never falsely collide.
const banglishEntries = Object.entries(BANGLISH_TO_EN).filter(([k]) => /^[a-z]+$/.test(k));
const nameEntries = Object.entries(NAME_TO_EN).filter(([k]) => /^[a-z]+$/.test(k));
const banglishIndex = makeSkeletonIndex(banglishEntries, latinSkeleton);
const nameIndex = makeSkeletonIndex(nameEntries, latinSkeleton);

function buildSourceKeysByTarget(entries: Array<[string, string]>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [k, v] of entries) {
    const arr = map.get(v);
    if (arr) arr.push(k);
    else map.set(v, [k]);
  }
  return map;
}
const banglishKeysByTarget = buildSourceKeysByTarget(banglishEntries);
const nameKeysByTarget = buildSourceKeysByTarget(nameEntries);

function skeletonSafeMatch(
  word: string,
  index: ReturnType<typeof makeSkeletonIndex<string>>,
  keysByTarget: Map<string, string[]>,
  allowNear: boolean,
): string | null {
  const hit = index.exact(word) ?? (allowNear ? index.near(word) : null);
  if (!hit) return null;
  const wf = phoneticFirstClass(word);
  const wkf = phoneticTermKeyFlex(word);
  const sources = keysByTarget.get(hit) ?? [];
  const ok = sources.some((k) =>
    phoneticFirstClass(k) === wf
    && Math.abs(word.length - k.length) <= 2
    && editDistance(wkf, phoneticTermKeyFlex(k)) <= 2);
  return ok ? hit : null;
}

/** Banglish and known Bengali words of a question as ENGLISH words (not stemmed): namaz -> prayer.
 *  `isEnglish` says whether a Latin word is a real English word; those are never "corrected". */
export function mappedEnglishWords(
  s: string,
  isEnglish: (w: string) => boolean = () => false,
  isArabicWord: (w: string) => boolean = () => false,
): string[] {
  const out: string[] = [];
  for (const w of wordsEn(s)) {
    if (BANGLISH_TO_EN[w]) out.push(BANGLISH_TO_EN[w]);
    else if (NAME_TO_EN[w]) out.push(NAME_TO_EN[w]);
    else if (w.length >= 4 && !isEnglish(w)) {
      const m = skeletonSafeMatch(w, banglishIndex, banglishKeysByTarget, false)
        ?? skeletonSafeMatch(w, nameIndex, nameKeysByTarget, !isArabicWord(w));   // another spelling of a known word
      if (m) out.push(m);
    }
  }
  for (const w of s.normalize('NFC').split(/[\s.,;:!?"'“”‘’()\[\]{}<>\/\\|\-–—_*&^%$#@~`+=।॥؟،؛…]+/u)) if (NAME_TO_EN[w]) out.push(NAME_TO_EN[w]);
  for (const w of wordsBn(s)) {
    const ws = stemBn(w);
    for (const [k, v] of Object.entries(BANGLISH_TO_EN)) {
      if (!/[\u0980-\u09FF]/.test(k)) continue;
      const hit = k.length < 3 ? w === k
        : k.length === 3 ? (w === k || ws === k)
          : k.length === 4 ? (w === k || ws === k || w.startsWith(k))
            : (w === k || w.includes(k));
      if (hit) out.push(v);
    }
  }
  return out;
}

// ---- Banglish (Bengali in Latin letters): map known words to English, drop the rest
export function banglishToEn(s: string): string[] {
  const out: string[] = [];
  for (const w of wordsEn(s)) {
    const m = BANGLISH_TO_EN[w];
    if (m) out.push(stemEn(m));
  }
  return out;
}
