// The kinds of question people ask about the Quran itself: a surah by number, a part of a surah, a famous
// passage by name, a juz (para), facts about a surah, duas, and words with spelling mistakes.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const e = new Engine();
const refs = (q: string) => e.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);
const range = (s: number, from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `${s}:${from + i}`);

describe('a surah by number', () => {
  it.each([
    // the whole surah (until 21 Nov 2026 only its first 10 ayahs were shown)
    ['surah 36', 36, 83], ['chapter 18', 18, 110], ['সূরা ৫৫', 55, 78], ['৩৬ নম্বর সূরা', 36, 83], ['36th surah of the Quran', 36, 83],
    ['which surah is number 55', 55, 78], ['which surah is the 67th', 67, 30], ['surah number 112', 112, 4], ['সূরা নং ১১২', 112, 4],
  ])('%s', (q, s, n) => expect(refs(q)).toEqual(range(s, 1, n)));
  it('a number that is not a surah is not one', () => {
    expect(e.ask('surah 115').kind).not.toBe('surah');
    expect(refs('surah 0')).toEqual([]);
  });
  it('the intro names the surah and its number', () => {
    expect(e.ask('surah 36').answer).toMatch(/Surah 36, Yaseen: all 83 ayahs/);
  });
});

describe('a part of a surah', () => {
  it.each([
    ['last 2 ayat of surah baqarah', range(2, 285, 286)], ['last two ayats of surah baqarah', range(2, 285, 286)], ['বাকারার শেষ ২ আয়াত', range(2, 285, 286)],
    ['last 3 ayat of surah hashr', range(59, 22, 24)], ['first 3 ayat of surah kahf', range(18, 1, 3)], ['বাকারার প্রথম ৩ আয়াত', range(2, 1, 3)],
    ['first 5 ayahs of surah alaq', range(96, 1, 5)], ['ayat 1 to 5 of surah alaq', range(96, 1, 5)], ['surah baqarah ayat 1 to 3', range(2, 1, 3)],
    ['surah naas er shesh ayat', ['114:6']], ['surah ikhlas last ayat', ['112:4']], ['last ayah of surah naas', ['114:6']],
    ['ayat 286 of surah baqarah', ['2:286']], ['surah fatiha ayat 2', ['1:2']], ['ayat 255 baqarah', ['2:255']],
  ])('%s', (q, expected) => expect(refs(q)).toEqual(expected));
  it('"last 50 ayat" of a long surah gives all 50, an ayah number past the end is ignored', () => {
    expect(refs('last 50 ayat of surah baqarah')).toEqual(range(2, 237, 286));
    expect(e.ask('ayat 999 of surah baqarah').kind).toBe('surah');
  });
  it('first and last of the whole Quran', () => {
    expect(refs('What is the first ayah of the Quran?')).toEqual(['1:1']);
    expect(refs('last ayah of the Quran')).toEqual(['114:6']);
  });
});

describe('famous passages by name', () => {
  it.each([
    ['amana rasul', range(2, 285, 286)], ['Amanar Rasul', range(2, 285, 286)], ['আমানার রাসূল', range(2, 285, 286)],
    ['Ayat e Karima', ['21:87']], ['ayat-e-karima', ['21:87']], ['আয়াতে কারীমা', ['21:87']],
    ['Bismillah', ['1:1']], ['bismillahir rahmanir rahim', ['1:1']], ['বিসমিল্লাহ', ['1:1']],
    ['teen qul', [...range(112, 1, 4), ...range(113, 1, 5), ...range(114, 1, 6)]], ['3 qul', [...range(112, 1, 4), ...range(113, 1, 5), ...range(114, 1, 6)]],
    ['চার কুল', [...range(109, 1, 6), ...range(112, 1, 4), ...range(113, 1, 5), ...range(114, 1, 6)]],
  ])('%s', (q, expected) => expect(refs(q)).toEqual(expected));
  it('the intro says what it is, in the language of the question', () => {
    expect(e.ask('amana rasul').answer).toMatch(/Amana ar-Rasul.*2:285-286/);
    expect(e.ask('আমানার রাসূল').answer).toMatch(/সূরা বাকারার শেষ দুই আয়াত/);
  });
});

describe('a juz (para)', () => {
  it.each([['tabarak para', '67:1'], ['Amma para', '78:1'], ['juz amma', '78:1'], ['jus 30', '78:1'], ['para 1', '1:1'], ['para 29', '67:1'], ['আম্মা পারা', '78:1']])(
    '%s starts at %s', (q, first) => {
      expect(e.ask(q).kind).toBe('juz');
      expect(refs(q)[0]).toBe(first);
    });
  it('"amma" alone (mother) and "paragraph" are not a juz', () => {
    expect(e.ask('my amma is sick').kind).not.toBe('juz');
    expect(e.ask('the paragraph is long').kind).not.toBe('juz');
  });
});

describe('facts about a surah (computed from the data)', () => {
  const fact = (q: string) => e.ask(q).data?.join(' ') ?? '';
  it.each([
    ['Is Surah Baqarah Makki or Madani?', /Medinan/], ['surah rahman makki naki madani', /Medinan/], ['Is Surah Mulk Meccan?', /Meccan/],
    ['Surah Yasin kon para te?', /juz 22/], ['Surah Kahf kon para?', /juz 15/], ['surah nur kon para', /juz 18/],
    ['What does the name Al-Baqarah mean?', /The Cow/], ['what does Al-Kawthar mean', /Abundance/],
    ['How many ayahs are in surah 18?', /110 ayahs/], ['How many verses in surah rahman?', /78 ayahs/], ['number of ayahs in surah 36', /83 ayahs/],
    ['সূরা ফাতিহায় কয়টি আয়াত?', /7 ayahs/],
    ['how many juz are in the Quran', /30 juz/], ['কুরআনে কয়টি পারা আছে?', /30 juz/],
    ['how many surahs are Meccan', /Meccan: 86 surahs/], ['which surah has the fewest ayahs', /Kawthar/],
  ])('%s', (q, expected) => {
    expect(e.ask(q).kind).toBe('data');
    expect(fact(q)).toMatch(expected);
  });
  it('the answer is written in the language of the question', () => {
    expect(e.ask('সূরা ইয়াসিন কোন পারায়?').answer).toMatch(/[\u0980-\u09FF]/);
  });
});

describe('duas that are in the Quran', () => {
  it.each([
    ['dua for parents', '17:24'], ['দোয়া পিতা-মাতার জন্য', '17:24'], ['dua for forgiveness from Quran', '7:23'], ['dua for knowledge', '20:114'],
    ['dua for my family', '25:74'], ['dua for my children', '25:74'], ['dua for health', '26:80'], ['কুরআনের দোয়া কী কী?', '2:201'], ['দোয়া ইউনুস', '21:87'],
  ])('%s -> %s first or among them', (q, first) => {
    expect(e.ask(q).kind).toBe('theme');
    expect(refs(q)).toContain(first);
  });
  it('a dua for parents is about the dua, not about parents in general', () => {
    expect(refs('dua for parents')[0]).toBe('17:24');
    expect(refs('dua for parents')).not.toContain('31:14');
  });
  it('parents without the word dua are still the parents theme', () => {
    expect(refs('What does the Quran say about parents?')).toContain('17:23');
  });
});

describe('spelling mistakes in English words', () => {
  it.each([['patince', '2:153'], ['pateince', '2:153'], ['forgivness', '39:53'], ['what does the quran say about gratefull people', '14:7'], ['mercey of Allah', '39:53']])(
    '%s', (q, first) => expect(refs(q)).toContain(first));
  it('real words and names are never "corrected" into something else', () => {
    expect(e.ask('Does the Quran talk about airplanes?').ayahs).toEqual([]);
    expect(e.ask('Is Messi mentioned in the Quran?').ayahs).toEqual([]);
    expect(e.ask('What does the Quran say about dinosaurs?').ayahs).toEqual([]);
  });
  it('two or more wrong letters are NOT guessed', () => {
    expect(e.ask('forgivnes').kind).not.toBe('theme');
  });
});

describe('a name is not a surah just because its consonants match', () => {
  it.each(['Who is better, Abu Bakr or Ali?', 'Abu Bakr', 'bakr', 'my friend Bakr'])('%s', (q) => {
    expect(['surah', 'ref', 'juz']).not.toContain(e.ask(q).kind);
  });
  it('the real spellings still work', () => {
    expect(refs('surah bakara')[0]).toBe('2:1');
    expect(refs('Bakarah')[0]).toBe('2:1');
    expect(refs('surah bakr')[0]).toBe('2:1');   // with the word "surah" a short spelling is accepted
  });
});

describe('questions for a scholar: hadith, tafsir, virtue, ranking people', () => {
  it.each([
    'fazilat of surah yasin', 'Is Surah Yasin the heart of the Quran?', 'what is the hadith about ayatul kursi',
    'Who is better, Abu Bakr or Ali?', 'সূরা ইয়াসিনের ফজিলত কী?', 'what is the best surah',
  ])('%s', (q) => {
    const r = e.ask(q);
    expect(r.kind).toBe('scholar');
    expect(r.ayahs).toEqual([]);
  });
  it('a plain question about "virtue" as a topic is not blocked', () => {
    expect(e.ask('What does the Quran say about patience?').kind).toBe('theme');
  });
});

describe('wishes and greetings', () => {
  it.each(['ramadan mubarak', 'Eid Mubarak', 'ঈদ মোবারক', 'walaikum assalam', 'Wa alaikum assalam', 'assalamualaikum', 'ওয়ালাইকুম আসসালাম'])('%s', (q) => {
    expect(e.ask(q).kind).toBe('greeting');
    expect(e.ask(q).ayahs).toEqual([]);
  });
  it('a wish is answered with a wish, and in the language of the message', () => {
    expect(e.ask('Eid Mubarak').answer).toMatch(/to you too/);
    expect(e.ask('ঈদ মোবারক').answer).toMatch(/[\u0980-\u09FF]/);
  });
});

describe('Banglish is answered in Bengali', () => {
  it.each(['surah naas er shesh ayat', 'surah rahman makki naki madani', 'Surah Kahf kon para?'])('%s', (q) => {
    expect(e.ask(q).lang).toBe('bn');
  });
  it('plain English with a South-Asian word stays English', () => {
    expect(e.ask('para 30').lang).toBe('en');
    expect(e.ask('Bakara 3 para').lang).toBe('en');
  });
});

describe('Bengali spellings and sentences from a real session', () => {
  it.each(['হেল্লো', 'হ্যাল্লো', 'হেলো', 'হ্যালো', 'হাই', 'কেমন আছো তুমি', 'তুমি কেমন আছো?', 'আপনি কেমন আছেন'])('%s is a greeting, not "who are you" and not "not found"', (q) => {
    expect(e.ask(q).kind).toBe('greeting');
  });
  it('a greeting word inside another word is not a greeting', () => {
    expect(e.ask('সূরা ফাতিহায় কয়টি আয়াত?').kind).toBe('data');
    expect(e.ask('হাইকোর্ট').kind).not.toBe('greeting');
  });
  it('"who are you" is still "who are you"', () => {
    for (const q of ['তুমি কে', 'তুমি কে বলো', 'আপনি কে?', 'tumi ke bolo']) expect(e.ask(q).kind, q).toBe('about');
  });
  it('"which surah is important / best" goes to a scholar, in every language', () => {
    for (const q of ['ইম্পর্টেন্ট সূরা কোনটা', 'সবচেয়ে গুরুত্বপূর্ণ সূরা কোনটা', 'শ্রেষ্ঠ সূরা কোনটা', 'which surah is the most important', 'most important ayah', 'sera surah konta']) {
      const r = e.ask(q);
      expect(r.kind, q).toBe('scholar');
      expect(r.ayahs).toEqual([]);
    }
  });
  it('numbers inside a Bengali sentence are Bengali digits; the data line and the references stay as they are', () => {
    const r = e.ask('কোর আনে কতটা সূরা আছে');
    expect(r.answer).toBe('কুরআনে ১১৪টি সূরা এবং ৬২৩৬টি আয়াত আছে।');
    expect(r.data?.[0]).toBe('The Quran has 114 surahs and 6236 ayahs.');
    expect(e.ask('সূরা ৩৬').answer).toBe('সূরা ৩৬, Yaseen: সব ৮৩টি আয়াত।');
    expect(e.ask('বাকারার শেষ ২ আয়াত').answer).toMatch(/2:285-286/);
  });
});
