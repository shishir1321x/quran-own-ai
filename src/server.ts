// The web server for Render (and for your own computer). Plain Node, no framework, no dependencies.
//   GET  /          the chat page
//   GET  /health    for Render's health check
//   POST /api/ask   { question, history?, accessCode? }
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { pathToFileURL } from 'node:url';
import { makeApi } from './api.js';
import { Engine } from './engine.js';
import { PAGE_HTML } from './page.js';
import { TERMS_HTML } from './terms.js';

const MAX_BODY_BYTES = 10_000;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const json = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(body));
};

export function createApp(env: { ACCESS_CODE?: string; RATE_LIMIT?: string } = {}, engine: Engine = new Engine()) {
  const api = makeApi(engine, env);
  return createServer(async (req, res) => {
    try {
      const path = (req.url ?? '/').split('?')[0];
      if (req.method === 'GET' && path === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff' });
        res.end(PAGE_HTML);
      } else if (req.method === 'GET' && path === '/terms') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'x-content-type-options': 'nosniff' });
        res.end(TERMS_HTML);
      } else if (req.method === 'GET' && path === '/health') {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end('ok');
      } else if (req.method === 'GET' && path === '/api/providers') {
        json(res, 200, { providers: ['own'] });
      } else if (req.method === 'POST' && path === '/api/ask') {
        let body: unknown;
        try { body = JSON.parse(await readBody(req)); } catch { return json(res, 400, { status: 'bad_request', message: 'Send JSON.' }); }
        const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
        const out = api(body, forwarded || req.socket.remoteAddress || 'unknown');
        json(res, out.status, out.body);
      } else {
        json(res, 404, { status: 'not_found' });
      }
    } catch (err) {
      console.log(JSON.stringify({ event: 'crash', error: String(err) }));
      json(res, 500, { status: 'error', message: 'Sorry, something went wrong. Please try again later.' });
    }
  });
}

// Start listening only when this file is run directly (`npm start`), not when a test imports it.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const started = Date.now();
  const engine = new Engine();
  console.log(JSON.stringify({ event: 'ready', ayahs: engine.quran.ayahs.length, startMs: Date.now() - started }));
  const port = Number(process.env.PORT) || 8787;
  createApp({ ACCESS_CODE: process.env.ACCESS_CODE, RATE_LIMIT: process.env.RATE_LIMIT }, engine)
    .listen(port, '0.0.0.0', () => console.log(JSON.stringify({ event: 'listening', port })));
}
