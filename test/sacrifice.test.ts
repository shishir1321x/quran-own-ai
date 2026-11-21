// "kon surah te kurbani korar kotha bola hoyeche?": the sacrifice (qurbani) topic in every spelling, "which surah"
// answered with the surah names, and Banglish sentence words that no longer hide the topic from the search.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);
const QURBANI = ['108:2', '22:34', '22:36', '22:37', '37:107'];

describe('sacrifice (qurbani)', () => {
  it.each(['qurbani', 'kurbani', 'korbani', 'sacrifice', 'কুরবানি', 'কুরবানী', 'কোরবানির কথা', 'القربان في القرآن', 'eid ul adha niye ayat',
    'kon surah te kurbani korar kotha bola hoyeche?', 'kon surah te sacrifice er kotha bola hoyeche?'])('%s', (q) => {
    const r = engine.ask(q);
    expect(r.kind).toBe('theme');
    expect(refs(q)).toEqual(QURBANI);
  });

  it('never the ayahs about animals sacrificed to idols (5:3, 5:90), although their English says "sacrificed"', () => {
    for (const q of ['sacrifice', 'qurbani', 'which surah talks about sacrifice']) {
      expect(refs(q), q).not.toContain('5:3');
      expect(refs(q), q).not.toContain('5:90');
    }
  });

  it('a ruling about it still goes to a scholar', () => {
    for (const q of ['is qurbani wajib?', 'kurbani kora ki farz', 'কুরবানি কি ওয়াজিব']) expect(engine.ask(q).kind, q).toBe('scholar');
  });
});

describe('"which surah ...?" names the surahs', () => {
  it('in English, Bengali and Arabic, in the order of the ayahs', () => {
    expect(engine.ask('which surah talks about sacrifice').answer).toContain(
      'These ayahs are in: Surah Al-Kawthar (108:2), Surah Al-Hajj (22:34, 22:36, 22:37), Surah As-Saaffaat (37:107).');
    expect(engine.ask('kon surah te kurbani korar kotha bola hoyeche?').answer).toContain('এই আয়াতগুলো আছে: সূরা Al-Kawthar (108:2), সূরা Al-Hajj');
    expect(engine.ask('في أي سورة ذكر القربان').answer).toContain('هذه الآيات في: سورة الكوثر (108:2)، سورة الحج (22:34، 22:36، 22:37)');
  });

  it('only when the question asks which surah', () => {
    expect(engine.ask('qurbani').answer).not.toContain('These ayahs are in');
    expect(engine.ask('which surah is number 55').kind).toBe('surah');
    expect(engine.ask('which surah has the most ayahs').kind).toBe('data');
  });
});

describe('Banglish and English sentence words do not hide the topic from the search', () => {
  it('"kon surah te mountain er kotha ache" finds what "mountains" finds', () => {
    expect(refs('kon surah te mountain er kotha ache')).toEqual(refs('mountains'));
    expect(refs('which surah talks about mountains')).toEqual(refs('mountains'));
    expect(refs('which surah talks about mountains')).not.toContain('2:76');
  });

  it('the words of an ayah are still found', () => {
    expect(refs('Say, He is Allah, who is One')).toContain('112:1');
    expect(refs('ransomed him with a great sacrifice')).toContain('37:107');
  });
});
