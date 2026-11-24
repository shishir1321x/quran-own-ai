import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('Screenshot cases & bot-directed pragmatics', () => {
  it('handles reported life-struggle sentences from screenshots with real comforting ayahs', () => {
    const en = engine.ask('i am struggling with life');
    expect(en.kind).toBe('theme');
    expect(en.mode).toBe('quran');
    expect(en.lang).toBe('en');
    expect(en.notFound).toBe(false);
    expect(en.answer).toContain('Allah sees your struggle');
    expect(en.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(expect.arrayContaining(['94:5', '2:286', '13:28']));

    const bn = engine.ask('ami jibon niye hotash');
    expect(bn.kind).toBe('theme');
    expect(bn.mode).toBe('quran');
    expect(bn.lang).toBe('bn');
    expect(bn.notFound).toBe(false);
    expect(bn.answer).toContain('জীবন এখন কঠিন');
    expect(bn.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(expect.arrayContaining(['94:5', '2:286', '13:28']));
  });

  it.each([
    ['you are donkey', 'en'],
    ['you are a cow', 'en'],
    ['you are crazy', 'en'],
    ['you are stupid', 'en'],
    ["you don't understand me", 'en'],
    ['tumi ekta goru', 'bn'],
    ['tumi gadha', 'bn'],
    ['তুমি একটা গাধা', 'bn'],
    ['তুমি পাগল', 'bn'],
    ['أنت حمار', 'ar'],
  ] as const)('redirects bot-directed remark "%s" calmly without searching for random ayahs', (q, lang) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('chat');
    expect(r.mode).toBe('general');
    expect(r.lang).toBe(lang);
    expect(r.ayahs).toEqual([]);
    expect(r.notFound).toBe(false);
  });
});

describe('Meaning-based multi-language situation understanding', () => {
  it.each([
    ['i am struggling with life', 'en', '94:5'],
    ['I keep overthinking about my future and feel anxious', 'en', '13:28'],
    ['nobody understands me and I feel so alone', 'en', '2:186'],
    ['I feel so guilty and ashamed about my past mistakes', 'en', '39:53'],
    ['someone betrayed me and I am furious', 'en', '3:134'],
    ['I lost my job and cannot pay my bills', 'en', '65:2'],
    ['my grandmother passed away today', 'en', '2:156'],
    ['I am very sick and in pain', 'en', '26:80'],
    ['I have no direction and want to become a better Muslim', 'en', '51:56'],
    ['why do bad things happen to me all the time?', 'en', '2:155'],
    ['Alhamdulillah I got good news and passed my exam!', 'en', '14:7'],
    ['আমি জীবন নিয়ে খুব ক্লান্ত আর অসহায়', 'bn', '94:5'],
    ['আমার খুব দুশ্চিন্তা হচ্ছে ভবিষ্যৎ নিয়ে', 'bn', '13:28'],
    ['ami khub dushchintay achi ghum asche na', 'bn', '13:28'],
    ['amar chakri nei r khub obhab', 'bn', '65:2'],
    ['أشعر بالقلق على مستقبلي', 'ar', '13:28'],
  ] as const)('understands "%s" -> cites %s', (q, lang, expectedRef) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('theme');
    expect(r.mode).toBe('quran');
    expect(r.lang).toBe(lang);
    expect(r.notFound).toBe(false);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain(expectedRef);
  });
});

describe('Everyday casual chatter & off-topic safety', () => {
  it.each([
    ['i am so sleepy', 'en', 'greeting', false],
    ['আমি ভাত খাবো', 'bn', 'greeting', false],
    ['ami bhat khabo', 'bn', 'greeting', false],
    ["let's be friends", 'en', 'greeting', false],
    ['amar bondhu hobe?', 'bn', 'greeting', false],
    ['what is the weather today?', 'en', 'chat', true],
    ['write python code for sorting', 'en', 'chat', true],
  ] as const)('handles casual/off-topic "%s" cleanly without spurious ayahs', (q, lang, kind, notFound) => {
    const r = engine.ask(q);
    expect(r.kind).toBe(kind);
    expect(r.mode).toBe('general');
    expect(r.lang).toBe(lang);
    expect(r.ayahs).toEqual([]);
    expect(r.notFound).toBe(notFound);
  });
});

describe('Strict non-regression on Quran queries, counts, crisis, and feedback', () => {
  it('keeps actual Quran verses, animal queries, counts, crisis, and feedback intact', () => {
    expect(refs('you are the best nation')).toContain('3:110');
    expect(refs('what does the quran say about cows?').length).toBeGreaterThan(0);

    const donkeyCount = engine.ask('how many times is the donkey mentioned');
    expect(donkeyCount.kind).toBe('data');

    expect(engine.ask('fuck my life I want to kill myself').kind).toBe('crisis');
    expect(engine.ask('you are wrong').kind).toBe('feedback');
  });
});

