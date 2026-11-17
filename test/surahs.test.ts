import { describe, expect, it } from 'vitest';
import { loadQuran } from '../src/data.js';
import { makeSurahFinder, skey } from '../src/surahs.js';

const q = loadQuran();
const f = makeSurahFinder(q);

describe('surah names', () => {
  it('every one of the 114 surahs has its own key (no two share one)', () => {
    const keys = q.chapters.map((c) => skey(c.tr));
    expect(new Set(keys).size).toBe(114);
  });
  it('finds a surah in English, Banglish, Bengali and Arabic', () => {
    expect(f.find('How many ayahs are in Surah Al-Baqarah?')).toBe(2);
    expect(f.find('surah naas er banglay ortho ki?')).toBe(114);
    expect(f.find('baqara')).toBe(2);
    expect(f.find('সূরা ফাতিহা')).toBe(1);
    expect(f.find('اشرح لي سورة الإخلاص')).toBe(112);
    expect(f.find('ya sin')).toBe(36);
  });
  it('a name that is also an ordinary word needs the word "surah"', () => {
    for (const w of ['rahman', 'asr', 'fil', 'tin', 'feel sad', 'hope']) expect(f.find(w)).toBeNull();
    expect(f.find('surah rahman')).toBe(55);
    expect(f.find('surah asr')).toBe(103);
  });
  it('At-Talaq and Al-Alaq are different surahs', () => {
    expect(f.find('surah talaq')).toBe(65);
    expect(f.find('surah alaq')).toBe(96);
  });
});
