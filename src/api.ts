// The /api/ask logic as a plain function, so it can be tested without starting a server.
import { Engine, type HistoryTurn, type Reply } from './engine.js';
import { RateLimiter } from './rateLimit.js';
import { cleanTranslation } from './text.js';

export const MAX_QUESTION_CHARS = 500;

export interface ApiEnv { ACCESS_CODE?: string; RATE_LIMIT?: string }
export interface ApiResult { status: number; body: Record<string, unknown> }

function cleanHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-3).map((t): HistoryTurn => {
    const o = (t ?? {}) as Record<string, unknown>;
    const cites = Array.isArray(o.citations) ? o.citations : [];
    return {
      question: typeof o.question === 'string' ? o.question.slice(0, MAX_QUESTION_CHARS) : '',
      answer: typeof o.answer === 'string' ? o.answer.slice(0, 600) : '',
      citations: cites
        .map((c) => ({ surah: Number((c as Record<string, unknown>)?.surah), ayah: Number((c as Record<string, unknown>)?.ayah) }))
        .filter((c) => Number.isInteger(c.surah) && Number.isInteger(c.ayah) && c.surah >= 1 && c.surah <= 114 && c.ayah >= 1)
        .slice(0, 10),
    };
  });
}

/** What the page shows for a reply: the answer plus the real ayahs, taken from the data (never typed by hand). */
export function toJson(engine: Engine, r: Reply): Record<string, unknown> {
  const q = engine.quran;
  const ayahs = r.ayahs.flatMap(({ s, a }) => {
    const y = q.get(s, a);
    if (!y) return [];
    const c = q.chapters[s - 1];
    const note = r.notes?.find((n) => n.s === s && n.a === a);
    const raw = (t: string) => t.replace(/^\s*\(\d+\)\s*/, '').trim();   // with the translator's own footnote marks, to match the notes
    return [{
      surah: s, ayah: a, surahName: c.ar, surahNameEn: c.tr,
      arabic: y.ar,
      ...(note ? { note: { text: note.text, source: note.source } } : {}),
      translation: r.translation === 'none' ? '' : (r.rawTranslation ? raw : cleanTranslation)(r.translation === 'bn' ? y.bn : y.en),
      translationEdition: r.translation === 'bn' ? 'bn.zakaria' : r.translation === 'none' ? 'none' : 'en.sahih',
    }];
  });
  return {
    status: 'ok', lang: r.lang, provider: 'own', attempts: ['own'], kind: r.kind, mode: r.mode,
    answer: r.answer, not_found: r.notFound, ayahs, ...(r.data ? { data: r.data } : {}),
    ...(r.suggestions?.length ? { suggestions: r.suggestions } : {}),
  };
}

export function makeApi(engine: Engine, env: ApiEnv = {}, now: () => number = Date.now) {
  const limit = Number(env.RATE_LIMIT) > 0 ? Number(env.RATE_LIMIT) : 30;
  const limiter = new RateLimiter(limit, 60 * 60_000, now);

  return function ask(body: unknown, ip: string): ApiResult {
    const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    if (env.ACCESS_CODE && b.accessCode !== env.ACCESS_CODE) {
      return { status: 403, body: { status: 'forbidden', message: 'Wrong or missing access code.' } };
    }
    const question = typeof b.question === 'string' ? b.question.trim() : '';
    if (!question) return { status: 400, body: { status: 'bad_request', message: 'Empty question.' } };
    if (question.length > MAX_QUESTION_CHARS) {
      return { status: 400, body: { status: 'bad_request', message: `At most ${MAX_QUESTION_CHARS} characters.` } };
    }
    if (!limiter.allow(ip)) return { status: 429, body: { status: 'rate_limited', message: 'Too many questions. Please try again later.' } };

    const t0 = Date.now();
    const reply = engine.ask(question, cleanHistory(b.history));
    // One log line per question. NO question text: only its length.
    console.log(JSON.stringify({ event: 'ask', kind: reply.kind, lang: reply.lang, ayahs: reply.ayahs.length, ms: Date.now() - t0, qChars: question.length }));
    return { status: 200, body: toJson(engine, reply) };
  };
}
