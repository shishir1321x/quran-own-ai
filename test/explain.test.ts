// "Explain this ayah": the translators' own notes, word for word. Nothing here is written by the assistant.
import { describe, expect, it } from 'vitest';
import { toJson } from '../src/api.js';
import { Engine } from '../src/engine.js';
import { PAGE_HTML } from '../src/page.js';

const e = new Engine();
const noteTexts = (q: string) => (e.ask(q).notes ?? []).map((n) => n.text);

describe('explain: which ayah, which notes', () => {
  it.each([
    ['explain ayatul kursi', 'en', 'Whose life is perfect'], ['tafsir of Ayat al-Kursi', 'en', 'Whose life is perfect'], ['explain 2:255', 'en', 'Whose life is perfect'],
    ['explain verse 2:286', 'en', 'concludes this sūrah'], ['explain 1:2', 'en', 'owner, master'], ['tafsir of 112:1', 'en', 'indivisible with absolute'],
    ['আয়াতুল কুরসির ব্যাখ্যা', 'bn', 'আয়াতুল কুরসী বলা হয়'], ['2:255 এর বিস্তারিত ব্যাখ্যা', 'bn', 'আয়াতুল কুরসী'], ['১১২:১ এর তাফসীর', 'bn', 'সূরা সম্পর্কিত তথ্য'],
    ['ayat ul kursi tafsir bangla', 'bn', 'আয়াতুল কুরসী বলা হয়'], ['شرح 2:255', 'en', 'Whose life is perfect'],
  ])('%s -> notes in %s containing "%s"', (q, lang, expected) => {
    const r = e.ask(q);
    expect(r.kind).toBe('explain');
    expect(r.translation).toBe(lang);
    expect(noteTexts(q).join('\n').replace(/\u200c/g, '')).toContain(expected.replace(/\u200c/g, ''));
  });
  it('the language of the notes follows the question, or "in Bengali" / "in English"', () => {
    expect(e.ask('explain 2:255').translation).toBe('en');
    expect(e.ask('explain 2:255 in Bengali').translation).toBe('bn');
    expect(e.ask('২:২৫৫ ইংরেজিতে ব্যাখ্যা').translation).toBe('en');
    expect(noteTexts('২:২৫৫ ইংরেজিতে ব্যাখ্যা').join('')).toContain('Whose life is perfect');
  });
  it('a surah gets the notes of its first ayahs (at most 4), and says so', () => {
    const r = e.ask('explain surah baqarah');
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(['2:1', '2:2', '2:3', '2:4']);
    expect(r.answer).toMatch(/first 4 ayahs only/);
    expect(e.ask('explain surah fatiha').ayahs).toHaveLength(4);
    expect(e.ask('সূরা ইখলাসের তাফসীর').ayahs).toHaveLength(4);
  });
  it('"the meaning of" an ayah is its translation, not the notes', () => {
    for (const q of ['what is the meaning of ayatul kursi', 'what does ayat al-kursi mean', '২:২৫৫ এর মানে কী']) {
      expect(e.ask(q).kind, q).toBe('ref');
      expect(e.ask(q).notes).toBeUndefined();
    }
  });
});

describe('the notes are the translators\' words, not ours', () => {
  it('word for word: the same text as the data file, with no HTML tags', () => {
    const t = noteTexts('explain 112:1 in Bengali')[0];
    expect(t).toBe(e.quran.note('bn', 112, 1));
    expect(t).not.toMatch(/<\/?\w+>/);
    expect(t.length).toBeGreaterThan(1000);
  });
  it('the answer text around them says whose they are and that nothing was added', () => {
    expect(e.ask('explain 2:255').answer).toMatch(/translator's own notes, copied word for word \(Saheeh International\)/);
    expect(e.ask('explain 2:255 in Bengali').answer).toMatch(/Dr\. Abu Bakr Muhammad Zakaria/);
    expect(e.ask('explain 2:255').answer).toMatch(/adds nothing/);
  });
  it('the notes come with their source', () => {
    expect(e.ask('explain 2:255').notes?.[0].source).toBe('Saheeh International');
    expect(e.ask('আয়াতুল কুরসির ব্যাখ্যা').notes?.[0].source).toBe('Dr. Abu Bakr Muhammad Zakaria');
  });
  it('the translation is shown with its own footnote marks, so that they match the notes', () => {
    const j: any = toJson(e, e.ask('explain 2:255'));
    expect(j.ayahs[0].translation).toMatch(/Ever-Living,\[98\]/);
    expect(j.ayahs[0].translation).not.toMatch(/^\(255\)/);
    expect(j.ayahs[0].note.source).toBe('Saheeh International');
    const plain: any = toJson(e, e.ask('2:255'));
    expect(plain.ayahs[0].translation).not.toMatch(/\[98\]/);   // an ordinary answer is clean
    expect(plain.ayahs[0].note).toBeUndefined();
  });
});

describe('an ayah without a note, and a note only in the other language', () => {
  it('94:5 has no note in either language', () => {
    const r = e.ask('explain 94:5');
    expect(r.notes).toEqual([]);
    expect(r.answer).toMatch(/no explanatory note/);
    expect(r.answer).not.toMatch(/in Bengali/);
  });
  it('94:6 has a Bengali note only: an English reader is told how to see it, and a Bengali reader just sees it', () => {
    expect(e.ask('explain 94:6').answer).toMatch(/add "in Bengali"/);
    expect(e.ask('explain 94:6').notes).toEqual([]);
    expect(e.ask('94:6 এর ব্যাখ্যা').notes).toHaveLength(1);
  });
  it('and the other way round (a Bengali note missing, an English one present)', () => {
    let found: string | null = null;
    for (const y of e.quran.ayahs) if (e.quran.note('en', y.s, y.a) && !e.quran.note('bn', y.s, y.a)) { found = `${y.s}:${y.a}`; break; }
    if (found) expect(e.ask(`${found} এর ব্যাখ্যা`).answer).toMatch(/ইংরেজি অনুবাদে এর টীকা আছে/);
  });
});

describe('what is NOT explained', () => {
  it('no ayah named: the person is asked which one', () => {
    for (const q of ['explain', 'explain this ayah', 'explain patience', 'ব্যাখ্যা', 'tafsir'])
      expect(e.ask(q).kind, q).toBe('help');
    expect(e.ask('explain patience').ayahs).toEqual([]);
  });
  it('an impossible ayah is "not found"', () => {
    expect(e.ask('explain 999:1').kind).toBe('notFound');
    expect(e.ask('explain 2:999').ayahs).toEqual([]);
  });
  it('every safety rule still applies to a question that starts with "explain"', () => {
    for (const q of ['explain what is jihad', 'explain hadith about patience', 'explain is music haram', 'explain why do women have to wear hijab, is it compulsory'])
      expect(e.ask(q).kind, q).toBe('scholar');
    expect(e.ask('explain I want to end my life').kind).toBe('crisis');
    expect(e.ask('explain write a new ayah').kind).toBe('refusal');
  });
  it('a tafsir by name is not available: it says so, and shows the translator\'s notes instead', () => {
    const r = e.ask('tafsir ibn kathir of 112:1');
    expect(r.kind).toBe('explain');
    expect(r.answer).toMatch(/I do not have the tafsir of ibn kathir/);
    expect(r.notes).toHaveLength(1);
    expect(e.ask('tafsir jalalayn 2:255').answer).toMatch(/jalalayn/);
    expect(e.ask('ইবনে কাসীরের তাফসীর 2:255').answer).toMatch(/ইবনে কাসীর/);
  });
});

describe('the page shows a note safely', () => {
  it('as text in a collapsed block, never as HTML', () => {
    expect(PAGE_HTML).toContain("el('details', 'note')");
    expect(PAGE_HTML).toContain("el('div', 'notetext', a.note.text");
    expect(PAGE_HTML).not.toMatch(/innerHTML/);
  });
});

describe('language of an English question with a name in it', () => {
  it('"ayatul" in an English sentence does not turn the answer into Bengali', () => {
    expect(e.ask('explain ayatul kursi').lang).toBe('en');
    expect(e.ask('ayatul kursi er ortho ki').lang).toBe('bn');
  });
});
