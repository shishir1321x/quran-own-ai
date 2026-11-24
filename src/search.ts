// Finding ayahs for a question, with no AI: checked themes first, then BM25 over English, Bengali,
// loose Bengali, Banglish phonetic, Arabic, and Arabic phonetic texts.
import { arPhoneticDocTokens, bnQueryToArKeys, buildArVocabByFirst, latinQueryToArKeys } from './arabicPhonetic.js';
import { banglishDocTokens, latinQueryToBnKeys, NON_QURAN_WORDS } from './banglishPhonetic.js';
import { Bm25 } from './bm25.js';
import type { Ayah, Quran } from './data.js';
import { BANGLISH_TO_EN, NAME_TO_EN, THEMES, type Theme } from './lexicon.js';
import { phoneticFirstClass, phoneticTermKey, phoneticTermKeyFlex } from './phoneticNorm.js';
import { americanize, bnLooseNorm, mappedEnglishWords, normAr, STOP_EN, normBn, stemBn, stemEn, tokensAr, tokensBn, tokensBnLoose, tokensEn, wordsBn, wordsEn } from './text.js';

export interface Index {
  en: Bm25;
  bn: Bm25;
  bnLoose: Bm25;
  bnLat: Bm25;
  ar: Bm25;
  arLat: Bm25;
  arVocab: Map<string, string[]>;
}

const INDEX_CACHE = new WeakMap<Quran, Index>();

export function buildIndex(q: Quran): Index {
  const cached = INDEX_CACHE.get(q);
  if (cached) return cached;
  const arDocs = q.ayahs.map((y) => arPhoneticDocTokens(y.ar));
  const built: Index = {
    en: new Bm25(q.ayahs.map((y) => tokensEn(y.en))),
    bn: new Bm25(q.ayahs.map((y) => tokensBn(y.bn))),
    bnLoose: new Bm25(q.ayahs.map((y) => tokensBnLoose(y.bn))),
    bnLat: new Bm25(q.ayahs.map((y) => banglishDocTokens(y.bn))),
    ar: new Bm25(q.ayahs.map((y) => tokensAr(y.arc))),
    arLat: new Bm25(arDocs),
    arVocab: buildArVocabByFirst(arDocs),
  };
  INDEX_CACHE.set(q, built);
  return built;
}

/** Is this word English? True for stop words and for any word that is in the English Quran text. */
export function englishChecker(index: Index): (w: string) => boolean {
  return (w) => STOP_EN.has(w.toLowerCase()) || index.en.df(stemEn(americanize(w.toLowerCase()))) > 0;
}

// ---------------------------------------------------------------- themes
const MAX_THEME_AYAHS = 5;
const isBengali = (w: string) => /[\u0980-\u09FF]/.test(w);
const isArabic = (w: string) => /[\u0600-\u06FF]/.test(w);
const arWord = (w: string) => { const n = normAr(w); return n.length > 4 && n.startsWith('ال') ? n.slice(2) : n; };

export interface ThemeMatch { themes: Theme[]; ayahs: Array<{ s: number; a: number; theme: string }> }

const phoneticWordChecker = (index?: Index) => (w: string): boolean =>
  !!index && (
    latinQueryToArKeys(w, (k) => index.arLat.df(k), index.arVocab).length > 0
    || latinQueryToBnKeys(w, (k) => index.bnLat.df(k)).length > 0
  );

/** Themes (patience, hardship, mercy ...) that the question is about, and their checked ayahs. */
export function matchThemes(question: string, isEnglish: (w: string) => boolean = () => false, index?: Index): ThemeMatch {
  const rawLatin = wordsEn(question);
  const latin = new Set([...rawLatin, ...mappedEnglishWords(question, isEnglish, phoneticWordChecker(index)).map((w) => w.toLowerCase())]);
  // Phonetic keys for non-English Latin/Banglish query tokens (4+ chars) so variants like qurbanee, shoytaan,
  // taqwah, sadaqaa, zakaat, munafeq, feresta, qiyamath, jannath, namazz, rojah match their themes automatically.
  const queryPhonetic: Array<{ word: string; key: string; flex: string; first: string }> = [];
  for (const w of rawLatin) {
    if (w.length < 4 || isEnglish(w) || NON_QURAN_WORDS.has(w)) continue;
    queryPhonetic.push({ word: w, key: phoneticTermKey(w), flex: phoneticTermKeyFlex(w), first: phoneticFirstClass(w) });
  }
  const bn = wordsBn(question);
  const bnStems = bn.map(stemBn);
  const bnLoose = bn.map(bnLooseNorm);
  const bnLooseStems = bnStems.map(bnLooseNorm);
  const ar = new Set(tokensAr(question).map(arWord));
  const wordHit = (raw: string): boolean => {
    if (isBengali(raw)) {
      const w = normBn(raw);
      const hitExact = w.length < 3 ? bn.some((x) => x === w)
        : w.length === 3 ? bn.some((x, i) => x === w || bnStems[i] === w)
          : w.length === 4 ? bn.some((x, i) => x === w || bnStems[i] === w || x.startsWith(w))
            : bn.some((x) => x === w || x.includes(w));
      if (hitExact) return true;
      const wl = bnLooseNorm(w);
      if (wl.length < 3) return bnLoose.some((x) => x === wl);
      if (wl.length === 3) return bnLoose.some((x, i) => x === wl || bnLooseStems[i] === wl);
      if (wl.length === 4) return bnLoose.some((x, i) => x === wl || bnLooseStems[i] === wl || x.startsWith(wl));
      return bnLoose.some((x) => x === wl || x.includes(wl));
    }
    if (isArabic(raw)) return ar.has(arWord(raw));
    const lo = raw.toLowerCase();
    if (latin.has(lo)) return true;
    if (lo.length >= 4 && /^[a-z]+$/.test(lo) && queryPhonetic.length > 0) {
      const k = phoneticTermKey(lo);
      const kf = phoneticTermKeyFlex(lo);
      const fc = phoneticFirstClass(lo);
      for (const q of queryPhonetic) {
        if (q.first !== fc || Math.abs(q.word.length - lo.length) > 2) continue;
        if (q.key === k || (lo.length >= 5 && q.flex === kf)) return true;
      }
    }
    return false;
  };
  const anyHit = (words: string[]) => words.some(wordHit);
  const hits = THEMES.filter((t) => (t.pattern ? t.pattern.test(question) : t.allOf ? t.allOf.every(anyHit) : anyHit(t.words)));
  // "dua for parents" is about a dua for parents, not about parents in general: the specific theme wins
  const specific = hits.filter((t) => t.allOf || t.specific);
  const hit = specific.length > 0 ? specific : hits;
  // When another theme also matched, "সময়"/"times" is usually temporal context ("কষ্টের সময় ধৈর্য"), not the "time" theme (103:1).
  const finalHit = hit.length > 1 && hit.some((t) => t.id === 'time') && !/\babout\s+time\b|সময়ের|সময়\s*(?:নিয়ে|সম্পর্কে|বিষয়ে)/i.test(question)
    ? hit.filter((t) => t.id !== 'time')
    : hit;
  const ayahs: ThemeMatch['ayahs'] = [];
  for (let i = 0; ayahs.length < MAX_THEME_AYAHS; i++) {
    let any = false;
    for (const t of finalHit) {
      const r = t.ayahs[i];
      if (!r) continue;
      any = true;
      if (ayahs.length < MAX_THEME_AYAHS && !ayahs.some((x) => x.s === r[0] && x.a === r[1])) ayahs.push({ s: r[0], a: r[1], theme: t.id });
    }
    if (!any) break;
  }
  return { themes: finalHit, ayahs };
}

// ---------------------------------------------------------------- BM25 search
/** Query words for each of the three texts. Banglish and Bengali words are also mapped to English. */
// Words that only frame a question, in English and Banglish ("which surah talks about ...", "kon surah te ... er kotha
// bola hoyeche"): never search words. The search counts a word that the text does not have as a MISSING word, so these
// hid the real topic ("sacrifice er kotha" was "not found"; "which surah talks about sacrifice" found "talk" in 2:76).
const FRAMING = new Set([
  'which', 'surah', 'surahs', 'sura', 'suras', 'surat', 'chapter', 'chapters', 'quran', 'koran', 'quraan', 'talk', 'talks', 'talking',
  'speak', 'speaks', 'speaking', 'mention', 'mentions', 'mentioned', 'mentioning', 'regarding', 'concerning',
  'reference', 'references', 'ref', 'translation', 'translations', 'english', 'bangla', 'bengali', 'state', 'states', 'stated',
  'include', 'including', 'find', 'list', 'only', 'without', 'passage', 'passages', 'containing', 'contain', 'contains', 'word', 'words',
  'verse', 'verses', 'ayah', 'ayahs', 'ayat', 'ayats', 'exact', 'phrase', 'statement', 'particular',
  'meaning', 'define', 'definition', 'ortho', 'orthho', 'mane',
  'suggest', 'suggests', 'suggested', 'suggesting', 'suggestion', 'suggestions',
  'recommend', 'recommends', 'recommended', 'recommending', 'recommendation', 'recommendations',
  'advise', 'advises', 'advised', 'advising', 'circumstance', 'circumstances', 'situation', 'situations',
  'uchit', 'poramorsho', 'koroniyo',
  'al', 'ul', 'il', 'el',
  'er', 'kotha', 'kothata', 'bola', 'bole', 'boleche', 'hoyeche', 'hoise', 'hoyece', 'hoeche', 'kon', 'kono', 'te', 'e', 'o', 'ar',
  'ki', 'kii', 'ache', 'ase', 'achhe', 'asche', 'niye', 'somporke', 'shomporke', 'bishoye', 'korar', 'kora', 'kore', 'korte', 'koro', 'na',
  'ayate', 'ayaat', 'ayatgula', 'ayatgulo', 'ayatgular', 'surate', 'surahte', 'suray', 'qurane', 'korane', 'kurane', 'quraner', 'kuraner',
  'bolo', 'bolun', 'dao', 'din', 'den', 'amake', 'jante', 'chai', 'gulo', 'guli', 'gula', 'dekhao', 'dekhan',
  'onubad', 'anubad', 'shoho', 'soho', 'shobdo', 'shobder', 'shobdota', 'shobdoti', 'eta', 'emon', 'kache', 'shonkha', 'sonkha', 'scientific', 'inference',
].filter((w) => !(w in BANGLISH_TO_EN) && !(w in NAME_TO_EN)));

const AR_TERM_TO_AR: Array<[RegExp, string]> = [
  [/(?:আর[-\s]*)?(?:রহমান|রাহমান)|\b(?:ar[-\s]*)?rahman\b/gi, 'رحمن'],
];

// Everyday English synonyms used ONLY when the user's English word itself has df === 0 in Saheeh International.
const EN_SYNONYMS: Record<string, string> = {
  ocean: 'sea', oceans: 'sea', money: 'wealth', salary: 'reward', wage: 'reward', wages: 'reward',
  mom: 'mother', mum: 'mother', mommy: 'mother', dad: 'father', daddy: 'father',
  kid: 'child', kids: 'child', hubby: 'husband', education: 'knowledge',
  sadness: 'grief', depression: 'grief', depressed: 'grief', anxiety: 'grief', anxious: 'grief', stress: 'distress',
  struggle: 'hardship', struggling: 'hardship', exhausted: 'hardship', overwhelmed: 'distress', hopeless: 'despair', broken: 'grief',
  happiness: 'joy', kindness: 'good', courage: 'steadfast', bravery: 'steadfast',
  humility: 'humble', greed: 'stingy', avarice: 'stingy', jealousy: 'envy', jealous: 'envy',
  alcohol: 'intoxicants', liquor: 'intoxicants', betting: 'gambling',
  loan: 'debt', loans: 'debt', theft: 'thief', stealing: 'steal', murder: 'kill', homicide: 'kill',
  battle: 'fight', devil: 'satan', destiny: 'decree', fate: 'decree', miracle: 'sign', miracles: 'signs',
  illness: 'sick', disease: 'sick', sickness: 'sick', medicine: 'healing',
  poverty: 'poor', gossip: 'backbite', wrath: 'anger', afraid: 'fear', scared: 'fear',
  apologize: 'repent', respect: 'honor', obedience: 'obey', disobedience: 'disobey',
  exam: 'trial', exams: 'trial', forest: 'garden', tears: 'weep', crying: 'weep', cry: 'weep',
  smile: 'laugh', wealthy: 'wealth', rich: 'wealth', generous: 'spend', generosity: 'spend',
  thankful: 'grateful', thankfulness: 'grateful', forgiveness: 'forgive',
  merciful: 'mercy', truthful: 'truth', truthfulness: 'truth', patience: 'patient',
  guidance: 'guide', punishment: 'punish', creation: 'create', creator: 'create',
  believer: 'believe', disbeliever: 'disbelieve', hypocrite: 'hypocrites',
  hellfire: 'fire', hereafter: 'hereafter', resurrection: 'resurrection',
  judgment: 'judge', judgement: 'judge', covenant: 'covenant', pilgrimage: 'hajj',
};

const EN_DERIV_SUFFIXES = ['ation', 'ition', 'ness', 'ment', 'less', 'tion', 'sion', 'able', 'ible', 'ance', 'ence', 'ful', 'ous', 'ive', 'ity', 'ist', 'ly', 'al', 'er', 'or'];

function resolveEnFallback(word: string, enBm: Bm25): string | null {
  const low = americanize(word.toLowerCase());
  const syn = EN_SYNONYMS[low] ?? EN_SYNONYMS[stemEn(low)];
  if (syn) {
    const s = stemEn(americanize(syn));
    if (enBm.df(s) > 0) return s;
  }
  for (const suf of EN_DERIV_SUFFIXES) {
    if (low.length - suf.length >= 4 && low.endsWith(suf)) {
      const base = low.slice(0, -suf.length);
      for (const cand of [stemEn(base), stemEn(base + 'e'), stemEn(base.replace(/i$/, 'y'))]) {
        if (cand.length >= 3 && enBm.df(cand) > 0) return cand;
      }
    }
  }
  return null;
}

export function queryTokens(
  question: string,
  isEnglish: (w: string) => boolean = () => false,
  index?: Index,
): { en: string[]; bn: string[]; bnLoose: string[]; bnLat: string[]; ar: string[]; arLat: string[] } {
  let cleaned = question
    .replace(/\b(?:bring|pull|fetch|find|show|give|list)\s+(?:me\s+|us\s+)?(?:all\s+|some\s+|any\s+)?(?:the\s+)?(?:ayahs?|ayats?|verses?)\b/gi, ' ')
    .replace(/\b(?:what\s+(?:does|do)|(?:the\s+)?(?:meaning|definition)\s+of)\b/gi, ' ')
    .replace(/(?:পরামর্শ|সাজেস্ট|রিকমেন্ড|সুপারিশ|করণীয়|কী\s*করা\s*উচিত|কি\s*করা\s*উচিত|এই\s*(?:অবস্থায়|পরিস্থিতিতে))/g, ' ')
    .replace(/\bmeans?\s*[?؟!.]*\s*$/i, ' ');
  const extraAr: string[] = [];
  for (const [re, arTok] of AR_TERM_TO_AR) {
    if (re.test(cleaned)) {
      extraAr.push(arTok);
      cleaned = cleaned.replace(re, ' ');
    }
  }
  const arLat: string[] = [];
  const bnLat: string[] = [];
  const enFallback: string[] = [];
  const matchedOtherWords = new Set<string>();
  const topic = cleaned.replace(/[A-Za-z']+/g, (w) => (FRAMING.has(w.toLowerCase()) ? ' ' : w));
  const topicWords = index ? wordsEn(topic) : [];
  if (index) {
    for (let i = 0; i < topicWords.length; i++) {
      const w = topicWords[i];
      if (isEnglish(w) || w in BANGLISH_TO_EN || w in NAME_TO_EN || FRAMING.has(w)) continue;
      // 1. Everyday English synonym / derivational root present in Saheeh International
      const enAlt = resolveEnFallback(w, index.en);
      if (enAlt) {
        enFallback.push(enAlt);
        matchedOtherWords.add(w);
        matchedOtherWords.add(stemEn(americanize(w)));
        continue;
      }
      // 2. Phonetic Arabic word in Uthmani Quran (y.ar)
      const arKeys = latinQueryToArKeys(w, (k) => index.arLat.df(k), index.arVocab);
      if (arKeys.length > 0) {
        arLat.push(...arKeys);
        matchedOtherWords.add(w);
        matchedOtherWords.add(stemEn(americanize(w)));
        continue;
      }
      // 2b. Adjacent Latin token join ("faya" + "kun" -> "fayakun")
      if (i + 1 < topicWords.length) {
        const nextW = topicWords[i + 1];
        if (!isEnglish(nextW) && !(nextW in BANGLISH_TO_EN) && !(nextW in NAME_TO_EN)) {
          const joinedKeys = latinQueryToArKeys(w + nextW, (k) => index.arLat.df(k), index.arVocab);
          if (joinedKeys.length > 0) {
            arLat.push(...joinedKeys);
            matchedOtherWords.add(w);
            matchedOtherWords.add(nextW);
            matchedOtherWords.add(stemEn(americanize(w)));
            matchedOtherWords.add(stemEn(americanize(nextW)));
            i++;
            continue;
          }
        }
      }
      // 3. Phonetic Banglish word in Dr. Zakaria's Bengali Quran (y.bn)
      const bnKeys = latinQueryToBnKeys(w, (k) => index.bnLat.df(k));
      if (bnKeys.length > 0) {
        bnLat.push(...bnKeys);
        matchedOtherWords.add(w);
        matchedOtherWords.add(stemEn(americanize(w)));
      }
    }
  }
  // A Banglish or foreign word that we translate (namaz -> prayer, Ibrahim -> Abraham) is REPLACED by its
  // translation; never let fuzzy prophet/Banglish name guessing reinterpret exact Arabic/Banglish Quran words.
  const mapped = mappedEnglishWords(cleaned, isEnglish, phoneticWordChecker(index)).map(stemEn);

  const raw = tokensEn(topic).filter((w) => !(w in BANGLISH_TO_EN) && !(w in NAME_TO_EN) && !matchedOtherWords.has(w));
  const rawBn = tokensBn(cleaned);
  const fullBnWords = wordsBn(cleaned);
  const bnLoose: string[] = [];
  const matchedBnWords = new Set<string>();
  const unresolvedFullBn = new Set<string>();
  if (index) {
    // Map each stemmed token back to its raw unstemmed word(s) so -র/-রা ("আকবার", "কাফির", "গাফুর") is tried unstemmed first.
    const rawByStem = new Map<string, string[]>();
    for (const fw of fullBnWords) {
      const sb = stemBn(fw);
      rawByStem.set(sb, [...(rawByStem.get(sb) ?? []), fw]);
    }
    for (const bw of rawBn) {
      if (index.bn.df(bw) > 0) continue;
      const loose = bnLooseNorm(bw);
      if (loose.length >= 2 && index.bnLoose.df(loose) > 0) {
        bnLoose.push(loose);
        matchedBnWords.add(bw);
        continue;
      }
      let hitKeys: string[] = [];
      for (const unstemmed of [...(rawByStem.get(bw) ?? []), bw]) {
        const keys = bnQueryToArKeys(unstemmed, (k) => index.arLat.df(k));
        if (keys.length > 0) { hitKeys = keys; break; }
      }
      if (hitKeys.length > 0) {
        arLat.push(...hitKeys);
        matchedBnWords.add(bw);
      } else {
        unresolvedFullBn.add(bw);
      }
    }
    // Adjacent Bengali token join ("ফায়া" + "কুন" -> "ফায়াকুন")
    for (let i = 0; i + 1 < fullBnWords.length; i++) {
      const s1 = stemBn(fullBnWords[i]), s2 = stemBn(fullBnWords[i + 1]);
      if (!unresolvedFullBn.has(s1) && !unresolvedFullBn.has(s2)) continue;
      const keys = bnQueryToArKeys(fullBnWords[i] + fullBnWords[i + 1], (k) => index.arLat.df(k));
      if (keys.length > 0) {
        arLat.push(...keys);
        matchedBnWords.add(s1);
        matchedBnWords.add(s2);
      }
    }
  }
  const bn = [...new Set(rawBn.filter((w) => !matchedBnWords.has(w)))];
  return {
    en: [...new Set([...raw, ...mapped, ...enFallback])],
    bn,
    bnLoose: [...new Set(bnLoose)],
    bnLat: [...new Set(bnLat)],
    ar: [...new Set([...tokensAr(cleaned), ...extraAr])],
    arLat: [...new Set(arLat)],
  };
}

export interface Found { ayah: Ayah; score: number }

const ARABIC_SHORT_PARTICLES = new Set([
  'kun', 'qul', 'la', 'laa', 'wa', 'fa', 'fi', 'fii', 'bi', 'li', 'min', 'an', 'in', 'ma', 'maa', 'ya', 'yaa',
  'ina', 'inna', 'ila', 'illa', 'ini', 'inni', 'ala', 'huwa', 'hum', 'qad', 'lam', 'lan', 'man', 'din', 'rab', 'haq', 'nur', 'ruh', 'ilm',
  'কুন', 'কুল', 'লা', 'ওয়া', 'ফা', 'ফি', 'বি', 'লি', 'মিন', 'আন', 'ইন', 'মা', 'ইয়া', 'ইন্না', 'ইল্লা', 'ইন্নি', 'আলা', 'হুয়া', 'হুওয়া',
  'দিন', 'দ্বীন', 'রব', 'হক', 'নূর',
]);

/** Top ayahs for a question, or [] if nothing in the Quran matches well enough. */
export function searchAyahs(index: Index, q: Quran, question: string, limit = 5): Found[] {
  const t = queryTokens(question, englishChecker(index), index);
  const total = new Map<number, number>();
  const coverage = new Map<number, number>();
  const hasArLat = t.arLat.length > 0;
  const nonParticleMissingEn = t.en.filter((w) => index.en.df(w) === 0 && !(hasArLat && ARABIC_SHORT_PARTICLES.has(w)));
  const nonParticleMissingBn = t.bn.filter((w) => index.bn.df(w) === 0 && !(hasArLat && ARABIC_SHORT_PARTICLES.has(w)));
  const missingEnWeight = nonParticleMissingEn.length * index.en.unknownIdf();
  const missingBnWeight = nonParticleMissingBn.length * index.bn.unknownIdf();
  const channels = [
    [index.en, t.en, 0],
    [index.bn, t.bn, 0],
    [index.bnLoose, t.bnLoose, missingBnWeight],
    [index.bnLat, t.bnLat, missingEnWeight + missingBnWeight],
    [index.ar, t.ar, 0],
    [index.arLat, t.arLat, missingEnWeight + missingBnWeight],
  ] as const;
  for (const [bm, toks, extraMissingWeight] of channels) {
    if (toks.length === 0) continue;
    // How much of the question does an ayah cover, weighing rare words more? Unknown words in the
    // English/Bengali channels ("cars" in "Tesla cars", "ভিডিও" in "ভিডিও গেম") also count against
    // phonetic fallback channels so a single accidental match cannot satisfy a multi-word off-topic query.
    const uniq = [...new Set(toks)];
    const weight = uniq.reduce((sum, w) => sum + (bm.df(w) > 0 ? bm.idf(w) : bm.unknownIdf()), 0) + extraMissingWeight;
    for (const h of bm.search(toks, 200)) {
      total.set(h.doc, (total.get(h.doc) ?? 0) + h.score);
      coverage.set(h.doc, Math.max(coverage.get(h.doc) ?? 0, h.matchedIdf / weight));
    }
  }
  // Precision before recall: an ayah that contains only ONE of several question words ("world cup" ->
  // "a full cup") is a coincidence, not an answer. Weight by coverage so full-query matches rank above partial ones.
  const ranked = [...total.entries()]
    .filter(([d]) => (coverage.get(d) ?? 0) >= MIN_COVERAGE)
    .map(([d, raw]) => [d, raw, raw * (0.5 + (coverage.get(d) ?? 0))] as const)
    .sort((a, b) => b[2] - a[2] || a[0] - b[0]);
  if (ranked.length === 0) return [];
  const effectiveEn = hasArLat ? t.en.filter((w) => !ARABIC_SHORT_PARTICLES.has(w)) : t.en;
  const effectiveBn = hasArLat ? t.bn.filter((w) => !ARABIC_SHORT_PARTICLES.has(w)) : t.bn;
  const purePhoneticOrLoose = effectiveEn.length === 0 && effectiveBn.length === 0 && (t.arLat.length > 0 || t.bnLat.length > 0 || t.bnLoose.length > 0);
  const singleKnownEn = t.en.length === 1 && t.bn.length === 0 && t.ar.length === 0 && index.en.df(t.en[0]) > 0 && index.en.df(t.en[0]) < 1500;
  const singleKnownBn = t.bn.length === 1 && t.en.length === 0 && t.ar.length === 0 && index.bn.df(t.bn[0]) > 0 && index.bn.df(t.bn[0]) < 1500;
  const minScore = purePhoneticOrLoose || singleKnownEn || singleKnownBn ? 0.5 : MIN_SCORE;
  if (Math.max(...ranked.map(([, r]) => r)) < minScore) return [];
  const best = ranked[0][2];
  // keep results that are close to the best one, plus full-coverage hits above minScore (so a 2-word ayah does not hide a longer exact match like 9:100)
  return ranked
    .filter(([d, raw, s]) => s >= best * 0.5 || ((coverage.get(d) ?? 0) >= 0.99 && raw >= minScore))
    .slice(0, limit)
    .map(([doc, score]) => ({ ayah: q.ayahs[doc], score }));
}

/** An ayah must contain at least this share of the question's words (rare words weigh more). */
export const MIN_COVERAGE = 0.5;

/** A hit must be at least this good. Calibrated on testset_30.csv, see `npm run eval`. */
export const MIN_SCORE = 3;
