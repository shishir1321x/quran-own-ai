// Which surah is the user talking about? ("Surah Al-Baqarah", "baqara", "সূরা ফাতিহা", "سورة الإخلاص")
import type { Quran } from './data.js';
import { latinSkeleton, makeSkeletonIndex } from './fuzzy.js';
import { normAr, tokensAr, wordsBn, wordsEn } from './text.js';

/** Spelling-insensitive key for a Latin surah name: Al-Baqara = baqarah = Baqarah. */
export function skey(s: string): string {
  let k = s.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z]/g, '');
  k = k.replace(/aa+/g, 'a').replace(/ee+|ii+/g, 'i').replace(/oo+|ou|uu+/g, 'u');
  // Take off the article BEFORE merging double letters, or "at-talaq" would lose its first t.
  for (const art of ['adh', 'ath', 'ash', 'al', 'an', 'ar', 'as', 'at', 'az', 'ad']) {
    if (k.startsWith(art) && k.length - art.length >= 3) { k = k.slice(art.length); break; }
  }
  return k.replace(/(.)\1+/g, '$1').replace(/h$/, '');
}

const EXTRA_LATIN: Record<string, number> = {
  bakara: 2, bakarah: 2, fateha: 1, fatihah: 1, tauba: 9, touba: 9, tawba: 9, bara: 9, kausar: 108, kaferun: 109, kafirun: 109, falak: 113,
  iqra: 96, lahab: 111, inshirah: 94, zilzal: 99, yousuf: 12, israil: 17, yaseen: 36, yasin: 36, ayatul: 0,
};
// Names that are also ordinary words or names: only accepted together with the word "surah".
const SAFE_WITHOUT_SURAH_WORD = new Set(['fatiha', 'baqara', 'ikhlas', 'falaq', 'kawthar', 'kafirun', 'yasin', 'kahf', 'waqia']);

const BENGALI_NAMES: Array<[RegExp, number]> = [
  [/ফাতিহা|ফাতেহা/, 1], [/বাকারা|বাক্বারা/, 2], [/ইমরান/, 3], [/নিসা/, 4], [/মায়িদা|মায়েদা/, 5], [/কাহফ|কাহ্ফ/, 18], [/ইউসুফ/, 12], [/মারইয়াম|মরিয়ম/, 19],
  [/লুকমান|লোকমান/, 31], [/সাজদা/, 32], [/নূর/, 24], [/ইয়াসিন|ইয়াসীন/, 36], [/রহমান/, 55], [/ওয়াকিয়া|ওয়াকিআ/, 56], [/মুলক|মুল্ক/, 67],
  [/দুহা|দোহা/, 93], [/ইনশিরাহ|ইনশিরাহ/, 94], [/তীন|তিন/, 95], [/আলাক/, 96], [/কদর|ক্বদর/, 97], [/যিলযাল|জিলজাল/, 99], [/তাকাসুর/, 102], [/আসর/, 103],
  [/হুমাযাহ|হুমাজাহ/, 104], [/ফীল|ফিল/, 105], [/কুরাইশ/, 106], [/মাউন/, 107], [/কাউসার|কাওসার/, 108], [/কাফিরুন|কাফেরুন/, 109], [/নাসর/, 110],
  [/মাসাদ|লাহাব/, 111], [/ইখলাস|এখলাস/, 112], [/ফালাক|ফালাক্ব/, 113], [/নাস\b|^নাস$|সূরা\s*নাস/, 114],
];

const SURAH_WORD = /\b(surah|sura|surat|soorah)\b|সূরা|সুরা|সূরাহ|سورة|سوره/i;

// Bengali names that are not ordinary words: accepted even without the word "সূরা" ("বাকারার শেষ ২ আয়াত").
const SAFE_BENGALI = /ফাতিহা|ফাতেহা|বাকারা|বাক্বারা|ইখলাস|এখলাস|ফালাক|কাউসার|কাওসার|কাফিরুন|কাফেরুন|ইয়াসিন|ইয়াসীন|কাহফ|ওয়াকিয়া|ওয়াকিআ/;

const ORDINAL = '(?:st|nd|rd|th)?';
const SURAH_NUMBER_PATTERNS: RegExp[] = [
  /(?:which|what)\s+(?:surah|sura|chapter)\s+is\s+(?:the\s+)?(\d{1,3})(?:st|nd|rd|th)\b/i,
  /(?:which|what)\s+(?:surah|sura|chapter)\b.{0,25}?(?:number|no\.?|#)\s*(\d{1,3})\b/i,
  /\b(?:surah|sura|chapter)\s*(?:no\.?|number|#)?\s*(\d{1,3})\b(?!\s*[:：])/i,
  new RegExp(`\\b(\\d{1,3})${ORDINAL}\\s*(?:no\\.?\\s*)?(?:surah|sura|chapter)\\b`, 'i'),
  /সূরা\s*(?:নং|নম্বর)?\s*(\d{1,3})/,
  /(\d{1,3})\s*(?:নং|নম্বর|তম)?\s*সূরা/,
  /(?:سورة|السورة)\s*(?:رقم)?\s*(\d{1,3})/,
];

/** "surah 36", "36th surah", "which surah is number 55", "৩৬ নম্বর সূরা" (digits already turned into 0-9). */
export function surahNumber(text: string): number | null {
  for (const re of SURAH_NUMBER_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 114) return n;
    }
  }
  return null;
}

export interface SurahFinder { find(text: string): number | null; name(s: number): string }

export function makeSurahFinder(q: Quran): SurahFinder {
  const byKey = new Map<string, number>();
  for (const c of q.chapters) if (!byKey.has(skey(c.tr))) byKey.set(skey(c.tr), c.id);
  for (const [k, v] of Object.entries(EXTRA_LATIN)) if (v > 0) byKey.set(skey(k), v);
  // Another spelling of a Latin name ("bakara", "bakarah", "baqarah"): the consonants decide. A skeleton that
  // two surahs share is never guessed.
  const bySkeleton = makeSkeletonIndex<number>([...byKey.entries()], latinSkeleton, 3);
  const byArabic = new Map<string, number>();
  for (const c of q.chapters) byArabic.set(tokensAr(normAr(c.ar)).join('') || normAr(c.ar), c.id);

  return {
    name: (s) => q.chapters[s - 1].tr,
    find(text: string): number | null {
      const hasWord = SURAH_WORD.test(text);
      // Latin names, one or two words ("ya sin")
      const words = wordsEn(text);
      for (let n = 2; n >= 1; n--) {
        for (let i = 0; i + n <= words.length; i++) {
          const key = skey(words.slice(i, i + n).join(''));
          const id = key.length >= 2 ? byKey.get(key) : undefined;
          if (!id) continue;
          if (hasWord || (key.length >= 5 && SAFE_WITHOUT_SURAH_WORD.has(key))) return id;
        }
      }
      // the same names in another spelling
      for (let n = 2; n >= 1; n--) {
        for (let i = 0; i + n <= words.length; i++) {
          const key = skey(words.slice(i, i + n).join(''));
          // two words ("ki bolse") are only matched when their consonants are the same; a one-letter slip is
          // tolerated in a single, longer word only. Otherwise two unrelated words would make a surah name.
          const sk = latinSkeleton(key);
          const id = n === 1 ? (bySkeleton.exact(key) ?? (sk.length >= 5 ? bySkeleton.near(key) : null)) : (sk.length >= 4 ? bySkeleton.exact(key) : null);
          // Without the word "surah", the written name must also be long enough ("bakara", not "Bakr": Abu Bakr is a person)
          if (id && (hasWord || (key.length >= 5 && SAFE_WITHOUT_SURAH_WORD.has(skey(q.chapters[id - 1].tr))))) return id;
        }
      }
      // Bengali names: with the word "সূরা", or alone if the name is not an ordinary word
      for (const w of wordsBn(text)) {
        if (!hasWord && !SAFE_BENGALI.test(w)) continue;
        for (const [re, id] of BENGALI_NAMES) if (re.test(w)) return id;
      }
      if (hasWord) {
        // Arabic names
        for (const t of tokensAr(text)) { const id = byArabic.get(t) ?? byArabic.get(`ال${t}`); if (id) return id; }
        for (const c of q.chapters) {
          const plain = normAr(c.ar).replace(/^ال/, '');
          if (plain.length >= 2 && normAr(text).includes(plain)) return c.id;
        }
      }
      return null;
    },
  };
}
