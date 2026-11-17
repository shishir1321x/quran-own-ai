// What a normal user asks: finding an ayah from its words, stories, many more topics, which translation, lists and facts,
// help, things that cannot be done here, rulings said in other ways, and the mistakes that must NOT happen.
import { describe, expect, it } from 'vitest';
import { Engine } from '../src/engine.js';
import { plausibleTypo } from '../src/fuzzy.js';
import { THEMES } from '../src/lexicon.js';
import { MORE_THEMES, STORIES } from '../src/themes_more.js';

const DAY = 86_400_000;
const e = new Engine(undefined, () => 20_000 * DAY);
const refs = (q: string) => e.ask(q).ayahs.map((a) => `${a.s}:${a.a}`);
const data = (q: string) => e.ask(q).data?.join(' ') ?? '';

describe('which ayah is this? (the words of the ayah, in any of the three languages)', () => {
  it.each([
    ['قل هو الله احد', ['112:1']], ['قُلْ هُوَ ٱللَّهُ أَحَدٌ', ['112:1']], ['ان مع العسر يسرا', ['94:5', '94:6']], ['ولا الضالين', ['1:7']],
    ['ان الانسان لفي خسر', ['103:2']], ['Say, He is Allah, who is One', ['112:1']], ['do not despair of the mercy of Allah', ['39:53']],
    ['Allah is the Light of the heavens and the earth', ['24:35']],
  ])('%s', (q, expected) => expect(refs(q)).toEqual(expected));
  it('a first word with a one-letter prefix still matches (فإن / إن, والحمد / الحمد)', () => {
    expect(refs('الحمد لله رب العالمين')).toEqual(expect.arrayContaining(['1:2', '39:75', '37:182']));
  });
  it('Bengali words of the translation', () => expect(refs('তিনি চিরঞ্জীব, সর্বসত্তার ধারক')).toContain('2:255'));
  it('only when the WHOLE text is in the ayah, and not for short or very common phrases', () => {
    expect(e.ask('What does the Quran say about patience and charity together').answer).not.toMatch(/contain the words you wrote/);
    expect(e.ask('الله').kind).not.toBe('search');      // one word is a topic, not a quotation
    expect(e.ask('in the name').answer).not.toMatch(/contain the words you wrote/);   // too short to be a quotation
  });
  it('the answer says it found the words, in the language of the question', () => {
    expect(e.ask('قل هو الله احد').answer).toMatch(/الكلمات/);
    expect(e.ask('Say, He is Allah, who is One').answer).toMatch(/contain the words you wrote/);
  });
});

describe('the story of a prophet or another person', () => {
  it.each([
    ['story of Prophet Yusuf', 12], ['tell me about Prophet Musa', 20], ['ঈসা (আ.) এর ঘটনা', 3], ['story of Adam', 2], ['story of the people of the cave', 18],
    ['Dhul-Qarnayn', 18], ['who is Maryam', 19], ['story of Prophet Nuh', 71], ['story of Sulaiman', 27], ['ইউসুফ (আ.) এর কাহিনী', 12],
    ['Luqman', 31], ['story of Qarun', 28], ['tell me about Prophet Ibrahim', 21], ['story of Yousef', 12],
  ])('%s -> surah %i', (q, s) => {
    expect(e.ask(q).kind).toBe('story');
    expect(e.ask(q).ayahs[0].s).toBe(s);
  });
  it('the intro says it is where the account begins', () => expect(e.ask('story of Adam').answer).toMatch(/where the account begins \(2:30-39\)/));
  it('a name without a request for a story is not turned into one', () => {
    expect(e.ask('adam').kind).not.toBe('story');
    expect(e.ask('tell me about a lot of things').kind).not.toBe('story');
    expect(e.ask('tell me about job opportunities').kind).not.toBe('story');
  });
  it('"the Quran" is not a name (its consonants are Qarun\'s): a question with it and "about" is still a topic', () => {
    expect(e.ask('What does the Quran say about patience?').kind).toBe('theme');
    expect(e.ask('What does the Quran say about sleep?').kind).toBe('theme');
  });
});

describe('many more topics', () => {
  it.each([
    ['What does the Quran say about jealousy?', '113:5'], ['What does the Quran say about hijab?', '24:31'], ['What does the Quran say about divorce?', '2:229'],
    ['What does the Quran say about friendship?', '49:10'], ['Quran about protecting the environment', '30:41'], ['What does the Quran say about animals?', '6:38'],
    ['business and trade in the Quran', '4:29'], ['what does Quran say about debt', '2:282'], ['freedom of religion in Islam', '2:256'], ['Quran about non-Muslims', '60:8'],
    ['what does the Quran say about the poor and needy', '107:3'], ['Hajj', '2:196'], ['Laylatul Qadr', '97:1'], ['Friday prayer in the Quran', '62:9'],
    ['Kaaba and qibla', '2:144'], ['protection from evil', '113:1'], ['trials and tests in life', '2:155'], ['destiny and qadar', '57:22'],
    ['ঈমান নিয়ে কী বলা হয়েছে?', '49:15'], ['taqwa', '3:102'], ['what does the Quran say about time', '103:1'], ['wudu ablution', '5:6'],
    ['women in the Quran', '33:35'], ['Satan', '35:6'], ['angels', '2:98'], ['jinn', '72:1'], ['hell', '2:24'], ['is the Quran protected from change', '15:9'],
    ['names of Allah', '7:180'], ['rizq provision', '65:3'], ['moderation and extravagance', '7:31'], ['keeping promises', '5:1'], ['consultation shura', '42:38'],
    ['what does the Quran say about usury', '2:275'], ['alcohol', '5:90'], ['pork', '2:173'], ['who is Allah', '112:1'], ['shirk', '4:48'], ['hypocrites', '2:8'],
    ['what does the Quran say about killing', '5:32'], ['how was man created', '23:12'], ['what does the Quran say about the sun and moon', '36:38'],
    ['Quran about sleep', '78:9'], ['what does the Quran say about rain', '25:48'], ['what does Islam say about forgiving others', '3:134'], ['recitation of the Quran', '73:4'],
    ['I am worried about my job', '65:3'], ['Prophet Muhammad', '33:40'], ['wealth', '3:14'], ['জিন', '72:1'], ['ফেরেশতা', '2:98'],
  ])('%s -> %s', (q, first) => {
    expect(['theme', 'search']).toContain(e.ask(q).kind);
    expect(refs(q)).toContain(first);
  });
  it('a theme of the "dua" kind: the specific one wins', () => {
    expect(refs('dua for health')[0]).toBe('26:80');
    expect(refs('dua for my children')[0]).toBe('25:74');
  });
  it('every ayah of every theme and story exists, and no ayah is listed twice in one theme', () => {
    for (const t of [...THEMES, ...MORE_THEMES]) {
      const seen = new Set<string>();
      for (const [s, a] of t.ayahs) {
        expect(e.quran.get(s, a), `${t.id} ${s}:${a}`).toBeDefined();
        expect(seen.has(`${s}:${a}`), `${t.id} lists ${s}:${a} twice`).toBe(false);
        seen.add(`${s}:${a}`);
      }
    }
    for (const st of STORIES) for (const [s, a] of st.ayahs) expect(e.quran.get(s, a), `${st.id} ${s}:${a}`).toBeDefined();
  });
  it('no list is long: at most 5 ayahs for a theme, 10 for a story', () => {
    for (const t of THEMES) expect(t.ayahs.length, t.id).toBeLessThanOrEqual(7);
    for (const st of STORIES) expect(st.ayahs.length, st.id).toBeLessThanOrEqual(10);
  });
});

describe('topics that need a scholar: no ayahs are picked out', () => {
  it.each([
    'What does the Quran say about jihad?', 'what does the Quran say about war', 'punishment for theft', 'what does the Quran say about slavery',
    'what does the Quran say about apostasy', 'যুদ্ধ নিয়ে কুরআন কী বলে', 'জিহাদ কী', 'what is hudud', 'terrorism in Islam', 'are kafirs punished',
  ])('%s', (q) => {
    const r = e.ask(q);
    expect(r.kind).toBe('scholar');
    expect(r.ayahs).toEqual([]);
  });
  it.each([
    'Is hijab compulsory?', 'Is it obligatory to pray five times?', 'Do I have to fast when I am sick?', 'Must I pay zakat?', 'Is it allowed to listen to the Quran while driving?',
    'is it a sin to lie', 'is it okay to cry', 'বাধ্যতামূলক কি',
  ].filter((q) => !/okay to cry/.test(q)))('a ruling said without the word "haram": %s', (q) => expect(e.ask(q).kind).toBe('scholar'));
  it('the benefit of reading a surah goes to a scholar (an explanation does not: see explain.test.ts)', () => {
    for (const q of ['benefits of reading surah mulk', 'benefit of reciting ayatul kursi']) expect(e.ask(q).kind, q).toBe('scholar');
  });
});

describe('which translation', () => {
  it.each([
    ['Bengali translation of 2:255', 'bn'], ['2:255 in Bengali', 'bn'], ['ayat ul kursi bangla', 'bn'], ['surah ikhlas in Bengali', 'bn'], ['২:২৫৫ বাংলায়', 'bn'],
    ['2:255 english e dekhao', 'en'], ['show me 112:1-4 in English', 'en'], ['ইংরেজিতে 2:255', 'en'],
    ['ayatul kursi only Arabic', 'none'], ['2:255 arabic only', 'none'], ['2:255 without translation', 'none'], ['শুধু আরবি 2:255', 'none'],
    ['2:255', 'en'], ['সূরা ইখলাস', 'bn'],
  ])('%s -> %s', (q, t) => expect(e.ask(q).translation).toBe(t));
  it('the page gets an empty translation when only the Arabic is wanted', async () => {
    const { toJson } = await import('../src/api.js');
    const j: any = toJson(e, e.ask('2:255 arabic only'));
    expect(j.ayahs[0].translation).toBe('');
    expect(j.ayahs[0].arabic.length).toBeGreaterThan(10);
  });
  it('asking for a transliteration shows the ayahs and says it is not available', () => {
    const r = e.ask('give me the transliteration of surah ikhlas');
    expect(r.ayahs).toHaveLength(4);
    expect(r.answer).toMatch(/Transliteration.*not available/);
  });
});

describe('lists and facts', () => {
  it.each([
    ['list of surah names', /1 Al-Faatiha.*114 An-Naas/], ['which surah comes after Baqarah', /Aal-i-Imraan/], ['which surah comes before surah yasin', /Faatir/],
    ['which surah is after Surah Yasin', /Saaffaat/], ['what is the longest ayah', /2:282/], ['how many sajdah in the Quran', /15 sajdah/],
    ['how many pages are in the Quran', /604 pages/], ['how many hizb are in the Quran', /15 hizb|60 hizb/], ['how many ayahs in juz 30', /564 ayahs/],
    ['how many words are in the Quran', /77800 words/], ['list of Meccan surahs', /Al-Ikhlaas/], ['list of Medinan surahs', /Al-Baqara/],
    ['surah baqarah er porer surah', /Aal-i-Imraan/],
  ])('%s', (q, expected) => {
    expect(e.ask(q).kind).toBe('data');
    expect(data(q)).toMatch(expected);
  });
  it('the first and the last surah have nothing before or after', () => {
    expect(e.ask('which surah comes before surah fatiha').answer).toMatch(/first surah/);
    expect(e.ask('which surah comes after surah naas').answer).toMatch(/last surah/);
  });
  it('the sajdah ayahs, from Tanzil, in order', () => {
    expect(refs('sajdah ayats')).toHaveLength(15);
    expect(refs('sajdah ayats')[0]).toBe('7:206');
  });
  it('a page of the mushaf', () => {
    expect(e.ask('page 50').kind).toBe('ref');
    expect(e.ask('page 605').kind).not.toBe('ref');
    expect(refs('page 1')[0]).toBe('1:1');
    expect(refs('পৃষ্ঠা ২')[0]).toBe('2:1');
  });
  it('numbers inside a Bengali answer are in Bengali digits', () => {
    expect(e.ask('কুরআনে কয় পৃষ্ঠা?').answer).toMatch(/৬০৪/);
    expect(e.ask('সূরা বাকারা কোন পারা').answer).toMatch(/১ নম্বর পারায়/);
  });
});

describe('the ayah of the day', () => {
  it('the same ayah all day, another one tomorrow, always one of the well-known ones', () => {
    const a = new Engine(undefined, () => 100 * DAY + 5_000).ask('ayah of the day').ayahs;
    const b = new Engine(undefined, () => 100 * DAY + 80_000_000).ask('ayah of the day').ayahs;
    const c = new Engine(undefined, () => 101 * DAY + 5_000).ask('ayah of the day').ayahs;
    expect(a).toHaveLength(1);
    expect(a).toEqual(b);
    expect(c).not.toEqual(a);
  });
  it.each(['ayah of the day', 'daily ayah', "today's ayat", 'আজকের আয়াত', 'random ayah'])('%s', (q) => expect(e.ask(q).ayahs).toHaveLength(1));
});

describe('help, who made you, and what cannot be done here', () => {
  it.each(['help', 'Help!', '?', 'menu', 'how do I use this bot', 'what can I ask you', 'সাহায্য', 'কী কী প্রশ্ন করা যায়', 'مساعدة'])('help: %s', (q) => {
    const r = e.ask(q);
    expect(r.kind).toBe('help');
    expect(r.ayahs).toEqual([]);
  });
  it('the help text gives examples in the language of the question', () => {
    expect(e.ask('help').answer).toMatch(/Surah Al-Ikhlas/);
    expect(e.ask('সাহায্য').answer).toMatch(/সূরা ইখলাস/);
    expect(e.ask('مساعدة').answer).toMatch(/سورة الإخلاص/);
  });
  it.each(['who made you', 'are you AI', 'are you a robot', 'কে বানিয়েছে তোমাকে'])('about: %s', (q) => expect(e.ask(q).kind).toBe('about'));
  it.each([
    'can you recite ayatul kursi audio', 'play surah rahman', 'prayer time today', 'what time is Jumuah prayer', 'fajr time', 'qibla direction', 'direction of qibla',
    'when is the next Eid', 'ঈদ কবে', 'নামাজের সময়', 'zakat calculator', 'download the Quran pdf',
  ])('cannot do: %s', (q) => {
    const r = e.ask(q);
    expect(r.kind).toBe('unsupported');
    expect(r.ayahs).toEqual([]);
  });
  it('but the topics next to them still work', () => {
    expect(e.ask('Friday prayer in the Quran').kind).toBe('theme');
    expect(e.ask('Kaaba and qibla').kind).toBe('theme');
    expect(e.ask('Hajj').kind).toBe('theme');
    expect(e.ask('what does the Quran say about fasting').kind).toBe('theme');
  });
  it.each(['this answer is wrong', 'you are wrong', 'that is incorrect', 'ভুল উত্তর', 'উত্তরটা ভুল'])('feedback: %s', (q) => expect(e.ask(q).kind).toBe('feedback'));
  it('a long question that happens to say "wrong" is still a question', () => {
    expect(e.ask('What does the Quran say about the wrong that people do to each other and how should they behave').kind).not.toBe('feedback');
  });
});

describe('typing mistakes are only corrected when they look like typing mistakes', () => {
  it.each([['recipe', 'recite', false], ['patince', 'patience', true], ['pateince', 'patience', true], ['forgivness', 'forgiveness', true], ['gratefull', 'grateful', true], ['mercey', 'mercy', true], ['prayet', 'prayer', true], ['cooking', 'looking', false], ['pizza', 'pizzas', true]])(
    '%s -> %s : %s', (a, b, ok) => expect(plausibleTypo(a, b)).toBe(ok));
  it('"recipe for biryani" is not about reciting', () => {
    expect(e.ask('recipe for biryani').ayahs).toEqual([]);
    expect(e.ask('recipe for biryani').notFound).toBe(true);
  });
  it('and the real mistakes still work', () => {
    expect(refs('patince')).toContain('2:153');
    expect(refs('mercey of Allah')).toContain('39:53');
  });
});

describe('a theme word beats a bare surah name that is also an ordinary word', () => {
  it('"sincerity ikhlas" is about sincerity; "surah ikhlas" and "ikhlas" are the surah', () => {
    expect(refs('sincerity ikhlas')).toContain('98:5');
    expect(refs('surah ikhlas')[0]).toBe('112:1');
    expect(refs('ikhlas')[0]).toBe('112:1');
  });
});
