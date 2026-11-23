// Verification of popular Quranic phrases/duas and normal Quranic phrases across English, Bangla, and Banglish.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';
import { GLOSSARY } from '../src/glossary.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('popular and normal Quranic phrases (EN / BN / Banglish)', () => {
  it('verifies every Surah:Ayah reference in GLOSSARY exists in data/quran.json', () => {
    const validRefs = new Set(engine.quran.ayahs.map((y) => `${y.s}:${y.a}`));
    for (const entry of GLOSSARY) {
      if (!entry.ayahs) continue;
      for (const [s, a] of entry.ayahs) {
        expect(validRefs.has(`${s}:${a}`), `Missing ayah ${s}:${a} for glossary id "${entry.id}"`).toBe(true);
      }
    }
  });

  it.each([
    ['inna lillahi wa inna ilayhi rajiun', '2:156', /belong to Allah/i, 'en'],
    ['hasbunallahu wa nimal wakeel', '3:173', /Sufficient for us is Allah/i, 'en'],
    ['rabbi zidni ilma', '20:114', /increase me in knowledge/i, 'en'],
    ['la tahzan innallaha maana', '9:40', /Do not grieve/i, 'en'],
    ['la tahzan', '9:40', /Do not grieve/i, 'en'],
    ['la ilaha illa anta subhanaka inni kuntu minaz zalimin', '21:87', /wrongdoers/i, 'en'],
    ['rabbi ishrah li sadri', '20:25', /expand.*breast/i, 'en'],
    ['la yukallifullahu nafsan illa wusaha', '2:286', /capacity/i, 'en'],
    ['rabbir hamhuma kama rabbayani saghira', '17:24', /mercy upon them/i, 'en'],
    ['kullu nafsin dhaiqatul mawt', '3:185', /taste death/i, 'en'],
    ['ala bidhikrillahi tatmainnul qulub', '13:28', /remembrance of Allah/i, 'en'],
    ['mashaallah la quwwata illa billah', '18:39', /no power except in Allah/i, 'en'],
    ['rabbana hab lana min azwajina', '25:74', /comfort to our eyes/i, 'en'],
    ['rabbana zalamna anfusana', '7:23', /wronged ourselves/i, 'en'],
    ['rabbana la tuzigh qulubana', '3:8', /hearts deviate/i, 'en'],
    ['wa ma tawfiqi illa billah', '11:88', /success is not but through Allah/i, 'en'],
    ['rabbi inni lima anzalta ilayya min khayrin faqir', '28:24', /in need/i, 'en'],
    ['fabi ayyi alai rabbikuma tukadhdhiban', '55:13', /favors of your Lord/i, 'en'],
    ['lakum dinukum waliya din', '109:6', /For you is your religion/i, 'en'],
    ['iyyaka nabudu wa iyyaka nastain', '1:5', /worship/i, 'en'],
    ['ihdinas siratal mustaqim', '1:6', /straight path/i, 'en'],
    ['la ikraha fid din', '2:256', /no compulsion/i, 'en'],
    ['hal jazaul ihsani illal ihsan', '55:60', /reward for good/i, 'en'],
    ['ufawwidu amri ilallah', '40:44', /entrust my affair/i, 'en'],
    ['la taqnatu min rahmatillah', '39:53', /Do not despair/i, 'en'],
    ['wa man yatawakkal alallahi fahuwa hasbuh', '65:3', /sufficient for him/i, 'en'],
    ['innallaha maas sabirin', '2:153', /with the patient/i, 'en'],
    ['salamun qawlan min rabbin rahim', '36:58', /Merciful Lord/i, 'en'],
    ['ya ayyatuhan nafsul mutmainnah', '89:27', /reassured soul/i, 'en'],
    // Bangla bare phrases
    ['ইন্না লিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন', '2:156', /আল্লাহরই জন্য/, 'bn'],
    ['হাসবুনাল্লাহু ওয়া নিমাল ওয়াকিল', '3:173', /আল্লাহই যথেষ্ট/, 'bn'],
    ['রাব্বি যিদনি ইলমা', '20:114', /জ্ঞান বৃদ্ধি/, 'bn'],
    ['লা তাহযান ইন্নাল্লাহা মাআনা', '9:40', /আমাদের সাথে আছেন/, 'bn'],
    ['লা ইলাহা ইল্লা আনতা সুবহানাকা', '21:87', /জালিমদের অন্তর্ভুক্ত/, 'bn'],
    ['কুল্লু নাফসিন জাইকাতুল মাউত', '3:185', /মৃত্যুর স্বাদ/, 'bn'],
    ['ইন্নামা আশকু বাসসি ওয়া হুযনি ইলাল্লাহ', '12:86', /দুঃখ কেবল আল্লাহর কাছেই/, 'bn'],
    ['আলা বিযিকরিল্লাহি তাতমাইন্নুল কুলূব', '13:28', /অন্তরসমূহ প্রশান্ত/, 'bn'],
  ])('bare popular phrase %s -> meaning + reference %s', (q, expectedRef, meaningRe, expectedLang) => {
    const r = engine.ask(q);
    expect(r.notFound).toBe(false);
    expect(r.lang).toBe(expectedLang);
    expect(r.answer).toMatch(meaningRe);
    expect(r.answer).toContain(expectedRef);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain(expectedRef);
  });

  it.each([
    // English meaning & reference
    ['what does hasbunallahu wa nimal wakeel mean?', '3:173', /Sufficient for us is Allah/i, 'en'],
    ['meaning and reference of inna lillahi wa inna ilayhi rajiun', '2:156', /belong to Allah/i, 'en'],
    ['what is the meaning of rabbana atina fid dunya hasanah and its reference?', '2:201', /good and in the Hereafter/i, 'en'],
    ['what does wa la taqrabuz zina mean?', '17:32', /unlawful sexual intercourse/i, 'en'],
    ['meaning of qul in kuntum tuhibbunallaha', '3:31', /love Allah/i, 'en'],
    ['reference of hal jazaul ihsani illal ihsan', '55:60', /reward for good/i, 'en'],
    ['which ayah says rabbi zidni ilma?', '20:114', /increase me in knowledge/i, 'en'],
    ['where in the quran is la tahzan innallaha maana?', '9:40', /Do not grieve/i, 'en'],
    // Bangla meaning & reference
    ['ইন্না লিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন অর্থ কী?', '2:156', /আল্লাহরই জন্য/, 'bn'],
    ['হাসবুনাল্লাহু ওয়া নিমাল ওয়াকিল এর অর্থ ও রেফারেন্স কী?', '3:173', /আল্লাহই যথেষ্ট/, 'bn'],
    ['রাব্বি যিদনি ইলমা কোন সূরার আয়াত?', '20:114', /জ্ঞান বৃদ্ধি/, 'bn'],
    ['রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ অর্থ কী?', '2:201', /দুনিয়াতে কল্যাণ/, 'bn'],
    ['লা তাহযান ইন্নাল্লাহা মাআনা অর্থ কী?', '9:40', /আমাদের সাথে আছেন/, 'bn'],
    ['ওয়া লা তাকরাবুয যিনা অর্থ কী?', '17:32', /ব্যভিচারের/, 'bn'],
    // Banglish meaning & reference
    ['hasbunallahu wa nimal wakil er ortho ki?', '3:173', /আল্লাহই যথেষ্ট/, 'bn'],
    ['inna lillahi wa inna ilayhi rajiun er ortho o reference ki?', '2:156', /আল্লাহরই জন্য/, 'bn'],
    ['rabbi zidni ilma kon surar kon ayat?', '20:114', /জ্ঞান বৃদ্ধি/, 'bn'],
    ['la tahzan er bangla ortho ki?', '9:40', /আমাদের সাথে আছেন/, 'bn'],
    ['rabbana atina kon ayate ache?', '2:201', /দুনিয়াতে কল্যাণ/, 'bn'],
    ['fa inna maal usri yusra mane ki?', '94:5', /কষ্টের সাথেই স্বস্তি/, 'bn'],
    ['wa la taqrabuz zina er ortho ki?', '17:32', /ব্যভিচারের/, 'bn'],
    ['hal jazaul ihsani illal ihsan er reference ki?', '55:60', /প্রতিদান/, 'bn'],
  ])('explicit meaning/ref query "%s" -> %s', (q, expectedRef, meaningRe, expectedLang) => {
    const r = engine.ask(q);
    expect(r.notFound).toBe(false);
    expect(r.lang).toBe(expectedLang);
    expect(r.answer).toMatch(meaningRe);
    expect(r.answer).toContain(expectedRef);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain(expectedRef);
  });

  it('understands popular English translated Quranic phrases cleanly', () => {
    for (const [q, ref] of [
      ['With hardship will be ease', '94:5'],
      ['Allah does not burden a soul beyond that it can bear', '2:286'],
      ['Indeed we belong to Allah and indeed to Him we will return', '2:156'],
    ] as const) {
      const r = engine.ask(q);
      expect(r.notFound).toBe(false);
      expect(r.answer).toContain(ref);
      expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain(ref);
    }
    expect(engine.ask('what does indeed we belong to allah and indeed to him we will return mean?').answer).toMatch(/2:156/);
    expect(engine.ask('what does with hardship will be ease mean?').answer).toMatch(/94:5/);
  });

  it('finds arbitrary normal non-glossary Quranic phrases with exact references in EN, BN, and Banglish', () => {
    const cases: Array<[string, string]> = [
      ['innallaha yuhibbul muhsinin', '2:195'],
      ['fabi ayyi hadithin badahu yuminun', '7:185'],
      ['আলা ইন্না আউলিয়াআল্লাহি লা খাউফুন আলাইহিম', '10:62'],
      ['রাব্বানা লা তাজআলনা ফিতনাতান লিল্লাযীনা কাফারূ', '60:5'],
      ['Indeed Allah loves the doers of good', '2:195'],
      ['which ayah says Indeed Allah loves the doers of good?', '2:195'],
      ['wa ma kana rabbuka liyuhlikal qura', '11:117'],
    ];
    for (const [q, expectedRef] of cases) {
      const r = engine.ask(q);
      expect(r.notFound, `Expected match for "${q}"`).toBe(false);
      expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain(expectedRef);
      expect(r.answer).toContain(expectedRef);
    }
  });

  it('preserves existing conversation, follow-up, surah, Ayatul Kursi, and safety boundaries', () => {
    expect(engine.ask('alhamdulillah').kind).toBe('greeting');
    const noHist = engine.ask('banglay ortho ki?');
    expect(noHist.notFound).toBe(true);
    expect(noHist.answer).toContain('কোন আয়াত');
    expect(engine.ask('what is the meaning of ayatul kursi').kind).toBe('ref');
    expect(engine.ask('meaning of Surah Al-Fatiha').kind).toBe('surah');
    expect(engine.ask('সূরা হজ্জের অর্থ').kind).toBe('surah');
    expect(engine.ask('what does jihad mean?').kind).toBe('scholar');
    expect(engine.ask('what is the capital of France').notFound).toBe(true);
    expect(refs('what is the meaning of photosynthesis?')).toEqual([]);
  });
});
