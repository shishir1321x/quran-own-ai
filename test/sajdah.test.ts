// "How many sajdah ayahs?": 15 places in Tanzil's list, and why scholars count 15, 14 or 11, without deciding (no ruling).
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();

describe('the sajdah ayahs', () => {
  it('gives the 15 places of the Tanzil list and says where the counts differ', () => {
    const r = engine.ask('how many sajdah ayahs are in the quran');
    expect(r.kind).toBe('data');
    expect(r.answer).toContain('marks 15 places of prostration');
    expect(r.answer).toContain('15, 14 or 11');
    for (const ref of ['22:77', '38:24', '53:62', '84:21', '96:19']) expect(r.answer).toContain(ref);
    expect(r.data?.[0]).toMatch(/^15 sajdah ayahs: 7:206/);
  });

  it('decides nothing: no ruling, and Tanzil\'s "obligatory" mark is never shown', () => {
    for (const q of ['how many sajdah ayahs are in the quran', 'list of sajdah ayahs', 'কুরআনে কয়টি সিজদার আয়াত আছে?', 'كم عدد آيات السجدة في القرآن']) {
      const r = engine.ask(q);
      expect(r.answer, q).not.toMatch(/obligatory|wajib|compulsory|ওয়াজিব|ফরজ|واجب/i);
      expect(r.answer, q).toMatch(/scholar|আলেম|العلماء|عالم/i);
    }
    expect(engine.ask('how many sajdah ayahs are in the quran').answer).toContain('please ask a qualified scholar');
  });

  it('answers in Bengali and Arabic', () => {
    expect(engine.ask('কুরআনে কয়টি সিজদার আয়াত আছে?').answer).toContain('১৫, ১৪ বা ১১');
    expect(engine.ask('كم عدد آيات السجدة في القرآن').answer).toContain('15 أو 14 أو 11');
  });

  it('the list still shows all 15 ayahs, with the note', () => {
    const r = engine.ask('list of sajdah ayahs');
    expect(r.ayahs).toHaveLength(15);
    expect(r.answer).toContain('count them differently');
  });
});

describe('Banglish counting questions', () => {
  it('"koyta" makes a question Banglish, and "sijdar" is a sajdah question', () => {
    const a = engine.ask('quran e sijda koyta');
    expect(a.lang).toBe('bn');
    expect(a.answer).toContain('১৫, ১৪ বা ১১');
    const b = engine.ask('sijdar ayat koyta');   // was answered "114 surahs and 6236 ayahs"
    expect(b.answer).toContain('সিজদার স্থান');
    expect(engine.ask('quran e koyta ayat ache').lang).toBe('bn');
    expect(engine.ask('how many sajdah in the Quran').lang).toBe('en');
  });
});

describe('other spellings, and Surah As-Sajdah', () => {
  it('every spelling of sajdah, and "kototi"', () => {
    for (const s of ['quran e kototi sijhda ache?', 'quran e sejdah koyti', 'sijdah koyta']) expect(engine.ask(s).answer, s).toContain('১৫, ১৪ বা ১১');
    expect(engine.ask('how many sujood are in the quran').answer).toContain('15, 14 or 11');
    expect(engine.ask('my sajadah is blue').kind).not.toBe('data');   // a prayer mat, not a prostration
  });

  it('"surah as-sajdah" is Surah 32, not the list of sajdah places', () => {
    for (const s of ['surah as-sajdah', 'surah sajda', 'সূরা সাজদা', 'সূরা সিজদা']) {
      const r = engine.ask(s);
      expect(r.kind, s).toBe('surah');
      expect(r.ayahs[0], s).toEqual({ s: 32, a: 1 });
    }
    expect(engine.ask('how many ayahs in surah as-sajdah').answer).toContain('Surah As-Sajda has 30 ayahs');
    expect(engine.ask('সূরা আস-সিজদা কয়টি আয়াত').answer).toContain('৩০টি আয়াত');
    expect(engine.ask('কুরআনে কতটি সিজদা আছে').answer).toContain('১৫টি সিজদার স্থান');
  });
});
