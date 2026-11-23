// Systemic phonetic & transliteration normalizer for Latin/Banglish/Islamic terms.
// Solves spelling variants like maqqi/makki/mekki/mokki, madni/madinee/madani, surrah/soorah/surah,
// ayyah/aayat/ayah, qurbanee/qurbani, shoytaan/shaitan, munafeq/munafiq, zakaat/zakat, taqwah/taqwa,
// ibraheem/ibrahim, dawood/dawud — without ever corrupting real English words or quoted phrases.
import { NON_QURAN_WORDS } from './banglishPhonetic.js';
import { phoneticFirstClass, phoneticTermKey, phoneticTermKeyFlex } from './fuzzy.js';

export { phoneticFirstClass, phoneticTermKey, phoneticTermKeyFlex };

// Structural & high-frequency Quran/question words whose phonetic variants must be recognized BEFORE
// numbers(), surah facts, passages, and theme regexes run.
// Format: [canonicalWord, ...seedVariants]
const CANONICAL_GROUPS: ReadonlyArray<readonly [string, ...string[]]> = [
  // Revelation periods (Meccan / Medinan / Makki / Madani)
  ['makki', 'makki', 'maqqi', 'maqi', 'maki', 'makkee', 'maqqee', 'mekki', 'mecci', 'mokki', 'mokkhi', 'makkiyah', 'makkiya', 'maqqiyah'],
  ['meccan', 'meccan', 'makkan', 'maqqan', 'maccan', 'mekkan', 'meccen', 'makkian', 'meccian'],
  ['madani', 'madani', 'madni', 'madini', 'madinee', 'medini', 'medinee', 'madaniyah', 'madaniya', 'madaniyyah'],
  ['medinan', 'medinan', 'madinan', 'medinen', 'madinen', 'madaniyan'],

  // Core Quran structural nouns
  ['surah', 'surah', 'soorah', 'surrah', 'shurah', 'sorah', 'soora', 'suurah'],
  ['surahs', 'surahs', 'soorahs', 'surrahs', 'shurahs', 'sorahs', 'sooras', 'suurahs'],
  ['ayah', 'ayah', 'ayyah', 'aayah', 'eyah', 'aaya'],
  ['ayahs', 'ayahs', 'ayyahs', 'aayahs', 'aayats', 'ayyats', 'ayaats', 'ayats', 'eyats'],
  ['quran', 'quran', 'quraan', 'kuraan', 'kuran', 'qoran', 'qoraan', 'koran', 'koraan', 'qurann'],
  ['juz', 'juzz', 'jooz', 'joz', 'juuz'],
  ['para', 'paara', 'parah', 'paraa', 'sipara', 'siparah'],
  ['hizb', 'hizb', 'hijb', 'hisb'],
  ['sajdah', 'sajdah', 'sajda', 'sejda', 'sijda', 'sijhda', 'shijda', 'sajdaa', 'sujud', 'sujood', 'sujuud'],
  ['tafsir', 'tafsir', 'tafseer', 'tafsiir', 'tafsier', 'tofseer', 'tofsir'],
  ['hadith', 'hadith', 'hadis', 'hadees', 'hadeeth', 'hadish'],
  ['fatwa', 'fatwa', 'fatawa', 'fatwah', 'fotwa', 'fotowa', 'fatawah'],
  ['halal', 'halal', 'halaal', 'hallal'],
  ['haram', 'haram', 'haraam', 'harram'],
  ['prophet', 'prophet', 'prophit', 'prohet'],
  ['prophets', 'prophets', 'prophits', 'prohets'],
  ['animal', 'animal', 'animel'],
  ['animals', 'animals', 'animels', 'animlas'],

  // Banglish question & prayer words used in early regexes
  ['koyta', 'koyta', 'koita', 'koytaa', 'koitaa'],
  ['koyti', 'koyti', 'koiti'],
  ['koybar', 'koybar', 'koibar', 'kotobar', 'kothobar'],
  ['kotogulo', 'kotogulo', 'kotogula', 'kothogulo'],
  ['somoy', 'somoy', 'shomoy', 'somoi', 'shomoi'],
  ['wakto', 'wakto', 'waqt', 'oakt', 'oakto', 'wakt'],
  ['namaz', 'namaz', 'namaj', 'namaaz', 'namaaj', 'namazz', 'namajj'],
  ['namajer', 'namajer', 'namazer', 'namaajer', 'namaazer'],
];

const EXACT_MAP = new Map<string, string>();
const KEY_MAP = new Map<string, string>();
const FLEX_MAP = new Map<string, string>();

for (const [canon, ...variants] of CANONICAL_GROUPS) {
  for (const v of variants) {
    const lo = v.toLowerCase();
    if (!EXACT_MAP.has(lo)) EXACT_MAP.set(lo, canon);
    const k = phoneticTermKey(lo);
    if (k.length >= 3 && !KEY_MAP.has(k)) KEY_MAP.set(k, canon);
    const kf = phoneticTermKeyFlex(lo);
    if (kf.length >= 4 && !FLEX_MAP.has(kf)) FLEX_MAP.set(kf, canon);
  }
}

// Words that must NEVER be rewritten by phonetic canonicalization (e.g. "sajadah" is a prayer mat, "shura" is a surah/theme).
const PROTECTED = new Set(['sajadah', 'shura', 'sura', 'suras', 'ayat', 'juz', 'para', 'paras', 'hijab']);

/**
 * Rewrite phonetic/transliteration variants of structural Quran & question keywords into their canonical forms
 * (e.g. "how many maqqi surahs are there?" -> "how many makki surahs are there?").
 * Quoted spans, real English words, and non-Quran words are never modified.
 */
export function canonicalizeQuestion(text: string, isEnglish: (w: string) => boolean): string {
  // Split around quoted segments so quoted words/phrases stay verbatim
  const parts = text.split(/(["“”«»'‘’][^"“”«»'‘’]{1,200}["“”«»'‘’])/);
  return parts
    .map((part, idx) => {
      if (idx % 2 === 1) return part; // inside quotes: untouched
      return part.replace(/\b[A-Za-z]{3,}\b/g, (word) => {
        const lo = word.toLowerCase();
        if (PROTECTED.has(lo) || NON_QURAN_WORDS.has(lo)) return word;
        const exact = EXACT_MAP.get(lo);
        if (exact) return exact;
        if (isEnglish(lo)) return word;
        const k = phoneticTermKey(lo);
        const byKey = KEY_MAP.get(k);
        if (byKey && Math.abs(lo.length - byKey.length) <= 3 && phoneticFirstClass(lo) === phoneticFirstClass(byKey)) {
          return byKey;
        }
        if (lo.length >= 4) {
          const kf = phoneticTermKeyFlex(lo);
          const byFlex = FLEX_MAP.get(kf);
          if (byFlex && Math.abs(lo.length - byFlex.length) <= 3 && phoneticFirstClass(lo) === phoneticFirstClass(byFlex)) {
            return byFlex;
          }
        }
        return word;
      });
    })
    .join('');
}

