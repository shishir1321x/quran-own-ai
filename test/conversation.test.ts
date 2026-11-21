// A very basic conversation in a humble manner, in English, Bengali, Banglish and Arabic: "hey how are you?" and
// "Are you good?" (from a real session) are answered like a person would, and a question about the Quran never is.
import { describe, expect, it } from 'vitest';
import { Engine, type HistoryTurn } from '../src/engine.js';
import { conversation } from '../src/conversation.js';
import { MSG } from '../src/templates.js';

const engine = new Engine();
const nfc = (s: string) => s.normalize('NFC');
const says = (q: string, history: HistoryTurn[] = []) => {
  const r = engine.ask(q, history);
  return { kind: r.kind, ayahs: r.ayahs.map((a) => `${a.s}:${a.a}`), answer: nfc(r.answer), lang: r.lang };
};
const after = (q: string, previous: string) => {
  const p = engine.ask(previous);
  return says(q, [{ question: previous, answer: p.answer, citations: [] }]);
};

describe('"how are you?" in every language', () => {
  it.each([
    ['hey how are you>', 'en'], ['Are you good?', 'en'], ['are you ok', 'en'], ["how's it going", 'en'], ['hi how are you doing today?', 'en'],
    ['how r u', 'en'], ['you good?', 'en'], ['kemon acho', 'bn'], ['kmn aso?', 'bn'], ['apni valo achen?', 'bn'], ['tumi kemon acho vai', 'bn'],
    ['ki obostha', 'bn'], ['তুমি কি ভালো আছো?', 'bn'], ['আপনি কেমন আছেন?', 'bn'], ['কী খবর', 'bn'], ['كيف حالك', 'ar'], ['كيفك', 'ar'],
  ] as const)('%s', (q, lang) => {
    const r = says(q);
    expect(r.kind).toBe('greeting');
    expect(r.ayahs).toEqual([]);
    expect(r.lang).toBe(lang);
    expect(r.answer).toContain(nfc(MSG.howAreYouAsked[lang]));
  });

  it('is honest that it is a program: "all is well here", never "I feel fine"', () => {
    for (const l of ['en', 'bn', 'ar'] as const) expect(MSG.howAreYou[l]).toMatch(/program|প্রোগ্রাম|برنامج/);
    expect(MSG.howAreYou.en).not.toMatch(/I (?:feel|am) (?:fine|good|happy)/);
  });

  it('a greeting word first is answered first: salam with salam', () => {
    expect(says('hey how are you').answer).toMatch(/^Hello! Alhamdulillah/);
    const salamHow = says('assalamu alaikum, apni kemon achen?').answer;
    expect(salamHow.startsWith(nfc('ওয়া আলাইকুমুস সালাম'))).toBe(true);
    expect(salamHow.endsWith(nfc('আপনি কেমন আছেন?'))).toBe(true);
    expect(says('good morning, how are you?').answer).toMatch(/^Good morning! Alhamdulillah/);
  });
});

describe('the person\'s answer', () => {
  it.each(["I'm fine", 'i am good', 'fine thanks', 'alhamdulillah', 'valo achi', 'alhamdulillah bhalo achi', 'ভালো আছি', 'আলহামদুলিল্লাহ ভালো আছি', 'أنا بخير'])('well: %s', (q) => {
    const r = says(q);
    expect(r.kind).toBe('greeting');
    expect(r.answer).toMatch(new RegExp(nfc('glad to hear|শুনে ভালো লাগলো|يسعدني')));
    expect(r.answer).not.toMatch(new RegExp(nfc('too, thank you|এখানেও')));
  });

  it.each(['i am good, and you?', "i'm doing well, thanks. what about you?", 'ami valo achi, tumi?', 'valo achi apni kemon achen', 'আলহামদুলিল্লাহ ভালো আছি, আপনি?'])('well, and asks back: %s', (q) => {
    expect(says(q).answer).toMatch(new RegExp(nfc('All is well here too|এখানেও সব ঠিক আছে')));
  });

  it('right after "How are you?", a short "good", "valo", "ঠিক আছে" is the answer (and alone, it is not)', () => {
    expect(after('good', 'how are you').answer).toContain('glad to hear');
    expect(after('valo', 'kemon acho').answer).toContain(nfc('শুনে ভালো লাগলো'));
    expect(after('ঠিক আছে', 'কেমন আছেন').answer).toContain(nfc('শুনে ভালো লাগলো'));
    expect(after('good, you?', 'how are you').answer).toContain('All is well here too');
    expect(says('good').answer).not.toContain('glad to hear');
    expect(says('ঠিক আছে').answer).toContain(nfc('আচ্ছা!'));
  });

  it.each(['not good', "i'm not fine", 'sad', 'feeling down', 'ami valo nei', 'mon kharap', 'ভালো নেই', 'মন খারাপ', 'لست بخير'])('not well: a kind word, then the ayahs about hardship and comfort: %s', (q) => {
    const r = says(q);
    expect(r.kind).toBe('theme');
    expect(r.ayahs).toContain('94:5');
    expect(r.answer).toMatch(new RegExp(nfc('sorry to hear|শুনে খারাপ লাগলো|يؤسفني')));
  });

  it('a crisis is still a crisis', () => {
    expect(says("i'm not ok, i want to die").kind).toBe('crisis');
  });
});

describe('greetings, goodbyes and small words', () => {
  it('salam is answered with salam; "walaikum assalam" with a welcome', () => {
    expect(says('assalamu alaikum').answer).toMatch(/^Wa alaikum assalam wa rahmatullah! Welcome/);
    expect(says('peace be upon you').answer).toMatch(/^Wa alaikum assalam/);
    expect(says('আসসালামু আলাইকুম').answer).toMatch(new RegExp(`^${nfc('ওয়া আলাইকুমুস সালাম')}`));
    expect(says('السلام عليكم ورحمة الله').answer).toMatch(/^وعليكم السلام/);
    for (const q of ['walaikum assalam', 'ওয়ালাইকুম আসসালাম', 'وعليكم السلام']) {
      expect(says(q).kind, q).toBe('greeting');
      expect(says(q).answer, q).not.toMatch(new RegExp(nfc('alaikum assalam|আলাইকুমুস|وعليكم')));
    }
  });

  it.each([
    ['bye', 'Allah Hafiz'], ['ok bye take care', 'Allah Hafiz'], ['see you later', 'Allah Hafiz'], ['allah hafez', 'Allah Hafiz'],
    ['khoda hafez', 'আল্লাহ হাফেজ'], ['valo theko', 'আল্লাহ হাফেজ'], ['pore kotha hobe', 'আল্লাহ হাফেজ'], ['আল্লাহ হাফেজ', 'আল্লাহ হাফেজ'],
    ['مع السلامة', 'في أمان الله'], ['good night', 'Good night'], ['sorry', 'No problem'], ['my bad', 'No problem'], ['সরি', 'কোনো সমস্যা নেই'],
    ['are you there?', 'I am here'], ['acho?', 'আমি এখানে আছি'], ['what are you doing', 'ready to help'], ['ki koro', 'সাহায্য করার জন্য প্রস্তুত'],
    ['nice to meet you', 'Nice to meet you too'], ['ok', 'All right'], ['acha', 'আচ্ছা!'], ['আচ্ছা', 'আচ্ছা!'],
  ])('%s', (q, text) => {
    const r = says(q);
    expect(r.kind).toBe('greeting');
    expect(r.ayahs).toEqual([]);
    expect(r.answer).toContain(nfc(text));
  });

  it('jazakallah is answered "wa iyyakum"; praise is thanked', () => {
    expect(says('jazakallah khair')).toMatchObject({ kind: 'thanks', answer: expect.stringContaining('Wa iyyakum') });
    expect(says('nice').kind).toBe('thanks');
    expect(says('দারুণ').kind).toBe('thanks');
  });
});

describe('a question about the Quran is never taken for conversation', () => {
  it.each([
    ['Is the reward for good anything but good', '55:60'], ['you are the best nation', '3:110'], ['ok show me surah yasin', '36:1'],
    ['hi what does the quran say about patience', '2:153'], ['no compulsion in religion', '2:256'], ['can you help me i feel sad', '94:5'],
  ])('%s', (q, ref) => expect(says(q).ayahs).toContain(ref));

  it('only the WHOLE message counts', () => {
    for (const q of ['good deeds', 'sorry for my sins', 'how are you supposed to pray', 'bye the quran', 'hello what is surah fatiha', 'ami valo nei dua dao koro'])
      expect(conversation(q), q).toBeNull();
  });

  it('the old answers about the assistant itself still come', () => {
    expect(says('who are you').kind).toBe('about');
    expect(says('are you a muslim?').answer).toContain('I am a computer program, not a person');
    expect(says('tell me a joke').kind).toBe('chat');
    expect(says('Eid Mubarak').answer).toMatch(/to you too/);
  });
});
