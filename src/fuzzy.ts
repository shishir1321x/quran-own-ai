// Spelling-tolerant matching, for names people write in many ways: "Ayatul Kursi" / "aital kursi" /
// "Ayat Al Kurshi" / "আয়াত আল কুরশি". Idea: compare the CONSONANTS only (a "skeleton"), because spellings
// of Arabic and Bengali names in other scripts differ mostly in the vowels and in similar-sounding letters.
/** Latin letters -> consonant skeleton: "dhairjo", "dhoirjo", "dhorjo" all become "drj"; "kursi" = "kurshi" = "krs". */
export function latinSkeleton(s: string): string {
  let k = s.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z]/g, '');
  k = k.replace(/ph/g, 'f').replace(/ch/g, 'c').replace(/q/g, 'k').replace(/c/g, 'k').replace(/z/g, 'j').replace(/v/g, 'b').replace(/x/g, 'ks');
  k = k.replace(/[aeiouyw]/g, '').replace(/h/g, '');
  return k.replace(/(.)\1+/g, '$1');
}

/** Bengali letters -> consonant skeleton: sh/s/ṣ are one, y/j are one, vowel signs and independent vowels are dropped. */
export function bengaliSkeleton(s: string): string {
  let k = s.normalize('NFC').replace(/[\u200c\u200d]/g, '');
  k = k.replace(/\u09AF\u09BC/g, 'Y');                       // য় (the y sound) keeps its own mark
  k = k.replace(/\u09A1\u09BC|\u09A2\u09BC/g, 'র');          // ড় ঢ়
  k = k.replace(/[শষ]/g, 'স').replace(/য/g, 'জ').replace(/ণ/g, 'ন').replace(/ৎ/g, 'ত');
  k = k.replace(/[\u0985-\u0994\u09BC\u09BE-\u09CD\u09D7\u0981-\u0983]/g, '');
  k = k.replace(/[^\u0995-\u09B9Y]/g, '');
  return k.replace(/(.)\1+/g, '$1');
}

/** Edit distance where swapping two neighbouring letters costs 1 ("কুসরি" vs "কুরসি"). */
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** A lookup from skeleton to value. A skeleton that belongs to two different values is dropped (not guessed). */
export function makeSkeletonIndex<T>(entries: Array<[string, T]>, skeleton: (s: string) => string, minLen = 3) {
  const map = new Map<string, T | null>();
  for (const [key, value] of entries) {
    const sk = skeleton(key);
    if (sk.length < minLen) continue;
    map.set(sk, map.has(sk) && map.get(sk) !== value ? null : value);
  }
  return {
    exact(word: string): T | null {
      const sk = skeleton(word);
      return sk.length >= minLen ? map.get(sk) ?? null : null;
    },
    /** one edit away, only for longer skeletons, and only if exactly one entry is that close */
    near(word: string): T | null {
      const sk = skeleton(word);
      if (sk.length < Math.max(minLen, 4)) return null;
      const hits = new Set<T>();
      for (const [k, v] of map) if (v !== null && Math.abs(k.length - sk.length) <= 1 && editDistance(k, sk) <= 1) hits.add(v);
      return hits.size === 1 ? [...hits][0] : null;
    },
  };
}

// ------------------------------------------------------------------ typing mistakes
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
function adjacentKeys(a: string, b: string): boolean {
  for (let r = 0; r < KEY_ROWS.length; r++) {
    const i = KEY_ROWS[r].indexOf(a);
    if (i < 0) continue;
    for (let rr = Math.max(0, r - 1); rr <= Math.min(2, r + 1); rr++) {
      for (const di of rr === r ? [-1, 1] : [-1, 0, 1]) {
        if (KEY_ROWS[rr][i + di + (rr > r ? 0 : 0)] === b) return true;
      }
    }
  }
  return false;
}

/**
 * Could `typed` be a typing mistake for `word`? One letter too many or too few, two neighbouring letters swapped,
 * or one letter replaced by the key NEXT to it on a keyboard. A different but real word ("recipe" for "recite":
 * p and t are far apart) is not a typing mistake.
 */
export function plausibleTypo(typed: string, word: string): boolean {
  if (typed === word) return false;
  if (editDistance(typed, word) !== 1) return false;
  if (typed.length !== word.length) return true;                    // one letter added or missing
  const diff: number[] = [];
  for (let i = 0; i < typed.length; i++) if (typed[i] !== word[i]) diff.push(i);
  if (diff.length === 2 && diff[1] === diff[0] + 1 && typed[diff[0]] === word[diff[1]] && typed[diff[1]] === word[diff[0]]) return true;  // swapped
  return diff.length === 1 && adjacentKeys(typed[diff[0]], word[diff[0]]);
}
