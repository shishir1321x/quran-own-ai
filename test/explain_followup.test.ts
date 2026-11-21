// "Can you explain these?": every explanation answer first says that the assistant explains nothing on its own (all it
// shows is the Quran as it is, its published translations, and the translators' own notes); and "explain these / this /
// it", "what does this mean?" explain the ayahs that were just shown.
import { describe, expect, it } from 'vitest';
import { Engine, type HistoryTurn } from '../src/engine.js';

const engine = new Engine();
const turn = (question: string): HistoryTurn => {
  const r = engine.ask(question);
  return { question, answer: r.answer, citations: r.ayahs.map((a) => ({ surah: a.s, ayah: a.a })) };
};
const OWN = { en: 'I do not explain anything on my own', bn: 'আমি নিজে থেকে কিছুই ব্যাখ্যা করি না', ar: 'لا أشرح شيئًا من عندي' };

describe('an explanation answer first says that it explains nothing on its own', () => {
  it('with notes, without a note, and when it asks which ayah (English, Bengali, Arabic)', () => {
    for (const q of ['explain 2:255', 'explain 94:6', 'can you explain me these?', 'explain patience', 'tafsir ibn kathir of 112:1']) {
      expect(engine.ask(q).answer.startsWith(OWN.en), q).toBe(true);
    }
    expect(engine.ask('2:255 এর ব্যাখ্যা').answer.startsWith(OWN.bn)).toBe(true);
    expect(engine.ask('شرح 2:255').answer.startsWith(OWN.ar)).toBe(true);
  });

  it('still says whose notes they are, word for word, and that it adds nothing', () => {
    const r = engine.ask('explain 2:255');
    expect(r.answer).toMatch(/translator's own notes, copied word for word \(Saheeh International\)/);
    expect(r.answer).toMatch(/adds nothing/);
    expect(r.notes?.length).toBeGreaterThan(0);
  });

  it('a ruling or a sensitive topic is still sent to a scholar', () => {
    expect(engine.ask('explain what is jihad').kind).toBe('scholar');
  });
});

describe('"explain these" explains the ayahs that were just shown', () => {
  it('one ayah, a surah, a topic (its first 4 ayahs)', () => {
    expect(engine.ask('explain this', [turn('2:255')]).ayahs).toEqual([{ s: 2, a: 255 }]);
    expect(engine.ask('explain it', [turn('2:255')]).kind).toBe('explain');
    expect(engine.ask('can you explain me these?', [turn('surah ikhlas')]).ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(['112:1', '112:2', '112:3', '112:4']);
    const topic = engine.ask('can you explain me these?', [turn('patience')]);
    expect(topic.ayahs).toHaveLength(4);
    expect(topic.answer).toMatch(/first 4 ayahs only/);
  });

  it('"what does this mean?" after an ayah gives its notes (not a word search)', () => {
    const r = engine.ask('what does this mean?', [turn('2:255')]);
    expect(r.kind).toBe('explain');
    expect(r.ayahs).toEqual([{ s: 2, a: 255 }]);
  });

  it('in Bengali and Arabic', () => {
    const bn = engine.ask('এগুলোর ব্যাখ্যা দাও', [turn('ধৈর্য')]);
    expect(bn.kind).toBe('explain');
    expect(bn.answer.startsWith(OWN.bn)).toBe(true);
    expect(engine.ask('ব্যাখ্যা করো', [turn('2:255')]).ayahs).toEqual([{ s: 2, a: 255 }]);
    const ar = engine.ask('اشرح هذه', [turn('سورة الإخلاص')]);
    expect(ar.ayahs).toHaveLength(4);
    expect(ar.answer.startsWith(OWN.ar)).toBe(true);
  });

  it('with nothing shown before, it asks which ayah', () => {
    const r = engine.ask('can you explain me these?');
    expect(r.kind).toBe('help');
    expect(r.answer).toMatch(/Which ayah do you want explained/);
  });
});
