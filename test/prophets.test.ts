// The prophets named in the Quran, counted from the text (src/prophets.ts), and follow-ups that continue the chat.
import { describe, expect, it } from 'vitest';
import { Engine, type HistoryTurn } from '../src/engine.js';
import { PROPHETS, prophetHits, prophetsNamedIn } from '../src/prophets.js';

const engine = new Engine();
const q = engine.quran;
const count = (id: string) => {
  const h = prophetHits(q).find((x) => x.prophet.id === id)!;
  return { times: h.ayahs.reduce((n, y) => n + y.times, 0), ayahs: h.ayahs.length, refs: h.ayahs.map((y) => `${y.s}:${y.a}`) };
};
const turn = (question: string): HistoryTurn => {
  const r = engine.ask(question);
  return { question, answer: r.answer, citations: r.ayahs.map((a) => ({ surah: a.s, ayah: a.a })) };
};
const refs = (question: string, before?: string) => engine.ask(question, before ? [turn(before)] : []).ayahs.map((a) => `${a.s}:${a.a}`);

describe('the prophets named in the Quran', () => {
  it('25 names, each found in the text', () => {
    expect(PROPHETS).toHaveLength(25);
    for (const p of PROPHETS) expect(count(p.id).ayahs, p.id).toBeGreaterThan(0);
  });

  it('the well-known counts', () => {
    expect(count('musa').times).toBe(136);
    expect(count('ibrahim').times).toBe(69);
    expect(count('nuh').times).toBe(43);
    expect(count('isa').times).toBe(25);
    expect(count('shuayb').times).toBe(11);
    expect(count('muhammad').times).toBe(5);   // محمد 4 times and أحمد once (61:6)
  });

  it('a word that only looks like the name is not counted (the English must have the name too)', () => {
    expect(count('nuh').refs).not.toContain('3:44');      // نوحيه "We reveal it"
    expect(count('hud').refs).not.toContain('2:135');     // هودا "Jews"
    expect(count('salih').refs).not.toContain('2:62');    // صالحا "righteous"
    expect(count('yahya').refs).not.toContain('2:28');    // يحييكم "He will give you life"
    expect(count('dhulkifl').refs).not.toContain('3:37'); // كفلها "put her in the care of"
  });

  it('finds the prophet a question names, but not the name of a surah', () => {
    expect(prophetsNamedIn('how many times is musa mentioned').map((p) => p.id)).toEqual(['musa']);
    expect(prophetsNamedIn('কুরআনে মূসা নবীর নাম কতবার এসেছে?').map((p) => p.id)).toEqual(['musa']);
    expect(prophetsNamedIn('كم مرة ذكر اسم موسى').map((p) => p.id)).toEqual(['musa']);
    expect(prophetsNamedIn('how many ayahs in surah yusuf')).toEqual([]);
  });

  it('the list comes with 40:78; a count shows the first ayahs', () => {
    const list = engine.ask('which prophets are mentioned in the quran');
    expect(list.answer).toContain('The Quran names 25 prophets: Adam, Idris');
    expect(list.ayahs).toEqual([{ s: 40, a: 78 }]);
    const musa = engine.ask('how many times is musa mentioned in the quran');
    expect(musa.answer).toContain('The name Musa (Moses) is in the Arabic text 136 times, in 131 ayahs.');
    expect(musa.ayahs).toHaveLength(10);
    expect(engine.ask('كم مرة ذكر اسم موسى في القرآن').answer).toContain('136 مرة في 131 آية');
    expect(engine.ask('story of musa').kind).toBe('story');
    expect(engine.ask('how many ayahs in surah yusuf').answer).toContain('111');
  });
});

describe('follow-ups that continue the chat', () => {
  it('more, next, previous, next surah, across the edges of surahs and of the Quran', () => {
    // a para goes 10 at a time ("para 30" begins at 78:1); a surah is shown whole, so "show more" after it ends it
    expect(refs('show more', 'para 30')).toEqual(Array.from({ length: 10 }, (_, i) => `78:${i + 11}`));
    expect(engine.ask('show more', [turn('surah yasin')]).answer).toContain('That was the end of Surah Yaseen');
    expect(refs('next ayah', '2:255')).toEqual(['2:256']);
    expect(refs('previous ayah', '2:255')).toEqual(['2:254']);
    expect(refs('next', '112:4')).toEqual(['113:1']);
    expect(refs('previous ayah', '3:1')).toEqual(['2:286']);
    expect(refs('next surah', 'surah al fatiha')[0]).toBe('2:1');
    expect(engine.ask('show more', [turn('surah al-ikhlas')]).answer).toContain('That was the end of Surah Al-Ikhlaas');
    expect(engine.ask('next ayah', [turn('114:6')]).answer).toContain('That is the last ayah of the Quran');
    expect(engine.ask('show more').answer).toMatch(/Which ayah or surah do you mean/);
  });

  it('more after a topic shows ayahs not shown yet', () => {
    const first = refs('patience');
    const more = refs('show more', 'patience');
    expect(more.length).toBeGreaterThan(0);
    for (const r of more) expect(first).not.toContain(r);
  });

  it('the same ayahs in another language', () => {
    const r = engine.ask('in english', [turn('ayatul kursi banglay')]);
    expect(r.ayahs).toEqual([{ s: 2, a: 255 }]);
    expect(r.translation).toBe('en');
    expect(engine.ask('only arabic', [turn('2:255')]).translation).toBe('none');
  });

  it('"what about ...": the same question for another surah, animal or prophet', () => {
    expect(engine.ask('what about surah al kahf', [turn('how many animals are mentioned in the quran')]).answer).toContain('Surah Al-Kahf names 2 kinds of animal: dog, fish');   // the dog of the cave, the fish of 18:61
    expect(engine.ask('what about the camel', [turn('how many times is the cow mentioned in the quran')]).answer).toContain('The camel is named 18 times');
    expect(engine.ask('what about musa', [turn('how many times is ibrahim mentioned')]).answer).toContain('136 times');
    expect(refs('what about mercy', 'patience')).toContain('39:53');
  });
});
