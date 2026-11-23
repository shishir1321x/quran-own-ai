// Phonetic Arabic transliteration index from Uthmani Arabic (y.ar) so users can look up
// any particular Quranic Arabic word written in Latin/Banglish ("sabikun", "sabiqun", "ulaika",
// "allahjina", "alladhina", "muflehun", "inteha", "imteha", "muttaqin") or casual Bengali
// transliteration ("সাবিকুন", "মুত্তাকুন", "ইন্তেহা").
import { plausibleTypo } from './fuzzy.js';

const BASE_AR: Record<string, string> = {
  'ا': '', 'ٱ': '', 'أ': '', 'إ': '', 'آ': 'a', 'ء': '', 'ؤ': '', 'ئ': '', 'ى': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
  'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
  'ع': '', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'ة': 'h',
};

const SHORT_HARAKAT = new Set(['\u064e', '\u0650', '\u064f', '\u064b', '\u064c', '\u064d']);
const SUN_LETTERS = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']);
const VOWEL_MAP: Record<string, string> = {
  '\u064e': 'a', '\u0670': 'a', '\u0653': '', '\u0650': 'i', '\u064f': 'u',
  '\u064b': 'an', '\u064c': 'un', '\u064d': 'in', '\u06e5': 'u', '\u06e6': 'i',
};

// Modern cities, countries, sports, tech, food, and common Banglish chat/kinship words that can
// happen to sound like a short Quranic Arabic verb/noun (e.g. ذَاقَا ~ "dhaka", عِندِيَ ~ "india", بَابَ ~ "baba").
const NON_ARABIC_WORDS = new Set([
  'india', 'dhaka', 'bangladesh', 'pakistan', 'kolkata', 'delhi', 'mumbai', 'karachi', 'lahore', 'islamabad',
  'sylhet', 'chittagong', 'rajshahi', 'khulna', 'london', 'paris', 'berlin', 'tokyo', 'dubai',
  'messi', 'ronaldo', 'neymar', 'elon', 'musk', 'fifa', 'cricket', 'football', 'hockey', 'baseball',
  'pizza', 'pasta', 'burger', 'biryani', 'samosa', 'noodles', 'sushi', 'chocolate', 'coffee', 'mango', 'banana',
  'google', 'iphone', 'laptop', 'computer', 'internet', 'facebook', 'whatsapp', 'youtube', 'tiktok', 'netflix',
  'spotify', 'instagram', 'android', 'bitcoin', 'pokemon', 'diwali', 'christmas', 'halloween', 'easter',
  'batman', 'superman', 'avatar', 'photosynthesis', 'toyota', 'ferrari', 'tesla', 'guitar', 'violin',
  'kemon', 'bhalo', 'valo', 'dhonnobad', 'taka', 'baba', 'dada', 'mama', 'kaka', 'chacha',
  'nana', 'nani', 'khala', 'fufu', 'bhai', 'apni', 'tumi', 'ami', 'tomar', 'amar', 'amake',
  'shomoy', 'khobor', 'bujhlam', 'bolun', 'dekhao', 'jante', 'bidesh', 'desh', 'manush', 'jinish',
  'bangla', 'bengali', 'banglay', 'english', 'arabic', 'ortho', 'orthho', 'shobdo', 'shobder',
  'ekta', 'kotha', 'ache', 'kono', 'tomato', 'lemon', 'melon', 'robot', 'museum', 'library', 'hotel',
]);

/**
 * Arabic Hamzat al-Wasl (ٱ) starting vowel rule (for words not starting with ال):
 *   If the 3rd base letter carries an intrinsic damma (not just plural -ū before و), emit 'u'
 *   (e.g. ٱسْجُدُوا -> usjudu, ٱدْخُلُوا -> udkhulu); otherwise emit 'i'
 *   (e.g. ٱنتَهَىٰ -> intaha, ٱمْتَحَنَ -> imtahan, ٱقْرَأْ -> iqra, ٱهْدِنَا -> ihdina, ٱتَّقُوا -> ittaqu).
 */
function hamzatWaslVowel(ar: string): 'i' | 'u' {
  let letters = 0;
  for (let i = 0; i < ar.length; i++) {
    const ch = ar[i];
    if (BASE_AR[ch] !== undefined || ch === 'و' || ch === 'ي') {
      letters++;
      if (letters === 3) {
        let hasDamma = false;
        let j = i + 1;
        while (j < ar.length && BASE_AR[ar[j]] === undefined && ar[j] !== 'و' && ar[j] !== 'ي') {
          if (ar[j] === '\u064f') hasDamma = true;
          j++;
        }
        // In plural forms like ٱتَّقُوا۟, damma before trailing و is plural -ū, not root damma.
        if (hasDamma && ar[j] !== 'و') return 'u';
        return 'i';
      }
    }
  }
  return 'i';
}

function romanizeUthmaniWord(ar: string): string {
  const w = ar.replace(/[\u0651\u0652\u0654]/g, '');
  let out = '';
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const next = w[i + 1] ?? '';
    if (VOWEL_MAP[ch] !== undefined) { out += VOWEL_MAP[ch]; continue; }
    // In Uthmani script, و before dagger alif (صلوٰة, زكوٰة, حيوٰة) is a silent seat for long ā.
    if (ch === 'و') {
      if (next === '\u0670') continue;
      out += (i === 0 || VOWEL_MAP[next] !== undefined) ? 'w' : 'u';
      continue;
    }
    if (ch === 'ي') { out += (i === 0 || VOWEL_MAP[next] !== undefined) ? 'y' : 'i'; continue; }
    if ((ch === 'ا' || ch === 'ٱ') && i === 0) {
      if (next === 'ل') out += 'a';
      else if (ch === 'ٱ') out += hamzatWaslVowel(ar);
      continue;
    }
    // Silent alif or alif maqsura after fathatan (سَلْسَبِيلًا, هُدًى)
    if ((ch === 'ا' || ch === 'ى') && i > 0 && w[i - 1] === '\u064b') continue;
    if (ch === 'ا' && i > 0) { out += 'a'; continue; }
    out += BASE_AR[ch] ?? '';
  }
  return out;
}

/** Canonical Latin phonetic form preserving `q`/`dh` and exact `a/i/u`, while normalizing diacritics (`ḥ` -> `h`, `ū` -> `u`). */
export function canonArLatin(raw: string): string {
  return raw.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z]/g, '')
    .replace(/aa+/g, 'a').replace(/ee+|ii+/g, 'i').replace(/oo+|uu+/g, 'u')
    .replace(/(.)\1+/g, '$1')
    .replace(/aw/g, 'au')
    .replace(/(?:ay|ey|ei)(?![aiu])/g, 'ai')
    .replace(/ph/g, 'f');
}

/** Vowel-flexible form (`e` -> `i`, `o` -> `u`): Arabic has only 3 vowel phonemes (`a`, `i`, `u`), so e.g. `muflehun` == `muflihun`. */
export function canonArLatinFlex(raw: string): string {
  return canonArLatin(raw).replace(/e/g, 'i').replace(/o/g, 'u').replace(/(.)\1+/g, '$1');
}

function arPhoneticVariants(baseKey: string): string[] {
  const out = new Set<string>([baseKey]);
  // Merge q->k (sabiqun/sabikun), dh->z (dhikr/zikr, alladhina/allazina), th->s (kawthar/kausar), gh->g (istigfar/gafur) on >= 5 chars.
  if (baseKey.length >= 5) {
    out.add(baseKey.replace(/q/g, 'k'));
    out.add(baseKey.replace(/dh/g, 'z').replace(/q/g, 'k'));
    out.add(baseKey.replace(/th/g, 's').replace(/q/g, 'k'));
    out.add(baseKey.replace(/gh/g, 'g').replace(/q/g, 'k'));
  }
  return [...out];
}

const AR_WORD_CACHE = new Map<string, string[]>();

/** Phonetic tokens indexed for one Uthmani Arabic ayah (`y.ar`). */
export function arPhoneticDocTokens(arText: string): string[] {
  const out: string[] = [];
  for (const rawAr of arText.split(/\s+/)) {
    if (!rawAr) continue;
    const cached = AR_WORD_CACHE.get(rawAr);
    if (cached) {
      for (const k of cached) out.push(k);
      continue;
    }
    const cleaned = rawAr
      .replace(/.\u06df/g, '')
      .replace(/[\u06d6-\u06de\u06e0-\u06e4\u06e7-\u06ed\u0640]/g, '');

    const vars: string[] = [cleaned];
    const withAl = cleaned
      .replace(/^ل[\u064e\u0650\u0651]*ل[\u0652]?/, 'ال')
      .replace(/^[وفبك][\u064e\u0650\u0651]*([اٱ]ل)/, '$1');
    if (withAl !== cleaned) vars.push(withAl);

    const solarBodies: string[] = [];
    for (const v of [...vars]) {
      const m = v.match(/^[اٱ]ل[\u0652]?([\u0621-\u064a])(.*)$/);
      if (m) {
        const noAl = m[1] + m[2];
        vars.push(noAl);
        if (SUN_LETTERS.has(m[1])) solarBodies.push(noAl);
      }
    }

    // Strip leading conjunction و/ف (including before Hamzat al-Wasl: فَٱنتَهَىٰ -> ٱنتَهَىٰ -> intaha!)
    const bare = cleaned.replace(/^[وف][\u064e\u0651]+/, '');
    if (bare !== cleaned && bare.replace(/[\u064b-\u0670]/g, '').length >= 3) vars.push(bare);

    const docKeys = new Set<string>();
    const addKey = (latin: string) => {
      const k = canonArLatin(latin);
      if (k.length < 4) return;
      for (const variant of arPhoneticVariants(k)) docKeys.add(variant);
    };

    const emitForms = (v: string, solarPrefix = '') => {
      const noTanwinCarrier = v.replace(/\u064b[اى]$/, '\u064b').replace(/[\u0651\u0652\u0654]/g, '');
      const last = noTanwinCarrier.at(-1) ?? '';
      const hasShortEnd = SHORT_HARAKAT.has(last);
      const pausal = hasShortEnd ? noTanwinCarrier.slice(0, -1) : noTanwinCarrier;
      const romPausal = solarPrefix + romanizeUthmaniWord(pausal);
      addKey(romPausal);

      // Keep final short vowel too ("ulaika", "alladhina", "dhalika", "rabbana") in addition to pausal ("ulaik").
      if (hasShortEnd) {
        const romFull = solarPrefix + romanizeUthmaniWord(noTanwinCarrier);
        addKey(romFull);
      }
      if (pausal.endsWith('ة')) {
        addKey(romPausal.replace(/h$/, 't'));
        addKey(romPausal.replace(/h$/, ''));
      }
    };

    for (const v of vars) emitForms(v);
    for (const body of solarBodies) emitForms(body, 'a');

    const arr = [...docKeys];
    AR_WORD_CACHE.set(rawAr, arr);
    for (const k of arr) out.push(k);
  }
  return out;
}

/** Build a first-letter bucketed vocabulary from indexed Arabic phonetic docs for fast Tier-4 typo lookup. */
export function buildArVocabByFirst(docs: string[][]): Map<string, string[]> {
  const sets = new Map<string, Set<string>>();
  for (const doc of docs) {
    for (const k of doc) {
      if (k.length < 6) continue;
      let s = sets.get(k[0]);
      if (!s) { s = new Set(); sets.set(k[0], s); }
      s.add(k);
    }
  }
  const out = new Map<string, string[]>();
  for (const [ch, s] of sets) out.set(ch, [...s]);
  return out;
}

/**
 * Tiered phonetic candidates for a cleaned Latin string:
 *   tier1: exact `canonArLatin`,
 *   tier2: `e->i`/`o->u` and `e->a` (South-Asian imalah: inteha->intaha, imtehan->imtahan, rehmat->rahmat),
 *   tier3: South-Asian consonant variants (`q/k`, `dh/z/j/d`, `th/s`, `gh/g`, `allah->alla`).
 */
export function expandArLatinTiers(joined: string): [string[], string[], string[]] {
  const bases = [joined];
  // Users frequently write "allah-" before "lladhina"/"llazi" -> "allahdhina", "allahjina", "allahzina", "allahdina"
  if (/^allah[a-z]{3,}$/.test(joined)) bases.push('alla' + joined.slice(5));

  const tier1: string[] = [];
  const tier2: string[] = [];
  const tier3: string[] = [];
  const seen = new Set<string>();
  const push = (arr: string[], k: string) => {
    if (k.length >= 4 && !seen.has(k)) { seen.add(k); arr.push(k); }
  };

  for (const base of bases) {
    const strict = canonArLatin(base);
    const flexI = canonArLatinFlex(base);
    // Keep o untouched when mapping e->a so "melon" does not turn into "malun", while "inteha" -> "intaha".
    const flexA = strict.replace(/e/g, 'a').replace(/(.)\1+/g, '$1');
    const consonants = strict.replace(/[aeiouyw]/g, '').length;
    if (base === joined) {
      push(tier1, strict);
      // Require >= 5 letters and >= 3 consonants before flexing vowels so short names like "Elon" do not hit "ilun".
      if (strict.length >= 5 && consonants >= 3) {
        push(tier2, flexI);
        push(tier2, flexA);
      }
    } else if (strict.length >= 5 && consonants >= 3) {
      push(tier3, strict);
      push(tier3, flexI);
      push(tier3, flexA);
    }
    for (const c of strict.length >= 5 && consonants >= 3 ? [strict, flexI, flexA] : [strict]) {
      if (c.length < 5) continue;
      for (const v of arPhoneticVariants(c)) push(tier3, v);
      if (c.length >= 6 && c.includes('j')) push(tier3, c.replace(/j/g, 'z'));
      if (c.length >= 7 && c.includes('d') && !c.includes('dh')) {
        push(tier3, c.replace(/d/g, 'dh'));
        push(tier3, c.replace(/d/g, 'z'));
      }
    }
  }
  return [tier1, tier2, tier3];
}

export function expandArLatinCandidates(joined: string): string[] {
  const [t1, t2, t3] = expandArLatinTiers(joined);
  return [...t1, ...t2, ...t3];
}

function pickBestArKey(
  joined: string,
  dfCheck: (k: string) => number,
  vocabByFirst?: Map<string, string[]>,
): string[] {
  const [t1, t2, t3] = expandArLatinTiers(joined);
  for (const k of t1) if (dfCheck(k) > 0) return [k];
  for (const k of t2) if (dfCheck(k) > 0) return [k];
  // Among consonant-relaxed Tier-3 candidates, pick the highest-DF real Quran word (e.g. "alazina" df=927 > "aladina" df=1).
  let bestKey = '';
  let bestDf = 0;
  for (const k of t3) {
    const df = dfCheck(k);
    if (df > bestDf) { bestDf = df; bestKey = k; }
  }
  if (bestKey) return [bestKey];

  // Tier 4: same-length adjacent-key / transposed-letter typo (e.g. "imteha" -> "intaha" 2:275) on >= 6 chars, >= 3 consonants.
  if (vocabByFirst && !/g(?!h)/.test(joined)) {
    const strict = canonArLatin(joined);
    if (strict.length >= 6 && strict.replace(/[aeiouyw]/g, '').length >= 3) {
      const probes = [strict, strict.replace(/e/g, 'a'), strict.replace(/e/g, 'i')];
      for (const p of probes) {
        const bucket = vocabByFirst.get(p[0]);
        if (!bucket) continue;
        let nearBest = '';
        let nearDf = 0;
        let nearCount = 0;
        for (const cand of bucket) {
          if (cand.length === p.length && plausibleTypo(p, cand)) {
            nearCount++;
            const df = dfCheck(cand);
            if (df > nearDf) { nearDf = df; nearBest = cand; }
          }
        }
        if (nearCount >= 1 && nearCount <= 3 && nearBest) return [nearBest];
      }
    }
  }
  return [];
}

/** Could `raw` be a user-typed Latin transliteration of an Arabic Quran word? Returns phonetic key(s) or []. */
export function latinQueryToArKeys(
  raw: string,
  dfCheck: (k: string) => number,
  vocabByFirst?: Map<string, string[]>,
): string[] {
  const joined = raw.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z]/g, '');
  if (joined.length < 4 || NON_ARABIC_WORDS.has(joined)) return [];
  // Classical Arabic transliteration never uses p, v, x, or c (only gh/g for غ).
  if (/[pvxc]/.test(joined)) return [];

  const direct = pickBestArKey(joined, dfCheck, vocabByFirst);
  if (direct.length > 0) return direct;

  // Construct-state compound suffix ("sidratul" -> "sidrat", "laylatul" -> "laylat", "rabbil" -> "rabb")
  if (joined.length >= 6 && /(?:ul|il|al)$/.test(joined)) {
    const sufHit = pickBestArKey(joined.slice(0, -2), dfCheck);
    if (sufHit.length > 0) return sufHit;
  }
  // Concatenated Allah compounds ("subhanallah", "alhamdulillah", "bismillah")
  if (joined.length >= 8 && joined.endsWith('allah')) {
    const stem = joined.slice(0, -5);
    const stemHits = pickBestArKey(stem, dfCheck);
    if (stemHits.length > 0 && dfCheck('alah') > 0) return [...stemHits, 'alah'];
  }
  return [];
}

const BN_AR_CONSONANT: Record<string, string> = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 's', 'জ': 'j', 'ঝ': 'j',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'v', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'r', 'য়': 'y', 'ৎ': 't', 'ং': 'ng',
};
const BN_AR_VOWEL_SIGN: Record<string, string> = {
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ে': 'e', 'ৈ': 'ai', 'ো': 'u', 'ৌ': 'au',
};
const BN_AR_INDEP_VOWEL: Record<string, string> = {
  'অ': 'a', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'এ': 'e', 'ঐ': 'ai', 'ও': 'u', 'ঔ': 'au',
};

function bnWordToLatin(bn: string, addImplicitA: boolean): string {
  const s = bn.normalize('NFC').replace(/[\u200c\u200d]/g, '');
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1] ?? '';
    if (BN_AR_INDEP_VOWEL[ch]) { out += BN_AR_INDEP_VOWEL[ch]; continue; }
    if (BN_AR_VOWEL_SIGN[ch]) { out += BN_AR_VOWEL_SIGN[ch]; continue; }
    if (ch === '\u09cd') continue;
    const cons = BN_AR_CONSONANT[ch];
    if (cons !== undefined) {
      out += cons;
      if (addImplicitA && i < s.length - 1 && next !== '\u09cd' && !BN_AR_VOWEL_SIGN[next] && ch !== 'ং' && ch !== 'ৎ') {
        out += 'a';
      }
    }
  }
  return out;
}

/** Convert a casual Bengali-script Arabic loanword/transliteration (e.g. "সাবিকুন", "ইন্তেহা") into indexed arLat keys. */
export function bnQueryToArKeys(bnWord: string, dfCheck: (k: string) => number): string[] {
  for (const implicitA of [false, true]) {
    const lat = bnWordToLatin(bnWord, implicitA);
    if (!lat || /[pvxc]/.test(lat)) continue;
    for (const form of lat.includes('j') ? [lat, lat.replace(/j/g, 'z')] : [lat]) {
      const hit = pickBestArKey(form, dfCheck);
      if (hit.length > 0) return hit;
    }
  }
  return [];
}
