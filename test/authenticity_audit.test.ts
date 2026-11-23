// Comprehensive authenticity & regression audit across English, Bangla, and Banglish.
// Every Quranic verse, structural fact, proper-name count, and honest boundary is tested directly
// against data/quran.json and verified behaviors.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';
import { THEMES } from '../src/lexicon.js';
import { TOPIC_GUIDE } from '../src/topicGuide.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('systemic collision and misroute fixes', () => {
  it('routes story of Bilqis to Queen of Sheba (27:22-31), never Satan', () => {
    const r = engine.ask('story of bilqis');
    expect(r.kind).toBe('story');
    expect(r.notFound).toBe(false);
    expect(r.ayahs[0]).toEqual({ s: 27, a: 22 });
    expect(r.ayahs[r.ayahs.length - 1]).toEqual({ s: 27, a: 31 });
  });

  it('routes pork exclusively to forbidden foods (2:173), never trials and tests', () => {
    const r = engine.ask('what does the quran say about pork?');
    expect(r.kind).toBe('theme');
    expect(r.notFound).toBe(false);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:173');
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).not.toContain('2:155');
    expect(r.answer.toLowerCase()).not.toContain('trials and tests');
  });

  it('routes kon sahabir nam quran e ache? to Zayd (33:37), never patience', () => {
    const r = engine.ask('kon sahabir nam quran e ache?');
    expect(r.kind).toBe('data');
    expect(r.lang).toBe('bn');
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(['33:37']);
  });

  it('routes Bengali Qul surahs question to the 5 Qul surahs, never anger', () => {
    const r = engine.ask('কোন সূরাগুলো কুল দিয়ে শুরু হয়েছে?');
    expect(r.kind).toBe('data');
    expect(r.lang).toBe('bn');
    const joined = `${r.answer} ${r.data?.join(' ') ?? ''}`;
    for (const s of ['72', '109', '112', '113', '114']) {
      expect(joined).toContain(s);
    }
  });
});

describe('proper-name occurrence counts in Arabic Quran text', () => {
  it('counts Iblis as 11 times in 11 ayahs, not Satan (73)', () => {
    const r = engine.ask('how many times is iblis mentioned in the quran?');
    expect(r.kind).toBe('data');
    expect(r.answer).toContain('11');
    expect(r.answer).not.toContain('73');
  });

  it('counts Jibril across all prefixed Arabic forms (3 times in 3 ayahs)', () => {
    const r = engine.ask('how many times is jibril mentioned in the quran?');
    expect(r.kind).toBe('data');
    expect(r.answer).toContain('3');
    expect(r.data?.join(' ')).toContain('2');
  });
});

describe('honest non-Quranic boundaries, Hadith guards, and safety', () => {
  it.each([
    ['is dajjal mentioned in the quran?', 'en'],
    ['দাজ্জাল কি কুরআনে আছে?', 'bn'],
    ['dajjal ki quran e ache?', 'bn'],
    ['is imam mahdi mentioned in the quran?', 'en'],
    ['ইমাম মাহদী কি কুরআনে আছে?', 'bn'],
    ['imam mahdi ki quran e ache?', 'bn'],
  ])('%s -> honest not-named-in-Quran scholar boundary in %s with 0 ayahs', (q, lang) => {
    const r = engine.ask(q);
    expect(r.kind, q).toBe('scholar');
    expect(r.lang, q).toBe(lang);
    expect(r.notFound, q).toBe(true);
    expect(r.ayahs, q).toEqual([]);
  });

  it.each([
    'which surah is equal to one third of the quran?',
    'which surah protects from dajjal?',
    'which surah protects from punishment of the grave?',
    'which surah is called umm al quran?',
    'which surah is called bride of the quran?',
  ])('%s -> Hadith/virtue scholar boundary with 0 ayahs', (q) => {
    const r = engine.ask(q);
    expect(r.kind, q).toBe('scholar');
    expect(r.notFound, q).toBe(true);
    expect(r.ayahs, q).toEqual([]);
  });

  it('routes Banglish churi to sensitive scholar boundary', () => {
    const r = engine.ask('churi korle ki hoy?');
    expect(r.kind).toBe('scholar');
    expect(r.lang).toBe('bn');
    expect(r.ayahs).toEqual([]);
  });

  it('preserves crisis safety trigger for suicide questions', () => {
    const r = engine.ask('what does the quran say about suicide?');
    expect(r.kind).toBe('crisis');
    expect(r.ayahs).toEqual([]);
  });
});

describe('verified Quran structural and factual answers (EN, BN, Banglish)', () => {
  it('computes Musa (136 times in 131 ayahs) as most-mentioned prophet and detects Banglish bn', () => {
    for (const [q, lang] of [
      ['which prophet is mentioned the most in the quran?', 'en'],
      ['কোন নবীর নাম কুরআনে সবচেয়ে বেশি এসেছে?', 'bn'],
      ['kon nobir nam quran e sobcheye beshi esheche?', 'bn'],
    ] as const) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('data');
      expect(r.lang, q).toBe(lang);
      const all = `${r.answer} ${r.data?.join(' ') ?? ''}`;
      expect(all, q).toContain('136');
      expect(all, q).toContain('131');
    }
  });

  it('computes cow (19 times in 19 ayahs) as most-mentioned named animal', () => {
    for (const q of [
      'which animal is mentioned the most in the quran?',
      'কুরআনে সবচেয়ে বেশি কোন প্রাণীর নাম এসেছে?',
    ]) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('data');
      const all = `${r.answer} ${r.data?.join(' ') ?? ''}`;
      expect(all, q).toContain('19');
    }
  });

  it('lists all 6 surahs named after animals', () => {
    for (const q of [
      'how many surahs are named after animals?',
      'which surahs are named after animals?',
      'প্রাণীর নামে কয়টি সূরা আছে?',
    ]) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('data');
      const all = `${r.answer} ${r.data?.join(' ') ?? ''}`;
      expect(all, q).toContain('Al-Baqara');
      expect(all, q).toContain('An-Naml');
      expect(all, q).toContain('Al-Fil');
    }
  });

  it.each([
    ['which surah is named after an ant?', 'An-Naml'],
    ['which surah is named after a bee?', 'An-Nahl'],
    ['which surah is named after a spider?', 'Al-Ankaboot'],
    ['which surah is named after iron?', 'Al-Hadid'],
    ['pipra name kon surah ache?', 'An-Naml'],
    ['moumachi name kon surah ache?', 'An-Nahl'],
    ['makorsha name kon surah ache?', 'Al-Ankaboot'],
    ['মৌমাছি নামে কোন সূরা আছে?', 'An-Nahl'],
  ])('%s -> resolves to %s instead of notFound or 114-surah dump', (q, expectedSurah) => {
    const r = engine.ask(q);
    expect(r.kind, q).toBe('data');
    expect(r.answer, q).toContain(expectedSurah);
    expect(r.answer, q).not.toContain('Al-Faatiha');
  });

  it('answers Surah opening questions accurately from data/quran.json', () => {
    const alm = engine.ask('which surahs start with alif lam mim?');
    expect(alm.kind).toBe('data');
    expect(alm.answer).toContain('6');
    expect(alm.answer).toContain('Al-Baqara');
    expect(alm.answer).toContain('As-Sajda');

    const hm = engine.ask('which surahs start with ha mim?');
    expect(hm.kind).toBe('data');
    expect(hm.answer).toContain('7');
    expect(hm.answer).toContain('Al-Ghaafir');
    expect(hm.answer).toContain('Al-Ahqaf');

    const alhamd = engine.ask('কোন সূরাটি আল-হামদুলিল্লাহ দিয়ে শুরু হয়েছে?');
    expect(alhamd.kind).toBe('data');
    expect(alhamd.lang).toBe('bn');
    expect(alhamd.data?.join(' ')).toContain('5');
    expect(alhamd.answer).toContain('Al-Faatiha');
    expect(alhamd.answer).toContain('Faatir');

    const muq = engine.ask('কয়টি সূরা হুরুফে মুকাত্তাআত দিয়ে শুরু হয়েছে?');
    expect(muq.kind).toBe('data');
    expect(muq.data?.join(' ')).toContain('29');
    expect(muq.answer).not.toContain('১১৪');
  });

  it('answers Zayd (33:37), named angels, Ramadan, Jumuah/Sabt, mosques, and revelation period factually', () => {
    expect(engine.ask('কোন সাহাবীর নাম কুরআনে আছে?').ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(['33:37']);

    const angels = engine.ask('which angels are mentioned in the quran?');
    expect(angels.kind).toBe('data');
    expect(angels.answer).toContain('Jibril');
    expect(angels.answer).toContain('Mikail');
    expect(angels.answer).toContain('Harut');
    expect(angels.answer).toContain('Malik');

    const month = engine.ask('পবিত্র কুরআনে কোন মাসের নাম এসেছে?');
    expect(month.kind).toBe('data');
    expect(month.answer).toContain('রমজান');
    expect(month.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:185');

    const day = engine.ask('which day is mentioned in the quran?');
    expect(day.kind).toBe('data');
    expect(day.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('62:9');
    expect(day.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:65');

    const mosques = engine.ask('which mosques are mentioned in the quran?');
    expect(mosques.kind).toBe('data');
    expect(mosques.answer).toContain('Al-Masjid al-Haram');
    expect(mosques.answer).toContain('Al-Masjid al-Aqsa');

    const years = engine.ask('how many years did it take to reveal the quran?');
    expect(years.kind).toBe('data');
    expect(years.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('17:106');
  });
});

describe('new authentic stories and topics across EN, Bangla, and Banglish', () => {
  it.each([
    ['story of asiya wife of pharaoh', '66:11'],
    ['আসিয়া সম্পর্কে কুরআন কী বলে?', '66:11'],
    ['what does the quran say about tahajjud?', '17:79'],
    ['তাহাজ্জুদ নামাজ নিয়ে কুরআনে কী বলা হয়েছে?', '17:79'],
    ['what does the quran say about racism?', '49:13'],
    ['বর্ণবাদ সম্পর্কে কুরআন কী বলে?', '49:13'],
    ['what does the quran say about cheating and fraud?', '83:1'],
    ['প্রতারণা ও ভেজাল নিয়ে কুরআন কী বলে?', '83:1'],
    ['what does the quran say about isra and miraj?', '17:1'],
    ['ইসরা ও মিরাজ সম্পর্কে কুরআন কী বলে?', '17:1'],
    ['what does the quran say about trinity?', '4:171'],
    ['what does the quran say about crucifixion of jesus?', '4:157'],
    ['yajuj majuj in the quran', '18:94'],
    ['what does the quran say about torah and gospel?', '5:44'],
    ['what does the quran say about success and hard work?', '23:1'],
    ['sofolota o porishrom niye quran ki bole?', '23:1'],
    ['what does the quran say about sahaba companions?', '9:100'],
    ['heartbreak quran', '94:5'],
    ['overthinking quran', '94:5'],
  ])('%s -> cites %s with notFound false', (q, expectedRef) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(false);
    expect(refs(q), q).toContain(expectedRef);
  });
});

describe('TOPIC_GUIDE structural and verse integrity against data/quran.json', () => {
  it('every ref cited in TOPIC_GUIDE points exists in quran.json and belongs to its theme ayahs', () => {
    const q = engine.quran;
    for (const [themeId, entry] of Object.entries(TOPIC_GUIDE)) {
      const themeAyahs = new Set(
        THEMES.filter((t) => t.id === themeId).flatMap((t) => t.ayahs.map(([s, a]) => `${s}:${a}`)),
      );
      expect(themeAyahs.size, `missing theme for guide ${themeId}`).toBeGreaterThan(0);
      for (const lang of ['en', 'bn', 'ar'] as const) {
        for (const bullet of entry.points[lang]) {
          for (const m of bullet.matchAll(/\b(\d{1,3}):(\d{1,3})\b/g)) {
            const s = Number(m[1]), a = Number(m[2]);
            expect(q.get(s, a), `${themeId} (${lang}) cites nonexistent ${s}:${a}`).toBeTruthy();
            expect(themeAyahs.has(`${s}:${a}`), `${themeId} (${lang}) cites ${s}:${a} outside theme ayahs`).toBe(true);
          }
        }
      }
    }
  });
});

