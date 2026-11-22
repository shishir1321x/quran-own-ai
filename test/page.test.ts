// The chat page, run like a browser (jsdom): the script must load, a question must go out, the answer must appear,
// and the text box must be cleared. A syntax error in the page script once made the form reload the page and lose the text.
import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';
import { makeApi } from '../src/api.js';
import { Engine } from '../src/engine.js';
import { PAGE_HTML } from '../src/page.js';

const engine = new Engine();
const api = makeApi(engine, { RATE_LIMIT: '100000' });

/** Load the page in a fake browser whose /api/ask is the real API function. */
function openPage() {
  const errors: string[] = [];
  const dom = new JSDOM(PAGE_HTML, {
    runScripts: 'dangerously',
    url: 'http://localhost:8787/',
    pretendToBeVisual: true,
    beforeParse(window) {
      (window as any).Element.prototype.scrollIntoView = () => {};
      (window as any).HTMLFormElement.prototype.requestSubmit = function () { this.dispatchEvent(new (window as any).Event('submit', { cancelable: true, bubbles: true })); };
      window.addEventListener('error', (ev: any) => errors.push(String(ev.message)));
      (window as any).fetch = async (_url: string, init: any) => {
        const out = api(JSON.parse(init.body), 'test-ip');
        return { json: async () => out.body };
      };
    },
  });
  return { dom, doc: dom.window.document, errors };
}
const settle = () => new Promise((r) => setTimeout(r, 30));

async function ask(doc: Document, text: string) {
  const box = doc.getElementById('q') as HTMLTextAreaElement;
  box.value = text;
  (doc.getElementById('f') as HTMLFormElement).dispatchEvent(new (doc.defaultView as any).Event('submit', { cancelable: true, bubbles: true }));
  await settle();
}

describe('the page script', () => {
  it('has no syntax error (a broken script makes the form reload the page)', () => {
    const script = PAGE_HTML.match(/<script>([\s\S]*)<\/script>/)![1];
    expect(() => new Function(script)).not.toThrow();
  });
  it('loads without an error in a browser-like page', () => {
    const { errors } = openPage();
    expect(errors).toEqual([]);
  });
});

describe('asking a question in the page', () => {
  it('the question appears, the box is cleared, the page is NOT reloaded, and the answer appears', async () => {
    const { doc, errors } = openPage();
    const submitted = vi.fn();
    (doc.getElementById('f') as HTMLFormElement).addEventListener('submit', (ev) => { if (!ev.defaultPrevented) submitted(); });
    await ask(doc, 'surah ikhlas');
    expect(errors).toEqual([]);
    expect(submitted).not.toHaveBeenCalled();                    // the script took over the form: no reload
    expect((doc.getElementById('q') as HTMLTextAreaElement).value).toBe('');
    const text = doc.getElementById('chat')!.textContent!;
    expect(text).toContain('surah ikhlas');
    expect(text).toContain('Surah 112, Al-Ikhlaas');
    expect(doc.querySelectorAll('.ayah')).toHaveLength(4);
    expect(doc.querySelector('.arabic')!.textContent!.length).toBeGreaterThan(5);
  });
  it('an ayah with a note shows it in a collapsed block (text only)', async () => {
    const { doc, errors } = openPage();
    await ask(doc, 'explain ayatul kursi');
    expect(errors).toEqual([]);
    const det = doc.querySelector('details.note')!;
    expect(det).not.toBeNull();
    expect(det.querySelector('summary')!.textContent).toContain('Translator’s notes: Saheeh International');
    expect(det.querySelector('.notetext')!.textContent).toContain('Whose life is perfect');
    expect(det.hasAttribute('open')).toBe(false);               // collapsed until tapped
  });
  it('a data answer shows its label and the line it was computed from', async () => {
    const { doc } = openPage();
    await ask(doc, 'How many ayahs are in Surah Al-Baqarah?');
    expect(doc.querySelector('.badge.data')).not.toBeNull();
    expect(doc.querySelector('.datalines')!.textContent).toContain('286');
  });
  it('a refused question shows the message, and the chat keeps the conversation', async () => {
    const { doc } = openPage();
    await ask(doc, 'Is music haram?');
    await ask(doc, 'hi');
    expect(doc.querySelectorAll('.msg.user')).toHaveLength(2);
    expect(doc.querySelectorAll('.msg.bot')).toHaveLength(2);
    expect(doc.getElementById('chat')!.textContent).toMatch(/qualified scholar/);
  });
  it('a failing server shows a message instead of losing the question', async () => {
    const { doc, dom } = openPage();
    (dom.window as any).fetch = async () => { throw new Error('offline'); };
    await ask(doc, 'patience');
    expect(doc.getElementById('chat')!.textContent).toContain('patience');
    expect(doc.getElementById('chat')!.textContent).toMatch(/Could not reach the server/);
    expect((doc.getElementById('btn') as HTMLButtonElement).disabled).toBe(false);   // can try again
  });
  it('"New chat" clears the conversation', async () => {
    const { doc } = openPage();
    await ask(doc, 'hi');
    (doc.getElementById('newChat') as HTMLButtonElement).click();
    expect(doc.querySelectorAll('.msg')).toHaveLength(0);
  });
  it('text from the server is put on the page as text, never as HTML', async () => {
    const { doc, dom } = openPage();
    (dom.window as any).fetch = async () => ({ json: async () => ({ status: 'ok', lang: 'en', mode: 'quran', kind: 'search', answer: '<img src=x onerror=alert(1)>', ayahs: [] }) });
    await ask(doc, 'x');
    expect(doc.querySelector('img')).toBeNull();
    expect(doc.getElementById('chat')!.textContent).toContain('<img src=x');
  });
  it('an earlier wrong-access-code warning is cleared once a later request succeeds', async () => {
    const guarded = makeApi(engine, { ACCESS_CODE: 'secret123', RATE_LIMIT: '100000' });
    const { doc, dom } = openPage();
    (dom.window as any).fetch = async (_url: string, init: any) => ({ json: async () => guarded(JSON.parse(init.body), 'test-ip').body });
    await ask(doc, 'help');
    expect(doc.getElementById('chat')!.textContent).toContain('Wrong or missing access code.');
    expect(doc.querySelectorAll('#chat .auth-warn')).toHaveLength(1);
    expect((doc.querySelector('body > details') as HTMLDetailsElement).open).toBe(true);

    (doc.getElementById('access') as HTMLInputElement).value = 'secret123';
    await ask(doc, 'help');
    expect(doc.querySelectorAll('#chat .auth-warn')).toHaveLength(0);
    expect(doc.getElementById('chat')!.textContent).not.toContain('Wrong or missing access code.');
    expect(doc.getElementById('chat')!.textContent).toContain('I can show ayahs and numbers');
  });
});
