// Numbers about the Quran, computed from the local data (no API call, no AI).
import type { Quran } from './data.js';
import { normAr, normEn, normBn } from './text.js';

export interface Stat { line: string; value?: number }

export function surahInfo(q: Quran, s: number): Stat {
  const c = q.chapters[s - 1];
  return { line: `Surah ${s}: ${c.tr} (${c.ar}), ${c.n} ayahs, ${c.type === 'meccan' ? 'Meccan' : 'Medinan'}.`, value: c.n };
}

export function extremeSurahs(q: Quran, which: 'most' | 'fewest'): { line: string; ids: number[]; value: number } {
  const target = which === 'most' ? Math.max(...q.chapters.map((c) => c.n)) : Math.min(...q.chapters.map((c) => c.n));
  const ids = q.chapters.filter((c) => c.n === target).map((c) => c.id);
  const names = ids.map((i) => `${i} ${q.chapters[i - 1].tr}`).join(', ');
  return { line: `Surah(s) with the ${which === 'most' ? 'most' : 'fewest'} ayahs: ${names}, ${target} ayahs each.`, ids, value: target };
}

export function revelationCounts(q: Quran): { line: string; meccan: number; medinan: number } {
  const m = q.chapters.filter((c) => c.type === 'meccan');
  const d = q.chapters.filter((c) => c.type === 'medinan');
  const sum = (l: typeof m) => l.reduce((a, c) => a + c.n, 0);
  return {
    line: `Meccan: ${m.length} surahs, ${sum(m)} ayahs; Medinan: ${d.length} surahs, ${sum(d)} ayahs; total ${q.chapters.length} surahs, ${q.ayahs.length} ayahs (classification as given by the Tanzil chapter data).`,
    meccan: m.length, medinan: d.length,
  };
}

export function totals(q: Quran): Stat {
  return { line: `The Quran has ${q.chapters.length} surahs and ${q.ayahs.length} ayahs.`, value: q.ayahs.length };
}

export type WordLang = 'en' | 'ar' | 'bn';

/** How often an exact word appears. English: in the Saheeh translation; Arabic: in the simple text; Bengali: in the Bengali translation. */
export function countWord(q: Quran, word: string, lang: WordLang): { line: string; total: number; ayahs: number; top: string } {
  const norm = (s: string) => (lang === 'en' ? normEn(s) : lang === 'ar' ? normAr(s) : normBn(s));
  const split = (s: string) => norm(s).split(/[^\p{L}\p{M}']+/u).filter(Boolean);
  const w = split(word)[0] ?? '';
  const per = new Map<number, number>();
  let total = 0, ayahs = 0;
  for (const y of q.ayahs) {
    const text = lang === 'en' ? y.en : lang === 'ar' ? y.arc : y.bn;
    const n = split(text).filter((x) => x === w).length;
    if (n > 0) { total += n; ayahs++; per.set(y.s, (per.get(y.s) ?? 0) + n); }
  }
  const top = [...per.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 5).map(([s, n]) => `${s} ${q.chapters[s - 1].tr}: ${n}`).join(', ') || 'none';
  const src = lang === 'en' ? 'Saheeh International translation' : lang === 'ar' ? 'Arabic text' : 'Bengali translation';
  return {
    line: `Word "${w}" (${src}): ${total} times in ${ayahs} ayahs. Top surahs: ${top}. Exact word form only; other forms of the word are not counted.`,
    total, ayahs, top,
  };
}

/** Count exact whole-word Arabic stems (allowing standard attached prefixes و ف ب ل ك ال لل) across the Arabic text. */
export function countArabicStems(
  q: Quran,
  stems: string[],
  label: string,
): { line: string; total: number; ayahs: number; top: string; forms: Array<[string, number]> } {
  const re = new RegExp(`(?<![\\u0600-\\u06FF])(?:و|ف)?(?:ب|ل|ك)?(?:ال|لل)?(?:${stems.join('|')})(?![\\u0600-\\u06FF])`, 'g');
  const per = new Map<number, number>();
  const formsMap = new Map<string, number>();
  let total = 0, ayahs = 0;
  for (const y of q.ayahs) {
    const m = normAr(y.arc).match(re);
    if (m && m.length > 0) {
      total += m.length;
      ayahs++;
      per.set(y.s, (per.get(y.s) ?? 0) + m.length);
      for (const f of m) formsMap.set(f, (formsMap.get(f) ?? 0) + 1);
    }
  }
  const top = [...per.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 5).map(([s, n]) => `${s} ${q.chapters[s - 1].tr}: ${n}`).join(', ') || 'none';
  const forms = [...formsMap.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const formsText = forms.map(([f, n]) => `${f} (${n})`).join(', ') || 'none';
  return {
    line: `Arabic forms for "${label}" (Tanzil simple-clean): ${total} times in ${ayahs} ayahs. Forms counted: ${formsText}. Top surahs: ${top}.`,
    total, ayahs, top, forms,
  };
}
