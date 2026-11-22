// Regression tests for all gaps and bugs found in the 219-question User Question Survey.
import { describe, expect, it } from 'vitest';
import { Engine, type HistoryTurn } from '../src/engine.js';

const e = new Engine();
const refs = (q: string, h: HistoryTurn[] = []) => e.ask(q, h).ayahs.map((a) => `${a.s}:${a.a}`);
const turn = (q: string): HistoryTurn => {
  const r = e.ask(q);
  return { question: q, answer: r.answer, citations: r.ayahs.map((a) => ({ surah: a.s, ayah: a.a })) };
};

describe('Bengali Unicode NFD/NFC & Surah ayah counts (survey #11, #14, #17, #38-#147)', () => {
  it('Bengali NFD (য+়) surah count queries return concise data count, never the whole surah', () => {
    // NFD decomposed য় (\u09AF\u09BC) as typed on common Bengali keyboards
    for (const [q, expectedDigits] of [
      ['সূরা আল-বাকারায় কয়টি আয়াত আছে؟', '২৮৬'],
      ['সূরা আল-ফাতিহায় কয়টি আয়াত আছে?', '৭'],
      ['সূরা ইউসুফে মোট কয়টি আয়াত আছে?', '১১১'],
    ] as const) {
      const r = e.ask(q);
      expect(r.kind, q).toBe('data');
      expect(r.ayahs, q).toEqual([]);
      expect(r.lang, q).toBe('bn');
      expect(r.answer, q).toContain(expectedDigits);
    }
  });

  it('surah names with apostrophes and Al-Anbya resolve accurately (survey #42, #55)', () => {
    const r42 = e.ask("সূরা Al-A'raf-এ কয়টি আয়াত আছে?");
    expect(r42.kind).toBe('data');
    expect(r42.answer).toContain('২০৬');
    expect(r42.data?.[0]).toContain("Al-A'raaf");

    const r55 = e.ask('Surah Al-Anbya te koyta ayat ache?');
    expect(r55.kind).toBe('data');
    expect(r55.answer).toContain('১১২');
    expect(r55.data?.[0]).toContain('Al-Anbiyaa');
  });

  it('all 114 chapters resolve to exact ayah counts in English, Bengali, and Banglish', () => {
    for (const c of e.quran.chapters) {
      const en = e.ask(`How many ayahs are in Surah ${c.tr}?`);
      expect(en.kind, `en ${c.id} ${c.tr}`).toBe('data');
      expect(en.data?.[0], `en ${c.id}`).toContain(`${c.n} ayahs`);

      const mix = e.ask(`Surah ${c.tr} te koyta ayat ache?`);
      expect(mix.kind, `mix ${c.id} ${c.tr}`).toBe('data');
      expect(mix.data?.[0], `mix ${c.id}`).toContain(`${c.n} ayahs`);
    }
  });
});

describe('Reason of Revelation / Asbab al-Nuzul (survey #10, #160-#165)', () => {
  it.each([
    ['Why was Surah Al-Kahf revealed?', 'en'],
    ['Does the Quran itself state why Surah Al-Fil was revealed? Show a Quran reference if it does.', 'en'],
    ['Does the Quran text state the historical reason for the revelation of 2:144? Answer from Quran text only.', 'en'],
    ['কুরআনের আয়াতেই কি সূরা আল-ফীল নাজিলের কারণ বলা হয়েছে? থাকলে আয়াতের রেফারেন্স দিন।', 'bn'],
    ['সূরা আল-বাকারাহ ২:১৪৪ নাজিলের ঐতিহাসিক কারণ কি কুরআনের আয়াতে বলা হয়েছে? শুধু কুরআনের পাঠ থেকে উত্তর দিন।', 'bn'],
    ['Quraner ayatei ki Surah Al-Fil naziler karon bola ache? Thakle reference dao.', 'bn'],
    ['Al-Baqarah 2:144 keno nazil hoyechilo—ei karon ki Quraner ayate bola ache?', 'bn'],
  ] as const)('%s -> dedicated Asbab al-Nuzul scope reply in %s', (q, lang) => {
    const r = e.ask(q);
    expect(r.kind, q).toBe('scholar');
    expect(r.lang, q).toBe(lang);
    expect(r.notFound, q).toBe(true);
    expect(r.ayahs, q).toEqual([]);
    expect(r.answer, q).toMatch(/Asbab al-Nuzul|শানে নুযূল|أسباب النزول/);
  });

  it('where/when revealed classification still returns Meccan/Medinan metadata', () => {
    const r = e.ask('Where was Surah Al-Kahf revealed?');
    expect(r.kind).toBe('data');
    expect(r.data?.[0]).toContain('Meccan');
  });
});

describe('Dual fatwa-refusal + verse retrieval & inheritance (survey #8, #36, #166-#171)', () => {
  it('plain halal/haram ruling still refuses with no ayahs (#8)', () => {
    const r = e.ask('Is interest (riba) halal or haram?');
    expect(r.kind).toBe('scholar');
    expect(r.ayahs).toEqual([]);
  });

  it.each([
    ['Are bank loans halal or haram? Show Quran verses that mention riba, without giving a fatwa.', 'en'],
    ['ব্যাংক ঋণ হালাল না হারাম? রিবা-সম্পর্কিত কুরআনের আয়াত দেখান, ফতোয়া দেবেন না।', 'bn'],
    ['Bank loan halal naki haram? Riba niye Quraner ayat dekhao, fatwa dio na.', 'bn'],
  ] as const)('without-fatwa riba request retrieves riba ayahs with scholar disclaimer (%s)', (q, lang) => {
    const r = e.ask(q);
    expect(r.kind).toBe('theme');
    expect(r.lang).toBe(lang);
    expect(r.notFound).toBe(false);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('2:275');
    expect(r.answer).toMatch(/fatwa|ফতোয়া/);
  });

  it('sensitive topic still refuses even with "without giving a fatwa"', () => {
    const r = e.ask('Show Quran verses about jihad, without giving a fatwa.');
    expect(r.kind).toBe('scholar');
    expect(r.ayahs).toEqual([]);
  });

  it.each([
    'Show the Quranic verses about inheritance, without deriving or explaining legal rulings.',
    'What Quran verses discuss inheritance shares? Give references and translations only.',
    'উত্তরাধিকার বণ্টন সম্পর্কে কুরআনের আয়াতের রেফারেন্স ও বাংলা অনুবাদ দিন; নিজে বিধান ব্যাখ্যা করবেন না।',
    'Mirash bitoron niye Quraner kon ayat ache? Reference o Bangla onubad dao, nijer theke hukum dio na.',
  ])('inheritance query retrieves 4:11, 4:12, 4:176 without being hijacked by explain (%s)', (q) => {
    const r = e.ask(q);
    expect(r.kind).toBe('theme');
    const list = r.ayahs.map((a) => `${a.s}:${a.a}`);
    expect(list).toEqual(expect.arrayContaining(['4:11', '4:12', '4:176']));
  });
});

describe('Personal guidance boundary (#37) & theme precision (#156, #158, #198, #201)', () => {
  it('refuses personal situation guidance/prediction (#37)', () => {
    const r = e.ask('Can you tell me what Allah wants me to do about my personal situation from Quran verses?');
    expect(r.kind).toBe('scholar');
    expect(r.notFound).toBe(true);
    expect(r.ayahs).toEqual([]);
  });

  it('honesty/truthfulness in Bengali and Banglish (#156, #158)', () => {
    for (const q of [
      'সত্যবাদিতা সম্পর্কে কুরআনের আয়াতগুলো বাংলা অনুবাদসহ দেখান।',
      'Shottobadita niye Quraner ayat Bangla onubad shoho dekhao.',
    ]) {
      const r = e.ask(q);
      expect(r.kind).toBe('theme');
      expect(r.lang).toBe('bn');
      expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(['9:119', '33:70']);
    }
  });

  it('hardship & patience in Bengali does not inject unrelated time ayah 103:1 (#198) and Banglish hardship/hope works (#201)', () => {
    const r198 = refs('দুশ্চিন্তা বা কষ্টের সময় ধৈর্য সম্পর্কে কুরআনের আয়াত দেখান; আমার জন্য ব্যক্তিগত সিদ্ধান্ত দেবেন না।');
    expect(r198).toEqual(expect.arrayContaining(['2:153', '94:5', '2:155', '94:6']));
    expect(r198).not.toContain('103:1');

    const r201 = refs('Koster por shosti o asha niye Quraner ayat reference ar Bangla onubad shoho dao.');
    expect(r201).toEqual(expect.arrayContaining(['94:5', '94:6', '39:53']));
  });
});

describe('Duas, transliterated phrases, stories, recitation, science, word search, Hifz, exact statements', () => {
  it('transliterated duas & phrases (#26, #172, #174, #176) and forgiveness duas (#33, #177)', () => {
    expect(refs('Find “Rabbana atina fid-dunya hasanah” and give the Quran reference and English translation.')).toEqual(['2:201']);
    expect(refs('“রব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ” দোয়াটি কোন আয়াতে আছে? বাংলা অনুবাদ দিন।')).toEqual(['2:201']);
    expect(refs('“Rabbana atina fid-dunya hasanah” dua ta kon ayate ache? Reference ar Bangla onubad dao.')).toEqual(['2:201']);

    const r26 = e.ask('“Inna ma’al usri yusra” kon surah ar ayat-e ache?');
    expect(r26.ayahs.map((a) => `${a.s}:${a.a}`)).toEqual(['94:5', '94:6']);
    expect(r26.answer).toContain('Ash-Sharh');

    expect(refs('Show Quranic duas for forgiveness in Arabic with English translations.')).toEqual(['7:23', '3:147', '23:118', '2:286']);
    expect(refs('Quran e maghfirater dua gula Bangla onubad o reference shoho dekhao.')).toEqual(['7:23', '3:147', '23:118', '2:286']);
  });

  it('prophet stories win over surah names when asking for the story (#34, #179, #182, #183)', () => {
    expect(refs('Where does the Quran tell the story of Maryam (Mary)? Please provide the surah and verse references.')[0]).toBe('19:16');
    expect(e.ask('Which verses tell the story of Prophet Yunus? Give surah and ayah references.').kind).toBe('story');
    expect(refs('Which verses tell the story of Prophet Yunus? Give surah and ayah references.')).toContain('37:139');
    expect(refs('Yunus (a.) er kahini kon surah ar ayat e ache?')).toContain('37:139');
    expect(refs('Ibrahim (a.) o murti-gulor ghotonar Quraner ayatgula kon suray? Reference dao.')).toContain('21:51');
  });

  it('recitation, listening, rain, and creation of heavens and earth (#185, #188, #189, #191, #193, #194, #195)', () => {
    expect(refs('What does the Quran say about listening when it is recited? Show the verse reference and translation.')).toEqual(['7:204']);
    expect(refs('Quran tilawat hole mon diye shonar kotha kon ayate bola hoyeche?')).toEqual(['7:204']);
    expect(refs('Tartil kore Quran porar kotha kon ayate ache? Reference ar Bangla onubad dao.')).toContain('73:4');

    const r191 = e.ask('Which verses mention the creation of the heavens and the earth? Give references only.');
    expect(r191.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('21:30');
    expect(r191.answer).toContain('References: 21:30');

    expect(refs('আকাশ ও পৃথিবীর সৃষ্টি সম্পর্কে কোন আয়াত আছে? বাংলা অনুবাদসহ দেখান, বৈজ্ঞানিক ব্যাখ্যা যোগ করবেন না।')).toContain('21:30');
    expect(refs('Brishti ar pani niye Quraner ayatgula reference o Bangla onubad shoho dekhao.')).toContain('25:48');
    expect(refs('Akas o prithibi srishti niye kon ayat ache? Reference dao, scientific inference koro na.')).toContain('21:30');
  });

  it('Arabic word Ar-Rahman search (#21, #29) and exact phrase/statement lookups (#18, #214-#219)', () => {
    for (const q of ['কুরআনে “আর-রহমান” শব্দটি থাকা আয়াতগুলো দেখান।', 'Ar-Rahman shobdota Quraner kon kon ayate ache?']) {
      const list = e.ask(q).ayahs;
      expect(list.length, q).toBeGreaterThan(0);
      for (const { s, a } of list) {
        expect(e.quran.get(s, a)!.arc, `${q} -> ${s}:${a}`).toContain('رحمن');
      }
    }

    expect(refs('“নিশ্চয়ই কষ্টের সাথেই স্বস্তি আছে”—এটি কোন সূরার কোন আয়াত?')).toContain('94:6');
    expect(refs('Find the verse that says “Allah is the Light of the heavens and the earth”; include its reference and English translation.')).toEqual(['24:35']);
    expect(refs('“আল্লাহ আসমানসমূহ ও জমিনের নূর”—এই বাক্যটি কোন আয়াতে আছে? বাংলা অনুবাদ দিন।')).toEqual(['24:35']);
    expect(refs('“Allah akash o jominer nur” kothata kon ayate ache? Reference ar Bangla onubad dao.')).toContain('24:35');

    expect(refs('Does the Quran state how many months are with Allah? Give the verse reference and English translation.')).toContain('9:36');
    expect(refs('কুরআনে আল্লাহর কাছে মাসের সংখ্যা বারো বলা হয়েছে—এটি কোন আয়াতে আছে? রেফারেন্স দিন।')).toContain('9:36');
    expect(refs('Quran e Allah’r kache masher shonkha baro bola hoyeche—eta kon ayate? Reference dao.')).toContain('9:36');
  });

  it('Hifz memorization: first 5 in Bengali (#211) and one ayah at a time (#209, #210, #212)', () => {
    expect(refs('সূরা আল-মুলকের প্রথম পাঁচ আয়াত মুখস্থের জন্য আরবি ও বাংলা অনুবাদসহ দেখান।')).toEqual(['67:1', '67:2', '67:3', '67:4', '67:5']);

    for (const q of [
      'Give Surah Al-Fatiha one ayah at a time with Arabic text and English translation.',
      'মুখস্থ করার জন্য সূরা আল-ফাতিহার আয়াতগুলো একে একে আরবি ও বাংলা অনুবাদসহ দিন।',
      'Mukhosto korar jonno Surah Al-Fatiha ayat ayat kore Arabic ar Bangla onubad shoho dao.',
    ]) {
      const r = e.ask(q);
      expect(r.ayahs, q).toEqual([{ s: 1, a: 1 }]);
      expect(r.suggestions?.[0], q).toMatch(/next ayah|পরের আয়াত/);
      const next = refs(r.suggestions![0], [turn(q)]);
      expect(next, q).toEqual(['1:2']);
    }
  });
});

