// Full-Quran Banglish phonetic indexer over Dr. Zakaria's Bengali translation (y.bn).
// Turns all ~15,400 Bengali words in the Quran into canonical Banglish keys so any Bengali
// word written in Latin letters ("pani", "agun", "somudro", "surjo", "valobasha", "mrittu",
// "ondhokar", "purushkar", "makorsha", "hridoy", ...) matches its real Quran ayahs directly.
import { normBn, tokensBn, wordsBn } from './text.js';

const BN_CONS: Record<string, string> = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 's', 'ষ': 's', 'স': 's', 'হ': 'h',
  'Y': 'y', 'ৎ': 't', 'ং': 'ng',
};
const BN_VSIGN: Record<string, string> = {
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
};
const BN_VIND: Record<string, string> = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
};

// Modern proper nouns, foods, apps, sports, and everyday Banglish chat/filler words that
// must never accidentally match a Bengali Quran word (e.g. "dhaka" vs ঢাকা "covered", "samosa" vs সমস্যা).
export const NON_QURAN_WORDS = new Set([
  'india', 'dhaka', 'bangladesh', 'pakistan', 'kolkata', 'delhi', 'mumbai', 'karachi', 'lahore', 'islamabad',
  'sylhet', 'chittagong', 'rajshahi', 'khulna', 'london', 'paris', 'berlin', 'tokyo', 'dubai',
  'messi', 'ronaldo', 'neymar', 'elon', 'musk', 'fifa', 'cricket', 'football', 'hockey', 'baseball',
  'pizza', 'pasta', 'burger', 'biryani', 'samosa', 'noodles', 'sushi', 'chocolate', 'coffee', 'mango', 'banana',
  'tomato', 'lemon', 'melon', 'robot', 'museum', 'library', 'hotel',
  'google', 'iphone', 'laptop', 'computer', 'internet', 'facebook', 'whatsapp', 'youtube', 'tiktok', 'netflix',
  'spotify', 'instagram', 'android', 'bitcoin', 'pokemon', 'diwali', 'christmas', 'halloween', 'easter',
  'batman', 'superman', 'avatar', 'photosynthesis', 'toyota', 'ferrari', 'tesla', 'guitar', 'violin',
  'kemon', 'bhalo', 'valo', 'dhonnobad', 'taka', 'dada', 'mama', 'kaka', 'chacha',
  'nana', 'nani', 'khala', 'fufu', 'apni', 'tumi', 'ami', 'tomar', 'amar', 'amake',
  'khobor', 'bujhlam', 'bolun', 'dekhao', 'jante', 'bidesh', 'jinish', 'ekta', 'kotha', 'ache', 'kono',
  'bangla', 'bengali', 'banglay', 'english', 'arabic', 'ortho', 'orthho', 'shobdo', 'shobder', 'mane',
  'hello', 'sorry', 'thank', 'thanks', 'please', 'okay', 'yeah', 'nope', 'cool', 'nice', 'good',
  'test', 'testing', 'check', 'checking', 'help', 'about', 'terms', 'privacy',
]);

function bnToBanglishRaw(bn: string): string[] {
  // In Unicode NFC, য় = \u09AF\u09BC, ড় = \u09A1\u09BC, ঢ় = \u09A2\u09BC (2 code units!).
  // Replace them with single-char symbols ('Y' for য়, 'র' for ড়/ঢ়) BEFORE char-by-char iteration.
  let s = normBn(bn)
    .replace(/\u09AF\u09BC/g, 'Y')
    .replace(/\u09A1\u09BC|\u09A2\u09BC/g, 'র')
    .replace(/ঃ/g, '');
  // Standard Bengali pronunciation of conjuncts ক্ষ -> খ (kh), জ্ঞ -> গ (g)
  s = s.replace(/ক\u09cdষ/g, 'খ').replace(/জ\u09cdঞ/g, 'গ');

  const emit = (str: string, opts: { keepChandrabindu: boolean; literalConjunct: boolean; dropMedialSchwa: boolean }) => {
    let res = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const next = str[i + 1] ?? '';
      const next2 = str[i + 2] ?? '';
      const next3 = str[i + 3] ?? '';
      if (ch === 'ঁ') { if (opts.keepChandrabindu) res += 'n'; continue; }
      if (BN_VIND[ch]) { res += BN_VIND[ch]; continue; }
      if (BN_VSIGN[ch]) { res += BN_VSIGN[ch]; continue; }
      if (ch === '\u09cd') continue;
      const c = BN_CONS[ch];
      if (c === undefined) continue;

      // ya-phala (C + ্ + য) — NEVER treat reph (র + ্ + য = সূর্য "surjo") as ya-phala!
      if (ch !== 'র' && next === '\u09cd' && next2 === 'য') {
        res += c;
        if (opts.literalConjunct) {
          res += 'y';
          if (!BN_VSIGN[next3] && next3 !== '\u09cd' && i + 2 < str.length - 1) res += 'a';
        } else if (i === 0 && !BN_VSIGN[next3]) {
          res += 'e';
        } else if (!BN_VSIGN[next3] && next3 !== '\u09cd' && i + 2 === str.length - 1) {
          res += 'o';
        }
        i += 2;
        continue;
      }

      // ba-phala (C + ্ + ব): spoken silent ("shopno", "shami") vs literal ("swopno", "swami")
      if (ch !== 'র' && next === '\u09cd' && next2 === 'ব') {
        res += c;
        if (opts.literalConjunct) res += 'w';
        if (!BN_VSIGN[next3] && next3 !== '\u09cd' && i + 2 < str.length - 1) res += 'o';
        i += 2;
        continue;
      }

      res += c;
      const hasExplicitVowel = !!BN_VSIGN[next];
      const hasVirama = next === '\u09cd';
      const isLast = i === str.length - 1 || (i === str.length - 2 && str[str.length - 1] === 'ঁ');
      if (!hasExplicitVowel && !hasVirama && ch !== 'ং' && ch !== 'ৎ') {
        if (!isLast) {
          // Bengali medial schwa syncope: in 3+ char words, an unmarked consonant before consonant+vowel is often silent
          // ("মাকড়সা" makor-sa, "আসমান" as-man, "ব্যবসা" beb-sa).
          const isMedialClosed = opts.dropMedialSchwa && i > 0 && !!BN_CONS[next] && (!!BN_VSIGN[next2] || next2 === '\u09cd');
          if (!isMedialClosed) res += 'o';
        } else if (i > 0 && str[i - 1] === '\u09cd') {
          res += 'o'; // final conjuncts keep trailing -o ("সমুদ্র" somudro, "সত্য" sotto, "স্বপ্ন" shopno)
        }
      }
    }
    return res;
  };

  const out = new Set<string>();
  out.add(emit(s, { keepChandrabindu: false, literalConjunct: false, dropMedialSchwa: false }));
  out.add(emit(s, { keepChandrabindu: false, literalConjunct: false, dropMedialSchwa: true }));
  if (s.includes('ঁ')) out.add(emit(s, { keepChandrabindu: true, literalConjunct: false, dropMedialSchwa: false }));
  if (s.includes('\u09cd')) {
    out.add(emit(s, { keepChandrabindu: false, literalConjunct: true, dropMedialSchwa: false }));
    out.add(emit(s, { keepChandrabindu: false, literalConjunct: true, dropMedialSchwa: true }));
  }
  return [...out];
}

/** Canonical Banglish key unifying sh/s, bh/v/b, chh/ch, ph/f, o/a, ee/i, oo/u, and repeated letters. */
export function canonBanglish(raw: string): string {
  return raw.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z]/g, '')
    .replace(/sh/g, 's')
    .replace(/chh/g, 'ch')
    .replace(/ph/g, 'f')
    .replace(/bh|v/g, 'b')
    .replace(/ng/g, 'n')
    .replace(/z/g, 'j')
    .replace(/q/g, 'k')
    .replace(/ee+|ii+/g, 'i').replace(/oo+|uu+/g, 'u').replace(/aa+/g, 'a')
    .replace(/o/g, 'a')
    .replace(/y/g, 'i')
    .replace(/(.)\1+/g, '$1');
}

function stripAspirates(k: string): string {
  return k.replace(/([tdkgj])h/g, '$1');
}

const BN_WORD_CACHE = new Map<string, string[]>();

/** Indexed Banglish phonetic keys for one Bengali Quran ayah (`y.bn`). */
export function banglishDocTokens(bnText: string): string[] {
  const out = new Set<string>();
  for (const w of [...wordsBn(bnText), ...tokensBn(bnText)]) {
    if (w.length < 2) continue;
    let keys = BN_WORD_CACHE.get(w);
    if (!keys) {
      const s = new Set<string>();
      for (const lat of bnToBanglishRaw(w)) {
        const k = canonBanglish(lat);
        if (k.length >= 4) s.add(k);
        if (k.length >= 5 && k.endsWith('a')) s.add(k.slice(0, -1));
        const noAsp = stripAspirates(k);
        if (noAsp.length >= 4) s.add(noAsp);
        if (noAsp.length >= 5 && noAsp.endsWith('a')) s.add(noAsp.slice(0, -1));
      }
      keys = [...s];
      BN_WORD_CACHE.set(w, keys);
    }
    for (const k of keys) out.add(k);
  }
  return [...out];
}

/** Match a user-typed Banglish word against the indexed Bengali Quran vocabulary (`index.bnLat`). */
export function latinQueryToBnKeys(raw: string, dfCheck: (k: string) => number): string[] {
  const joined = raw.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z]/g, '');
  if (joined.length < 4 || NON_QURAN_WORDS.has(joined)) return [];
  // Drop obvious English-only endings/patterns never used in Bengali romanization
  if (/[x]/.test(joined)) return [];

  const k1 = canonBanglish(joined);
  if (k1.length >= 4 && dfCheck(k1) > 0) return [k1];
  if (k1.length >= 5 && k1.endsWith('a') && dfCheck(k1.slice(0, -1)) > 0) return [k1.slice(0, -1)];

  // Tier 2: relax aspirated consonants (ondokar <-> ondhokar, kuda <-> khudha) & e <-> a/i on >= 5 chars
  if (k1.length >= 5) {
    const cands = [
      stripAspirates(k1),
      k1.replace(/e/g, 'i'),
      k1.replace(/e/g, 'a'),
      stripAspirates(k1.replace(/e/g, 'i')),
      stripAspirates(k1.replace(/e/g, 'a')),
    ];
    let best = '';
    let bestDf = 0;
    for (const c of cands) {
      if (c.length < 4) continue;
      const df = dfCheck(c);
      if (df > bestDf) { bestDf = df; best = c; }
    }
    if (best) return [best];
  }
  return [];
}

