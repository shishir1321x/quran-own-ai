import { describe, expect, it } from 'vitest';
import { Bm25 } from '../src/bm25.js';
import { americanize, cleanTranslation, mappedEnglishWords, normAr, stemEn, tokensAr, tokensBn, tokensEn } from '../src/text.js';

describe('cleanTranslation (display only)', () => {
  it('removes the verse number and footnote marks, keeps the translator\'s own brackets', () => {
    expect(cleanTranslation('(1) In the name of Allāh,[2] the Entirely Merciful, the Especially Merciful.[3]'))
      .toBe('In the name of Allāh, the Entirely Merciful, the Especially Merciful.');
    expect(cleanTranslation('For indeed, with hardship [will be] ease [i.e., relief].')).toContain('[will be]');
    expect(cleanTranslation('রহমান, রহীম [১] আল্লাহ্‌র নামে [২]')).toBe('রহমান, রহীম আল্লাহ্‌র নামে');
  });
});

describe('words', () => {
  it('English: stop words go, plurals and -ing are merged', () => {
    expect(tokensEn('What does the Quran say about praying?')).toEqual(['pray']);
    expect(stemEn('patients')).toBe('patient');
  });
  it('British -our spellings become American, but "hour" and "your" stay', () => {
    expect(americanize('neighbours')).toBe('neighbors');
    expect(americanize('honour')).toBe('honor');
    expect(americanize('your')).toBe('your');
    expect(americanize('hours')).toBe('hours');
  });
  it('Bengali: a suffix is cut and the question words are dropped', () => {
    expect(tokensBn('কুরআনে কি ফুটবলের কথা আছে?')).toEqual(['ফুটবল']);
  });
  it('Arabic: vowel marks and the article are removed', () => {
    expect(normAr('ٱلْحَمْدُ لِلَّهِ')).toBe('الحمد لله');
    expect(tokensAr('ماذا يقول القرآن عن بر الوالدين؟')).toEqual(['بر', 'والدين']);
  });
  it('Banglish and prophet names are translated to the English words', () => {
    expect(mappedEnglishWords('namaz keno porbo')).toEqual(['prayer']);
    expect(mappedEnglishWords('Tell me about Ibrahim')).toEqual(['abraham']);
  });
});

describe('BM25', () => {
  const docs = [['patience', 'prayer'], ['patience'], ['charity'], ['prayer', 'prayer', 'fasting']];
  const bm = new Bm25(docs);
  it('ranks the ayah with both words first and finds nothing for an unknown word', () => {
    expect(bm.search(['patience', 'prayer'])[0].doc).toBe(0);
    expect(bm.search(['bitcoin'])).toEqual([]);
  });
  it('a rare word weighs more than a common one', () => {
    expect(bm.idf('charity')).toBeGreaterThan(bm.idf('prayer'));
  });
  it('reports how much of the question a document covers', () => {
    const h = bm.search(['patience', 'prayer']).find((x) => x.doc === 0)!;
    expect(h.matched).toBe(2);
  });
});
