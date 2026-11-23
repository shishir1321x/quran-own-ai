// Finding ayahs for any particular Quranic Arabic word written in Latin, Banglish, Bengali, or Arabic.
import { describe, expect, it } from 'vitest';
import { Engine, type HistoryTurn } from '../src/engine.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('particular Quran word lookup (phonetic Arabic index)', () => {
  it.each([
    ['sabikun', '56:10'],
    ['sabiqun', '56:10'],
    ['assabiqun', '56:10'],
    ['bring the ayahs of sabikun', '56:10'],
    ['which ayah mentions sabiqun?', '56:10'],
    ['sabiqun shobder ortho ki?', '56:10'],
    ['সাবিকুন', '56:10'],
    ['সাবিকুন কোন আয়াতে আছে?', '56:10'],
    ['muttaqun', '39:33'],
    ['muttaqin', '2:2'],
    ['muttakin', '56:16'],
    ['muflihun', '2:5'],
    ['zalimun', '23:107'],
    ['firdaws', '18:107'],
    ['tasnim', '83:27'],
    ['salsabil', '76:18'],
    ['zakkum', '37:62'],
    ['sidrat', '53:14'],
    ['sidratul muntaha', '53:14'],
    ['muqarrabun', '56:11'],
    ['khashiun', '23:2'],
    ['hanif', '3:95'],
  ])('%s -> includes %s', (q, expected) => {
    const r = engine.ask(q);
    expect(r.notFound).toBe(false);
    expect(refs(q)).toContain(expected);
  });

  it('does not confuse Arabic words like "zalimun" with similar-skeleton prophet names', () => {
    const r = refs('zalimun');
    expect(r).toContain('23:107');
    expect(r).not.toContain('27:27');
    expect(r).not.toContain('38:34');
  });

  it('returns all 4 ayahs containing sabikun/sabiqun (not hidden by 2-word 56:10 score)', () => {
    expect(refs('sabikun')).toEqual(expect.arrayContaining(['56:10', '23:61', '35:32', '9:100']));
    expect(refs('sabiqun')).toEqual(expect.arrayContaining(['56:10', '23:61', '35:32', '9:100']));
  });

  it('understands bare pronouns/demonstratives like ulaika and alladhina spelling variants', () => {
    for (const q of ['ulaika', 'Ulaika', 'what does ulaika mean?']) {
      const r = engine.ask(q);
      expect(r.notFound, q).toBe(false);
      expect(r.answer, q).toContain('أولئك');
      expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:5');
    }
    for (const q of ['alladhina', 'Allahzina', 'allahjina', 'allahdina', 'allahdhina', 'allahjina shobder ortho ki?']) {
      const r = engine.ask(q);
      expect(r.notFound, q).toBe(false);
      expect(r.answer, q).toContain('الذين');
      expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:3');
    }
    const showMoreUlaika = engine.ask('show more', [{
      question: 'ulaika',
      answer: engine.ask('ulaika').answer,
      citations: engine.ask('ulaika').ayahs.map((a) => ({ surah: a.s, ayah: a.a })),
    }]);
    expect(showMoreUlaika.notFound).toBe(false);
    expect(showMoreUlaika.ayahs.length).toBeGreaterThan(0);

    const showMoreAlladhina = engine.ask('show more', [{
      question: 'allahjina',
      answer: engine.ask('allahjina').answer,
      citations: engine.ask('allahjina').ayahs.map((a) => ({ surah: a.s, ayah: a.a })),
    }]);
    expect(showMoreAlladhina.notFound).toBe(false);
    expect(showMoreAlladhina.ayahs.length).toBeGreaterThan(0);
  });

  it('handles vowel variations (e<->i, o<->u) and Unicode diacritics across all Quran words', () => {
    for (const q of ['muflehun', 'moflehun', 'muflihon', 'al-mufliḥūn', 'muflihun']) {
      const r = engine.ask(q);
      expect(r.notFound, q).toBe(false);
      expect(r.ayahs.map((a) => `${a.s}:${a.a}`), q).toContain('2:5');
    }
    for (const [q, expected] of [
      ['sabekun', '56:10'],
      ['kafiron', '109:1'],
      ['zalemun', '23:107'],
      ['moslemun', '21:108'],
      ['muttaken', '56:16'],
      ['muttaqen', '2:2'],
      ['monafekun', '8:49'],
      ['yastahzeun', '15:11'],
      ['tazakkarun', '37:155'],
      ['taqelun', '37:138'],
      ['hesab', '78:27'],
      ['jebril', '2:98'],
      ['ebadat', '19:65'],
    ] as const) {
      const r = engine.ask(q);
      expect(r.notFound, q).toBe(false);
      expect(r.kind, q).not.toBe('theme');
      expect(r.ayahs.map((a) => `${a.s}:${a.a}`), q).toContain(expected);
    }
    expect(engine.ask('yastahzeun').kind).toBe('search');
    // Known Banglish topic words like "sabar" must still map to their theme cleanly.
    const sabar = engine.ask('sabar');
    expect(sabar.kind).toBe('theme');
    expect(sabar.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:153');
  });

  it('supports "show more" after a transliterated word query', () => {
    const first = engine.ask('muttakin');
    expect(first.ayahs.length).toBe(5);
    const turn: HistoryTurn = {
      question: 'muttakin',
      answer: first.answer,
      citations: first.ayahs.map((a) => ({ surah: a.s, ayah: a.a })),
    };
    const next = engine.ask('show more', [turn]);
    expect(next.notFound).toBe(false);
    expect(next.ayahs.length).toBeGreaterThan(0);
    const firstSet = new Set(first.ayahs.map((a) => `${a.s}:${a.a}`));
    for (const y of next.ayahs) expect(firstSet.has(`${y.s}:${y.a}`)).toBe(false);
  });

  it('never hallucinates Arabic hits for non-Quran words, cities, food, or Banglish chat words', () => {
    for (const q of ['messi', 'pizza', 'airplanes', 'dinosaurs', 'dhaka', 'india', 'photosynthesis', 'cricket', 'google', 'taka']) {
      const r = engine.ask(q);
      expect(r.notFound, q).toBe(true);
      expect(r.ayahs, q).toEqual([]);
    }
  });
});

