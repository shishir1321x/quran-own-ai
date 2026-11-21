// A surah is shown whole (Al-Baqarah: all 286 ayahs); a range or a part exactly as asked; a mushaf page whole.
// A para (juz, up to 564 ayahs) still goes 10 at a time with "show more". The chat history must then carry up to
// 286 ayahs per turn: the API keeps them all, and the server accepts three such turns.
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeApi } from '../src/api.js';
import { Engine } from '../src/engine.js';
import { createApp } from '../src/server.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);
const baqarah = Array.from({ length: 286 }, (_, i) => ({ surah: 2, ayah: i + 1 }));

describe('a whole surah', () => {
  it('all its ayahs, the longest too', () => {
    const r = engine.ask('surah al-baqarah');
    expect(r.ayahs).toHaveLength(286);
    expect(r.answer).toContain('all 286 ayahs');
    expect(refs('surah yasin')).toHaveLength(83);
    expect(refs('surah ikhlas')).toEqual(['112:1', '112:2', '112:3', '112:4']);
  });

  it('a range or a part: exactly what was asked', () => {
    expect(refs('2:1-286')).toHaveLength(286);
    expect(refs('ayat 1 to 20 of surah baqarah')).toHaveLength(20);
    expect(refs('last 20 ayat of surah baqarah')[0]).toBe('2:267');
    expect(refs('2:255')).toEqual(['2:255']);
  });

  it('a mushaf page: the whole page, also across surahs', () => {
    expect(refs('page 604')).toEqual(['112:1', '112:2', '112:3', '112:4', '113:1', '113:2', '113:3', '113:4', '113:5', '114:1', '114:2', '114:3', '114:4', '114:5', '114:6']);
    expect(refs('page 1')).toEqual(['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7']);
  });

  it('a para still goes 10 at a time', () => {
    expect(refs('para 30')).toHaveLength(10);
  });
});

describe('the chat history can carry a whole surah', () => {
  it('the API keeps every ayah of the turn before: "next ayah" after Al-Baqarah is 3:1', () => {
    const api = makeApi(engine, { RATE_LIMIT: '100000' });
    const out = api({ question: 'next ayah', history: [{ question: 'surah al-baqarah', answer: 'x', citations: baqarah }] }, 'ip');
    const ayahs = (out.body.ayahs as Array<{ surah: number; ayah: number }>).map((a) => `${a.surah}:${a.ayah}`);
    expect(ayahs).toEqual(['3:1']);
  });

  it('"show more" after a whole surah says that it has ended', () => {
    const api = makeApi(engine, { RATE_LIMIT: '100000' });
    const out = api({ question: 'show more', history: [{ question: 'surah al-baqarah', answer: 'x', citations: baqarah }] }, 'ip');
    expect(out.body.answer).toContain('That was the end of Surah Al-Baqara');
  });

  describe('over HTTP', () => {
    let base = '';
    const server = createApp({}, engine);
    beforeAll(async () => { await new Promise<void>((r) => server.listen(0, '127.0.0.1', r)); base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`; });
    afterAll(() => server.close());

    it('three turns that each showed Al-Baqarah are still accepted', async () => {
      const turn = { question: 'surah al-baqarah', answer: 'Surah 2, Al-Baqara: all 286 ayahs.', citations: baqarah };
      const res = await fetch(`${base}/api/ask`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: 'next ayah', history: [turn, turn, turn] }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ayahs[0]).toMatchObject({ surah: 3, ayah: 1 });
    });
  });
});
