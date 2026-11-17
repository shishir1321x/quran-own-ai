import { describe, expect, it } from 'vitest';
import { loadQuran } from '../src/data.js';
import { normAr } from '../src/text.js';

const q = loadQuran();

describe('the Quran data', () => {
  it('is complete: 114 surahs, 6236 ayahs, in order', () => {
    expect(q.chapters).toHaveLength(114);
    expect(q.ayahs).toHaveLength(6236);
    q.chapters.forEach((c) => expect(q.surah(c.id)).toHaveLength(c.n));
    expect(q.get(2, 286)?.a).toBe(286);
    expect(q.get(2, 287)).toBeUndefined();
  });
  it('has the Arabic, the English and the Bengali for every ayah', () => {
    for (const y of q.ayahs) {
      expect(y.ar.length, `${y.s}:${y.a} arabic`).toBeGreaterThan(0);
      expect(y.en.length, `${y.s}:${y.a} english`).toBeGreaterThan(0);
      expect(y.bn.length, `${y.s}:${y.a} bengali`).toBeGreaterThan(0);
    }
  });
  it('the well-known ayahs are where they should be', () => {
    expect(q.get(2, 255)?.arc).toContain('كرسيه');
    expect(q.get(112, 1)?.arc).toContain('أحد');
    expect(q.get(94, 5)?.en).toMatch(/hardship/i);
    expect(q.get(94, 5)?.bn).toContain('কষ্ট');
  });
  it('the bismillah is not stuck to the first ayah of a surah (only surah 1 has it as ayah 1)', () => {
    expect(normAr(q.get(1, 1)!.ar)).toBe('بسم الله الرحمن الرحيم');
    expect(normAr(q.get(2, 1)!.ar)).toBe('الم');
    expect(normAr(q.get(112, 1)!.ar)).toBe('قل هو الله احد');
    expect(normAr(q.get(95, 1)!.ar)).toMatch(/^والتين/);
    expect(normAr(q.get(9, 1)!.ar)).toMatch(/^براءه/);
    // no first ayah (except 1:1) starts with the bismillah any more
    const welded = q.ayahs.filter((y) => y.a === 1 && y.s !== 1 && normAr(y.ar).startsWith('بسم الله الرحمن الرحيم'));
    expect(welded).toEqual([]);
  });
  it('knows where each of the 30 juz starts', () => expect(q.juz).toHaveLength(30));
  it('records where its text comes from (credit and version)', () => {
    expect(q.meta.sources.map((s) => s.name).join(' ')).toMatch(/Tanzil.*Saheeh.*Zakaria/s);
  });
});
