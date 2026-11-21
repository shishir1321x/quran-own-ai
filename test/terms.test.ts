// "What is this chatbot about?" gets a specific answer, and the assistant has its own Terms page (/terms),
// written for what it really does. Nothing in it belongs to another app.
import { JSDOM } from 'jsdom';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { makeApi } from '../src/api.js';
import { Engine } from '../src/engine.js';
import { PAGE_HTML } from '../src/page.js';
import { createApp } from '../src/server.js';
import { TERMS_HTML } from '../src/terms.js';

const engine = new Engine();

describe('what this chatbot is about', () => {
  it('a specific answer: what it searches, the translations, examples, what it does not do, and the Terms', () => {
    const r = engine.ask('what is this chatbot about');
    expect(r.kind).toBe('about');
    for (const part of ['Quran Assistant from Amal', '6236 ayahs', 'Saheeh International', 'Zakaria', 'explain 2:255', 'how many times is Musa mentioned', 'not a religious authority', 'Terms']) {
      expect(r.answer, part).toContain(part);
    }
    expect(r.link).toEqual({ href: '/terms', label: 'Terms & privacy' });
  });

  it('in Bengali and Arabic too', () => {
    const bn = engine.ask('tumi k?');
    expect(bn.kind).toBe('about');
    expect(bn.answer).toContain('৬২৩৬টি আয়াত');
    expect(bn.answer).toContain('Amal');
    const ar = engine.ask('ما هذا البرنامج').answer;
    expect(ar).toContain('6236 آية');
    expect(ar).toContain('Amal');
  });

  it('a question about the terms or privacy gets the short version, with the link', () => {
    for (const q of ['what are your terms', 'terms and conditions', 'do you store my questions', 'privacy policy', 'তোমার শর্তাবলী কী?']) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('terms');
      expect(r.ayahs, q).toEqual([]);
      expect(r.link?.href, q).toBe('/terms');
    }
    expect(engine.ask('do you store my questions').answer).toContain('The text of your questions is not saved');
  });
});

describe('the Terms page', () => {
  let base = '';
  const server = createApp({}, engine);
  beforeAll(async () => { await new Promise<void>((r) => server.listen(0, '127.0.0.1', r)); base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`; });
  afterAll(() => server.close());

  it('is served at /terms', async () => {
    const res = await fetch(`${base}/terms`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    expect(await res.text()).toContain('At a glance');
  });

  it('plain language: a summary, then numbered sections', () => {
    const doc = new JSDOM(TERMS_HTML).window.document;
    expect(doc.querySelector('.glance')!.querySelectorAll('li').length).toBeGreaterThanOrEqual(5);
    const numbers = [...doc.querySelectorAll('h2 .n')].map((e) => Number(e.textContent));
    expect(numbers).toEqual(numbers.map((_, i) => i + 1));
    expect(numbers.length).toBeGreaterThanOrEqual(8);
  });

  it('says what the assistant really does, and names its real sources', () => {
    for (const part of ['not a religious authority', 'access code', 'not saved', 'Google', 'Microsoft', 'Tanzil', 'CC BY 3.0', 'Saheeh International', 'QuranEnc.com', 'Zakaria', 'Render', 'as it is']) {
      expect(TERMS_HTML, part).toContain(part);
    }
  });

  it('says it is from Amal (approved by Amal), and copies nothing from the Amal app\'s own terms or contacts', () => {
    expect(TERMS_HTML).toContain('from Amal');
    expect(TERMS_HTML).not.toMatch(/student project/i);
    expect(TERMS_HTML).not.toMatch(/lit labs|singapore|noor coins|soul stack|jannah garden|@/i);
  });

  it('is linked from the chat page', () => {
    const doc = new JSDOM(PAGE_HTML).window.document;
    expect([...doc.querySelectorAll('a')].some((a) => a.getAttribute('href') === '/terms')).toBe(true);
  });
});

describe('what the Terms promise is true', () => {
  it('the server log has no question text', () => {
    const api = makeApi(engine, { RATE_LIMIT: '100000' });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    api({ question: 'my very private question about patience' }, 'ip');
    const written = log.mock.calls.map((c) => c.join(' ')).join('\n');
    log.mockRestore();
    expect(written).not.toContain('private');
    expect(written).toContain('"qChars"');
  });

  it('the chat page shows a link that comes with an answer', async () => {
    const api = makeApi(engine, { RATE_LIMIT: '100000' });
    const dom = new JSDOM(PAGE_HTML, {
      runScripts: 'dangerously', url: 'http://localhost:8787/', pretendToBeVisual: true,
      beforeParse(window) {
        (window as any).Element.prototype.scrollIntoView = () => {};
        (window as any).fetch = async (_u: string, init: any) => ({ json: async () => api(JSON.parse(init.body), 'ip').body });
      },
    });
    const doc = dom.window.document;
    (doc.getElementById('q') as HTMLTextAreaElement).value = 'what is this chatbot about';
    doc.getElementById('f')!.dispatchEvent(new (dom.window as any).Event('submit', { cancelable: true, bubbles: true }));
    await new Promise((r) => setTimeout(r, 30));
    const link = doc.querySelector('#chat a.answer-link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/terms');
    expect(link.textContent).toBe('Terms & privacy');
  });
});

describe('the examples in the "about" answer', () => {
  it('every quoted example, in every language, is answered (after a surah, for "show more" and "next ayah")', async () => {
    const { MSG } = await import('../src/templates.js');
    const before = engine.ask('surah yasin');
    const history = [{ question: 'surah yasin', answer: before.answer, citations: before.ayahs.map((a) => ({ surah: a.s, ayah: a.a })) }];
    for (const lang of ['en', 'bn', 'ar'] as const) {
      const examples = [...MSG.about[lang].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(examples.length, lang).toBeGreaterThanOrEqual(8);
      for (const q of examples) {
        const r = engine.ask(q, history);
        expect(r.notFound, `${lang}: ${q}`).toBe(false);
        expect(['chat', 'about'], `${lang}: ${q}`).not.toContain(r.kind);
      }
    }
  });
});

describe('from Amal', () => {
  it('the name answer and the page header say it', () => {
    expect(engine.ask('what is your name?').answer).toContain('Quran Assistant, from Amal');
    expect(engine.ask('তোমার নাম কী?').answer).toContain('Amal');
    expect(engine.ask('ما اسمك؟').answer).toContain('Amal');
    const doc = new JSDOM(PAGE_HTML).window.document;
    expect(doc.querySelector('h1')!.textContent).toMatch(/Quran Assistant.*by Amal/);
    expect(doc.title).toContain('Amal');
  });
});
