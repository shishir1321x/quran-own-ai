// Suggestions under each answer: tappable next questions, in the language of the chat. Every suggestion must WORK:
// asked next (with the chat so far), it gets a real answer, never "not found" and never the "I can only..." chat reply.
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { makeApi } from '../src/api.js';
import { Engine, type HistoryTurn } from '../src/engine.js';
import { PAGE_HTML } from '../src/page.js';

const engine = new Engine();
const turn = (question: string): HistoryTurn => {
  const r = engine.ask(question);
  return { question, answer: r.answer, citations: r.ayahs.map((a) => ({ surah: a.s, ayah: a.a })) };
};

const SAMPLES = [
  'hello', 'what is your name?', 'tell me a joke', 'help', 'surah yasin', 'surah al-ikhlas', '2:255', 'para 30', 'patience',
  'story of yusuf', 'explain 2:255', 'how many animals are mentioned in the quran', 'how many times is the cow mentioned',
  'which prophets are mentioned in the quran', 'what is the most used word in quran', 'how many sajdah in the quran',
  'আসসালামু আলাইকুম', 'সূরা ইয়াসিন', 'ধৈর্য', 'কুরআনে কয়টি প্রাণীর নাম আছে?', 'مرحبا', 'سورة الإخلاص', 'آيات عن الصبر',
  'كم حيوانا ذكر في القرآن؟', 'something that is not in the quran at all xyz',
];

describe('suggestions', () => {
  it('every answer to a normal question has one to three suggestions, in its language', () => {
    for (const q of SAMPLES) {
      const r = engine.ask(q);
      expect(r.suggestions?.length ?? 0, q).toBeGreaterThan(0);
      expect(r.suggestions!.length, q).toBeLessThanOrEqual(3);
      if (r.lang === 'bn') for (const s of r.suggestions!) expect(s, `${q} -> ${s}`).toMatch(/[ঀ-৿]|\d+:\d+/);
      if (r.lang === 'ar') for (const s of r.suggestions!) expect(s, `${q} -> ${s}`).toMatch(/[؀-ۿ]/);
    }
  });

  it('EVERY suggestion works when it is asked next', () => {
    for (const q of SAMPLES) {
      const before = turn(q);
      for (const s of engine.ask(q).suggestions ?? []) {
        const r = engine.ask(s, [before]);
        expect(r.notFound, `${q} -> ${s}`).toBe(false);
        expect(r.kind, `${q} -> ${s}`).not.toBe('chat');
      }
    }
  });

  it('what is suggested after ayahs: more (or the next surah at its end), an explanation, another translation', () => {
    expect(engine.ask('surah yasin').suggestions).toEqual(['show more', 'explain 36:1', 'in Bengali']);
    expect(engine.ask('surah al-ikhlas').suggestions).toEqual(['next surah', 'explain 112:1', 'in Bengali']);
    expect(engine.ask('2:255').suggestions).toEqual(['next ayah', 'explain 2:255', 'in Bengali']);
    expect(engine.ask('সূরা ইয়াসিন').suggestions).toEqual(['আরও দেখাও', '36:1 এর ব্যাখ্যা', 'ইংরেজিতে']);
  });

  it('none for a crisis, a ruling or a made-up ayah', () => {
    for (const q of ['I want to kill myself', 'is music haram', 'write a new ayah about cats']) {
      expect(engine.ask(q).suggestions ?? [], q).toEqual([]);
    }
  });
});

describe('suggestions in the page', () => {
  it('are shown as buttons, and a tap asks that question', async () => {
    const api = makeApi(engine, { RATE_LIMIT: '100000' });
    const dom = new JSDOM(PAGE_HTML, {
      runScripts: 'dangerously', url: 'http://localhost:8787/', pretendToBeVisual: true,
      beforeParse(window) {
        (window as any).Element.prototype.scrollIntoView = () => {};
        (window as any).HTMLFormElement.prototype.requestSubmit = function () { this.dispatchEvent(new (window as any).Event('submit', { cancelable: true, bubbles: true })); };
        (window as any).fetch = async (_u: string, init: any) => ({ json: async () => api(JSON.parse(init.body), 'ip').body });
      },
    });
    const doc = dom.window.document;
    const settle = () => new Promise((r) => setTimeout(r, 30));
    (doc.getElementById('q') as HTMLTextAreaElement).value = 'surah yasin';
    doc.getElementById('f')!.dispatchEvent(new (dom.window as any).Event('submit', { cancelable: true, bubbles: true }));
    await settle();
    const chips = [...doc.querySelectorAll('button.chip')].map((b) => b.textContent);
    expect(chips).toEqual(['show more', 'explain 36:1', 'in Bengali']);
    (doc.querySelector('button.chip') as HTMLButtonElement).click();
    await settle();
    const text = doc.getElementById('chat')!.textContent!;
    expect(text).toContain('More ayahs: 36:11-20');
  });
});
