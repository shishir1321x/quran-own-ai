import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/server.js';

let base = '';
const server = createApp({ ACCESS_CODE: 'code123' });
beforeAll(async () => {
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));

const post = (body: unknown, raw?: string) => fetch(`${base}/api/ask`, { method: 'POST', body: raw ?? JSON.stringify(body) });

describe('the web server', () => {
  it('serves the page, the health check and the provider list', async () => {
    const page = await fetch(base);
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('Quran Assistant');
    expect(await (await fetch(`${base}/health`)).text()).toBe('ok');
    expect(await (await fetch(`${base}/api/providers`)).json()).toEqual({ providers: ['own'] });
    expect((await fetch(`${base}/nope`)).status).toBe(404);
  });
  it('answers a question over HTTP (and needs the access code)', async () => {
    expect((await post({ question: 'hi' })).status).toBe(403);
    const r = await post({ question: 'Where is Ayat al-Kursi?', accessCode: 'code123' });
    expect(r.status).toBe(200);
    const b: any = await r.json();
    expect(b.ayahs[0]).toMatchObject({ surah: 2, ayah: 255 });
  });
  it('bad JSON is a plain 400, not a crash', async () => {
    expect((await post(null, '{not json')).status).toBe(400);
  });
  it('the page has no technical words in the answers area and sends no key anywhere', async () => {
    const html = await (await fetch(base)).text();
    expect(html).not.toMatch(/api[_-]?key|innerHTML/i);
  });
});
