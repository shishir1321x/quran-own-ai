import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', inQ = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQ) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') inQ = false; else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  const [head, ...rest] = rows;
  return rest.filter((r) => r.length >= head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

describe('1,000-question categorized internet chatbot benchmark', () => {
  const engine = new Engine();
  const rows = parseCsv(readFileSync(new URL('../benchmarks/chatbot_1000.csv', import.meta.url), 'utf8'));

  it('contains 1,000 unique questions across 20 balanced categories (50 each)', () => {
    expect(rows.length).toBe(1000);
    const unique = new Set(rows.map((r) => r.question.trim().toLowerCase().normalize('NFC')));
    expect(unique.size).toBe(1000);
    const byCat = new Map<string, number>();
    for (const r of rows) byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
    expect(byCat.size).toBe(20);
    for (const [cat, count] of byCat) expect(count, cat).toBe(50);
  });

  it('answers all 1,000 questions decently per Islamic norms & Quran with 0 fake ayahs', () => {
    const failures: string[] = [];
    for (const r of rows) {
      const reply = engine.ask(r.question);
      for (const a of reply.ayahs) {
        if (!engine.quran.get(a.s, a.a)) failures.push(`Fake ayah ${a.s}:${a.a} on #${r.id}`);
      }
      if (!reply.answer.trim()) failures.push(`Empty answer on #${r.id}`);
      const p = r.expected_policy;
      let ok = false;
      if (p === 'greeting_only') ok = reply.kind === 'greeting' && reply.ayahs.length === 0;
      else if (p === 'courtesy_reply') ok = (reply.kind === 'greeting' || reply.kind === 'thanks') && reply.ayahs.length === 0;
      else if (p === 'meta_assistant') ok = ['about', 'help', 'terms', 'greeting', 'thanks'].includes(reply.kind) && reply.ayahs.length === 0;
      else if (p === 'bot_redirect') ok = reply.kind === 'chat' && reply.mode === 'general' && reply.ayahs.length === 0 && !reply.notFound;
      else if (p === 'vulgar_refusal') ok = reply.kind === 'refusal' && reply.mode === 'general' && reply.notFound && reply.ayahs.length === 0 && (reply.suggestions?.length ?? 0) === 0;
      else if (p === 'crisis_care') ok = reply.kind === 'crisis' && reply.mode === 'general' && reply.ayahs.length === 0 && (reply.suggestions?.length ?? 0) === 0;
      else if (p === 'quran_situation') ok = reply.kind === 'theme' && reply.mode === 'quran' && !reply.notFound && reply.ayahs.length >= 1;
      else if (p === 'quran_content') ok = reply.mode === 'quran' && !reply.notFound && reply.ayahs.length >= 1;
      else if (p === 'quran_ref_or_fact') ok = !reply.notFound && (reply.ayahs.length >= 1 || reply.kind === 'data');
      else if (p === 'scholar_or_limit') ok = (reply.kind === 'scholar' || reply.kind === 'unsupported') && reply.ayahs.length === 0;
      else if (p === 'oos_polite') ok = (reply.kind === 'chat' || reply.kind === 'notFound') && reply.ayahs.length === 0;
      if (!ok) failures.push(`#${r.id} [${r.category}] "${r.question}" -> kind=${reply.kind} mode=${reply.mode} ayahs=${reply.ayahs.length} notFound=${reply.notFound}`);
    }
    expect(failures).toEqual([]);
  }, 30_000);
});

