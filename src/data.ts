// Loads data/quran.json (made by `npm run build-data`) and gives fast lookups.
import { readFileSync } from 'node:fs';

export interface Chapter { id: number; ar: string; tr: string; en: string; type: 'meccan' | 'medinan'; n: number }
export interface Ayah {
  s: number; a: number;
  ar: string;   // Uthmani Arabic, shown to the user
  arc: string;  // simple-clean Arabic, used only for matching
  en: string;   // English translation as published
  bn: string;   // Bengali translation as published
}
export interface Quran {
  meta: { built: string; sources: { what: string; name: string; terms: string; url: string }[] };
  chapters: Chapter[];
  /** where each of the 30 juz (para) starts: [surah, ayah] */
  juz: Array<[number, number]>;
  /** the 604 pages of the Madani mushaf and the 240 hizb quarters: where each starts */
  pages: Array<[number, number]>;
  hizbs: Array<[number, number]>;
  /** the 15 sajdah ayahs: [surah, ayah, type] */
  sajdas: Array<[number, number, string]>;
  ayahs: Ayah[];
  get(s: number, a: number): Ayah | undefined;
  /** The translator's own note for an ayah (word for word), or undefined. Loaded the first time it is needed. */
  note(lang: 'en' | 'bn', s: number, a: number): string | undefined;
  surah(s: number): Ayah[];
}

let cached: Quran | null = null;
let notesCache: { en: Record<string, string>; bn: Record<string, string> } | null = null;
function loadNotes() {
  if (!notesCache) {
    try { notesCache = JSON.parse(readFileSync(new URL('../data/notes.json', import.meta.url), 'utf8')); }
    catch { notesCache = { en: {}, bn: {} }; }   // no notes file: no notes, everything else works
  }
  return notesCache!;
}

export function loadQuran(path?: string): Quran {
  if (cached && !path) return cached;
  const raw = JSON.parse(readFileSync(path ?? new URL('../data/quran.json', import.meta.url), 'utf8'));
  const ayahs: Ayah[] = raw.ayahs.map((r: [number, number, string, string, string, string]) => ({
    s: r[0], a: r[1], ar: r[2], arc: r[3], en: r[4], bn: r[5],
  }));
  if (ayahs.length !== 6236 || raw.chapters.length !== 114 || raw.juz?.length !== 30 || raw.pages?.length !== 604 || raw.hizbs?.length !== 240 || raw.sajdas?.length !== 15) throw new Error('data/quran.json is not a complete Quran');
  const bySurah: Ayah[][] = Array.from({ length: 114 }, () => []);
  for (const y of ayahs) bySurah[y.s - 1].push(y);
  const q: Quran = {
    meta: raw.meta,
    chapters: raw.chapters,
    juz: raw.juz,
    pages: raw.pages,
    hizbs: raw.hizbs,
    sajdas: raw.sajdas,
    ayahs,
    get: (s, a) => bySurah[s - 1]?.[a - 1],
    note: (lang, s, a) => loadNotes()[lang][`${s}:${a}`],
    surah: (s) => bySurah[s - 1] ?? [],
  };
  if (!path) cached = q;
  return q;
}
