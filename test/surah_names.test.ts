// "surah hazz" is Surah Al-Hajj, like "surah hajj": surah names in the spellings people type, in Latin and in Bengali
// letters, without taking an ordinary word or a prophet's name for a surah.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();
const surahOf = (q: string) => {
  const r = engine.ask(q);
  return r.kind === 'surah' ? r.ayahs[0]?.s : `${r.kind}`;
};

describe('Latin spellings next to the word "surah"', () => {
  it.each([
    ['surah hazz', 22], ['surah hojj', 22], ['surah hajj', 22], ['surah al hajj', 22], ['hazz surah', 22],
    ['surah zinn', 72], ['surah jinn', 72], ['surah ahjab', 33], ['surah jasiya', 45], ['surah ahkaf', 46], ['surah jumma', 62],
    ['surah muddassir', 74], ['surah kiyamah', 75], ['surah dahr', 76], ['surah zuha', 93], ['surah takasur', 102], ['surah toha', 20],
    ['surah mominun', 23], ['surah nohol', 16], ['surah kasas', 28], ['surah layl', 92], ['surah kaf', 50], ['surah qaf', 50],
    ['surah ankabut', 29], ['surah adiyat', 100], ['surah anfal', 8], ['surah anbiya', 21], ['surah hujurat', 49], ['surah kahf', 18],
  ])('%s -> %i', (q, s) => expect(surahOf(q)).toBe(s));

  it('"zariyat" is Adh-Dhariyat (51), not Al-Hujurat (49)', () => {
    for (const q of ['surah zariyat', 'surah zariat', 'surah dhariyat']) expect(surahOf(q), q).toBe(51);
  });

  it('Quraish and Kawthar are surahs, not Ayat al-Kursi (their consonants are those of "kursi")', () => {
    for (const q of ['surah quraish', 'surah kawsar', 'surah kauser', 'সূরা কাউসার', 'সূরা কুরাইশ']) expect(engine.ask(q).kind, q).toBe('surah');
    expect(surahOf('surah quraish')).toBe(106);
    expect(surahOf('surah kawsar')).toBe(108);
  });

  it('Ayat al-Kursi still works', () => {
    for (const q of ['ayatul kursi', 'kursi', 'ayat al kursi', 'আয়াতুল কুরসি']) expect(engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`), q).toEqual(['2:255']);
  });

  it('an ordinary Banglish word after "surah" is never a short surah name', () => {
    for (const q of ['surah er nam ki', 'surah nam', 'surah kon ta', 'surah te ki ache']) expect(engine.ask(q).kind, q).not.toBe('surah');
  });
});

describe('Bengali names', () => {
  it.each([
    ['সূরা হজ্জ', 22], ['সূরা হজ্জের অর্থ', 22], ['সূরা আহযাব', 33], ['সূরা জুমআ', 62], ["সূরা জুমু'আ", 62], ['সূরা আনকাবুত', 29],
    ['সূরা আদিয়াত', 100], ['সূরা আল-ফজর', 89], ['সূরা নূহ', 71], ['সূরা তওবা', 9], ['সূরা আত-তাওবাহ', 9], ['সূরা ত্বা হা', 20],
    ['সূরা বনী ইসরাইল', 17], ['সূরা আলা', 87], ['সূরা আলাক', 96], ['সূরা আন নাস', 114], ['সূরা আন নাসর', 110], ['সূরা তীন', 95],
    ['সূরা হুমাযা', 104], ['সূরা ফুরকান', 25], ['সূরা হাদীদ', 57], ['সূরা কাফ', 50], ['সূরা ইয়াসিন', 36],
  ])('%s -> %i', (q, s) => expect(surahOf(q)).toBe(s));

  it('every one of the 114 surahs has a Bengali name', async () => {
    const src = (await import('node:fs')).readFileSync(new URL('../src/surahs.ts', import.meta.url), 'utf8');
    const bengaliPart = src.slice(src.indexOf('const BENGALI_NAMES'), src.indexOf('const BENGALI_ALL'));
    const ids = new Set([...bengaliPart.matchAll(/,\s*(\d+)\]/g)].map((m) => Number(m[1])));
    for (let s = 1; s <= 114; s++) expect(ids.has(s), `surah ${s}`).toBe(true);
  });

  it('the name next to "সূরা" wins over an earlier ordinary word ("তিন" is three)', () => {
    expect(engine.ask('প্রথম তিন আয়াত সূরা মুলক').ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(['67:1', '67:2', '67:3']);
    expect(engine.ask('তিনটি সূরার নাম বলো').ayahs.some((a) => a.s === 95)).toBe(false);
  });

  it('an ordinary word or a prophet\'s name elsewhere in a question about surahs is not a surah', () => {
    for (const q of ['ফজর নামাজে কোন সূরা পড়া হয়', 'কোন সূরায় নূহ নবীর কথা আছে', 'তওবা সম্পর্কে কোন সূরায় বলা আছে',
      'তালাক নিয়ে কোন সূরা আছে', 'জিন সম্পর্কে কোন সূরায় আছে', 'হজ্জ সম্পর্কে কোন সূরায় বলা হয়েছে', 'জুমার নামাজে কোন সূরা পড়তে হয়',
      'কিয়ামতের দিন সম্পর্কে কোন সূরায় বলা হয়েছে', 'হজ্জ', 'তওবা']) expect(engine.ask(q).kind, q).not.toBe('surah');
  });
});

describe('Surah Al-Kafirun is not the sensitive topic "kafir"', () => {
  it('opens the surah in Bengali, Arabic and English', () => {
    for (const q of ['সূরা কাফিরুন', 'কাফিরুন', 'سورة الكافرون', 'surah kafirun']) expect(surahOf(q), q).toBe(109);
  });
  it('a question about kafirs still goes to a scholar', () => {
    for (const q of ['কাফির কারা', 'কাফেরদের সাথে কি করতে হবে', 'من هو الكافر', 'who are the kafir']) expect(engine.ask(q).kind, q).toBe('scholar');
  });
});
