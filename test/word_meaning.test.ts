// Asking for the lexical meaning of a single word or Quranic term in English, Bengali, Banglish, or Arabic.
import { describe, expect, it } from 'vitest';
import { Engine, type HistoryTurn } from '../src/engine.js';

const engine = new Engine();
const turn = (q: string): HistoryTurn => {
  const r = engine.ask(q);
  return { question: q, answer: r.answer, citations: r.ayahs.map((a) => ({ surah: a.s, ayah: a.a })) };
};

describe('word meaning lookups', () => {
  it.each([
    ['what is the meaning of sabr?', /Patience|steadfastness/i, '2:153'],
    ['meaning of taqwa', /God-consciousness|mindfulness/i, '2:2'],
    ['what does taqwa mean?', /God-consciousness|mindfulness/i, '2:2'],
    ['meaning of zakat', /charity|purification/i, '2:43'],
    ['what does ihsan mean?', /excellence|goodness/i, '16:90'],
    ['what is the meaning of barakah?', /blessing|blessings/i, '7:96'],
    ['define taqwa', /God-consciousness|mindfulness/i, '2:2'],
    ['meaning of the Arabic word صبر', /patience|steadfastness/i, '2:153'],
    ['meaning of tawbah', /Repentance|turning back/i, '66:8'],
    ['what does ar-rahman mean?', /Merciful/i, '55:1'],
  ])('%s -> lexical meaning + ayah %s', (q, pattern, expectedAyah) => {
    const r = engine.ask(q);
    expect(r.notFound).toBe(false);
    expect(r.mode).toBe('quran');
    expect(r.answer).toMatch(pattern);
    expect(r.answer).toMatch(/General lexical meaning/i);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain(expectedAyah);
    expect(r.suggestions?.length ?? 0).toBeGreaterThan(0);
  });

  it('works in Bengali, Banglish, and Arabic', () => {
    const bn1 = engine.ask('সবর শব্দের অর্থ কী?');
    expect(bn1.lang).toBe('bn');
    expect(bn1.notFound).toBe(false);
    expect(bn1.answer).toContain('ধৈর্য');
    expect(bn1.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:153');

    const bn2 = engine.ask('তাকওয়া মানে কী?');
    expect(bn2.lang).toBe('bn');
    expect(bn2.notFound).toBe(false);
    expect(bn2.answer).toContain('তাকওয়া');

    const bn3 = engine.ask('তওবা শব্দের অর্থ কী?');
    expect(bn3.lang).toBe('bn');
    expect(bn3.notFound).toBe(false);
    expect(bn3.answer).toContain('অনুশোচনা');

    const bn4 = engine.ask('সবরের অর্থ কী?');
    expect(bn4.lang).toBe('bn');
    expect(bn4.notFound).toBe(false);
    expect(bn4.answer).toContain('ধৈর্য');

    const banglish = engine.ask('sabr er ortho ki?');
    expect(banglish.lang).toBe('bn');
    expect(banglish.notFound).toBe(false);
    expect(banglish.answer).toContain('ধৈর্য');

    const ikhlasBanglish = engine.ask('ikhlas mane ki?');
    expect(ikhlasBanglish.lang).toBe('bn');
    expect(ikhlasBanglish.notFound).toBe(false);
    expect(ikhlasBanglish.answer).toContain('একনিষ্ঠতা');

    const ar = engine.ask('ما معنى الصبر؟');
    expect(ar.lang).toBe('ar');
    expect(ar.notFound).toBe(false);
    expect(ar.answer).toContain('حبس النفس');
    expect(ar.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:153');
  });

  it('handles glossary entries that have no attached ayahs cleanly', () => {
    const r = engine.ask('what does allahu akbar mean?');
    expect(r.notFound).toBe(false);
    expect(r.mode).toBe('quran');
    expect(r.answer).toContain('Allah is the Greatest');
    expect(r.suggestions?.length ?? 0).toBeGreaterThan(0);
  });

  it('supports "what is <glossary term>?" without breaking general/safety checks', () => {
    const r = engine.ask('what is sabr?');
    expect(r.notFound).toBe(false);
    expect(r.answer).toMatch(/Patience|steadfastness/i);
    expect(engine.ask('what is jihad?').kind).toBe('scholar');
    expect(engine.ask('what is your name?').kind).toBe('about');
  });

  it('falls back honestly to Quran ayahs for Arabic/English words outside the glossary', () => {
    const ar = engine.ask('what is the meaning of شمس?');
    expect(ar.notFound).toBe(false);
    expect(ar.answer).toContain('do not have a standalone full-word dictionary entry');
    expect(ar.ayahs.length).toBeGreaterThan(0);
  });

  it('returns an honest not-found response for unknown non-Quranic words (never followUpNone)', () => {
    const r = engine.ask('what is the meaning of photosynthesis?');
    expect(r.notFound).toBe(true);
    expect(r.kind).toBe('notFound');
    expect(r.answer).toContain('do not have a dictionary meaning');
    expect(r.answer).not.toContain('Which ayah or surah do you mean');
  });

  it('keeps follow-ups, ayah meanings, surah meanings, and safety rules intact', () => {
    expect(engine.ask('banglay ortho ki?').notFound).toBe(true);
    expect(engine.ask('banglay ortho ki?').answer).toContain('কোন আয়াত');
    const prev = turn('2:255');
    const fu = engine.ask('banglay ortho ki?', [prev]);
    expect(fu.kind).toBe('followup');
    expect(fu.translation).toBe('bn');

    const pointBack = engine.ask('what does this mean?', [prev]);
    expect(pointBack.kind).toBe('explain');

    expect(engine.ask('what is the meaning of ayatul kursi').kind).toBe('ref');
    expect(engine.ask('meaning of Surah Al-Fatiha').kind).toBe('surah');
    expect(engine.ask('সূরা হজ্জের অর্থ').kind).toBe('surah');
    expect(engine.ask('what does Al-Kawthar mean').kind).toBe('data');
    expect(engine.ask('What does the name Al-Baqarah mean?').kind).toBe('data');
    expect(engine.ask('what does jihad mean?').kind).toBe('scholar');
  });
});

