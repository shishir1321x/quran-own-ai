// Recognising "Ayat al-Kursi" in the many ways people write it.
// The distinctive word is "kursi" (kursi, kurshi, korsi, kusri, কুরসি, কুরশি, কুসরি ...). It counts when the whole message is
// that word, or when an "ayat"-like word (ayat, ayatul, ayat al, aital ...) stands right before it. Nothing looser:
// a looser rule once took "the Quran" for it.
import { bengaliSkeleton, latinSkeleton } from './fuzzy.js';
import { wordsBn, wordsEn } from './text.js';

const swapped = (sk: string): string => (sk.length >= 3 ? sk.slice(0, -2) + sk[sk.length - 1] + sk[sk.length - 2] : sk);

const KURSI_LATIN = new Set([latinSkeleton('kursi'), swapped(latinSkeleton('kursi'))]);       // krs, ksr
const AYAT_LATIN = new Set(['t', 'tl']);                                                        // ayat, ayatul, ayat al, aital
const ONE_WORD_LATIN = new Set([latinSkeleton('ayatulkursi'), latinSkeleton('ayatkursi')]);     // tlkrs, tkrs

const KURSI_BN = new Set([bengaliSkeleton('কুরসি'), swapped(bengaliSkeleton('কুরসি'))]);
const AYAT_BN = new Set([bengaliSkeleton('আয়াত'), bengaliSkeleton('আয়াতুল')]);
const ONE_WORD_BN = new Set([bengaliSkeleton('আয়াতুলকুরসি'), bengaliSkeleton('আয়াতকুরসি')]);

// "surah quraish", "সূরা কাউসার": with the word surah it is a surah (Quraish and Kawthar have the consonants of "kursi")
const SURAH = /^(?:surah|sura|surat|soorah|chapter)$|^সূরা|^সুরা/;

function check(words: string[], skeleton: (s: string) => string, kursi: Set<string>, ayat: Set<string>, oneWord: Set<string>): boolean {
  for (let i = 0; i < words.length; i++) {
    const sk = skeleton(words[i]);
    if (oneWord.has(sk)) return true;                                   // written as one word
    if (!kursi.has(sk)) continue;
    if (words.length <= 2 && !words.some((w) => SURAH.test(w))) {
      if (kursi !== KURSI_LATIN || (words[i].length >= 5 && /^[kq]/i.test(words[i]) && /[uo]/i.test(words[i]))) return true;   // just "kursi" (not "surah quraish" or "cars")
    }
    const prev1 = skeleton(words[i - 1] ?? '');
    const prev2 = skeleton((words[i - 2] ?? '') + (words[i - 1] ?? ''));
    if (ayat.has(prev1) || ayat.has(prev2)) return true;
  }
  return false;
}

/** "ayatul kursi", "aital kursi", "Ayat Al Kurshi", "আয়াত আল কুরশি", "আয়াতল কুসরি" ... */
export function isAyatulKursi(text: string): boolean {
  return check(wordsEn(text), latinSkeleton, KURSI_LATIN, AYAT_LATIN, ONE_WORD_LATIN)
    || check(wordsBn(text), bengaliSkeleton, KURSI_BN, AYAT_BN, ONE_WORD_BN);
}
