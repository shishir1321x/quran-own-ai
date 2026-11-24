import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('Sentence-meaning first: Suicide & Self-harm (Personal Condolence vs Quranic Topic vs Bereavement)', () => {
  it.each([
    ['i want to suicide', 'en'],
    ['i want to do suicide', 'en'],
    ['i want to commit suicide', 'en'],
    ['thinking about suicide right now', 'en'],
    ['আমি আত্মহত্যা করতে চাই', 'bn'],
    ['ami atmohotta korte chai', 'bn'],
    ['أفكر في الانتحار', 'ar'],
  ] as const)('gives compassionate condolence & crisis care for personal expression "%s"', (q, lang) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('crisis');
    expect(r.lang).toBe(lang);
    expect(r.ayahs).toEqual([]);
    expect(r.answer.length).toBeGreaterThan(80);
  });

  it.each([
    ['suicide', 'en'],
    ['self-harm', 'en'],
    ['what does the quran say about suicide?', 'en'],
    ['ayahs about suicide', 'en'],
    ['আত্মহত্যা', 'bn'],
    ['আত্মহত্যা সম্পর্কে কুরআন কী বলে?', 'bn'],
    ['atmohotta', 'bn'],
    ['الانتحار', 'ar'],
    ['ما يقول القرآن عن الانتحار', 'ar'],
  ] as const)('shows what the Quran says about suicide for topic query "%s"', (q, lang) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('theme');
    expect(r.mode).toBe('quran');
    expect(r.lang).toBe(lang);
    expect(r.notFound).toBe(false);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(expect.arrayContaining(['4:29', '4:30', '2:195', '39:53', '5:32']));
  });

  it('gives bereavement condolence when mourning someone else who died by suicide', () => {
    const r = engine.ask('my friend committed suicide');
    expect(r.kind).toBe('theme');
    expect(r.answer).toMatch(/Inna lillahi/i);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:156');
  });
});

describe('Sentence-meaning first across all major topics (Personal Sentence vs Bare Topic)', () => {
  it('distinguishes personal divorce heartbreak from bare topic "divorce"', () => {
    const personal = engine.ask('I am going through a divorce');
    const bare = engine.ask('divorce');
    expect(personal.kind).toBe('theme');
    expect(personal.answer).toMatch(/sorry you are going through the pain/i);
    expect(personal.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('65:2');

    expect(bare.kind).toBe('theme');
    expect(bare.answer).not.toMatch(/sorry you are going through/i);
    expect(bare.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:227');
  });

  it('distinguishes personal marriage hope from bare topic "marriage"', () => {
    const personal = engine.ask('I want to get married');
    const bare = engine.ask('marriage');
    expect(personal.answer).toMatch(/May Allah bless your intention for marriage/i);
    expect(personal.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(expect.arrayContaining(['30:21', '25:74']));

    expect(bare.answer).not.toMatch(/May Allah bless your intention/i);
    expect(bare.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('30:21');
  });

  it('distinguishes bereavement ("my father died") and fear of death from bare topic "death"', () => {
    const grief = engine.ask('my father died last year');
    const fear = engine.ask('I am afraid of dying');
    const bare = engine.ask('death');

    expect(grief.answer).toMatch(/Inna lillahi/i);
    expect(grief.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:156');

    expect(fear.answer).toMatch(/balance reverent mindfulness with deep hope/i);
    expect(fear.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(expect.arrayContaining(['39:53', '3:185']));

    expect(bare.answer).not.toMatch(/Inna lillahi|reverent mindfulness/i);
    expect(bare.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('3:185');
  });

  it('distinguishes personal prayer struggle from bare topic "prayer"', () => {
    const personal = engine.ask('I find it hard to pray regularly');
    const bare = engine.ask('prayer');

    expect(personal.answer).toMatch(/faith is alive in your heart/i);
    expect(personal.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('14:40');

    expect(bare.answer).not.toMatch(/faith is alive in your heart/i);
    expect(bare.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('29:45');
  });

  it('distinguishes wanting to quit alcohol/sin from bare topic "alcohol"', () => {
    const personal = engine.ask('I want to quit drinking alcohol');
    const bare = engine.ask('alcohol');

    expect(personal.answer).toMatch(/courageous step that Allah loves/i);
    expect(personal.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('39:53');

    expect(bare.answer).not.toMatch(/courageous step/i);
    expect(bare.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('5:90');
  });

  it('distinguishes being gossiped about / stolen from vs topic or ruling queries', () => {
    const gossiped = engine.ask('people are gossiping about me behind my back');
    const bareGossip = engine.ask('gossip');
    expect(gossiped.answer).toMatch(/treated unfairly|restrain their anger/i);
    expect(gossiped.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('49:12');
    expect(bareGossip.answer).not.toMatch(/treated unfairly/i);

    const victim = engine.ask('someone stole my money');
    const ruling = engine.ask('punishment for theft');
    expect(victim.kind).toBe('theme');
    expect(victim.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('3:134');
    expect(ruling.kind).toBe('scholar');
  });

  it('distinguishes harming others de-escalation from bare topic "killing"', () => {
    const personal = engine.ask('I want to hurt someone');
    const bare = engine.ask('killing');

    expect(personal.answer).toMatch(/pause, take a deep breath/i);
    expect(personal.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(expect.arrayContaining(['5:32', '3:134']));

    expect(bare.answer).not.toMatch(/pause, take a deep breath/i);
    expect(bare.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('5:32');
  });

  it('adapts any general Quranic theme to personal stance (charity, Hajj, aging parents)', () => {
    const charityPersonal = engine.ask('I really want to give charity to the poor');
    const charityBare = engine.ask('charity');
    expect(charityPersonal.answer).toMatch(/May Allah bless your sincere intention/i);
    expect(charityBare.answer).not.toMatch(/May Allah bless your sincere intention/i);
    expect(refs('I really want to give charity to the poor')).toContain('2:261');

    const hajjPersonal = engine.ask('I hope to go for Hajj soon');
    const hajjBare = engine.ask('Hajj');
    expect(hajjPersonal.answer).toMatch(/May Allah bless your sincere intention/i);
    expect(hajjBare.answer).not.toMatch(/May Allah bless your sincere intention/i);

    const parentsContext = engine.ask('my parents are getting old');
    const parentsBare = engine.ask('parents');
    expect(parentsContext.answer).toMatch(/May Allah place blessing and goodness/i);
    expect(parentsBare.answer).not.toMatch(/May Allah place blessing and goodness/i);
  });

  it('understands practical non-Quran sentences without leaking spurious BM25 verses', () => {
    for (const q of [
      'where is my order?',
      'how to remove grease stains from clothes',
      'clean a cast-iron skillet without ruining it',
      'how many hearts does an octopus have?',
    ]) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('chat');
      expect(r.ayahs, q).toEqual([]);
      expect(r.notFound, q).toBe(true);
    }
  });
});

describe('Suggestions, recommendations, and circumstances: Quran-first reflection + gentle Islamic-norm fallback', () => {
  it.each([
    ['recommend a surah for peace of mind', 'en', '13:28'],
    ['suggest me a surah to read', 'en', '2:255'],
    ['কুরআন থেকে কিছু সাজেস্ট করো', 'bn', '2:255'],
    ['what should I do when I cannot decide between two options?', 'en', '3:159'],
    ['what should I do if I hear a rumor about someone?', 'en', '49:6'],
    ['any suggestions when two friends are fighting?', 'en', '49:9'],
    ['what should I do when someone insults me?', 'en', '25:63'],
    ['what should I do if someone owes me money and cannot pay right now?', 'en', '2:280'],
    ['any recommendations when guests visit our home?', 'en', '51:24'],
    ['what do you think about patience?', 'en', '2:153'],
    ['any suggestions about honey?', 'en', '47:15'],
    ['কেউ অপমান করলে আমার কী করা উচিত?', 'bn', '25:63'],
    ['গুজব শুনলে কী করা উচিত পরামর্শ দাও', 'bn', '49:6'],
    ['بماذا تنصحني إذا سمعت إشاعة؟', 'ar', '49:6'],
  ] as const)('finds and reflects Quranic guidance first for "%s" -> cites %s', (q, lang, expectedRef) => {
    const r = engine.ask(q);
    expect(r.mode, q).toBe('quran');
    expect(r.lang, q).toBe(lang);
    expect(r.notFound, q).toBe(false);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`), q).toContain(expectedRef);
  });

  it.each([
    ['what should I wear to a job interview?', 'en', /adab|modesty/i],
    ['suggest a gift for my mother', 'en', /adab|extravagance/i],
    ['what should I do if I miss my flight?', 'en', /Bismillah|mashwarah|tawakkul/i],
    ['any suggestions for staying organized at my desk?', 'en', /Bismillah|mashwarah|tawakkul/i],
    ['what do you recommend for migraine relief?', 'en', /afiyah|dua for health/i],
    ['এই পরিস্থিতিতে প্রেজেন্টেশনের আগে আমার কী করা উচিত?', 'bn', /বিসমিল্লাহ|তাওয়াক্কুল/],
    ['ماذا أفعل إذا فاتتني الحافلة؟', 'ar', /ببسم الله|التوكل/],
  ] as const)('gives gentle, decent Islamic-norm fallback when Quran has no direct verse for "%s"', (q, lang, pattern) => {
    const r = engine.ask(q);
    expect(r.kind, q).toBe('chat');
    expect(r.mode, q).toBe('general');
    expect(r.lang, q).toBe(lang);
    expect(r.ayahs, q).toEqual([]);
    expect(r.notFound, q).toBe(true);
    expect(r.answer, q).toMatch(pattern);
  });
});


