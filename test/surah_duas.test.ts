// Verification of Surah-wise, "40 Rabbana", Prophet, and topic-based Quranic duas across EN, Bangla, and Banglish.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';
import { PROPHET_DUAS, RABBANA_DUAS, SURAH_DUAS } from '../src/duas.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('Quranic duas by Surah, Rabbana collection, Prophet, and topic (EN / BN / Banglish)', () => {
  it('verifies every [surah, ayah] in SURAH_DUAS, RABBANA_DUAS, and PROPHET_DUAS exists in data/quran.json', () => {
    const valid = new Set(engine.quran.ayahs.map((y) => `${y.s}:${y.a}`));
    for (const [surahStr, entry] of Object.entries(SURAH_DUAS)) {
      const sExpected = Number(surahStr);
      expect(entry.ayahs.length).toBeGreaterThan(0);
      for (const [s, a] of entry.ayahs) {
        expect(s, `Surah key mismatch ${sExpected} vs ${s}`).toBe(sExpected);
        expect(valid.has(`${s}:${a}`), `Missing SURAH_DUAS ref ${s}:${a}`).toBe(true);
      }
    }
    for (const [s, a] of RABBANA_DUAS) {
      expect(valid.has(`${s}:${a}`), `Missing RABBANA_DUAS ref ${s}:${a}`).toBe(true);
    }
    for (const p of PROPHET_DUAS) {
      expect(p.ayahs.length).toBeGreaterThan(0);
      for (const [s, a] of p.ayahs) {
        expect(valid.has(`${s}:${a}`), `Missing PROPHET_DUAS ref ${s}:${a} for ${p.id}`).toBe(true);
      }
    }
  });

  it.each([
    ['duas in Surah Al-Baqarah', 'en', 7, ['2:127', '2:201', '2:250', '2:286']],
    ['duas from Surah Ibrahim', 'en', 6, ['14:35', '14:40', '14:41']],
    ['give me duas in Surah Ali Imran', 'en', 12, ['3:8', '3:38', '3:147', '3:191']],
    ['সূরা বাকারার দোয়াগুলো কী কী?', 'bn', 7, ['2:201', '2:286']],
    ['সূরা ইবরাহীমের দোয়া দাও', 'bn', 6, ['14:35', '14:40', '14:41']],
    ['Surah Taha er dua dao', 'bn', 6, ['20:25', '20:28', '20:114']],
    ['Surah Kahf e kon dua ache?', 'bn', 2, ['18:10', '18:24']],
    ['Surah Al-Araf er dua gula', 'bn', 7, ['7:23', '7:89', '7:126', '7:151']],
    ['Surah Al-Anbiya duas', 'en', 4, ['21:83', '21:87', '21:89']],
    ['Surah Furqan er dua', 'bn', 2, ['25:65', '25:74']],
    ['Surah Hashr dua', 'en', 1, ['59:10']],
    ['Surah Hashr er dua', 'bn', 1, ['59:10']],
    ['duas in Surah Al-Fatiha', 'en', 2, ['1:6', '1:7']],
    ['duas in Surah Al-Muminun', 'en', 8, ['23:29', '23:97', '23:118']],
    ['duas in Surah At-Tahrim', 'en', 2, ['66:8', '66:11']],
    ['duas in Surah Nuh', 'en', 1, ['71:28']],
    ['duas in Surah Yunus', 'en', 3, ['10:85', '10:86', '10:88']],
    ['baqarah er dua', 'bn', 7, ['2:201', '2:286']],
    ['বাকারার দোয়া', 'bn', 7, ['2:201', '2:286']],
  ])('surah-wise dua query "%s" -> lang=%s count=%i (not whole surah)', (q, expectedLang, expectedCount, expectedRefs) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('theme');
    expect(r.notFound).toBe(false);
    expect(r.lang).toBe(expectedLang);
    expect(r.ayahs).toHaveLength(expectedCount);
    const got = r.ayahs.map((a) => `${a.s}:${a.a}`);
    for (const ref of expectedRefs) expect(got).toContain(ref);
  });

  it('gives an honest, helpful response for a surah without direct duas (never dumps whole surah)', () => {
    const r = engine.ask('duas in Surah Al-Kawthar');
    expect(r.kind).toBe('theme');
    expect(r.ayahs).toEqual([]);
    expect(r.answer).toMatch(/does not contain a direct supplication/i);

    const bn = engine.ask('সূরা কাউসারের দোয়া দাও');
    expect(bn.kind).toBe('theme');
    expect(bn.ayahs).toEqual([]);
    expect(bn.lang).toBe('bn');
  });

  it('returns the Rabbana duas collection and Surah-dua overview in EN, Bangla, and Banglish', () => {
    for (const [q, expectedLang] of [
      ['40 rabbana duas', 'en'],
      ['all rabbana duas in the quran', 'en'],
      ['রাব্বানা দোয়াগুলো দাও', 'bn'],
    ] as const) {
      const r = engine.ask(q);
      expect(r.kind).toBe('theme');
      expect(r.lang).toBe(expectedLang);
      expect(r.ayahs).toHaveLength(RABBANA_DUAS.length);
      const got = r.ayahs.map((a) => `${a.s}:${a.a}`);
      expect(got).toEqual(expect.arrayContaining(['2:127', '2:201', '2:286', '3:8', '7:23', '14:41', '18:10', '25:74', '59:10', '66:8']));
    }

    for (const q of ['which surahs have duas?', 'কোন কোন সূরায় দোয়া আছে?']) {
      const r = engine.ask(q);
      expect(r.kind).toBe('theme');
      expect(r.notFound).toBe(false);
      expect(r.ayahs.length).toBeGreaterThanOrEqual(5);
    }
  });

  it.each([
    ['dua of Prophet Musa', 'en', ['20:25', '28:24']],
    ['dua of Prophet Ibrahim', 'en', ['14:40', '14:41', '37:100']],
    ['dua of Prophet Yunus', 'en', ['21:87']],
    ['দোয়া ইউনুস', 'bn', ['21:87']],
    ['dua of Prophet Ayyub', 'en', ['21:83']],
    ['dua of Prophet Adam', 'en', ['7:23']],
    ['dua of Prophet Nuh', 'en', ['11:47', '71:28']],
    ['dua of Prophet Yusuf', 'en', ['12:101']],
    ['dua of Prophet Zakariyya', 'en', ['3:38', '21:89']],
    ['dua of Prophet Sulaiman', 'en', ['27:19', '38:35']],
    ['dua of Asiya', 'en', ['66:11']],
    ['নবী মুসা (আ.) এর দোয়া', 'bn', ['20:25', '28:24']],
    ['Ibrahim (a.) er dua ki?', 'bn', ['14:40', '14:41', '37:100']],
  ])('prophet/figure dua query "%s" (%s)', (q, expectedLang, expectedRefs) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('theme');
    expect(r.lang).toBe(expectedLang);
    const got = r.ayahs.map((a) => `${a.s}:${a.a}`);
    for (const ref of expectedRefs) expect(got).toContain(ref);
  });

  it('answers expanded topic-based Quranic dua categories and keeps existing behavior intact', () => {
    expect(refs('dua for guidance')).toEqual(['1:6', '1:7', '3:8', '18:10']);
    expect(refs('dua for patience')).toEqual(['2:250', '7:126', '3:147']);
    expect(refs('dua for protection')).toEqual(expect.arrayContaining(['113:1', '114:1', '23:97']));
    expect(refs('dua for rizq')).toEqual(['28:24', '5:114', '2:201']);
    expect(refs('dua for anxiety')).toEqual(['21:87', '21:83', '18:10', '2:286']);
    expect(refs('dua for travel')).toEqual(['43:13', '43:14', '23:29', '17:80']);

    // Regressions preserved:
    expect(engine.ask('Surah Al-Baqarah').kind).toBe('surah');
    expect(engine.ask('Surah Al-Baqarah').ayahs).toHaveLength(286);
    expect(engine.ask('story of Yusuf').kind).toBe('story');
    expect(refs('dua for parents')[0]).toBe('17:24');
    expect(refs('dua for parents')).not.toContain('31:14');
    expect(refs('Show Quranic duas for forgiveness in Arabic with English translations.')).toEqual(['7:23', '3:147', '23:118', '2:286']);
  });
});

