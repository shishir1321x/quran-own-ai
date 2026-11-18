// Voice: the page uses the browser's own speech recognition (no AI on the server, no key). The server still gets text.
// A fake recognizer stands in for the browser's here; a real microphone has to be tried by hand in Chrome or Edge.
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { makeApi } from '../src/api.js';
import { Engine } from '../src/engine.js';
import { PAGE_HTML } from '../src/page.js';

const engine = new Engine();
const api = makeApi(engine, { RATE_LIMIT: '100000' });
const settle = () => new Promise((r) => setTimeout(r, 30));

/** A stand-in for the browser's SpeechRecognition: the test says what the user "said". */
class FakeRecognizer {
  static last: FakeRecognizer | null = null;
  lang = ''; interimResults = false; continuous = false; maxAlternatives = 1;
  onresult: ((ev: unknown) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  onstart: (() => void) | null = null;
  started = false;
  constructor() { FakeRecognizer.last = this; }
  start() { this.started = true; this.onstart?.(); }
  stop() { this.onend?.(); }
  say(text: string) {
    const result = Object.assign([{ transcript: text, confidence: 0.9 }], { isFinal: true });
    this.onresult?.({ resultIndex: 0, results: [result] });
    this.onend?.();
  }
  fail(error: string) { this.onerror?.({ error }); this.onend?.(); }
}

function openPage(withVoice: boolean) {
  const errors: string[] = [];
  const dom = new JSDOM(PAGE_HTML, {
    runScripts: 'dangerously', url: 'http://localhost:8787/', pretendToBeVisual: true,
    beforeParse(window) {
      (window as any).Element.prototype.scrollIntoView = () => {};
      (window as any).HTMLFormElement.prototype.requestSubmit = function () { this.dispatchEvent(new (window as any).Event('submit', { cancelable: true, bubbles: true })); };
      window.addEventListener('error', (ev: any) => errors.push(String(ev.message)));
      (window as any).fetch = async (_u: string, init: any) => ({ json: async () => api(JSON.parse(init.body), 'ip').body });
      if (withVoice) (window as any).webkitSpeechRecognition = FakeRecognizer;
    },
  });
  return { doc: dom.window.document, errors };
}

describe('voice in the page', () => {
  it('there is no mic button in a browser without speech recognition (and no error)', () => {
    const { doc, errors } = openPage(false);
    expect(errors).toEqual([]);
    expect((doc.getElementById('mic') as HTMLElement | null)?.hidden ?? true).toBe(true);
  });

  it('speaking a question sends it, and the answer appears', async () => {
    const { doc, errors } = openPage(true);
    const mic = doc.getElementById('mic') as HTMLButtonElement;
    expect(mic.hidden).toBe(false);
    mic.click();
    expect(FakeRecognizer.last?.started).toBe(true);
    FakeRecognizer.last!.say('surah yasin');
    await settle();
    expect(errors).toEqual([]);
    const text = doc.getElementById('chat')!.textContent!;
    expect(text).toContain('surah yasin');                     // the spoken question, as the user's message
    expect(text).toContain('Surah 36, Yaseen');                // and its answer
  });

  it('listens in the chosen language (Bengali, Arabic, English)', () => {
    const { doc } = openPage(true);
    const pick = doc.getElementById('voiceLang') as HTMLSelectElement;
    for (const [value] of [['bn-BD'], ['ar-SA'], ['en-US']]) {
      pick.value = value;
      (doc.getElementById('mic') as HTMLButtonElement).click();
      expect(FakeRecognizer.last!.lang).toBe(value);
      FakeRecognizer.last!.stop();
    }
  });

  it('a refused microphone says so, and sends nothing', async () => {
    const { doc } = openPage(true);
    (doc.getElementById('mic') as HTMLButtonElement).click();
    FakeRecognizer.last!.fail('not-allowed');
    await settle();
    expect(doc.getElementById('voiceStatus')!.textContent).toMatch(/microphone/i);
    expect(doc.querySelectorAll('.msg.user')).toHaveLength(0);
  });

  it('Settings says where the voice goes', () => {
    const { doc } = openPage(true);
    expect(doc.querySelector('details')!.textContent).toMatch(/speech/i);
  });
});

describe('spoken references', () => {
  it('"chapter 2 verse 255" is 2:255 (speech-to-text often writes "chapter")', () => {
    expect(engine.ask('chapter 2 verse 255').ayahs).toEqual([{ s: 2, a: 255 }]);
    expect(engine.ask('Chapter 112').ayahs[0]).toEqual({ s: 112, a: 1 });
    expect(engine.ask('chapter 2 verse 255 in Bengali').translation).toBe('bn');
  });
});
