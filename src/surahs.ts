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
  // other names, and spellings the consonants cannot reach (too short, or shared with another surah)
  dahr: 76, duha: 93, dhuha: 93, doha: 93, zuha: 93, zoha: 93, toha: 20, twaha: 20, layl: 92, kaf: 50, ahkaf: 46,
  zariyat: 51, zariat: 51, jariyat: 51, dhariyat: 51, kawsar: 108, kauser: 108, kowsar: 108,
};

/** The consonants of a surah name: th is s and dh is z (Muddaththir = Muddassir, Dhariyat = Zariyat), then latinSkeleton. */
const surahSkeleton = (s: string) => latinSkeleton(s.replace(/th/g, 's').replace(/dh/g, 'z'));
/** The first letter's sound class: a vowel, or k for q/k/c, j for j/z ... ("kiyamah" ~ "qiyama", "zinn" ~ "jinn", not "nam" ~ "anam"). */
const firstSound = (k: string) => (/^[aeiouyw]/.test(k) ? 'V' : /^[qkc]/.test(k) ? 'k' : /^[jz]/.test(k) ? 'j' : k[0]);
// Banglish and English words that are never read as a short surah name, even right after "surah"
const NOT_A_SHORT_NAME = new Set(['nam', 'naam', 'jonno', 'jonne', 'kon', 'kono', 'kar', 'kor', 'koro', 'hoy', 'hobe', 'ache', 'ase', 'nai',
  'nei', 'bol', 'bolo', 'dao', 'din', 'den', 'por', 'pore', 'age', 'are', 'ki', 'ta', 'ti', 'ei', 'oi', 'se', 'mon', 'jan', 'jani', 'kaj',
  'kam', 'rat', 'dui', 'one', 'two', 'ten', 'name', 'meaning', 'mean', 'number', 'no', 'from', 'with', 'about', 'many', 'much']);
// Names that are also ordinary words or names: only accepted together with the word "surah".
const SAFE_WITHOUT_SURAH_WORD = new Set(['fatiha', 'baqara', 'ikhlas', 'falaq', 'kawthar', 'kafirun', 'yasin', 'kahf', 'waqia']);

const BENGALI_NAMES: Array<[RegExp, number]> = [
  [/ফাতিহা|ফাতেহা/, 1], [/বাকারা|বাক্বারা/, 2], [/ইমরান/, 3], [/নিসা/, 4], [/মায়িদা|মায়েদা/, 5], [/কাহফ|কাহ্ফ/, 18], [/ইউসুফ/, 12], [/মারইয়াম|মরিয়ম/, 19],
  [/লুকমান|লোকমান/, 31], [/সাজদা/, 32], [/নূর/, 24], [/ইয়াসিন|ইয়াসীন/, 36], [/রহমান/, 55], [/ওয়াকিয়া|ওয়াকিআ/, 56], [/মুলক|মুল্ক/, 67],
  [/দুহা|দোহা/, 93], [/ইনশিরাহ|ইনশিরাহ/, 94], [/^(?:তীন|ত্বীন|তিন)(?:এর|ের|র)?$/, 95], [/আলাক/, 96], [/কদর|ক্বদর/, 97], [/যিলযাল|জিলজাল/, 99], [/তাকাসুর/, 102], [/আসর/, 103],
  [/হুমাযা|হুমাজা/, 104], [/ফীল|ফিল/, 105], [/কুরাইশ/, 106], [/মাউন/, 107], [/কাউসার|কাওসার/, 108], [/কাফিরুন|কাফেরুন/, 109], [/নাসর/, 110],
  [/মাসাদ|লাহাব/, 111], [/ইখলাস|এখলাস/, 112], [/ফালাক|ফালাক্ব/, 113], [/নাস\b|^নাস$|সূরা\s*নাস/, 114],
];
// The other 80 surahs (and more spellings of a few above) in Bengali letters, several common spellings each; a final "হ"
// and a case ending ("হজ্জের", "তাওবায়") may follow. Many are ordinary words or a prophet's name as well (নূহ, ফজর, কলম,
// তালাক, জিন, তওবা, ইবরাহীম), so these count ONLY right next to the word "সূরা": "সূরা হজ্জ", "সূরা আল-ফজর",
// "ফজর সূরার". Never in "ফজর নামাজে কোন সূরা পড়া হয়?". HAVE THESE SPELLINGS CHECKED by a native reader.
const BENGALI_NEXT_TO_SURAH: Array<[RegExp, number]> = ([
  ['আনআম|আনয়াম', 6], ['আরাফ', 7], ['আনফাল', 8], ['তাওবা|তওবা', 9], ['ইউনুস|ইউনূস', 10], ['হূদ|হুদ', 11], ['রাদ|রাআদ|রায়াদ', 13],
  ['ইবরাহীম|ইবরাহিম|ইব্রাহিম|ইব্রাহীম', 14], ['হিজর|হিজ্র', 15], ['নাহল|নাহ্ল|নাহাল', 16], ['ইসরা|বনী|বনি', 17],
  ['ত্বাহা|তাহা|ত্বহা|তোহা|ত্বোহা', 20], ['আম্বিয়া|আনবিয়া', 21], ['হজ্জ|হাজ্জ|হজ|হাজ', 22], ['মুমিনুন|মুমিনূন|মুমেনুন', 23],
  ['ফুরকান|ফুরক্বান', 25], ['শুআরা|শুয়ারা', 26], ['নামল|নাম্ল', 27], ['কাসাস|ক্বাসাস|কাছাছ|কাসাছ', 28], ['আনকাবুত|আনকাবূত', 29],
  ['রূম|রুম', 30], ['আহযাব|আহজাব', 33], ['সাবা', 34], ['ফাতির|ফাত্বির', 35], ['সাফফাত|সাফ্ফাত|সাফাত|ছাফফাত', 37],
  ['সোয়াদ|ছোয়াদ|সাদ|স্বাদ|ছাদ', 38], ['যুমার|জুমার', 39], ['মুমিন|গাফির|গাফের', 40], ['ফুসসিলাত|ফুস্সিলাত|ফুসিলাত', 41],
  ['শূরা|শুরা', 42], ['যুখরুফ|জুখরুফ', 43], ['দুখান|দোখান', 44], ['জাসিয়া|জাছিয়া', 45], ['আহকাফ|আহক্বাফ', 46],
  ['মুহাম্মাদ|মুহাম্মদ', 47], ['ফাতহ|ফাত্হ|ফাতাহ', 48], ['হুজুরাত|হুজরাত', 49], ['ক্বাফ|কাফ', 50], ['যারিয়াত|জারিয়াত|যারিআত', 51],
  ['তূর|তুর', 52], ['নাজম|নজম', 53], ['ক্বামার|কামার|কমর', 54], ['হাদীদ|হাদিদ', 57], ['মুজাদালা|মুজাদিলা', 58],
  ['হাশর', 59], ['মুমতাহিনা|মুমতাহানা', 60], ['সাফ|সফ|ছফ', 61], ['জুমআ|জুমুআ|জুমা|জুম্মা', 62], ['মুনাফিকুন|মুনাফিকূন', 63],
  ['তাগাবুন|তাগাবূন', 64], ['তালাক|ত্বালাক', 65], ['তাহরীম|তাহরিম', 66], ['কলম|ক্বালাম|কালাম', 68], ['হাক্কা', 69],
  ['মাআরিজ|মায়ারিজ', 70], ['নূহ|নুহ', 71], ['জিন|জ্বিন|জীন|জ্বীন', 72], ['মুযযাম্মিল|মুজ্জাম্মিল|মুযাম্মিল|মুজাম্মিল', 73],
  ['মুদ্দাসসির|মুদ্দাছছির|মুদ্দাসির|মুদ্দাস্সির', 74], ['ক্বিয়ামা|কিয়ামা|কিয়ামত|ক্বিয়ামত', 75], ['ইনসান|দাহর', 76], ['মুরসালাত', 77], ['নাবা', 78],
  ['নাযিয়াত|নাজিয়াত|নাযিআত', 79], ['আবাসা', 80], ['তাকভীর|তাকভির|তাকউইর', 81], ['ইনফিতার', 82],
  ['মুতাফফিফীন|মুতাফফিফিন|মুতাফ্ফিফীন', 83], ['ইনশিকাক|ইনশিক্বাক', 84], ['বুরূজ|বুরুজ', 85], ['তারিক|ত্বারিক', 86], ['আলা', 87],
  ['গাশিয়া', 88], ['ফজর|ফাজর', 89], ['বালাদ', 90], ['শামস|শামছ', 91], ['লাইল|লায়ল', 92], ['যুহা|জুহা|দ্বোহা|দ্বুহা', 93],
  ['বাইয়্যিনা|বাইয়িনা|বায়্যিনা|বাইয়েনা', 98], ['আদিয়াত', 100], ['কারিয়া|ক্বারিয়া|কারিআ|ক্বারিআ', 101],
] as Array<[string, number]>).map(([p, id]): [RegExp, number] => [new RegExp(`^(?:${p})হ?(?:এর|ের|র|য়|ে|তে|কে)?$`.normalize('NFC')), id]);
const BENGALI_ALL = [...BENGALI_NAMES, ...BENGALI_NEXT_TO_SURAH];
// "সূরা" itself; "সূরার" / "সূরায়" (of / in the surah) have the name BEFORE them ("ফজর সূরার"), never after
// ("কোন সূরায় নূহ নবীর কথা আছে?" is not Surah Nuh)
const BN_SURAH = new RegExp('^(?:সূরা|সুরা|সূরাহ)$'.normalize('NFC'));
const BN_SURAH_INFLECTED = new RegExp('^(?:সূরা|সুরা)(?:র|য়|তে|টি|টা)$'.normalize('NFC'));
const BN_ARTICLE = new RegExp('^(?:আল|আত|আন|আর|আস|আয|আদ|আশ|আজ|আছ)$'.normalize('NFC'));   // "সূরা আল-ফজর", "সূরা আত-তীন"
const BN_WHICH = new RegExp('^(?:কোন|কোনো|কোনটি|কোনটা|কয়টি|কয়টা|কয়|কত|কতটি|কতগুলো)$'.normalize('NFC'));   // "কোন সূরা নূহ ...?"

const SURAH_WORD = /\b(surah|sura|surat|soorah)\b|সূরা|সুরা|সূরাহ|سورة|سوره/i;
const LATIN_SURAH_WORD = /^(?:surah|sura|surat|soorah|chapter)$/;

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
  // "Al-Ankaboot" is "ankabut", but a person types "ankabut", whose "an" looks like an article and is cut ("kabut"):
  // keep that form too (Al-Anfal, Al-Anbiya, Al-Ankabut, Al-Adiyat ...)
  for (const c of q.chapters) { const k2 = skey(skey(c.tr)); if (!byKey.has(k2)) byKey.set(k2, c.id); }
  for (const [k, v] of Object.entries(EXTRA_LATIN)) if (v > 0) byKey.set(skey(k), v);
  // Another spelling of a Latin name ("bakara", "bakarah", "baqarah"): the consonants decide. A skeleton that
  // two surahs share is never guessed.
  const bySkeleton = makeSkeletonIndex<number>([...byKey.entries()], surahSkeleton, 3);
  // Right next to the word "surah", a name may also be short (Hajj, Jinn, Nahl, Qasas ...). Its consonants are then
  // compared WITH the h (Hajj = h-j = Hazz, but Duha = j-h), it must start with the same sound and be about as long,
  // and no other surah may fit ("surah hazz", but never "surah er nam" for Al-An'am).
  const nearKey = (k: string) => k.replace(/th/g, 's').replace(/dh/g, 'z').replace(/ph/g, 'f').replace(/[qc]/g, 'k').replace(/z/g, 'j')
    .replace(/v/g, 'b').replace(/[aeiouyw]/g, '').replace(/(.)\1+/g, '$1');
  const byNear = new Map<string, Array<{ key: string; id: number }>>();
  for (const [key, id] of byKey) byNear.set(nearKey(key), [...(byNear.get(nearKey(key)) ?? []), { key, id }]);
  const shortName = (key: string): number | null => {
    if (key.length < 2 || NOT_A_SHORT_NAME.has(key)) return null;
    const fits = (byNear.get(nearKey(key)) ?? []).filter((c) => firstSound(c.key) === firstSound(key) && Math.abs(c.key.length - key.length) <= 1);
    const ids = new Set(fits.map((c) => c.id));
    return ids.size === 1 ? [...ids][0] : null;
  };
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
          const sk = surahSkeleton(key);
          const id = n === 1 ? (bySkeleton.exact(key) ?? (sk.length >= 5 ? bySkeleton.near(key) : null)) : (sk.length >= 4 ? bySkeleton.exact(key) : null);
          // Without the word "surah", the written name must also be long enough ("bakara", not "Bakr": Abu Bakr is a person)
          if (id && (hasWord || (key.length >= 5 && SAFE_WITHOUT_SURAH_WORD.has(skey(q.chapters[id - 1].tr))))) return id;
        }
      }
      // a short name right next to the word "surah": "surah hazz", "surah zinn", "nohol surah"
      for (let i = 0; i < words.length; i++) {
        if (!(LATIN_SURAH_WORD.test(words[i - 1] ?? '') || LATIN_SURAH_WORD.test(words[i + 1] ?? ''))) continue;
        const id = shortName(skey(words[i]));
        if (id) return id;
      }
      // Bengali names. First the word right next to "সূরা" (every name): "সূরা হজ্জ", "সূরা আল-ফজর", "বাকারা সূরার",
      // "সূরা ত্বা হা"; an apostrophe inside a name is dropped ("জুমু'আ" = "জুমুআ").
      const bn = wordsBn(text.replace(/([ঀ-৿])['’‘`ʼ]+(?=[ঀ-৿])/g, '$1'));
      const bnName = (w: string | undefined): number | null => {
        if (w) for (const [re, id] of BENGALI_ALL) if (re.test(w)) return id;
        return null;
      };
      for (let i = 0; i < bn.length; i++) {
        const bare = BN_SURAH.test(bn[i]);
        if (!bare && !BN_SURAH_INFLECTED.test(bn[i])) continue;
        if (bare && !BN_WHICH.test(bn[i - 1] ?? '')) {
          const j = BN_ARTICLE.test(bn[i + 1] ?? '') ? i + 2 : i + 1;
          const id = bnName(bn[j]) ?? (bn[j] && bn[j + 1] ? bnName(bn[j] + bn[j + 1]) : null);
          if (id) return id;
        }
        const id = bnName(bn[i - 1]);
        if (id) return id;
      }
      // Then, as before, the names of the first list anywhere with the word "সূরা", or alone if not an ordinary word
      for (const w of bn) {
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
