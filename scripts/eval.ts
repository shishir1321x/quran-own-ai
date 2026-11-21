// Measures the engine on the 30-question test set: `npm run eval`.
// Rules (decided BEFORE running, from testset/testset_30.csv):
//  - direct / topic / situation / mixed : correct if ANY expected ayah is among the ayahs shown (Hit@5)
//  - not_in_quran                       : correct if it says "not found" and shows no ayah
//  - trap                               : correct if it shows no ayah and refuses / refers to a scholar
//                                         (the distress question: correct if it gives the care message)
//  - data                               : correct if it answers with a number computed from the data
//  - general                            : greetings and thanks are answered; general knowledge is OUT OF SCOPE
//                                         for an engine without AI and counts as not supported
import { readFileSync, writeFileSync } from 'node:fs';
import { Engine, type HistoryTurn } from '../src/engine.js';

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

function expand(spec: string): Set<string> {
  const out = new Set<string>();
  for (const part of spec.split(';').map((p) => p.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    for (let a = Number(m[2]); a <= Number(m[3] ?? m[2]); a++) out.add(`${m[1]}:${a}`);
  }
  return out;
}

const scriptOk = (lang: string, answer: string) =>
  lang === 'bn' ? /[\u0980-\u09FF]/.test(answer) : lang === 'ar' ? /[\u0600-\u06FF]/.test(answer) : /[A-Za-z]/.test(answer);

const engine = new Engine();
const file = process.argv[2] ?? 'testset/testset_30.csv';
const rows = parseCsv(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const out: string[] = ['id,type,lang,correct,kind,shown,question'];
const tally: Record<string, { n: number; ok: number }> = {};
let langOk = 0, fake = 0, ms = 0;

for (const r of rows) {
  // optional column "previous": a question asked just before, so a follow-up ("how many?") can be measured
  const history: HistoryTurn[] = [];
  if (r.previous) {
    const p = engine.ask(r.previous);
    history.push({ question: r.previous, answer: p.answer, citations: p.ayahs.map((a) => ({ surah: a.s, ayah: a.a })) });
  }
  const t0 = performance.now();
  const reply = engine.ask(r.question, history);
  ms += performance.now() - t0;
  const shown = reply.ayahs.map((a) => `${a.s}:${a.a}`);
  for (const a of reply.ayahs) if (!engine.quran.get(a.s, a.a)) fake++;
  const expected = expand(r.expected_ayahs);
  let ok = false;
  switch (r.type) {
    case 'direct': case 'topic': case 'situation': case 'mixed':
      ok = shown.some((s) => expected.has(s)); break;
    case 'exact':   // exactly these ayahs, no more and no fewer
      ok = shown.length === expected.size && shown.every((x) => expected.has(x)); break;
    case 'info': {  // a computed fact about a surah
      const want = r.notes?.match(/answer contains: (.+)$/)?.[1]?.trim();
      ok = reply.kind === 'data' && !!want && (reply.data?.join(' ') + ' ' + reply.answer).toLowerCase().includes(want.toLowerCase());
      break;
    }
    case 'translation': {   // exactly these ayahs, shown with the asked translation
      const want = r.notes?.match(/translation: (\w+)/)?.[1];
      ok = shown.length === expected.size && shown.every((x) => expected.has(x)) && reply.translation === want;
      break;
    }
    case 'kind': {          // the kind of reply (help, unsupported, about, feedback ...)
      const want = r.notes?.match(/kind: (\w+)/)?.[1];
      ok = reply.kind === want && shown.length === 0; break;
    }
    case 'reply': {         // a reply without ayahs: its kind AND a sentence in it ("kind: greeting | answer contains: How are you?")
      const want = r.notes?.match(/kind: (\w+)/)?.[1];
      const text = r.notes?.match(/answer contains: (.+)$/)?.[1]?.trim() ?? '';
      ok = reply.kind === want && shown.length === 0 && !!text && reply.answer.toLowerCase().includes(text.toLowerCase()); break;
    }
    case 'answer': {        // some of these ayahs AND a sentence in the answer
      const want = r.notes?.match(/answer contains: (.+)$/)?.[1]?.trim() ?? '';
      ok = shown.some((x) => expected.has(x)) && reply.answer.toLowerCase().includes(want.toLowerCase()); break;
    }
    case 'explain': {       // exactly these ayahs, and the translator's notes for them (checked against what the notes must contain)
      const spec = r.notes ?? '';
      const noteText = ((reply as unknown as { notes?: Array<{ text: string }> }).notes ?? []).map((n) => n.text).join('\n').replace(/\u200c/g, '');
      const want = spec.match(/notes contain: ([^|]+)/)?.[1]?.trim().replace(/\u200c/g, '');
      const ansWant = spec.match(/answer contains: ([^|]+)/)?.[1]?.trim();
      const exactAyahs = shown.length === expected.size && shown.every((x) => expected.has(x));
      let notesOk = true;
      if (want) notesOk = noteText.includes(want);
      if (/notes: absent/.test(spec)) notesOk = noteText === '';
      if (/notes: none/.test(spec)) notesOk = noteText === '' && /no explanatory note/i.test(reply.answer + ' ' + reply.answer);
      const ansOk = !ansWant || reply.answer.toLowerCase().includes(ansWant.toLowerCase());
      const extra = /notes: none/.test(spec) && /answer contains/.test(spec) ? ansOk : true;
      ok = exactAyahs && notesOk && ansOk && extra;
      break;
    }
    case 'not_in_quran':
      ok = reply.notFound && shown.length === 0; break;
    case 'trap':
      ok = r.expected_not_found === 'true'
        ? reply.notFound && shown.length === 0 && (reply.kind === 'refusal' || reply.kind === 'scholar')
        : reply.kind === 'crisis';
      break;
    case 'data': {
      const want = r.notes?.match(/answer contains: (.+)$/)?.[1]?.trim();
      ok = reply.kind === 'data' && !!reply.data?.length
        && (!want || (reply.data.join(' ') + ' ' + reply.answer).toLowerCase().includes(want.toLowerCase()))
        && (!/Al-Baqarah/i.test(r.question) || /286/.test(reply.answer))
        && (!/সবচেয়ে বেশি/.test(r.question) || /Baqara/.test(reply.data[0]));
      break;
    }
    case 'general':
      ok = /^(hi|ধন্যবাদ|good (?:morning|evening|afternoon|night)|assalamu|thank|walaikum|eid|jazak|ramadan)/i.test(r.question) ? reply.kind === 'greeting' || reply.kind === 'thanks' : false; break;
  }
  const lok = scriptOk(reply.lang === r.lang || r.lang === 'bn' ? r.lang : reply.lang, reply.answer);
  if (lok) langOk++;
  (tally[r.type] ??= { n: 0, ok: 0 }).n++;
  if (ok) tally[r.type].ok++;
  out.push([r.id, r.type, r.lang, ok ? 'yes' : 'NO', reply.kind, shown.slice(0, 5).join(' '), JSON.stringify(r.question)].join(','));
  console.log(`${ok ? 'ok ' : 'NO '} ${String(r.id).padStart(2)} ${r.type.padEnd(12)} ${reply.kind.padEnd(9)} ${shown.slice(0, 4).join(' ').padEnd(22)} ${r.question.slice(0, 52)}`);
}

const total = rows.length;
const okAll = Object.values(tally).reduce((a, t) => a + t.ok, 0);
console.log('\nBy type:');
for (const [k, v] of Object.entries(tally)) console.log(`  ${k.padEnd(13)} ${v.ok}/${v.n}`);
console.log(`\nCorrect: ${okAll}/${total}   Fake ayahs: ${fake}   Answer in the question's script: ${langOk}/${total}   Average time: ${(ms / total).toFixed(2)} ms per question`);
writeFileSync(new URL(`../eval-results-${file.split('/').pop()}`, import.meta.url), out.join('\n') + '\n');
