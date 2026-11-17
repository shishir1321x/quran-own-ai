import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeApi, MAX_QUESTION_CHARS } from '../src/api.js';
import { Engine } from '../src/engine.js';

const engine = new Engine();
afterEach(() => vi.restoreAllMocks());

describe('/api/ask', () => {
  it('answers with the real Arabic and a clean translation, from the data', () => {
    const r = makeApi(engine)({ question: 'surah naas er banglay ortho ki?' }, 'ip');
    const b = r.body as any;
    expect(r.status).toBe(200);
    expect(b).toMatchObject({ status: 'ok', provider: 'own', mode: 'quran', not_found: false });
    expect(b.ayahs).toHaveLength(6);
    expect(b.ayahs[0].arabic).toBe(engine.quran.get(114, 1)!.ar);
    expect(b.ayahs[0].surahNameEn).toBe('An-Naas');
    expect(b.ayahs[0].translationEdition).toBe('bn.zakaria'); // a Bengali question gets the Bengali translation
  });
  it('shows no footnote marks or verse numbers in the translation', () => {
    const b = makeApi(engine)({ question: 'Show me Surah Al-Fatiha' }, 'ip').body as any;
    for (const a of b.ayahs) expect(a.translation).not.toMatch(/^\(\d+\)|\[\d+\]/);
  });
  it('numbers come with the data line they were computed from', () => {
    const b = makeApi(engine)({ question: 'How many ayahs are in Surah Al-Baqarah?' }, 'ip').body as any;
    expect(b.mode).toBe('data');
    expect(b.data[0]).toMatch(/286/);
  });
  it('a follow-up uses the ayahs of the chat so far', () => {
    const api = makeApi(engine);
    const first = api({ question: 'surah naas' }, 'ip').body as any;
    const b = api({ question: 'banglay ortho ki?', history: [{ question: 'surah naas', answer: first.answer, citations: first.ayahs.map((a: any) => ({ surah: a.surah, ayah: a.ayah })) }] }, 'ip').body as any;
    expect(b.kind).toBe('followup');
    expect(b.ayahs).toHaveLength(6);
  });
  it('bad history cannot break it', () => {
    const r = makeApi(engine)({ question: 'hi', history: [null, 5, { citations: [{ surah: 999, ayah: -1 }, 'x'] }] }, 'ip');
    expect(r.status).toBe(200);
  });

  it('refuses an empty question, a long question, and a wrong access code', () => {
    const api = makeApi(engine, { ACCESS_CODE: 'secret' });
    expect(api({ question: 'hi', accessCode: 'nope' }, 'ip').status).toBe(403);
    expect(api({ question: 'hi' }, 'ip').status).toBe(403);
    expect(api({ question: '  ', accessCode: 'secret' }, 'ip').status).toBe(400);
    expect(api({ question: 'x'.repeat(MAX_QUESTION_CHARS + 1), accessCode: 'secret' }, 'ip').status).toBe(400);
    expect(api({ question: 'hi', accessCode: 'secret' }, 'ip').status).toBe(200);
    expect(api(null, 'ip').status).toBe(403);
  });
  it('limits each IP per hour, and lets it in again after the hour', () => {
    let t = 0;
    const api = makeApi(engine, { RATE_LIMIT: '2' }, () => t);
    expect(api({ question: 'hi' }, 'a').status).toBe(200);
    expect(api({ question: 'hi' }, 'a').status).toBe(200);
    expect(api({ question: 'hi' }, 'a').status).toBe(429);
    expect(api({ question: 'hi' }, 'b').status).toBe(200);
    t = 60 * 60_000;
    expect(api({ question: 'hi' }, 'a').status).toBe(200);
  });
  it('never logs the text of a question, only its length', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const q = 'my secret private question about patience';
    makeApi(engine)({ question: q }, 'ip');
    const line = String(log.mock.calls[0][0]);
    expect(line).not.toMatch(/secret|private|patience/);
    expect(JSON.parse(line)).toMatchObject({ event: 'ask', qChars: q.length });
  });
});
