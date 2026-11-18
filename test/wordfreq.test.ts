// "What is the most used word in the Quran?" and "how many times is Allah mentioned?": counted in the Arabic text.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';
import { isAllahForm, isSmall, wordFrequency } from '../src/wordfreq.js';

const engine = new Engine();
const q = engine.quran;

describe('counting the words of the Arabic text', () => {
  const f = wordFrequency(q);

  it('counts every written word: 77800, the most used is من', () => {
    expect(f.total).toBe(77800);
    expect(f.ranked[0]).toEqual({ word: 'من', n: 2763 });
    expect(f.content[0]).toEqual({ word: 'الله', n: 2153 });
  });

  it('keeps words apart that only look alike without hamza', () => {
    const n = (w: string) => f.ranked.find((x) => x.word === w)?.n;
    expect(n('إن')).toBe(966);
    expect(n('أن')).toBe(638);
    expect(n('على')).toBe(670);
  });

  it('the name Allah: 2153 alone, 2698 with a letter joined in front, اللهم apart', () => {
    expect(f.allah.alone).toBe(2153);
    expect(f.allah.all).toBe(2698);
    expect(f.allah.allahumma).toBe(5);
    expect(f.allah.forms.find((w) => w.word === 'آلله')?.n).toBe(2);
    for (const w of ['الله', 'والله', 'بالله', 'لله', 'ولله', 'فلله', 'تالله', 'وتالله', 'آلله']) expect(isAllahForm(w), w).toBe(true);
    expect(isAllahForm('اللهم')).toBe(false);
  });

  it('small words, also with و or ف in front', () => {
    for (const w of ['من', 'ولا', 'فإن', 'الذين', 'عليهم']) expect(isSmall(w), w).toBe(true);
    for (const w of ['الله', 'والله', 'قال', 'الأرض']) expect(isSmall(w), w).toBe(false);
  });

  it('can count one surah, and keeps a tie', () => {
    const yasin = wordFrequency(q, 36);
    expect(yasin.total).toBe(730);
    expect(yasin.ranked[0]).toEqual({ word: 'من', n: 28 });
    const ikhlas = wordFrequency(q, 112);
    expect(ikhlas.ranked.filter((w) => w.n === 2).map((w) => w.word)).toEqual(['الله', 'أحد', 'ولم']);
  });
});

describe('the engine: the most used word', () => {
  it('answers with the most used word, the most used content word, Allah with its forms, and the next words', () => {
    const r = engine.ask('what is the most used word in quran?');
    expect(r.kind).toBe('data');
    expect(r.ayahs).toEqual([]);
    expect(r.answer).toContain('the most used word is من ("from, of"): 2763 times');
    expect(r.answer).toContain('Not counting small words');
    expect(r.answer).toContain('the most used word is الله: 2153 times');
    expect(r.answer).toContain('the name Allah (الله) is there 2698 times');
    expect(r.answer).toContain('Next come: قال 416, كان 323, قل 294, الأرض 287');
    expect(r.answer).not.toMatch(/والله \d/);   // a form of Allah is not listed again as a "next" word
  });

  it('in Bengali, Banglish and Arabic', () => {
    expect(engine.ask('কুরআনে সবচেয়ে বেশি ব্যবহৃত শব্দ কোনটি?').answer).toContain('২৭৬৩ বার');
    expect(engine.ask('quran e sobcheye beshi kon shobdo ache').lang).toBe('bn');
    expect(engine.ask('ما هي أكثر كلمة تكررت في القرآن').answer).toContain('هي «من»: 2763 مرة');
  });

  it('in one surah, with a tie', () => {
    expect(engine.ask('what is the most used word in surah yasin').answer).toContain('in Surah Yaseen (730 words), the most used word is من');
    const r = engine.ask('most used word in surah ikhlas');
    expect(r.answer).toContain('the most used words are الله, أحد, ولم: 2 times each');
    expect(r.answer).toContain('the most used words are الله, أحد: 2 times each');
  });

  it('other questions about words and surahs are not taken for it', () => {
    expect(engine.ask('how many words are in the quran').answer).toContain('77800 words');
    expect(engine.ask('which surah has the most words').answer).not.toContain('the most used word');
    expect(engine.ask('how many times does the word patience appear').answer).toMatch(/The word "patience" appears/);
  });
});

describe('the engine: how many times the name Allah is there', () => {
  it('counts in the Arabic text, not in the translation', () => {
    for (const s of ['how many times is allah mentioned in the quran', 'how many times does the word allah appear in the quran', 'how often is the name allah mentioned']) {
      const r = engine.ask(s);
      expect(r.answer, s).toContain('The name Allah (الله) is in the Arabic text 2698 times: 2153 times on its own and 545 times');
      expect(r.answer, s).toContain('[brackets]');
    }
    expect(engine.ask('কুরআনে আল্লাহ শব্দটি কতবার এসেছে?').answer).toContain('মোট ২৬৯৮ বার');
    expect(engine.ask('كم مرة ذكر اسم الله في القرآن').answer).toContain('2698 مرة');
  });

  it('in one surah', () => {
    expect(engine.ask('how many times is allah mentioned in surah ikhlas').answer).toContain('in the Arabic text of Surah Al-Ikhlaas 2 times');
  });

  it('a question with another topic is not a count of the name', () => {
    expect(engine.ask('how many times does allah mention patience').answer).not.toContain('The name Allah (الله) is in the Arabic text');
  });
});

describe('other ways to ask for the most used word', () => {
  it.each([
    'কোন শব্দটি বেশি ব্যবহার হয়েছে?', 'which word is used mostly in quran?', 'which word occurs most frequently in the quran',
    'most repeated word in quran', 'কুরআনে সর্বাধিক ব্যবহৃত শব্দ কোনটি', 'kon shobdo sobcheye beshi bebohar hoyeche',
    'ما الكلمة الأكثر استخداما في القرآن',
  ])('%s', (s) => {
    const r = engine.ask(s);
    expect(r.kind).toBe('data');
    expect(r.answer).toMatch(/2763|২৭৬৩/);
  });
});
