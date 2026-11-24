import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();
const nfc = (s: string) => s.normalize('NFC');

describe('Islamic etiquette conversation', () => {
  it.each([
    ['barakallahu feek', 'en', 'thanks'],
    ['may allah bless you', 'en', 'thanks'],
    ['may allah reward you', 'en', 'thanks'],
    ['fi amanillah', 'en', 'greeting'],
    ['please make dua for me', 'en', 'thanks'],
    ['amar jonno dua korben', 'bn', 'thanks'],
    ['আমার জন্য দোয়া করবেন', 'bn', 'thanks'],
    ['ameen', 'en', 'thanks'],
    ['আমিন', 'bn', 'thanks'],
    ['have a nice day', 'en', 'greeting'],
    ['jummah mubarak', 'en', 'greeting'],
    ['im back', 'en', 'greeting'],
    ['আমি আজ খুব খুশি', 'bn', 'greeting'],
    ['ami aj khub khushi', 'bn', 'greeting'],
    ['can you help me?', 'en', 'greeting'],
    ['where should i start reading the quran?', 'en', 'greeting'],
    ['কুরআন কোথা থেকে পড়া শুরু করবো?', 'bn', 'greeting'],
  ] as const)('responds with Islamic etiquette for "%s"', (q, lang, kind) => {
    const r = engine.ask(q);
    expect(r.kind).toBe(kind);
    expect(r.mode).toBe('general');
    expect(r.lang).toBe(lang);
    expect(r.ayahs).toEqual([]);
    expect(r.notFound).toBe(false);
  });
});

describe('Quranic consolation for sadness and heaviness', () => {
  it.each([
    ['my heart feels so heavy right now', 'en'],
    ['I had a terrible day and feel broken', 'en'],
    ['everything is going wrong and I feel lost', 'en'],
    ['i just want to talk to someone', 'en'],
    ['আজ আমার একদম ভালো লাগছে না', 'bn'],
    ['মনটা খুব ভেঙে গেছে', 'bn'],
    ['kichu valo lagche na amar', 'bn'],
    ['খুব একা লাগছে', 'bn'],
    ['قلبي حزين', 'ar'],
  ] as const)('consoles "%s" with real Quranic comfort ayahs', (q, lang) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('theme');
    expect(r.mode).toBe('quran');
    expect(r.lang).toBe(lang);
    expect(r.notFound).toBe(false);
    const refs = r.ayahs.map((a) => `${a.s}:${a.a}`);
    expect(refs).toEqual(expect.arrayContaining(['94:5', '94:6', '2:286', '13:28']));
  });
});

describe('Dignified vulgarity guard and non-false-positives', () => {
  it.each([
    ['fuck you', 'en'],
    ['you are an idiot', 'en'],
    ['go to hell', 'en'],
    ['tui khub harami', 'bn'],
    ['খানকির ছেলে', 'bn'],
    ['اخرس يا كلب', 'ar'],
  ] as const)('ignores vulgar input "%s" calmly without preachy ayahs', (q, lang) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('refusal');
    expect(r.mode).toBe('general');
    expect(r.lang).toBe(lang);
    expect(r.notFound).toBe(true);
    expect(r.ayahs).toEqual([]);
    expect(r.suggestions).toEqual([]);
  });

  it('keeps self-harm crisis priority higher than vulgarity', () => {
    const r = engine.ask('fuck my life I want to kill myself');
    expect(r.kind).toBe('crisis');
  });

  it('never false-triggers vulgar guard on legitimate Quran topics', () => {
    for (const q of [
      'what does the Quran say about hell?',
      'what does the Quran say about zina?',
      'what does the Quran say about adultery?',
      'who is the assistant?',
      'Surah Al-Baqarah',
    ]) {
      const r = engine.ask(q);
      expect(r.kind).not.toBe('refusal');
    }
  });

  it('does not hijack non-sadness queries like guilt, rizq, or someone else sick', () => {
    const guilt = engine.ask('I feel guilty after making a mistake');
    expect(guilt.ayahs.map((a) => `${a.s}:${a.a}`)).not.toEqual(['94:5', '94:6', '2:286', '13:28', '39:53', '65:3']);
    const joke = engine.ask('tell me a joke');
    expect(joke.kind).toBe('chat');
    expect(nfc(joke.answer)).toContain('I am only a Quran assistant');
    const unknown = engine.ask('blargfoo xyzwidget');
    expect(unknown.kind).toBe('notFound');
    expect(unknown.ayahs).toEqual([]);
  });
});

