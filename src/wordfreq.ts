// Which words are used most in the Quran (or in one surah), and how often the name Allah is there.
// Counted in the Arabic text (Tanzil simple-clean, the `arc` field), word by word as it is WRITTEN:
// "الأرض" and "والأرض" are two forms and are counted apart. Hamza is kept, so إنّ / أنّ / أن are not merged,
// and على is not merged with the name علي. Nothing here is interpretation: it is counting.
import type { Quran } from './data.js';

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const words = (s: string) => s.replace(MARKS, '').split(/\s+/).filter(Boolean);

/**
 * "Small words": particles, pronouns, demonstratives, relative pronouns, and prepositions with a pronoun joined
 * (as written in the simple-clean text). A word that is one of these with و or ف in front counts as small too.
 * Chosen by hand (grammar, not religion); `npm run check-wording` shows the result for a reader to check.
 */
export const SMALL_WORDS = new Set([
  'من', 'في', 'ما', 'إن', 'أن', 'لا', 'إلا', 'ألا', 'على', 'إلى', 'عن', 'مع', 'ثم', 'أو', 'أم', 'بل', 'قد', 'لقد', 'لم', 'لن', 'لو',
  'لولا', 'إذ', 'إذا', 'يا', 'أيها', 'حتى', 'كل', 'بعد', 'قبل', 'عند', 'كما', 'إنما', 'أنما', 'لما', 'مما', 'بما', 'عما', 'فيما',
  'ذلك', 'تلك', 'هذا', 'هذه', 'هؤلاء', 'أولئك', 'الذي', 'الذين', 'التي', 'اللاتي', 'هو', 'هي', 'هم', 'هن', 'هما', 'أنا', 'نحن',
  'أنت', 'أنتم', 'إنا', 'إنه', 'إنهم', 'إني', 'أنه', 'أنهم', 'له', 'لهم', 'لكم', 'لنا', 'لك', 'لي', 'لها', 'به', 'بها', 'بهم',
  'فيه', 'فيها', 'فيهم', 'عليه', 'عليها', 'عليهم', 'عليكم', 'علينا', 'منه', 'منها', 'منهم', 'منكم', 'إليه', 'إليهم', 'إليك',
  'عنه', 'عنهم', 'إذن', 'كي', 'لكن',
]);
export const isSmall = (w: string) => SMALL_WORDS.has(w) || (/^[وف]/.test(w) && SMALL_WORDS.has(w.slice(1)));

/** The name Allah with a letter joined in front: والله، بالله، لله، ولله، فلله، تالله، وتالله، آلله (a question) ... Not اللهم. */
// الله, والله, فالله, بالله, تالله, وتالله | لله, ولله, فلله | آلله ("is it Allah ...?", the question hamza joined: 10:59, 27:59)
const ALLAH_FORM = /^(?:و|ف)?(?:ب|ت)?الله$|^(?:و|ف)?لله$|^آلله$/;
export const isAllahForm = (w: string) => ALLAH_FORM.test(w);

export interface WordCount { word: string; n: number }
export interface Frequency {
  /** all the words of the text (or of the surah) */
  total: number;
  /** every written form, the most used first (a tie keeps the order of the Quran) */
  ranked: WordCount[];
  /** the same without the small words */
  content: WordCount[];
  /** the name Allah: alone, with a letter joined in front, each form, and اللهم */
  allah: { alone: number; all: number; forms: WordCount[]; allahumma: number };
}

const cache = new Map<string, Frequency>();

/** How often every word is used, in the whole Quran or in one surah. Computed once per scope. */
export function wordFrequency(q: Quran, surah?: number): Frequency {
  const key = `${surah ?? 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const count = new Map<string, number>();
  let total = 0;
  for (const y of surah ? q.surah(surah) : q.ayahs) {
    for (const w of words(y.arc)) { total++; count.set(w, (count.get(w) ?? 0) + 1); }
  }
  const ranked = [...count.entries()].map(([word, n]) => ({ word, n })).sort((a, b) => b.n - a.n);
  const forms = ranked.filter((w) => isAllahForm(w.word));
  const out: Frequency = {
    total,
    ranked,
    content: ranked.filter((w) => !isSmall(w.word)),
    allah: {
      alone: count.get('الله') ?? 0,
      all: forms.reduce((a, w) => a + w.n, 0),
      forms: forms.filter((w) => w.word !== 'الله'),
      allahumma: count.get('اللهم') ?? 0,
    },
  };
  cache.set(key, out);
  return out;
}

/** The first words of a ranking, and every word tied with the first. */
export const tiedTop = (list: WordCount[]): WordCount[] => list.filter((w) => w.n === list[0]?.n);
