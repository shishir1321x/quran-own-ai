// "How many animals are mentioned in the Quran?" and count follow-ups ("give me the count number", "how many?").
import { describe, expect, it } from 'vitest';
import { ANIMALS, animalHits, animalKindsIn, animalsIn } from '../src/animals.js';
import { Engine, type HistoryTurn } from '../src/engine.js';

const engine = new Engine();
const q = engine.quran;
const refs = (id: string) => (animalHits(q).find((h) => h.kind.id === id)?.ayahs ?? []).map((a) => `${a.s}:${a.a}`);
const turn = (question: string): HistoryTurn => {
  const r = engine.ask(question);
  return { question, answer: r.answer, citations: r.ayahs.map((a) => ({ surah: a.s, ayah: a.a })) };
};

describe('the animals named in the Quran, counted from the text', () => {
  it('finds every kind of the list (27), and every ayah is real', () => {
    const hits = animalHits(q);
    expect(hits.length).toBe(ANIMALS.length);
    expect(hits.length).toBe(27);
    for (const h of hits) for (const a of h.ayahs) expect(q.get(a.s, a.a)).toBeDefined();
  });

  it('counts an ayah only when the Arabic AND the English name the animal', () => {
    expect(refs('camel')).not.toContain('2:34');    // ابليس (Iblis) contains ابل
    expect(refs('donkey')).not.toContain('35:27');  // حمر here means "red"
    expect(refs('snake')).not.toContain('55:15');   // جان here means "jinn"
    expect(refs('cow')).not.toContain('21:37');     // عجل here means "haste"
    expect(refs('cow')).not.toContain('3:183');     // بقربان (an offering)
    expect(refs('hoopoe')).not.toContain('27:22');  // "[the hoopoe]" was added in brackets by the translator
    expect(refs('goat')).not.toContain('11:42');    // معزل (an isolated place)
  });

  it('finds the well-known places', () => {
    expect(refs('elephant')).toEqual(['105:1']);
    expect(refs('spider')).toEqual(['29:41']);
    expect(refs('ant')).toEqual(['27:18']);
    expect(refs('bee')).toEqual(['16:68']);
    expect(refs('wolf')).toEqual(['12:13', '12:14', '12:17']);
    expect(refs('cow')).toEqual(expect.arrayContaining(['2:67', '2:71', '12:43', '2:51']));   // the calf counts with the cow
    expect(refs('horse')).toContain('38:31');   // "racehorses"
    expect(refs('fish')).toContain('21:87');    // "the man of the fish" (ذا النون)
    expect(refs('sheep')).toEqual(expect.arrayContaining(['6:143', '20:18', '38:23']));
  });

  it('can be limited to one surah', () => {
    expect(animalsIn(q, 2).map((h) => h.kind.id)).toEqual(['mosquito', 'cow', 'quail', 'ape', 'pig', 'donkey']);
    expect(animalsIn(q, 105).map((h) => h.kind.id)).toEqual(['elephant']);
    expect(animalsIn(q, 1)).toEqual([]);
  });
});

describe('the engine: questions about animals', () => {
  it('answers how many, with the number, the names and the rule, and no ayah picked out', () => {
    const r = engine.ask('how many animals are mentioned in quran?');
    expect(r.kind).toBe('data');
    expect(r.answer).toContain('The Quran names 27 kinds of animal');
    expect(r.answer).toContain('elephant');
    expect(r.answer).toMatch(/How this is counted/);
    expect(r.ayahs).toEqual([]);
    expect(r.data).toContain('elephant (الفيل): 105:1');
    expect(r.data?.[0]).toMatch(/checked by a scholar/);
  });

  it('answers "which / what / list" in English, Bengali, Banglish and Arabic', () => {
    for (const s of ['what animals are mentioned in quran?', 'which animals are named in the Quran', 'list of animals in quran']) {
      expect(engine.ask(s).answer, s).toContain('27 kinds');
    }
    const bn = engine.ask('কুরআনে কোন কোন প্রাণীর কথা বলা হয়েছে?');
    expect(bn.lang).toBe('bn');
    expect(bn.answer).toContain('২৭ প্রকার');
    expect(bn.answer).toContain('হাতি');
    expect(engine.ask('quran e koyta prani er nam ache').answer).toContain('২৭');
    const ar = engine.ask('ما هي الحيوانات المذكورة في القرآن');
    expect(ar.answer).toContain('27');
    expect(ar.answer).toContain('الفيل');
  });

  it('answers for one surah', () => {
    expect(engine.ask('how many animals are mentioned in surah al baqarah').answer).toContain('Surah Al-Baqara names 6 kinds');
    expect(engine.ask('animals mentioned in surah al fil').answer).toMatch(/names 1 kind of animal: elephant/);
    expect(engine.ask('which animals are in surah al fatiha').answer).toContain('I found no animal named');
  });

  it('keeps the other answers about animals', () => {
    const theme = engine.ask('What does the Quran say about animals?');
    expect(theme.kind).toBe('theme');
    expect(theme.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('6:38');
    expect(theme.answer).toContain('which animals are mentioned in the Quran?');   // the hint
    expect(engine.ask('which animals are haram?').kind).toBe('scholar');
    expect(engine.ask('how many times does the word animal appear in the quran').answer).toMatch(/The word "animal" appears/);
  });
});

describe('the engine: a number asked as a follow-up', () => {
  it('"give me the count number" after the animals question gives the count', () => {
    const r = engine.ask('give me the count number', [turn('how many animals are mentioned in quran?')]);
    expect(r.kind).toBe('data');
    expect(r.answer).toContain('27 kinds');
    expect(engine.ask('how many?', [turn('what animals are mentioned in quran?')]).answer).toContain('27 kinds');
    expect(engine.ask('মোট কয়টি?', [turn('কুরআনে কোন কোন প্রাণীর কথা বলা হয়েছে?')]).answer).toContain('২৭');
  });

  it('after a surah or a para it counts the ayahs', () => {
    expect(engine.ask('how many?', [turn('surah yasin')]).answer).toContain('83 ayahs');
    expect(engine.ask('how many?', [turn('para 30')]).answer).toMatch(/Juz 30 has \d+ ayahs/);
  });

  it('when there is nothing to count it says what it can count, and never searches for the word "count"', () => {
    for (const [question, before] of [['give me the count number', 'patience'], ['how many?', 'Ayat al-Kursi'], ['give me the count number', ''], ['how many?', '']]) {
      const r = engine.ask(question, before ? [turn(before)] : []);
      expect(r.kind, `${before} -> ${question}`).toBe('data');
      expect(r.ayahs).toEqual([]);
      expect(r.answer).toMatch(/I can count things in the Quran/);
    }
  });

  it('a real counting question is not taken for a follow-up', () => {
    expect(engine.ask('how many surahs are there', [turn('patience')]).answer).toContain('114 surahs');
    expect(engine.ask('how many ayahs in surah baqarah', [turn('patience')]).answer).toContain('286');
    expect(engine.ask('how many times does the word patience appear', [turn('surah yasin')]).answer).toMatch(/The word "patience" appears/);
  });
});

describe('how many times one animal is named', () => {
  const mentions = (id: string) => {
    const h = animalHits(q).find((x) => x.kind.id === id)!;
    return { times: h.ayahs.reduce((n, y) => n + y.times, 0), ayahs: h.ayahs.length };
  };

  it('counts every time the name is in the Arabic of a counted ayah', () => {
    expect(mentions('spider')).toEqual({ times: 2, ayahs: 1 });   // 29:41: العنكبوت twice
    expect(mentions('ant')).toEqual({ times: 3, ayahs: 1 });      // 27:18: النمل, نملة, النمل
    expect(mentions('dog')).toEqual({ times: 5, ayahs: 3 });      // 18:22: كلبهم three times
    expect(mentions('cow')).toEqual({ times: 19, ayahs: 19 });
  });

  it('finds the animal a question names, but not the name of a surah', () => {
    const ids = (s: string) => animalKindsIn(s).map((k) => k.id);
    expect(ids('how many times is the cow mentioned')).toEqual(['cow']);
    expect(ids('how many times are horses and mules mentioned')).toEqual(['horse', 'mule']);
    expect(ids('কুরআনে গরুর কথা কতবার এসেছে?')).toEqual(['cow']);
    expect(ids('quran e kukur er kotha koybar ache')).toEqual(['dog']);
    expect(ids('كم مرة ذكرت البقرة في القرآن')).toEqual(['cow']);
    expect(ids('how many ayahs are in surah al-baqarah')).toEqual([]);
    expect(ids('كم آية في سورة البقرة')).toEqual([]);
    expect(ids('surah an-naml')).toEqual([]);
  });

  it('answers in English, Bengali and Arabic, with the first ayahs shown', () => {
    const en = engine.ask('how many times is the cow mentioned in the quran?');
    expect(en.kind).toBe('data');
    expect(en.answer).toContain('The cow is named 19 times in 19 ayahs of the Quran.');
    expect(en.answer).toContain('Here are the first 10.');
    expect(en.ayahs).toHaveLength(10);
    for (const a of en.ayahs) expect(q.get(a.s, a.a)).toBeDefined();
    expect(en.data?.join(' ')).toMatch(/cow \(Arabic: بقر, عجل\): 19 times in 19 ayahs: 2:51/);
    expect(engine.ask('how many times is the spider mentioned').answer).toContain('named 2 times in 1 ayah of the Quran');
    expect(engine.ask('কুরআনে গরুর কথা কতবার এসেছে?').answer).toContain('কুরআনে গরু ১৯টি আয়াতে মোট ১৯ বার উল্লেখ করা হয়েছে।');
  });

  it('uses the Arabic number forms: واحدة, the dual, 3-10 and 11+', () => {
    expect(engine.ask('كم مرة ورد ذكر الفيل في القرآن').answer).toContain('مرة واحدة في آية واحدة');
    expect(engine.ask('كم مرة ذكر العنكبوت في القرآن').answer).toContain('مرتين في آية واحدة');
    expect(engine.ask('كم مرة ذكر الكلب في القرآن').answer).toContain('5 مرات في 3 آيات');
    expect(engine.ask('كم مرة ذكرت البقرة في القرآن').answer).toContain('19 مرة في 19 آية');
    expect(engine.ask('ما الحيوانات المذكورة في سورة الفيل').answer).toContain('نوعًا واحدًا');
  });

  it('can count in one surah, and says so when the animal is not in it', () => {
    expect(engine.ask('how many times is the dog mentioned in surah al kahf').answer).toContain('named 4 times in 2 ayahs of Surah Al-Kahf');
    const none = engine.ask('how many times is the elephant mentioned in surah al baqarah');
    expect(none.answer).toContain('The elephant is not named in Surah Al-Baqara.');
    expect(none.ayahs).toEqual([]);
  });

  it('keeps the other counts as they were', () => {
    expect(engine.ask('how many times does the word cow appear').answer).toMatch(/The word "cow" appears/);
    expect(engine.ask('how many ayahs are in surah al-baqarah').answer).toContain('286');
    expect(engine.ask('كم آية في سورة البقرة').answer).toContain('286');
  });
});

describe('a follow-up is answered in its own language', () => {
  it('Bengali after English, English after Bengali', () => {
    const bn = engine.ask('মোট কয়টি?', [turn('how many animals are mentioned in quran?')]);
    expect(bn.lang).toBe('bn');
    expect(bn.answer).toContain('২৭ প্রকার');
    const en = engine.ask('how many?', [turn('কুরআনে কোন কোন প্রাণীর কথা বলা হয়েছে?')]);
    expect(en.lang).toBe('en');
    expect(en.answer).toContain('The Quran names 27 kinds');
    expect(engine.ask('how many?', [turn('সূরা ইয়াসিন')]).answer).toContain('Surah Yaseen has 83 ayahs');
  });
});

describe('the Arabic answer names the surah in Arabic', () => {
  it('سورة الكهف, not "Al-Kahf"', () => {
    const r = engine.ask('كم مرة ذكر الكلب في سورة الكهف');
    expect(r.answer).toContain('ورد ذكر الكلب في سورة الكهف 4 مرات في آيتين.');
    expect(r.answer).not.toMatch(/[A-Za-z]/);
    expect(engine.ask('ما الحيوانات المذكورة في سورة البقرة').answer).toContain('تذكر سورة البقرة 6 أنواع');
  });
});
