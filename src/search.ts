// Finding ayahs for a question, with no AI: checked themes first, then BM25 over the three texts.
import { Bm25 } from './bm25.js';
import type { Ayah, Quran } from './data.js';
import { BANGLISH_TO_EN, NAME_TO_EN, THEMES, type Theme } from './lexicon.js';
import { americanize, mappedEnglishWords, normAr, STOP_EN, normBn, stemEn, tokensAr, tokensBn, tokensEn, wordsBn, wordsEn } from './text.js';

export interface Index { en: Bm25; bn: Bm25; ar: Bm25 }

export function buildIndex(q: Quran): Index {
  return {
    en: new Bm25(q.ayahs.map((y) => tokensEn(y.en))),
    bn: new Bm25(q.ayahs.map((y) => tokensBn(y.bn))),
    ar: new Bm25(q.ayahs.map((y) => tokensAr(y.arc))),
  };
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

/** Themes (patience, hardship, mercy ...) that the question is about, and their checked ayahs. */
export function matchThemes(question: string, isEnglish: (w: string) => boolean = () => false): ThemeMatch {
  const latin = new Set([...wordsEn(question), ...mappedEnglishWords(question, isEnglish).map((w) => w.toLowerCase())]);
  const bn = wordsBn(question);
  const ar = new Set(tokensAr(question).map(arWord));
  const wordHit = (raw: string): boolean => {
    if (isBengali(raw)) {
      const w = normBn(raw);
      return bn.some((x) => x === w || (w.length >= 3 && x.includes(w)));
    }
    if (isArabic(raw)) return ar.has(arWord(raw));
    return latin.has(raw.toLowerCase());
  };
  const anyHit = (words: string[]) => words.some(wordHit);
  const hits = THEMES.filter((t) => (t.allOf ? t.allOf.every(anyHit) : anyHit(t.words)));
  // "dua for parents" is about a dua for parents, not about parents in general: the specific theme wins
  const specific = hits.filter((t) => t.allOf);
  const hit = specific.length > 0 ? specific : hits;
  const ayahs: ThemeMatch['ayahs'] = [];
  for (let i = 0; ayahs.length < MAX_THEME_AYAHS; i++) {
    let any = false;
    for (const t of hit) {
      const r = t.ayahs[i];
      if (!r) continue;
      any = true;
      if (ayahs.length < MAX_THEME_AYAHS && !ayahs.some((x) => x.s === r[0] && x.a === r[1])) ayahs.push({ s: r[0], a: r[1], theme: t.id });
    }
    if (!any) break;
  }
  return { themes: hit, ayahs };
}

// ---------------------------------------------------------------- BM25 search
/** Query words for each of the three texts. Banglish and Bengali words are also mapped to English. */
export function queryTokens(question: string, isEnglish: (w: string) => boolean = () => false): { en: string[]; bn: string[]; ar: string[] } {
  // A Banglish or foreign word that we translate (namaz -> prayer, Ibrahim -> Abraham) is REPLACED by its
  // translation: the original word is not in the English text and must not count as a missing word.
  const mapped = mappedEnglishWords(question, isEnglish).map(stemEn);
  const raw = tokensEn(question).filter((w) => !(w in BANGLISH_TO_EN) && !(w in NAME_TO_EN));
  return { en: [...new Set([...raw, ...mapped])], bn: tokensBn(question), ar: tokensAr(question) };
}

export interface Found { ayah: Ayah; score: number }

/** Top ayahs for a question, or [] if nothing in the Quran matches well enough. */
export function searchAyahs(index: Index, q: Quran, question: string, limit = 5): Found[] {
  const t = queryTokens(question, englishChecker(index));
  const total = new Map<number, number>();
  const coverage = new Map<number, number>();
  for (const [bm, toks] of [[index.en, t.en], [index.bn, t.bn], [index.ar, t.ar]] as const) {
    if (toks.length === 0) continue;
    // How much of the question does an ayah cover, weighing rare words more? A word that is not in the
    // Quran at all ("Ibrahim" in an English text that says "Abraham") counts as the rarest word, missing.
    const uniq = [...new Set(toks)];
    const weight = uniq.reduce((sum, w) => sum + (bm.df(w) > 0 ? bm.idf(w) : bm.unknownIdf()), 0);
    for (const h of bm.search(toks, 200)) {
      total.set(h.doc, (total.get(h.doc) ?? 0) + h.score);
      coverage.set(h.doc, Math.max(coverage.get(h.doc) ?? 0, h.matchedIdf / weight));
    }
  }
  // Precision before recall: an ayah that contains only ONE of several question words ("world cup" ->
  // "a full cup") is a coincidence, not an answer. Show nothing rather than a wrong ayah.
  const ranked = [...total.entries()].filter(([d]) => (coverage.get(d) ?? 0) >= MIN_COVERAGE).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  if (ranked.length === 0) return [];
  const best = ranked[0][1];
  if (best < MIN_SCORE) return [];
  // keep results that are close to the best one: a weak tail is noise
  return ranked.filter(([, s]) => s >= best * 0.5).slice(0, limit).map(([doc, score]) => ({ ayah: q.ayahs[doc], score }));
}

/** An ayah must contain at least this share of the question's words (rare words weigh more). */
export const MIN_COVERAGE = 0.5;

/** A hit must be at least this good. Calibrated on testset_30.csv, see `npm run eval`. */
export const MIN_SCORE = 3;
