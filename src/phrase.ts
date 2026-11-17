// "Which ayah is this?": the user writes some words of an ayah (in Arabic, English or Bengali) and we find where it is.
// It counts only when the WHOLE text the user wrote is in the ayah, word for word and in the same order.
import type { Quran } from './data.js';
import { normAr, normBn, normEn, wordsBn } from './text.js';

const MAX_RESULTS = 8;

const arabicWords = (s: string): string[] => normAr(s).split(/[^\u0600-\u06FF]+/).filter(Boolean);
const englishWords = (s: string): string[] => normEn(s).split(/[^a-z]+/).filter(Boolean);
const bengaliWords = (s: string): string[] => wordsBn(s);

/** The first word of an Arabic text may carry a one-letter prefix: "فإن" for "إن", "والحمد" for "الحمد". */
const PREFIXES = 'وفبلك';
const sameWord = (hayWord: string, word: string, first: boolean, arabic: boolean): boolean =>
  hayWord === word || (arabic && first && hayWord.length === word.length + 1 && PREFIXES.includes(hayWord[0]) && hayWord.endsWith(word));

/** Does `hay` contain `needle` as consecutive words? */
function containsRun(hay: string[], needle: string[], arabic = false): boolean {
  if (needle.length === 0 || needle.length > hay.length) return false;
  outer: for (let i = 0; i + needle.length <= hay.length; i++) {
    for (let j = 0; j < needle.length; j++) if (!sameWord(hay[i + j], needle[j], j === 0, arabic)) continue outer;
    return true;
  }
  return false;
}

export class PhraseIndex {
  private readonly ar: string[][];
  private readonly en: string[][];
  private readonly bn: string[][];

  constructor(private readonly quran: Quran) {
    this.ar = quran.ayahs.map((y) => arabicWords(y.arc));
    this.en = quran.ayahs.map((y) => englishWords(y.en));
    this.bn = quran.ayahs.map((y) => bengaliWords(y.bn));
  }

  /** The ayahs that contain the words of the question, or null. Short or very common phrases are not matched. */
  find(question: string): Array<{ s: number; a: number }> | null {
    const total = question.split(/\s+/).filter(Boolean).length;
    const tries: Array<[string[], string[][], boolean]> = [];
    const ar = arabicWords(question);
    if (ar.length >= 2 && (ar.length >= 3 || ar.length * 2 >= total)) tries.push([ar, this.ar, true]);
    const bn = bengaliWords(question);
    if (bn.length >= 3 && bn.length * 2 >= total) tries.push([bn, this.bn, false]);
    const en = englishWords(question);
    if (en.length >= 4 && !ar.length && !bn.length) tries.push([en, this.en, false]);
    for (const [needle, hay, arabic] of tries) {
      const hits: Array<{ s: number; a: number }> = [];
      hay.forEach((words, i) => { if (containsRun(words, needle, arabic)) hits.push({ s: this.quran.ayahs[i].s, a: this.quran.ayahs[i].a }); });
      if (hits.length >= 1 && hits.length <= MAX_RESULTS) return hits;
    }
    return null;
  }
}
