import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';
import { bengaliSkeleton, editDistance, latinSkeleton, makeSkeletonIndex } from '../src/fuzzy.js';
import { isAyatulKursi } from '../src/kursi.js';
import { mappedEnglishWords } from '../src/text.js';

const e = new Engine();
const refs = (q: string) => e.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('skeletons', () => {
  it('Latin: the vowels and similar letters do not matter', () => {
    expect(new Set(['dhairjo', 'dhoirjo', 'dhorjo', 'dhoirjyo'].map(latinSkeleton)).size).toBe(1);
    expect(latinSkeleton('kursi')).toBe(latinSkeleton('kurshi'));
    expect(latinSkeleton('zakat')).toBe(latinSkeleton('jakat'));
    expect(latinSkeleton('ayatul kursi')).toBe(latinSkeleton('aital kursi'));
  });
  it('Bengali: স/শ/ষ and the vowel signs do not matter', () => {
    expect(bengaliSkeleton('কুরসি')).toBe(bengaliSkeleton('কুরশি'));
    expect(bengaliSkeleton('আয়াতুল কুরসি')).toBe(bengaliSkeleton('আয়াত আল কুরশি'));
  });
  it('edit distance counts a swap of two neighbours as one', () => {
    expect(editDistance('krs', 'ksr')).toBe(1);
    expect(editDistance('abc', 'abc')).toBe(0);
    expect(editDistance('abc', 'xyz')).toBe(3);
  });
  it('a skeleton that two different values share is never guessed', () => {
    const idx = makeSkeletonIndex<number>([['bat', 1], ['bet', 2], ['kursi', 3]], latinSkeleton, 2);
    expect(idx.exact('bit')).toBeNull();
    expect(idx.exact('kurshi')).toBe(3);
  });
});

describe('Ayat al-Kursi in every spelling people use', () => {
  it.each([
    'Where is Ayat al-Kursi?', 'aital kursi', 'Aytal Kursi', 'Ayat Al Kurshi', 'ayatul kursi', 'Ayat-ul-Kursi', 'ayat kursi', 'kursi',
    'আয়াতুল কুরসি', 'আয়াতল কুসরি', 'আয়াত আল কুরশি', 'আয়াত কুরসি', 'আয়াতুল কুরসি কোথায় আছে?', 'آية الكرسي',
  ])('%s', (q) => expect(refs(q)).toEqual(['2:255']));
  it('other questions are not mistaken for it', () => {
    for (const q of ['What does the Quran say about patience?', 'surah baqara', 'How many ayahs are in Surah Al-Baqarah?', 'the chair is broken', 'আয়াত'])
      expect(isAyatulKursi(q), q).toBe(false);
  });
});

describe('a surah written another way', () => {
  it.each([['surah bakara', 2], ['Surah Bakarah', 2], ['surah yaseen', 36], ['surah mulq', 67], ['surah nass', 114], ['surah an nas', 114], ['bakara', 2], ['surah ikhlaas', 112]])(
    '%s -> surah %i', (q, s) => expect(e.ask(q).ayahs[0].s).toBe(s));
  it('an ordinary word is still not a surah', () => {
    expect(e.ask('I need to feel better').kind).not.toBe('surah');
    expect(e.ask('hope').kind).not.toBe('surah');
  });
});

describe('a juz (para)', () => {
  it.each([
    ['Bakara 3 para', '2:253'], ['para 30', '78:1'], ['3 নং পারা', '2:253'], ['juz 5', '4:24'], ['পারা ২৯', '67:1'], ['الجزء 2', '2:142'], ['para 1', '1:1'],
  ])('%s starts at %s', (q, first) => {
    const r = e.ask(q);
    expect(r.kind).toBe('juz');
    expect(`${r.ayahs[0].s}:${r.ayahs[0].a}`).toBe(first);
  });
  it('the 30 starts come from Tanzil, in order', () => {
    expect(e.quran.juz).toHaveLength(30);
    expect(e.quran.juz[3]).toEqual([3, 93]);
    expect(e.quran.juz[13]).toEqual([15, 1]);
  });
  it('para 31 does not exist', () => expect(e.ask('para 31').kind).not.toBe('juz'));
});

describe('Banglish words in other spellings', () => {
  it.each([['dhorjo niye ki ache', '2:153'], ['sobor', '2:153'], ['jakaat', '2:261'], ['namaj keno', '29:45'], ['roja', '2:183']])('%s -> %s', (q, first) => {
    expect(e.ask(q).kind).toBe('theme');
    expect(refs(q)[0]).toBe(first);
  });
  it('a real English word is never "corrected"', () => {
    const isEnglish = (w: string) => ['mother', 'father', 'dozen'].includes(w);
    expect(mappedEnglishWords('mother father dozen', isEnglish)).toEqual([]);
  });
});
