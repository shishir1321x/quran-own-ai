import { describe, expect, it } from 'vitest';
import { loadQuran } from '../src/data.js';
import { countWord, extremeSurahs, revelationCounts, surahInfo, totals } from '../src/stats.js';

const q = loadQuran();

describe('numbers', () => {
  it('surah info', () => expect(surahInfo(q, 2).line).toBe('Surah 2: Al-Baqara (البقرة), 286 ayahs, Medinan.'));
  it('the longest surah is Al-Baqara (286); the shortest are three surahs of 3 ayahs', () => {
    expect(extremeSurahs(q, 'most').ids).toEqual([2]);
    expect(extremeSurahs(q, 'fewest').ids).toEqual([103, 108, 110]);
    expect(extremeSurahs(q, 'fewest').value).toBe(3);
  });
  it('Meccan + Medinan add up to everything', () => {
    const r = revelationCounts(q);
    expect(r.meccan + r.medinan).toBe(114);
    expect(r.meccan).toBe(86);
    expect(totals(q).value).toBe(6236);
  });
  it('counts an exact word and says what it counted', () => {
    const r = countWord(q, 'Patience', 'en');
    expect(r.total).toBeGreaterThan(5);
    expect(r.line).toMatch(/Exact word form only/);
    expect(countWord(q, 'bitcoin', 'en').total).toBe(0);
  });
  it('counts an Arabic word without vowel marks', () => {
    expect(countWord(q, 'كرسيه', 'ar').total).toBeGreaterThanOrEqual(1);
  });
});
