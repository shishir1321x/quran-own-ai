// Structured topic & presentation answers (myquran.online-style sections in EN / BN / Banglish / AR,
// strictly scholar-safe with zero AI, zero fatwas, zero fake ayahs).
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { makeApi, toJson } from '../src/api.js';
import { Engine } from '../src/engine.js';
import { PAGE_HTML } from '../src/page.js';

const engine = new Engine();
const refs = (q: string) => engine.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);

describe('prayer times & daily prayer count (EN, Bangla, Banglish, Arabic)', () => {
  it.each([
    ['prayer time', 'en', '4:103'],
    ['prayer times', 'en', '4:103'],
    ['what does the quran say about prayer times', 'en', '4:103'],
    ['নামাজের সময়', 'bn', '4:103'],
    ['নামাযের সময়', 'bn', '4:103'],
    ['সালাতের সময়', 'bn', '4:103'],
    ['namajer somoy', 'bn', '4:103'],
    ['namaj er somoy', 'bn', '4:103'],
    ['أوقات الصلاة', 'ar', '4:103'],
  ])('%s -> structured Quranic prayer-times answer in %s with %s', (q, expectedLang, expectedRef) => {
    const r = engine.ask(q);
    expect(r.kind, q).toBe('theme');
    expect(r.lang, q).toBe(expectedLang);
    expect(r.notFound, q).toBe(false);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain(expectedRef);
    expect(r.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('17:78');
    expect(r.versesTitle).toBeTruthy();
    expect(r.points?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(r.followUpPrompt).toBeTruthy();
    expect(r.notes).toBeUndefined();
  });

  it.each([
    ['how many times muslim should pray?', 'en'],
    ['how many times a day should Muslims pray?', 'en'],
    ['how many prayers a day', 'en'],
    ['five daily prayers', 'en'],
    ['dine koybar namaz porte hoy?', 'bn'],
    ['namaj koy wakto?', 'bn'],
    ['koy wakto namaz?', 'bn'],
    ['pach wakto namaz', 'bn'],
    ['দিনে কয়বার নামাজ পড়তে হয়?', 'bn'],
    ['দিনে কতবার নামাজ পড়তে হয়?', 'bn'],
    ['নামাজ কয় ওয়াক্ত?', 'bn'],
    ['কয় ওয়াক্ত নামাজ?', 'bn'],
    ['পাঁচ ওয়াক্ত নামাজ', 'bn'],
    ['كم مرة نصلي في اليوم؟', 'ar'],
  ])('%s -> honest Quranic daily-prayers answer in %s (never word-count hijack)', (q, expectedLang) => {
    const r = engine.ask(q);
    expect(r.kind, q).toBe('theme');
    expect(r.lang, q).toBe(expectedLang);
    expect(r.notFound, q).toBe(false);
    const list = r.ayahs.map((a) => `${a.s}:${a.a}`);
    expect(list).toContain('4:103');
    expect(list).toContain('23:1');
    expect(list).toContain('23:2');
    expect(r.points?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(r.versesTitle).toBeTruthy();
  });

  it('live local prayer clock schedules still stay unsupported with no ayahs', () => {
    for (const q of [
      'prayer time today', 'what time is Jumuah prayer', 'fajr time', 'maghrib time',
      'আজকের নামাজের সময়', 'ইফতারের সময়', 'ফজরের সময়', 'ajker namajer somoy',
    ]) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('unsupported');
      expect(r.ayahs, q).toEqual([]);
    }
  });

  it('legitimate Quran word-occurrence counts still work accurately', () => {
    for (const q of [
      'How many times does the word "patience" appear in the Quran?',
      'how many times does the word pray appear in the Quran?',
      'how many times does allah mention patience',
      'সবর শব্দটি কতবার এসেছে?',
      'sabr quran e koybar ache?',
    ]) {
      const r = engine.ask(q);
      expect(r.kind, q).toBe('data');
      expect(r.mode, q).toBe('data');
    }
  });
});

describe('expanded topics across English, Bangla, and Banglish', () => {
  it.each([
    ['orphans', '93:9'], ['এতিম', '93:9'], ['etim', '93:9'],
    ['neighbors', '4:36'], ['প্রতিবেশী', '4:36'], ['protibeshi', '4:36'],
    ['purpose of life', '51:56'], ['why did Allah create us', '51:56'], ['জীবনের উদ্দেশ্য', '51:56'], ['jiboner uddesho', '51:56'],
    ['dhikr', '13:28'], ['যিকির', '13:28'], ['zikir', '13:28'],
    ['good deeds', '2:177'], ['নেক আমল', '2:177'], ['nek amol', '2:177'],
    ['akhlaq', '68:4'], ['উত্তম চরিত্র', '68:4'], ['choritro', '68:4'],
    ['kindness', '16:90'], ['সদাচরণ', '16:90'],
    ['kinship', '4:1'], ['আত্মীয়স্বজন', '4:1'], ['attiyoshojon', '4:1'],
    // Banglish triggers on existing themes
    ['bondhutto', '49:10'], ['bebsha', '4:29'], ['poribesh', '30:41'], ['fereshta', '2:98'],
    ['kobor', '23:99'], ['mrittu', '3:185'], ['binoy', '31:18'], ['gyan', '20:114'],
    ['porikkha', '2:155'], ['bhaggo', '57:22'], ['opochoy', '7:31'], ['sontan', '64:15'],
    ['ghum', '78:9'], ['shoytan', '35:6'], ['munafik', '2:8'], ['ghush', '2:188'],
  ])('%s -> %s with structured overview points', (q, expectedRef) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(false);
    expect(refs(q), q).toContain(expectedRef);
    expect(r.versesTitle, q).toBeTruthy();
    expect(r.points?.length ?? 0, q).toBeGreaterThanOrEqual(2);
    expect(r.followUpPrompt, q).toBeTruthy();
  });
});

describe('structured sections on word meanings, searches, refs, stories, and UI rendering', () => {
  it('attaches structured overview sections across reply kinds without leaking translator notes', () => {
    for (const q of ['Ulaika', 'Allahzina', 'muflehun', 'sabikun', 'sabr er ortho ki?', 'makorsha', 'story of Yusuf', '2:255', 'surah ikhlas']) {
      const r = engine.ask(q);
      expect(r.notFound, q).toBe(false);
      expect(r.ayahs.length, q).toBeGreaterThan(0);
      expect(r.versesTitle, q).toBeTruthy();
      expect(r.pointsTitle, q).toBeTruthy();
      expect(r.points?.length ?? 0, q).toBeGreaterThanOrEqual(2);
      expect(r.followUpPrompt, q).toBeTruthy();
      expect(r.notes, q).toBeUndefined();
      const j: any = toJson(engine, r);
      expect(j.versesTitle).toBe(r.versesTitle);
      expect(j.points).toEqual(r.points);
      expect(j.followUpPrompt).toBe(r.followUpPrompt);
      expect(j.ayahs[0].note).toBeUndefined();
    }
  });

  it('renders structured "The Quran says", left-bar quote, bullet overview, and follow-up prompt safely in the page', async () => {
    const api = makeApi(engine, { RATE_LIMIT: '100000' });
    const errors: string[] = [];
    const dom = new JSDOM(PAGE_HTML, {
      runScripts: 'dangerously',
      url: 'http://localhost:8787/',
      pretendToBeVisual: true,
      beforeParse(window) {
        (window as any).Element.prototype.scrollIntoView = () => {};
        (window as any).HTMLFormElement.prototype.requestSubmit = function () {
          this.dispatchEvent(new (window as any).Event('submit', { cancelable: true, bubbles: true }));
        };
        window.addEventListener('error', (ev: any) => errors.push(String(ev.message)));
        (window as any).fetch = async (_u: string, init: any) => ({ json: async () => api(JSON.parse(init.body), 'ip').body });
      },
    });
    const doc = dom.window.document;
    const settle = () => new Promise((r) => setTimeout(r, 30));

    async function askUi(text: string) {
      (doc.getElementById('q') as HTMLTextAreaElement).value = text;
      doc.getElementById('f')!.dispatchEvent(new (dom.window as any).Event('submit', { cancelable: true, bubbles: true }));
      await settle();
    }

    await askUi('prayer time');
    expect(errors).toEqual([]);
    const firstBot = doc.querySelector('.msg.bot')!;
    expect(firstBot.querySelector('.sec-head')!.textContent).toBe('The Quran says');
    expect(firstBot.querySelector('.ref')!.textContent).toBe('Surah An-Nisaa, 4:103');
    expect(firstBot.querySelector('.ayah-quote .arabic')!.textContent!.length).toBeGreaterThan(10);
    expect(firstBot.querySelector('.ayah-quote .trans')!.textContent).toContain('specified times');
    expect(firstBot.querySelectorAll('ul.points li').length).toBeGreaterThanOrEqual(3);
    expect(firstBot.querySelector('.followup-prompt')!.textContent).toContain('Would you like');

    await askUi('namajer somoy');
    expect(errors).toEqual([]);
    const bots = doc.querySelectorAll('.msg.bot');
    const bnBot = bots[bots.length - 1];
    expect(bnBot.querySelector('.sec-head')!.textContent).toBe('কুরআনে যা বলা হয়েছে');
    expect(bnBot.querySelector('.ref')!.textContent).toContain('সূরা An-Nisaa, 4:103');
    expect(bnBot.querySelectorAll('ul.points li').length).toBeGreaterThanOrEqual(3);
    expect(bnBot.querySelector('.followup-prompt')!.textContent).toContain('আরও জানতে');
  });
});

describe('systemic phonetic & transliteration variant understanding (EN, Bangla, Banglish)', () => {
  it.each([
    ['how many maqqi surahs are there?', 'en', /86 Meccan/],
    ['how many maqi surahs are there?', 'en', /86 Meccan/],
    ['how many mekki surahs are there?', 'en', /86 Meccan/],
    ['how many mokki surahs are there?', 'en', /86 Meccan/],
    ['how many maqqan surahs are there?', 'en', /86 Meccan/],
    ['how many madni surahs are there?', 'en', /28 Medinan/],
    ['how many madinee surahs are there?', 'en', /28 Medinan/],
    ['how many medini surahs are there?', 'en', /28 Medinan/],
    ['koyta maqqi surah ache?', 'bn', /৮৬/],
    ['koita madni surah ache?', 'bn', /২৮/],
    ['মক্কি সূরা কয়টি?', 'bn', /৮৬/],
    ['মাদানি সূরা কয়টি?', 'bn', /২৮/],
    ['list of maqqi surahs', 'en', /86 Meccan/],
    ['list of madni surahs', 'en', /28 Medinan/],
    ['is surah baqarah maqqi or madni?', 'en', /Medinan/],
    ['how many ayyahs in surrah bakarah?', 'en', /286/],
    ['how many juzz in kuraan?', 'en', /30 juz/],
    ['how many sujood ayahs in quraan?', 'en', /15/],
  ])('%s -> %s data answer matching %s', (q, expectedLang, pattern) => {
    const r = engine.ask(q);
    expect(r.kind, q).toBe('data');
    expect(r.lang, q).toBe(expectedLang);
    expect(r.answer, q).toMatch(pattern);
  });

  it.each([
    ['qurbanee', '108:2'],
    ['shoytaan', '35:6'],
    ['taqwah', '3:102'],
    ['sadaqaa', '2:261'],
    ['zakaat', '2:261'],
    ['namazz', '29:45'],
    ['namazz er shomoy', '4:103'],
    ['rojah', '2:183'],
    ['jannath', '2:25'],
    ['qiyamath', '99:7'],
    ['munafeq', '2:8'],
    ['feresta', '2:98'],
    ['dhoirjyo', '2:153'],
    ['tawheed', '112:1'],
    ['taubah', '39:53'],
    ['ribaa', '2:275'],
    ['qiblahh', '2:144'],
    ['kaabah', '2:144'],
    ['jumaah', '62:9'],
  ])('theme phonetic variant %s -> %s', (q, expectedRef) => {
    const r = engine.ask(q);
    expect(r.notFound, q).toBe(false);
    expect(refs(q), q).toContain(expectedRef);
  });

  it('understands phonetic prophet & animal spellings in counts and stories', () => {
    expect(engine.ask('how many times is ibraheem mentioned in the quran?').answer).toContain('69');
    expect(engine.ask('how many times is dawood mentioned?').answer).toContain('16');
    expect(engine.ask('how many times is haroon mentioned?').answer).toContain('20');
    expect(engine.ask('how many times is moosaa mentioned?').answer).toContain('136');
    expect(engine.ask('how many times is muhammed mentioned?').answer).toContain('5');
    expect(engine.ask('story of Ibraheem').kind).toBe('story');
    expect(engine.ask('story of Dawood').kind).toBe('story');
    expect(engine.ask('quran e makorshaa koybar ache?').answer).toContain('২');
  });

  it('counts transliterated Arabic, Islamic, and Banglish words accurately AND preserves English reply language', () => {
    const jannah = engine.ask('how many times the jannah word appeared');
    expect(jannah.kind).toBe('data');
    expect(jannah.lang).toBe('en');
    expect(jannah.answer).toContain('83 times');

    const jannat = engine.ask('how many times the jannat word appeared');
    expect(jannat.kind).toBe('data');
    expect(jannat.lang).toBe('en');
    expect(jannat.answer).toContain('83 times');

    const jannatBn = engine.ask('jannat shobdoti kotobar esheche?');
    expect(jannatBn.kind).toBe('data');
    expect(jannatBn.lang).toBe('bn');
    expect(jannatBn.answer).toContain('৮৩');

    const ulaika = engine.ask('how many times does the word ulaika appear?');
    expect(ulaika.kind).toBe('data');
    expect(ulaika.lang).toBe('en');
    expect(ulaika.data?.[0]).toContain('Arabic text');
    expect(ulaika.answer).not.toMatch(/\b0 times\b/);

    const alladhina = engine.ask('how many times does the word alladhina appear?');
    expect(alladhina.kind).toBe('data');
    expect(alladhina.lang).toBe('en');
    expect(alladhina.data?.[0]).toContain('Arabic text');
    expect(alladhina.answer).toContain('810 times');

    const taqwa = engine.ask('how many times does taqwa appear in the quran?');
    expect(taqwa.kind).toBe('data');
    expect(taqwa.lang).toBe('en');
    expect(taqwa.answer).not.toMatch(/\b0 times\b/);

    const dunya = engine.ask('how many times does the dunya word appear?');
    expect(dunya.kind).toBe('data');
    expect(dunya.lang).toBe('en');
    expect(dunya.answer).not.toMatch(/\b0 times\b/);

    // Truly non-Quranic words still honestly report 0 times
    const bitcoin = engine.ask('how many times does the word bitcoin appear?');
    expect(bitcoin.kind).toBe('data');
    expect(bitcoin.lang).toBe('en');
    expect(bitcoin.answer).toContain('0 times');
  });

  it('answers verified Quran trivia, per-surah word counts, per-juz surah counts, and avoids silent misroutes (EN, Bangla, Banglish)', () => {
    expect(engine.ask('Which surah has no Bismillah?').answer).toMatch(/At-Tawba/);
    expect(engine.ask('কোন সূরায় বিসমিল্লাহ নেই?').answer).toMatch(/তাওবা/);
    expect(engine.ask('kon surah te bismillah nai?').answer).toMatch(/তাওবা/);

    const twoBis = engine.ask('Which surah has two Bismillahs?');
    expect(twoBis.answer).toMatch(/An-Naml/);
    expect(twoBis.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('27:30');
    expect(engine.ask('কোন সূরায় দুইবার বিসমিল্লাহ আছে?').answer).toMatch(/নামল/);

    expect(engine.ask('Which is the first surah of the Quran?').answer).toMatch(/Al-Faatiha/);
    expect(engine.ask('কুরআনের প্রথম সূরা কোনটি?').answer).toMatch(/Al-Faatiha/);
    expect(engine.ask('Which is the last surah of the Quran?').answer).toMatch(/An-Naas/);
    expect(engine.ask('কুরআনের শেষ সূরা কোনটি?').answer).toMatch(/An-Naas/);

    const shortest = engine.ask('Which is the shortest ayah in the Quran?');
    expect(shortest.kind).toBe('data');
    expect(shortest.answer).toMatch(/55:64/);
    expect(shortest.ayahs.map((a) => `${a.s}:${a.a}`)).toContain('55:64');

    expect(engine.ask('How many words are in Surah Al-Fatiha?').answer).toMatch(/29 words/);
    expect(engine.ask('সূরা ফাতিহায় কয়টি শব্দ আছে?').answer).toMatch(/২৯টি শব্দ/);

    expect(engine.ask('How many surahs are in juz 30?').answer).toMatch(/37 surahs/);
    expect(engine.ask('৩০ নং পারায় কয়টি সূরা আছে?').answer).toMatch(/৩৭টি সূরা/);

    expect(engine.ask('Which surah is named after a woman?').answer).toMatch(/Maryam/);
    expect(engine.ask('কোন সূরা একজন নারীর নামে?').answer).toMatch(/মারইয়াম/);

    expect(engine.ask('Which surahs are named after prophets?').answer).toMatch(/Yunus.*Hud.*Yusuf.*Ibrahim.*Muhammad.*Nooh/);
    expect(engine.ask('কোন কোন সূরা নবীদের নামে?').answer).toMatch(/ইউনুস.*নূহ/);

    expect(engine.ask('Which surah has the word Allah in every ayah?').answer).toMatch(/Al-Mujaadila/);
    expect(engine.ask('কোন সূরার প্রতিটি আয়াতে আল্লাহ শব্দটি আছে?').answer).toMatch(/আল-মুজাদালাহ/);

    expect(engine.ask('How many manzils are in the Quran?').answer).toMatch(/7 manzils/);
    expect(engine.ask('How many ruku are in the Quran?').answer).toMatch(/558 rukus/);
    expect(engine.ask('Which surah was revealed first?').kind).toBe('scholar');

    // Previously misrouted story & newly added stories
    const harun = engine.ask('story of Harun');
    expect(harun.kind).toBe('story');
    expect(harun.answer).toContain('Harun');
    expect(harun.answer).not.toContain('Qarun');
    expect(engine.ask('story of Khidr').ayahs[0]).toEqual({ s: 18, a: 60 });
    expect(engine.ask('story of Talut and Jalut').ayahs[0]).toEqual({ s: 2, a: 246 });
    expect(engine.ask('story of people of the ditch').ayahs[0]).toEqual({ s: 85, a: 4 });
    expect(engine.ask('story of people of the elephant').ayahs[0]).toEqual({ s: 105, a: 1 });
    expect(engine.ask('story of Habil and Qabil').ayahs[0]).toEqual({ s: 5, a: 27 });
    expect(engine.ask('story of Ismail').ayahs[0]).toEqual({ s: 37, a: 101 });
    expect(engine.ask('story of Yaqub').ayahs[0]).toEqual({ s: 12, a: 83 });
    expect(engine.ask('story of Yahya').ayahs[0]).toEqual({ s: 19, a: 7 });

    // Newly fixed topics & Banglish phrasings
    expect(refs('mon kharap hole ki porbo')).toContain('94:5');
    expect(refs('what does the Quran say about mental health?')).toContain('94:5');
    expect(refs('কুরআনে জাদু বা সিহর নিয়ে কী আছে')).toContain('2:102');
    expect(refs('kuran e jadu niye ki ache')).toContain('2:102');
    expect(refs('what does the Quran say about embryology?')).toContain('23:12');
    expect(refs('what does the Quran say about big bang?')).toContain('21:30');
    expect(refs('what does the Quran say about science?')).toContain('3:190');
  });
});

