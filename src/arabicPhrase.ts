// General full-Quran spoken Arabic phonetic phrase matcher across all 6,236 ayahs (y.ar).
// Converts every Uthmani ayah into a continuous, boundary-indexed 16-letter spoken phonetic stream
// (handling sun-letter ال assimilation, Hamzat-al-Wasl elision, construct-state ة->t, madd al-iwad,
// and word joins/splits) so any contiguous Quranic phrase typed in Latin or Bengali script matches
// accurately without hardcoded verse lists or third-party AI.
import { bnToArLatinCandidates, NON_ARABIC_WORDS } from './arabicPhonetic.js';
import { NON_QURAN_WORDS } from './banglishPhonetic.js';
import type { Quran } from './data.js';
import { editDistance } from './fuzzy.js';
import type { Index } from './search.js';
import { stemBn } from './text.js';

const BASE_AR: Record<string, string> = {
  'ا': '', 'ٱ': '', 'أ': '', 'إ': '', 'آ': 'a', 'ء': '', 'ؤ': '', 'ئ': '',
  'ب': 'b', 'ت': 't', 'ث': 's', 'ج': 'z', 'ح': 'h', 'خ': 'k', 'د': 'd', 'ذ': 'z',
  'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 's', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
  'ع': '', 'غ': 'g', 'ف': 'f', 'ق': 'k', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'ة': 'h',
};

const SHORT_HARAKAT = new Set(['\u064e', '\u0650', '\u064f', '\u064b', '\u064c', '\u064d']);
const SUN_LETTERS = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']);
const VOWEL_MAP: Record<string, string> = {
  '\u064e': 'a', '\u0670': 'a', '\u0653': '', '\u0650': 'i', '\u064f': 'u',
  '\u064b': 'an', '\u064c': 'un', '\u064d': 'in', '\u06e5': 'u', '\u06e6': 'i', '\u06e7': 'i', '\u06e8': 'n',
};

const MAX_SHORT_HITS = 10;
const MAX_LONG_HITS = 8;

// Question framing wrappers stripped ONLY at the edges of an explicit phrase query
const LEAD_FRAME = /^(?:(?:please|pls)\s+|(?:can|could)\s+you\s+)?(?:(?:(?:quran|verse|ayah|ayat|surah)\s+)?(?:reference|ref|location|source)\s+(?:of|for)\s+|(?:which|what)\s+(?:surah|sura|chapter|ayah|ayat|verse|part)(?:\s+(?:and|&)\s+(?:ayah|ayat|verse))?\s+(?:is|are|says?|has|have|contains?|mentions?|includes?)\s+|where\s+(?:in\s+(?:the\s+)?(?:quran|koran)\s+)?(?:is|does|do)\s+(?:it\s+say\s+)?|(?:show|give|find)\s+(?:me\s+)?(?:the\s+)?(?:(?:quran|verse)\s+)?(?:reference|ref|surah|ayah|ayat|verse)\s+(?:of|for|with|containing|that\s+says?)\s+|(?:find|locate)\s+|(?:meaning|definition|translation)\s+(?:of|for)\s+)/i;
const TRAIL_FRAME = /(?:\s+(?:in\s+(?:which|what)\s+(?:surah|sura|ayah|ayat|verse)(?:\s+is\s+(?:this|it))?|which\s+(?:surah|sura|ayah|ayat)(?:\s+is\s+(?:this|it))?|in\s+(?:the\s+)?(?:quran|koran)|(?:and\s+)?(?:give|show)\s+(?:the\s+)?(?:quran\s+)?(?:reference|ref|translation).*|(?:(?:dua|ayat|shobdo|phrase)(?:\s*(?:ta|ti|tar|tir))?\s+)?(?:(?:er|r)\s+)?(?:(?:quran|bangla|english)\s+)?(?:reference|ref|surah|ayat|onubad)(?:\s+(?:o|ar|and)\s+(?:bangla|english)?\s*(?:onubad|translation|ortho|meaning|reference|ref))?(?:\s+(?:ki|kothay|kon\s+ta|dao|din|dekhao))?|(?:(?:dua|ayat)(?:\s*(?:ta|ti))?\s+)?kon\s+(?:surah|sura|surar|suray|surate)(?:\s+(?:ar|o|er))?\s*(?:kon\s+)?(?:ayat|ayate|ayat-e)?(?:\s+(?:ache|ase|achhe))?|(?:(?:dua|ayat)(?:\s*(?:ta|ti))?\s+)?kon\s+(?:ayat|ayate|ayat-e)(?:\s+(?:ache|ase|achhe))?|reference\s+(?:ar|o|and)\s+.*|(?:(?:দোয়াটি|দোয়াটা|দোয়ার|আয়াতটি|আয়াতটা|বাক্যটি)\s*)?(?:এর\s+)?(?:কোন\s*(?:সূরার|সূরায়|সূরা|সুরার|সুরায়|সুরা)(?:\s*(?:কোন|ও|আর))?\s*(?:আয়াত|আয়াতে)?|কোন\s*(?:আয়াত|আয়াতে)|(?:কুরআনের\s*)?রেফারেন্স(?:\s*(?:ও|এবং|আর)\s*(?:বাংলা\s*)?(?:অনুবাদ|অর্থ))?)(?:\s*(?:আছে|হবে|কী|কি|দাও|দিন|দেখান|দেখাও))?|বাংলা\s*অনুবাদ\s*(?:দিন|দাও))(?:\s+(?:is\s+(?:this|it)|ache|ase|achhe|আছে))?)+$/i;

/** Strip EN/BN/Banglish reference/location/translation framing wrappers at query edges. */
export function stripPhraseFrame(question: string): string {
  let span = question.replace(/[?!.।؟،"“”«»'‘’]+/g, ' ').replace(/\s+/g, ' ').trim();
  for (let pass = 0; pass < 3; pass++) {
    const next = span.replace(LEAD_FRAME, '').replace(TRAIL_FRAME, '').trim();
    if (next === span) break;
    span = next;
  }
  return span.replace(/\s+/g, ' ').trim();
}

// Quranic Arabic loanwords that appear inside Saheeh International / Dr. Zakaria's Bengali text
// and therefore should NOT trigger the non-Arabic real-language veto.
const ALLOWED_EN_ARABIC = new Set([
  'allah', 'allahu', 'allaha', 'allahi', 'adam', 'islam', 'muslim', 'salam', 'jinn', 'iblis',
  'ramadan', 'kaaba', 'quran', 'hajj', 'zakat', 'shaitan', 'rabbi', 'amin', 'saba', 'ibrahim',
  'musa', 'yusuf', 'maryam', 'isa', 'nuh', 'yunus', 'dawud', 'sulaiman', 'lut', 'hud', 'salih',
]);

const ALLOWED_BN_ARABIC = new Set([
  'আল্লাহ', 'আল্লাহু', 'আল্লাহা', 'রব', 'রব্বি', 'রহমান', 'রহীম', 'রহিম', 'আলামিন', 'আলামীন',
  'রহমত', 'দিন', 'দ্বীন', 'নূর', 'হক', 'কুল', 'সুবহানাল্লাহ', 'আলহামদুলিল্লাহ', 'বিসমিল্লাহ',
  'আহাদ', 'সামাদ', 'কুরআন', 'দুনিয়া', 'আখিরাত', 'মালিক', 'সালাম', 'জান্নাত', 'জাহান্নাম',
  'শয়তান', 'ঈমান', 'ইসলাম', 'মুসলিম', 'মুমিন', 'ইলম', 'সবর', 'জিকির', 'যিকির', 'কিয়ামত',
  'তওবা', 'আযাব', 'আমিন', 'নবী', 'রাসূল', 'কিতাব', 'আয়াত', 'সূরা',
]);

/** Canonical 16-letter spoken phonetic key (`a,i,u,b,d,f,g,h,k,l,m,n,r,s,t,z`), collapsing duplicate adjacency. */
export function canonArStream(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/ph/g, 'f')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/sh/g, 's')
    .replace(/th/g, 's')
    .replace(/dh|zh/g, 'z')
    .replace(/q/g, 'k')
    .replace(/j/g, 'z')
    .replace(/aw/g, 'au')
    .replace(/(?:ay|ey|ei)(?![aiu])/g, 'ai')
    .replace(/e/g, 'i')
    .replace(/o/g, 'u')
    .replace(/w/g, 'u')
    .replace(/y/g, 'i')
    .replace(/(.)\1+/g, '$1');
}

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
        if (hasDamma && ar[j] !== 'و') return 'u';
        return 'i';
      }
    }
  }
  return 'i';
}

function romanizeStreamWord(ar: string, elideWasl: boolean): { full: string; wasl: number } {
  const w = ar.replace(/[\u0651\u0652\u0654]/g, '');
  let start = 0;
  let wasl = 0;
  let prefix = '';

  // Detect initial ال / ٱل (including with sun-letter assimilation: drop silent ل before sun letters)
  const alMatch = w.match(/^([اٱ]ل)([\u0621-\u064a])(.*)$/);
  if (alMatch) {
    wasl = 97; // 'a'
    const isSun = SUN_LETTERS.has(alMatch[2]);
    prefix = (elideWasl && w[0] === 'ٱ') ? (isSun ? '' : 'l') : (isSun ? 'a' : 'al');
    start = 2;
  } else if (w[0] === 'ٱ') {
    const v = hamzatWaslVowel(ar);
    wasl = v.charCodeAt(0);
    if (!elideWasl) prefix = v;
    start = 1;
  }

  let body = prefix;
  for (let i = start; i < w.length; i++) {
    const ch = w[i];
    const next = w[i + 1] ?? '';
    if (VOWEL_MAP[ch] !== undefined) { body += VOWEL_MAP[ch]; continue; }
    if (ch === 'و') {
      if (next === '\u0670') continue;
      body += (i === 0 || Boolean(VOWEL_MAP[next])) ? 'u' : 'u';
      continue;
    }
    if (ch === 'ي') { body += 'i'; continue; }
    if (ch === 'ى') {
      if ((i > 0 && w[i - 1] === '\u064b') || next === '\u0670') continue;
      if (Boolean(VOWEL_MAP[next])) { body += 'i'; continue; }
      if (i > 0 && w[i - 1] === '\u0650') continue;
      body += 'a';
      continue;
    }
    if (ch === 'ة') { body += Boolean(VOWEL_MAP[next]) ? 't' : 'h'; continue; }
    if (ch === 'ا' && i > 0 && w[i - 1] === '\u064b') continue;
    if (ch === 'ا' && i > 0) { body += 'a'; continue; }
    body += BASE_AR[ch] ?? '';
  }
  return { full: body.replace(/(.)\1+/g, '$1'), wasl };
}

interface AyahStream {
  stream: string;
  starts: Uint16Array;     // primary word start offsets
  conjStarts: Uint16Array; // optional post-conjunction (و/ف) start offset, 0xffff if none
  ends: Uint16Array;       // full connected word end offsets
  pausalEnds: Uint16Array; // pausal word end offsets
  wasls: Uint8Array;       // wasl vowel char code (0 if none)
}

function buildAyahStream(arText: string): AyahStream {
  const rawWords = arText.split(/\s+/).filter(Boolean);
  const starts = new Uint16Array(rawWords.length);
  const conjStarts = new Uint16Array(rawWords.length).fill(0xffff);
  const ends = new Uint16Array(rawWords.length);
  const pausalEnds = new Uint16Array(rawWords.length);
  const wasls = new Uint8Array(rawWords.length);

  let stream = '';
  for (let wi = 0; wi < rawWords.length; wi++) {
    const cleaned = rawWords[wi]
      .replace(/.\u06df/g, '')
      .replace(/.\u06e0/g, '')
      .replace(/[\u06d6-\u06de\u06e1-\u06e4\u06e9-\u06ed\u0640]/g, '');

    const { full, wasl } = romanizeStreamWord(cleaned, wi > 0);
    const noTanwin = cleaned.replace(/\u064b[اى]$/, '\u064b').replace(/[\u0651\u0652\u0654]/g, '');
    const lastCh = noTanwin.at(-1) ?? '';
    const pausalSlice = SHORT_HARAKAT.has(lastCh)
      ? romanizeStreamWord(noTanwin.slice(0, -1), wi > 0).full + (lastCh === '\u064b' ? 'a' : '')
      : full;
    const pausalSeg = pausalSlice.replace(/(.)\1+/g, '$1');

    // Append full word to connected stream, collapsing cross-word duplicate character
    const wordStart = stream.length > 0 && full.length > 0 && stream[stream.length - 1] === full[0]
      ? stream.length - 1
      : stream.length;
    starts[wi] = wordStart;
    wasls[wi] = wasl;

    if (full.length > 0) {
      stream += (stream.length > 0 && stream[stream.length - 1] === full[0]) ? full.slice(1) : full;
    }
    const wordEnd = stream.length;
    ends[wi] = wordEnd;

    // Pausal end: if full word ended in -n (-un/-in) or -t (ة+haraka) or short -a/-i/-u, compute exact offset
    const lenDiff = full.length - pausalSeg.length;
    pausalEnds[wi] = lenDiff > 0 && wordEnd - lenDiff > wordStart ? wordEnd - lenDiff : wordEnd;

    // Post-conjunction start after leading و/ف ("وَعَصْرٍ", "فَإِنَّ")
    if ((cleaned[0] === 'و' || cleaned[0] === 'ف') && full.length >= 4 && SHORT_HARAKAT.has(noTanwin[1] ?? '')) {
      const skipConj = (full[0] === 'u' || full[0] === 'f') && (full[1] === 'a') ? 2 : 1;
      if (wordStart + skipConj < wordEnd) conjStarts[wi] = wordStart + skipConj;
    }
  }

  return { stream, starts, conjStarts, ends, pausalEnds, wasls };
}

interface Hit { s: number; a: number; strict: boolean; words: number }

export class ArabicPhraseIndex {
  private built: AyahStream[] | null = null;

  constructor(private readonly quran: Quran) {}

  private ensureBuilt(): AyahStream[] {
    if (!this.built) {
      this.built = this.quran.ayahs.map((y) => buildAyahStream(y.ar));
    }
    return this.built;
  }

  private matchInAyah(
    ay: AyahStream,
    needle: string,
    maxEdits: number,
  ): { matched: boolean; words: number; exact: boolean } {
    const s = ay.stream;
    const nLen = needle.length;
    const nWords = ay.starts.length;
    if (nWords < 2) return { matched: false, words: 0, exact: false };

    const checkWindow = (idx: number, fromWi: number): { words: number; exact: boolean } | null => {
      const endPos = idx + nLen;
      for (let ej = fromWi + 1; ej < nWords; ej++) {
        if (ay.ends[ej] === endPos || ay.pausalEnds[ej] === endPos) {
          return { words: ej - fromWi + 1, exact: true };
        }
        if (ay.starts[ej] > endPos) break;
      }
      return null;
    };

    // Tier 1: exact spaceless substring aligned to word start & end (with optional wasl vowel at start)
    for (let wi = 0; wi < nWords - 1; wi++) {
      const st = ay.starts[wi];
      if (s.startsWith(needle, st)) {
        const hit = checkWindow(st, wi);
        if (hit) return { matched: true, ...hit };
      }
      const cst = ay.conjStarts[wi];
      if (cst !== 0xffff && s.startsWith(needle, cst)) {
        const hit = checkWindow(cst, wi);
        if (hit) return { matched: true, ...hit };
      }
      const wasl = ay.wasls[wi];
      if (wasl !== 0 && needle.charCodeAt(0) === wasl && s.startsWith(needle.slice(1), st)) {
        const endPos = st + nLen - 1;
        for (let ej = wi + 1; ej < nWords; ej++) {
          if (ay.ends[ej] === endPos || ay.pausalEnds[ej] === endPos) {
            return { matched: true, words: ej - wi + 1, exact: true };
          }
          if (ay.starts[ej] > endPos) break;
        }
      }
    }

    if (maxEdits === 0) return { matched: false, words: 0, exact: false };

    // Tier 2: Pigeonhole prefilter (halves for k=1, thirds for k=2) -> boundary-snapped edit distance
    const parts = maxEdits === 1
      ? [needle.slice(0, Math.floor(nLen / 2)), needle.slice(Math.floor(nLen / 2))]
      : [needle.slice(0, Math.floor(nLen / 3)), needle.slice(Math.floor(nLen / 3), Math.floor((2 * nLen) / 3)), needle.slice(Math.floor((2 * nLen) / 3))];
    if (!parts.some((p) => p.length >= 5 && s.includes(p))) return { matched: false, words: 0, exact: false };

    const firstCons = needle.replace(/[aiu]/g, '')[0] ?? '';
    for (let wi = 0; wi < nWords - 1; wi++) {
      const st = ay.starts[wi];
      const cst = ay.conjStarts[wi];
      const candStarts = cst !== 0xffff ? [st, cst] : [st];
      const wasl = ay.wasls[wi];
      const useWasl = wasl !== 0 && needle.charCodeAt(0) === wasl;
      const cmpNeedle = useWasl ? needle.slice(1) : needle;
      const cmpLen = cmpNeedle.length;

      for (const curStart of candStarts) {
        for (let ej = wi + 1; ej < nWords; ej++) {
          for (const endPos of ay.pausalEnds[ej] !== ay.ends[ej] ? [ay.pausalEnds[ej], ay.ends[ej]] : [ay.ends[ej]]) {
            const subLen = endPos - curStart;
            if (Math.abs(subLen - cmpLen) > maxEdits) continue;
            const sub = s.slice(curStart, endPos);
            if (!useWasl && firstCons && (sub.replace(/[aiu]/g, '')[0] ?? '') !== firstCons) continue;
            if (editDistance(sub, cmpNeedle) <= maxEdits) {
              return { matched: true, words: ej - wi + 1, exact: false };
            }
          }
          if (ay.ends[ej] - curStart > cmpLen + maxEdits + 2) break;
        }
      }
    }
    return { matched: false, words: 0, exact: false };
  }

  /** Extract target Arabic phonetic stream(s) from query if it passes all off-topic / real-language vetoes. */
  private extractNeedles(question: string, isEnglish: (w: string) => boolean, index?: Index): string[] {
    const span = stripPhraseFrame(question);
    if (!span) return [];

    const hasBn = /[\u0980-\u09FF]/.test(span);
    const hasLat = /[A-Za-z]/.test(span);
    if (hasBn && hasLat) return [];

    const needles = new Set<string>();
    const tokens = span.split(/\s+/).filter(Boolean);

    if (hasBn) {
      // Guardrail 1 (Bengali impossible-in-Arabic consonants)
      if (/[পভচঝঙঞটডঢ]/.test(span)) return [];
      // Guardrail 2 (Bengali real-language translation veto)
      let realBnCount = 0;
      let checkedBn = 0;
      for (const rawTok of tokens) {
        const clean = rawTok.replace(/[^\u0980-\u09FF]/g, '');
        if (!clean || NON_QURAN_WORDS.has(clean)) continue;
        checkedBn++;
        if (ALLOWED_BN_ARABIC.has(clean)) continue;
        const st = stemBn(clean);
        if (index && (index.bn.df(clean) > 0 || index.bn.df(st) > 0)) realBnCount++;
      }
      if (checkedBn > 0 && (realBnCount >= 2 || realBnCount * 2 >= checkedBn)) return [];

      // Convert each Bengali word to Arabic-Latin candidates and concatenate
      const perWord = tokens.map((tok) => {
        const clean = tok.replace(/[^\u0980-\u09FF]/g, '');
        if (!clean) return [];
        const cands = bnToArLatinCandidates(clean).slice(0, 4);
        return cands;
      });
      if (perWord.some((c) => c.length === 0)) return [];

      const firstCombo = perWord.map((c) => c[0]).join('');
      const secondCombo = perWord.map((c) => c[1] ?? c[0]).join('');
      for (const raw of [firstCombo, secondCombo]) {
        const s = canonArStream(raw);
        if (s) needles.add(s);
        if (s.endsWith('h') && s.length >= 9) needles.add(s.slice(0, -1));
      }
      // Also allow first 2 alternatives cleanly without exponential blowup
      if (tokens.length <= 4) {
        let combos = [''];
        for (const list of perWord) {
          const next: string[] = [];
          for (const pref of combos) for (const c of list.slice(0, 3)) if (next.length < 24) next.push(pref + c);
          combos = next;
        }
        for (const c of combos) {
          const s = canonArStream(c);
          if (s) needles.add(s);
        }
      }
    } else if (hasLat) {
      const cleanWords = tokens.map((w) => w.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean);
      if (cleanWords.length === 0) return [];
      const joined = cleanWords.join('');
      // Guardrail 1 (Latin impossible-in-Arabic letters)
      if (/[pvxc]/.test(joined)) return [];
      // Guardrail 2 (off-topic + real English words veto)
      for (const w of cleanWords) {
        if (NON_QURAN_WORDS.has(w) || NON_ARABIC_WORDS.has(w)) return [];
        if (w.length >= 4 && isEnglish(w) && !ALLOWED_EN_ARABIC.has(w)) return [];
      }
      const s = canonArStream(joined);
      if (s) needles.add(s);
      if (s.endsWith('h') && s.length >= 9) needles.add(s.slice(0, -1));
    }

    return [...needles];
  }

  /** Find Quran ayahs matching a Latin- or Bengali-transliterated contiguous Arabic phrase, or null. */
  find(question: string, isEnglish: (w: string) => boolean = () => false, index?: Index): Array<{ s: number; a: number }> | null {
    if (/[\u0600-\u06FF]/.test(question)) return null;
    const rawNeedles = this.extractNeedles(question, isEnglish, index);
    if (rawNeedles.length === 0) return null;

    // Require minimum stream length & consonant floor (Tier 1: len >= 8, cons >= 4)
    const valid = rawNeedles.filter((n) => n.length >= 8 && n.replace(/[aiu]/g, '').length >= 4);
    if (valid.length === 0) return null;

    const streams = this.ensureBuilt();

    // Try Tier 1 exact across all valid needles first
    for (const needle of valid) {
      const hits: Hit[] = [];
      for (let i = 0; i < streams.length; i++) {
        const res = this.matchInAyah(streams[i], needle, 0);
        if (res.matched) {
          const y = this.quran.ayahs[i];
          hits.push({ s: y.s, a: y.a, strict: true, words: res.words });
        }
      }
      if (hits.length > 0) {
        const maxWords = Math.max(...hits.map((h) => h.words));
        if (maxWords === 2 && needle.length < 14 && hits.length > MAX_SHORT_HITS) continue;
        return hits.slice(0, maxWords >= 3 || needle.length >= 14 ? MAX_LONG_HITS : MAX_SHORT_HITS).map(({ s, a }) => ({ s, a }));
      }
    }

    // Tier 2 fuzzy (k=1 if len >= 11 & cons >= 6; k=2 if len >= 18 & cons >= 9) + 2-ayah span fallback
    const primary = valid[0];
    const cons = primary.replace(/[aiu]/g, '').length;
    const maxEdits = primary.length >= 18 && cons >= 9 ? 2 : primary.length >= 11 && cons >= 6 ? 1 : 0;
    if (maxEdits > 0) {
      const hits: Hit[] = [];
      for (let i = 0; i < streams.length; i++) {
        const res = this.matchInAyah(streams[i], primary, maxEdits);
        if (res.matched) {
          const y = this.quran.ayahs[i];
          hits.push({ s: y.s, a: y.a, strict: false, words: res.words });
        }
      }
      if (hits.length > 0) {
        const maxWords = Math.max(...hits.map((h) => h.words));
        if (!(maxWords === 2 && primary.length < 14 && hits.length > MAX_SHORT_HITS)) {
          return hits.slice(0, MAX_LONG_HITS).map(({ s, a }) => ({ s, a }));
        }
      }
    }

    // 2-ayah consecutive boundary span for long recitations ("wal asr innal insana lafi khusr" -> 103:1, 103:2)
    if (primary.length >= 14 && cons >= 7) {
      for (let i = 0; i + 1 < streams.length; i++) {
        const y1 = this.quran.ayahs[i];
        const y2 = this.quran.ayahs[i + 1];
        if (y1.s !== y2.s) continue;
        const combined = streams[i].stream + (streams[i].stream.at(-1) === streams[i + 1].stream[0] ? streams[i + 1].stream.slice(1) : streams[i + 1].stream);
        if (combined.includes(primary) || (primary.length >= 16 && editDistance(combined.slice(0, primary.length + 1), primary) <= 1)) {
          return [{ s: y1.s, a: y1.a }, { s: y2.s, a: y2.a }];
        }
      }
    }

    return null;
  }
}

