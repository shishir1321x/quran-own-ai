// Full-Quran Arabic-phonetic phrase & short-word understanding tests across Latin and Bengali scripts.
// Verifies "kun", "kun faya kun", "কুন ফায়া কুন", tajweed/wasl liaisons, splits/joins,
// zero theme/surah hijacks, and zero false positives on off-topic queries.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('user screenshot queries: kun, kun faya kun, কুন ফায়া কুন', () => {
  it.each([
    'kun',
    'kun faya kun',
    'kun fayakun',
    'kunfayakun',
    'fayakun',
    'কুন',
    'কুন ফায়া কুন',
    'কুন ফায়াকুন',
    'ফায়াকুন',
    'what does kun faya kun mean?',
    'কুন ফায়া কুন অর্থ কী?',
  ])('%s -> resolves to كُن فَيَكُونُ ayahs (e.g. 36:82)', (q) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(false);
    expect(refs(q), q).toContain('36:82');
  });

  it('resolves "faya" and "ফায়া" to authentic 40:81 (فَأَىَّ), never false 51:26', () => {
    for (const q of ['faya', 'ফায়া']) {
      const r = engine.ask(q);
      expect(r.notFound, q).toBe(false);
      expect(refs(q), q).toContain('40:81');
      expect(refs(q), q).not.toContain('51:26');
    }
  });
});

describe('famous Latin-transliterated Quranic phrases (splits, joins, sun letters, Uthmani fixes)', () => {
  it.each([
    ['bismillahi rahmanir rahim', '1:1'],
    ['alhamdulillahi rabbil alamin', '1:2'],
    ['maliki yawmid din', '1:4'],
    ['iyyaka nabudu wa iyyaka nastain', '1:5'],
    ['ihdinas siratal mustaqim', '1:6'],
    ['inna lillahi wa inna ilayhi rajiun', '2:156'],
    ['la ikraha fid din', '2:256'],
    ['la yukallifullahu nafsan illa wusaha', '2:286'],
    ['hasbunallahu wa nimal wakeel', '3:173'],
    ['kullu nafsin zaikatul maut', '3:185'],
    ['la tahzan innallaha maana', '9:40'],
    ['rabbi ishrah li sadri', '20:25'],
    ['rabbishrahli sadri', '20:25'],
    ['rabbi zidni ilma', '20:114'],
    ['la ilaha illa anta subhanaka', '21:87'],
    ['wa ma arsalnaka illa rahmatal lil alamin', '21:107'],
    ['wama khalaqtul jinna wal insa', '51:56'],
    ['fabi ayyi ala i rabbikuma tukadhiban', '55:13'],
    ['inna ma al usri yusra', '94:5'],
    ['wal asr innal insana lafi khusr', '103:1'],
    ['wal asr innal insana lafi khusr', '103:2'],
    ['lakum dinukum waliya din', '109:6'],
    ['qul huwallahu ahad', '112:1'],
  ])('%s -> cites %s with no misroute', (q, expected) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(false);
    expect(refs(q), q).toContain(expected);
  });
});

describe('Bengali-transliterated Quranic phrases & short words', () => {
  it.each([
    ['ইন্না লিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন', '2:156'],
    ['হাসবুনাল্লাহু ওয়া নিমাল ওয়াকিল', '3:173'],
    ['লা ইলাহা ইল্লা আনতা', '21:87'],
    ['লা তাহযান ইন্নাল্লাহা মাআনা', '9:40'],
    ['ইয়্যাকা নাবুদু', '1:5'],
    ['ইহদিনাস সিরাতাল মুস্তাকিম', '1:6'],
    ['রব্বি যিদনি ইলমা', '20:114'],
    ['রব্বিশ রাহলি সদরি', '20:25'],
    ['ফাবি আইয়ি আলাই রব্বিকুমা', '55:13'],
    ['কুল হুওয়াল্লাহু আহাদ', '112:1'],
    ['আলিফ লাম মীম', '2:1'],
    ['আলিফ লাম মীম', '3:1'],
    ['কুল', '112:1'],
  ])('%s -> cites %s', (q, expected) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(false);
    expect(refs(q), q).toContain(expected);
  });
});

describe('zero false positives on off-topic queries & preserved themes/conversation', () => {
  it.each([
    'pizza',
    'cricket',
    'Tesla cars',
    'Elon Musk',
    'quantum physics',
    'smartphone app',
    'how to cook rice',
    'ভিডিও গেম',
    'ফুটবল',
    'Messi',
    'Bitcoin',
  ])('%s -> stays notFound with 0 ayahs', (q) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(true);
    expect(r.ayahs, q).toEqual([]);
  });

  it('preserves curated theme, story, and conversational greetings', () => {
    const lq = engine.ask('Laylatul Qadr');
    expect(lq.kind).toBe('theme');
    expect(refs('Laylatul Qadr')).toContain('97:1');

    const dq = engine.ask('Dhul-Qarnayn');
    expect(dq.kind).toBe('story');
    expect(refs('Dhul-Qarnayn')).toContain('18:83');

    const alh = engine.ask('alhamdulillah');
    expect(alh.kind).toBe('greeting');
    expect(alh.ayahs).toEqual([]);

    const hw = engine.ask('hello world');
    expect(hw.kind).toBe('greeting');
    expect(hw.ayahs).toEqual([]);
  });
});

