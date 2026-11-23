// Comprehensive word understanding across Bangla, English, Banglish, and transliterated Arabic.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();

describe('Hamzat al-Wasl Arabic words & screenshot queries (inteha / imteha / imtehan)', () => {
  it.each([
    ['inteha', '2:275'],
    ['imteha', '2:275'],
    ['imtehan', '2:155'],
    ['imtahan', '2:155'],
    ['what does imtahan mean?', '49:3'],
    ['ইন্তেহা', '2:275'],
    ['ইমতেহান', '49:3'],
    ['iqra', '96:1'],
    ['ihdina', '1:6'],
    ['istaghfir', '12:97'],
    ['istigfar', '3:135'],
    ['isbir', '2:153'],
    ['ittaqu', '15:69'],
    ['usjudu', '53:62'],
    ['udkhulu', '2:58'],
    ['gafur', '41:32'],
  ])('%s -> finds real Quran ayahs (incl. %s)', (q, expected) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(false);
    expect(r.ayahs.length, q).toBeGreaterThan(0);
    if (expected) expect(r.ayahs.map((a) => `${a.s}:${a.a}`), q).toContain(expected);
  });
});

describe('Banglish everyday Quran words (full Bengali Quran phonetic index)', () => {
  it.each([
    'pani', 'agun', 'pahar', 'nodi', 'somudro', 'shomudro', 'gach', 'gachh', 'modhu', 'dudh',
    'surjo', 'shurjo', 'chand', 'chad', 'brishti', 'batash', 'pathor', 'loha', 'pakhi', 'mach', 'machh',
    'makorsha', 'moumachi', 'pipra', 'manush', 'nari', 'purush', 'sontan', 'shontan', 'bondhu', 'shotru',
    'gorib', 'dhoni', 'etim', 'jibon', 'mrittu', 'mrityu', 'ghum', 'shopno', 'swopno', 'ondhokar', 'andhakar',
    'sotto', 'mittha', 'shasti', 'purushkar', 'puroshkar', 'valobasha', 'bhalobasha', 'ohongkar', 'ahankar',
    'prithibi', 'srishti', 'rokto', 'hridoy', 'chokh', 'asman', 'jomin', 'khudha', 'byabsha', 'bebsha',
    'hotya', 'churi', 'bichar', 'shakkhi', 'shanti', 'juddho', 'kanna', 'hashi', 'lobh', 'ghrina',
  ])('Banglish "%s" returns real Quran ayahs', (w) => {
    const r = engine.ask(w);
    expect(r.notFound, w).toBe(false);
    expect(r.ayahs.length, w).toBeGreaterThan(0);
  });
});

describe('Bangla spelling tolerance, inflections, and colloquial synonyms', () => {
  it.each([
    'সূর্য', 'সুর্য', 'চাঁদ', 'চাদ', 'পাহাড়', 'পাহার', 'নবী', 'নবি', 'রাসূল', 'রসুল',
    'শান্তি', 'সান্তি', 'ভালোবাসা', 'ভালবাসা', 'দুঃখ', 'দুখ', 'পৃথিবী', 'পৃথিবি',
    'মানুষ', 'মানুষগুলোর', 'পিঁপড়া', 'গরীব', 'ধনী', 'টাকা', 'জল', 'সাগর', 'কবর', 'ফিরিশতা',
  ])('Bangla "%s" returns real Quran ayahs', (w) => {
    const r = engine.ask(w);
    expect(r.notFound, w).toBe(false);
    expect(r.ayahs.length, w).toBeGreaterThan(0);
  });
});

describe('English irregular morphology, synonyms, frequent single words, and 5-letter typos', () => {
  it.each([
    'children', 'women', 'wives', 'thieves', 'forgave', 'spoke', 'taught', 'fought',
    'ocean', 'money', 'education', 'courage', 'humility', 'alcohol', 'illness', 'poverty',
    'earth', 'water', 'light', 'people', 'fire', 'heart', 'truth', 'peace', 'hope', 'fear',
    'thankfulness', 'forgiveness', 'heavn', 'mothr', 'fathr',
  ])('English "%s" returns real Quran ayahs', (w) => {
    const r = engine.ask(w);
    expect(r.notFound, w).toBe(false);
    expect(r.ayahs.length, w).toBeGreaterThan(0);
  });
});

describe('strict negative safety (no false matches on non-Quranic words)', () => {
  it.each([
    'messi', 'Is Elon Musk mentioned in the Quran?', 'pizza', 'airplanes', 'dinosaurs',
    'dhaka', 'india', 'bangladesh', 'cricket', 'football', 'photosynthesis',
    'samosa', 'mango', 'tiktok', 'batman', 'museum', 'tomato', 'lemon', 'melon', 'robot',
  ])('"%s" stays notFound with zero ayahs', (q) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(true);
    expect(r.ayahs, q).toEqual([]);
  });
});

