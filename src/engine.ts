// The whole "AI": rules and a search engine, no third-party model. A question goes through these
// steps in order; the first one that applies answers.
//   safety (crisis, made-up ayah, ruling, hadith/tafsir) -> thanks/wishes/greeting/about -> numbers and facts
//   -> ayah reference or a famous passage -> juz -> surah (by name or number, a part of it) -> follow-up
//   -> checked themes -> "something from the Quran" -> BM25 search -> not found
import { loadQuran, type Quran } from './data.js';
import { THEMES, GENERAL_AYAHS, NO_TOPIC_WORDS, BANGLISH_TO_EN, NAME_TO_EN } from './lexicon.js';
import { STORIES, type Story } from './themes_more.js';
import { PhraseIndex } from './phrase.js';
import { editDistance, plausibleTypo } from './fuzzy.js';
import { isAyatulKursi } from './kursi.js';
import { buildIndex, englishChecker, matchThemes, searchAyahs, type Index } from './search.js';
import { countWord, extremeSurahs, revelationCounts, surahInfo, totals, type WordLang } from './stats.js';
import { makeSurahFinder, surahNumber, type SurahFinder } from './surahs.js';
import { MSG, STAT_TEXT, THEME_LABEL } from './templates.js';
import { americanize, normEn, normAr, tokensEn, wordsBn, wordsEn } from './text.js';
import type { Lang } from './types.js';
import { detectLanguage } from './language.js';

export type Kind =
  | 'greeting' | 'thanks' | 'about' | 'scholar' | 'refusal' | 'crisis'
  | 'theme' | 'surah' | 'ref' | 'juz' | 'story' | 'explain' | 'search' | 'noTopic' | 'followup' | 'data' | 'help' | 'unsupported' | 'feedback' | 'notFound';

export interface Reply {
  kind: Kind;
  mode: 'quran' | 'data' | 'general';
  lang: Lang;
  answer: string;
  ayahs: Array<{ s: number; a: number }>;
  notFound: boolean;
  data?: string[];
  /** which translation to show under the ayahs */
  translation: 'en' | 'bn' | 'none';
  /** The translators' own notes for the ayahs shown, word for word (only for an explanation request). */
  notes?: Array<{ s: number; a: number; text: string; source: string }>;
  /** Show the translation with its own footnote marks (so the marks match the notes). */
  rawTranslation?: boolean;
}
export interface HistoryTurn { question: string; answer: string; citations: Array<{ surah: number; ayah: number }> }

const MAX_RANGE = 10;
const EXPLAIN_MAX_AYAHS = 4;
const NOTE_SOURCE = { en: 'Saheeh International', bn: 'Dr. Abu Bakr Muhammad Zakaria' } as const;

// ------------------------------------------------------------------ safety and small talk
const CRISIS = [
  /\b(kill myself|end my life|ending my life|take my own life|want to die|wanna die|suicid\w*|can'?t go on|cannot go on|no reason to live|don'?t want to live|do not want to live|hurt myself|self[- ]?harm|nothing matters)\b/i,
  /আত্মহত্যা|মরে যেতে|মরতে ইচ্ছ|মরতে চাই|বাঁচতে ইচ্ছ|বাঁচতে চাই না|জীবন শেষ|নিজেকে শেষ|আর পারছি না/,
  /\b(atmohotta|atmahatya|morte ichha|morte chai|bachte ichha|bachte chai na|jibon shesh|nijeke shesh)\b/i,
  /أريد أن أموت|انتحار|أقتل نفسي|لا أريد أن أعيش|لا أستطيع المتابعة|لا فائدة من الحياة/,
];
const MADE_UP = [
  /\b(write|make up|compose|invent|create|generate|fabricate|forge)\b.{0,50}\b(ayah|ayat|aya|verse|surah|sura)\b/i,
  /\b(complete|finish)\s+(this|my|the following|the next)\s+(ayah|ayat|aya|verse)\b/i,
  /\b(new|made[- ]?up|fake|fabricated|invented|my own)\s+(ayah|ayat|aya|verse|surah)\b/i,
  /(اكتب|ألّف|ألف|أنشئ|اختلق|أكمل).{0,40}(آية|ايه|سورة)/,
  /(আয়াত|সূরা).{0,25}(বানাও|বানিয়ে|বানান|লিখে দাও|লিখে দিন|লিখো|রচনা)|(বানিয়ে|নতুন).{0,15}(আয়াত|সূরা)/,
  /\b(ayat|surah|aya)\b.{0,25}\b(banao|baniye|likhe dao|likho)\b/i,
];
const FATWA = [
  /\b(haram|halal|fatwa|fatawa|ruling|permissible|impermissible|is it (a )?sin to|jayez|jaiz|najayez|najaiz)\b/i,
  /হারাম|হালাল|ফতোয়া|ফাতাওয়া|জায়েজ|জায়েয|নাজায়েজ|নাজায়েয|গুনাহ হবে|পাপ হবে/,
  /\b(allowed|permitted|lawful|forbidden|prohibited|sinful|permissible)\b.{0,25}\b(in islam|islamically|in the quran|by islam)\b/i,
  /\b(makruh|mustahab|wajib|farz|fard|sunnah or)\b|ওয়াজিব|ফরজ|ফরয|মাকরুহ|সুন্নত কি/i,
  /\b(sunni|shia|shi'?ite|salafi|wahhabi|sect|madhhab|mazhab)\b/i,
  /حرام|حلال|فتوى|يجوز|هل يحل/,
];
// Questions that need hadith or tafsir, which this assistant does not have.
const HADITH = /\b(hadith|hadis|hadees|asbab|shane\s*nuzul|shan[- ]e[- ]nuzul|reasons? (?:of|for) (?:the )?revelation|fazilat|fazilah|fazail|virtues? of|sawab|thawab|reward for (?:reading|reciting)|heart of the (?:quran|koran)|greatest (?:surah|ayah|verse)|best (?:surah|ayah|verse)|most rewarding|who is (?:better|best|greater|greatest|superior|more virtuous)|benefits? of (?:reading|reciting|listening))\b|(?:important|best|greatest|top|most important) (?:surah|ayah|ayat|verse)|(?:surah|ayah|ayat)\s+(?:is|er)?\s*(?:the\s+)?(?:most\s+)?(?:important|best|greatest)|(?:ইম্পর্টেন্ট|ইমপর্টেন্ট|ইম্পরট্যান্ট|গুরুত্বপূর্ণ|শ্রেষ্ঠ|সেরা|সবচেয়ে ভালো|সবচেয়ে উত্তম).{0,14}(?:সূরা|আয়াত)|(?:সূরা|আয়াত).{0,14}(?:ইম্পর্টেন্ট|ইমপর্টেন্ট|গুরুত্বপূর্ণ|শ্রেষ্ঠ|সেরা)|\b(?:shreshtho|sreshtho|shera|sera)\s+(?:surah|ayat)|হাদীস|হাদিস|শানে নুযূল|শানে নুজুল|ফজিলত|ফযীলত|সওয়াব|ছওয়াব|সাওয়াব|حديث|فضل سورة/i;
const WISHES = /\b(eid\s*mubarak|ramadan\s*mubarak|ramzan\s*mubarak|jumma\s*mubarak|jumuah\s*mubarak|jumu'?ah\s*mubarak)\b|ঈদ\s*মোবারক|ঈদ\s*মুবারক|রমজান\s*মোবারক|রমযান\s*মুবারক|জুমা\s*মোবারক|عيد مبارك|رمضان مبارك|جمعة مباركة/i;
// Topics that need context and knowledge of Islamic law: no ayahs are picked out for them.
const SENSITIVE = /\b(jihad|jihaad|terror|terrorism|terrorist|terrorists|war|wars|apostasy|apostate|blasphemy|slavery|slaves?|infidels?|kuffar|kafirs?|kafir|stoning|flogging|amputat\w*|hudud|thief|theft|steal(?:ing)?|beheading|honou?r killing)\b|(?<![\u0980-\u09FF])(?:জিহাদ|যুদ্ধ|সন্ত্রাস|দাসত্ব|ক্রীতদাস|কাফির|কাফের|মুরতাদ|হুদুদ|চুরি|হাত কাটা|পাথর মেরে)|جهاد|إرهاب|ردة|كافر|حد السرقة/i;
// Rulings phrased without the word "haram": "is it compulsory", "must I", "do I have to".
const FATWA_MORE: RegExp[] = [
  /\bis it\b.{0,4}\s*(?:allowed|permitted|permissible|lawful|forbidden|prohibited|sinful|a sin|compulsory|obligatory|mandatory|required|necessary|halal|haram)\b/i,
  /\b(?:compulsory|obligatory|mandatory)\b/i,
  /\b(?:do|must|should|shall|can|am|are)\s+(?:i|we|you|women|men|muslims|a muslim)\s+(?:have to|need to|must|supposed to|required to|obliged to)\b/i,
  /\bmust\s+(?:i|we|a muslim|muslims|women|men)\b/i,
  /বাধ্যতামূলক|আবশ্যক|অবশ্যই করতে হবে|করতে হবে কি|করা কি জরুরি|জরুরি কি/,
];
const HELP = /^\s*(?:help|menu|commands?|options|start|\?)\s*[!?.]*\s*$|\b(?:how (?:do|can|to) i use|how does this (?:bot|work)|what (?:can|may|should) i ask|what questions|which questions|examples? of questions|show me what you can do)\b|^\s*(?:সাহায্য|হেল্প|মেনু|مساعدة)\s*[!?.।]*\s*$|কী কী প্রশ্ন|কি কি প্রশ্ন|কীভাবে ব্যবহার|কিভাবে ব্যবহার|ki ki (?:prosno|jiggesh)|কী জিজ্ঞেস করব|কি জিজ্ঞেস করব|ما الأسئلة|كيف أستخدم/i;
const UNSUPPORTED: RegExp[] = [
  /\b(?:audio|mp3|recording)\b|\b(?:listen to|hear|play|sound of|voice of)\b.{0,30}\b(?:quran|surah|ayat|ayah|recitation|qari)\b|\b(?:recite|recitation)\b.{0,30}\b(?:audio|aloud|for me|to me)\b|অডিও|শুনাও|শোনাও|শুনতে চাই|সুর করে|استمع|صوت/i,
  /\b(?:prayer|namaz|salah|salat|azan|adhan|iftar|sehri|suhoor|fajr|zuhr|dhuhr|asr|maghrib|isha|jumm?ah|jumuah|jumua)\s*(?:times?|timings?|schedule)\b|\b(?:time|when|what time)\b.{0,25}\b(?:fajr|zuhr|dhuhr|asr|maghrib|isha|iftar|sehri|suhoor|jumm?ah|jumuah|jumua|namaz|salah|salat|azan|adhan)\b|নামাজের সময়|নামাযের সময়|সালাতের সময়|ইফতারের সময়|সাহরির সময়|আজানের সময়|জুমার সময়|أوقات الصلاة|موعد الصلاة/i,
  /\bqibla\b.{0,25}\b(?:direction|find|where|which way)\b|\bdirection\b.{0,15}\b(?:qibla|kaaba|kabah|mecca|makkah)\b|কিবলার দিক|কিবলা কোন দিকে|اتجاه القبلة/i,
  /\b(?:next|when is|when'?s|date of|today'?s|what is today'?s)\b.{0,18}\b(?:eid|ramadan|ramzan|hijri|islamic date|muharram|shab-?e|laylatul)\b|\bhijri\b.{0,10}\b(?:date|calendar)\b|ঈদ কবে|রমজান কবে|রমযান কবে|ইসলামিক তারিখ|হিজরি তারিখ|متى (?:العيد|رمضان)|التاريخ الهجري/i,
  /\bzakat\b.{0,12}\b(?:calculator|calculation|calculate|amount|nisab|how much)\b|যাকাত (?:ক্যালকুলেটর|হিসাব|কত)|حاسبة الزكاة/i,
  /\b(?:download|pdf|mp4|wallpaper|app store|play store)\b/i,
];
const FEEDBACK = /\b(?:this|that|your|the|it|answer)\b.{0,25}\b(?:wrong|incorrect|not correct|not right|bad|useless)\b|\byou(?:'re| are)\s+(?:wrong|incorrect|useless|stupid)\b|\b(?:wrong|incorrect) answer\b|ভুল (?:উত্তর|বলছ|বলছেন|বললে)|উত্তর(?:টা)? ভুল|ঠিক (?:না|নয়|হয়নি|হয় নি)|তুমি ভুল|আপনি ভুল|هذا (?:خطأ|غلط)|إجابة خاطئة/i;
const TRANSLIT = /\btransliterat\w*|\bromani[sz]ed\b|\broman letters\b|\benglish letters\b|উচ্চারণ|النطق/i;
// Which translation does the person want?
const REQ_BN = /\b(?:in|into)\s+(?:bangla|bengali)\b|\b(?:bangla|bengali)\s+(?:translation|onubad|e|te|ay)\b|\bbanglay\b|\bbangla\b|বাংলা/i;
const REQ_EN = /\b(?:in|into)\s+english\b|\benglish\s+(?:translation|e|te|ay|version)\b|\benglish\b|ইংরেজি|ইংরেজী|ইংলিশ/i;
const REQ_NONE = /\b(?:only|just)\s+arabic\b|\barabic\s+only\b|\bwithout\s+(?:the\s+)?translation\b|\bno\s+translation\b|শুধু\s*আরবি|আরবি\s*শুধু|অনুবাদ ছাড়া|بدون ترجمة|العربية فقط/i;
const STORY_TRIGGER = /\b(?:story|stories|tale|about|who (?:is|was)|life of|history of|kahini|kahani|ghotona|gotona|qissa|qisas)\b|কাহিনী|কাহিনি|ঘটনা|জীবনী|সম্পর্কে|সম্বন্ধে|বিষয়ে|কে ছিলেন|قصة|قصص/i;
const AYAH_OF_DAY = /\b(?:ayah|ayat|verse|aya)\b.{0,15}\b(?:of the day|for today|today|daily)\b|\b(?:today'?s|daily|random)\s+(?:ayah|ayat|verse|aya)\b|আজকের আয়াত|প্রতিদিনের আয়াত|দৈনিক আয়াত|آية اليوم|آية عشوائية/i;
const LIST_SURAHS = /\b(?:list|names?|all)\b.{0,12}\b(?:surahs?|suras?)\b|\b(?:surahs?|suras?)\b.{0,10}\b(?:list|names?)\b|সূরার (?:তালিকা|নাম)|সব সূরার|সূরাগুলোর নাম|قائمة السور|أسماء السور/i;
const LIST_WORD = /\b(?:list|names?|which|name)\b|তালিকা|নাম|কোন কোন|قائمة|أسماء/i;
const NEIGHBOR_AFTER = /\b(?:after|next|following|porer|porey|parer)\b|পরের|পরে|بعد/i;
const NEIGHBOR_BEFORE = /\b(?:before|previous|preceding|agher|agey|ager)\b|আগের|আগে|قبل/i;
const LONGEST_AYAH = /\b(?:longest|biggest|largest)\s+(?:ayah|ayat|verse|aya)\b|সবচেয়ে (?:বড়|লম্বা|দীর্ঘ) আয়াত|أطول آية/i;
const SAJDA = /\b(?:sajda|sajdah|sijda|sijdah|sajdas|sajdahs|prostrations?)\b|সিজদা|সেজদা|সিজদার|سجدة|آيات السجدة/i;
const PAGES = /\bhow many pages\b|কয়টি পৃষ্ঠা|কত পৃষ্ঠা|কয় পৃষ্ঠা|كم صفحة/i;
const PAGE_NO = /\bpage\s*(?:no\.?|number)?\s*(\d{1,3})\b|পৃষ্ঠা\s*(?:নং|নম্বর)?\s*(\d{1,3})|صفحة\s*(\d{1,3})/i;
const HIZB = /\bhow many hizb\b|কয়টি হিযব|কয়টি হিজব|كم حزب/i;
const WORDS_IN_QURAN = /\bhow many\s+(?:words|letters)\b|কয়টি শব্দ|কত শব্দ|কয়টি হরফ|كم كلمة|كم حرف/i;
// "explain 2:255", "tafsir of Ayat al-Kursi", "আয়াতুল কুরসির ব্যাখ্যা": show the translator's notes for the ayah.
const EXPLAIN = /\b(explain|explanation|explaining|elaborate|interpret|interpretation|commentary|tafsir|tafseer|tafsier|tafsiir)\b|ব্যাখ্যা|তাফসীর|তাফসির|শরহ|شرح|تفسير|توضيح/gi;
// A named work of tafsir: we do not have these, only the translators' notes.
const TAFSIR_WORK = /\b(ibn kathir|ibn katheer|ibn-kathir|kathir|katheer|jalalayn|jalalain|jalalein|tabari|tabri|qurtubi|qurtubee|sa'?di|saadi|maududi|mawdudi|tafheem|muyassar|maarif|maariful|ibn abbas|baghawi|razi|zamakhshari)\b|ইবনে কাসীর|ইবনে কাছীর|জালালাইন|তাবারী|কুরতুবী|মাওদুদী|তাফহীম|মা'?আরিফুল|ابن كثير|الجلالين|الطبري|القرطبي|السعدي|الميسر/gi;
const THANKS = /\b(thanks|thank you|thankyou|thx|shukria|shukriya|dhonnobad|dhanyabad|jazak\w*|jazaka\w*)\b|ধন্যবাদ|শুকরিয়া|জাযাকাল্লাহ|জাজাকাল্লাহ|شكرا|شكرًا|جزاك/i;
const GREETING = /\b(hi+|hello|hey|heya|salam|salaam|walaikum\s*(?:assalam|salam)\w*|wa\s*alaikum\s*(?:assalam|salam)\w*|waalaikum\w*|assalamu\s*alaikum|assalamualaikum|as-?salamu\s*alaykum|good (morning|evening|afternoon|night)|kemon\s*acho|kemon\s*achen|kemon\s*aso|kmn\s*acho|kmon\s*acho|ki\s*obostha|ki\s*khobor|how are you|whats up|what'?s up|sup)\b|ওয়া\s*আলাইকুম|ওয়ালাইকুম|আসসালামু|আসসালামুআলাইকুম|সালাম|নমস্কার|কেমন আছ|কি অবস্থা|কী অবস্থা|কি খবর|কী খবর|وعليكم السلام|السلام عليكم|سلام|مرحبا|أهلا|اهلا|كيف حالك/i;
// Bengali greeting words, only as whole words (a short word like "হায়" is also the end of "ফাতিহায়").
const BN_GREETING = /(?<![\u0980-\u09FF])(?:হাই|হায়|হ্যালো|হ্যাল্লো|হেলো|হেল্লো|হেলও)(?![\u0980-\u09FF])/;
const ABOUT = /\b(who are you|what are you|what can you do|what do you do|tumi ke|apni ke|tumi ki|ki korte paro|ki korte paren)\b|(?:তুমি|আপনি) কে(?![\u0980-\u09FF])|তুমি কি(?![\u0980-\u09FF])|আপনি কি করতে|কী করতে পারো|কি করতে পারো|কী করতে পারেন|من أنت|ماذا تستطيع|ما هذا|\bwho (?:made|created|built|developed|designed|programmed) you\b|\bare you (?:an? )?(?:ai|a\.i\.|bot|robot|human|real|chatgpt|gpt|person)\b|কে (?:বানিয়েছে|তৈরি করেছে|বানিয়েছেন)|তুমি কি (?:এআই|রোবট|মানুষ|বট)|من صنعك|من أنشأك/i;

const anyMatch = (list: RegExp[], text: string) => list.some((re) => re.test(text));
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

// ------------------------------------------------------------------ numbers
const HOW_MANY = /\b(how many|how much|number of|count|koyta|koyti|kotogulo|koto)\b|কয়টি|কয়টা|কতটি|কতগুলো|কতগুলি|কত|كم/i;
const HOW_OFTEN = /\b(how many times|how often|how frequently|koybar|kotobar|koto bar)\b|কতবার|কত বার|কতবারই|كم مرة|كم مره/i;
const AYAH_WORD = /\b(ayah|ayahs|ayat|verse|verses)\b|আয়াত|আয়াতে|آية|آيات|ايه/i;
const SURAH_WORD_RE = /\b(surah|surahs|sura|suras)\b|সূরা|সূরাতে|সূরায়|سورة|سور/i;
const MOST = /\b(most|longest|biggest|largest|maximum|sobcheye boro|sobcheye beshi)\b|সবচেয়ে বেশি|সবচেয়ে বড়|সর্বাধিক|সবচেয়ে লম্বা|أطول|أكثر/i;
const FEWEST = /\b(fewest|least|shortest|smallest|minimum|sobcheye choto|sobcheye kom)\b|সবচেয়ে কম|সবচেয়ে ছোট|সর্বনিম্ন|أقصر|أقل/i;
const REVEL = /\b(meccan|makkan|medinan|madinan|makki|madani)\b|মক্কী|মাদানী|মাক্কী|মাদানি|مكي|مدني|مكية|مدنية/i;

function extractWord(question: string): { word: string; lang: WordLang } | null {
  const quoted = question.match(/["“”«»'‘’]([^"“”«»'‘’]{2,30})["“”«»'‘’]/);
  let w = quoted?.[1]?.trim() ?? '';
  if (!w) {
    const bn = wordsBn(question);
    const i = bn.findIndex((x) => /^শব্দ/.test(x) || x === 'শব্দটি');
    if (i > 0) w = bn[i - 1];
    else if (bn.length > 0 && !/[a-z]/i.test(question)) w = bn.find((x) => !NO_TOPIC_WORDS.has(x) && x.length > 2) ?? '';
  }
  if (!w) {
    const ar = normAr(question).split(/\s+/).filter((x) => /[\u0600-\u06FF]/.test(x));
    const i = ar.findIndex((x) => x === 'كلمه' || x === 'كلمة');
    if (i >= 0 && ar[i + 1]) w = ar[i + 1];
  }
  if (!w) {
    const drop = new Set(['time', 'times', 'appear', 'appears', 'appeared', 'word', 'often', 'many', 'frequently', 'mention', 'mentioned', 'koybar', 'kotobar', 'bar', 'ache', 'ashe', 'esheche', 'shobdo', 'shobdoti', 'kotha']);
    w = wordsEn(question).find((x) => !drop.has(x) && tokensEn(x).length > 0) ?? '';
  }
  if (!w) return null;
  if (/[\u0980-\u09FF]/.test(w)) return { word: w, lang: 'bn' };
  if (/[\u0600-\u06FF]/.test(w)) return { word: w, lang: 'ar' };
  const mapped = BANGLISH_TO_EN[w.toLowerCase()];
  return { word: mapped ?? w, lang: 'en' };
}

// ------------------------------------------------------------------ references
const REF = /(\d{1,3})\s*[:：]\s*(\d{1,3})(?:\s*(?:-|–|to)\s*(\d{1,3}))?/;
const REF_WORDS = /(?:surah|sura|সূরা|سورة)\s*(\d{1,3}).{0,14}?(?:ayah|ayat|verse|আয়াত|آية)\s*(\d{1,3})/i;
const AYATUL_KURSI = /ayat(?:ul)?[\s-]*(?:al[\s-]*)?kursi|আয়াতুল\s*কুরস|آية\s*الكرسي/i;
const FIRST_LAST = /\b(first|1st|last)\s+(ayah|ayat|aya|verse)\b.{0,20}\b(quran|koran)\b|কুরআনের\s+(প্রথম|শেষ)\s+আয়াত|أول آية|آخر آية/i;
const AYAH_NUMBER = /(?:ayah|ayat|aya|verse|আয়াত|آية|ايه)\s*(?:no\.?|number|নম্বর|رقم)?\s*(\d{1,3})\b|\b(\d{1,3})\s*(?:no\.?\s*)?(?:ayah|ayat|aya|verse|নম্বর আয়াত|নং আয়াত)/i;
const JUZ = /\b(?:para|paara|siparah|sipara|juz|jus|joz|jooz|juzz)\s*(?:no\.?|number)?\s*(\d{1,2})\b|\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:para|paara|siparah|sipara|juz|jus)\b|পারা\s*(?:নং|নম্বর)?\s*(\d{1,2})|(\d{1,2})\s*(?:নং|নম্বর)?\s*পারা|জুয\s*(\d{1,2})|জুজ\s*(\d{1,2})|(?:الجزء|جزء)\s*(\d{1,2})/i;
const FOLLOW_UP = /\b(ortho|er ortho|meaning|translate|translation|onubad|banglay|bangla te)\b|অর্থ|মানে|অনুবাদ|বাংলায়|معنى|ترجمة|ترجم/i;

// A juz (para) by its famous name: "Amma para" is the 30th, "Tabarak para" the 29th.
const JUZ_NAMED: Array<[RegExp, number]> = [
  [/\b(amma|ammaa)\b.{0,12}\b(para|juz|jus|sipara|siparah)\b|\b(para|juz|jus|sipara|siparah)\b.{0,12}\b(amma|ammaa)\b|আম্মা\s*পারা|পারা\s*আম্মা|جزء عم/i, 30],
  [/\btabarak\w*\b.{0,12}\b(para|juz|sipara|siparah)\b|\b(para|juz|sipara|siparah)\b.{0,12}\btabarak\w*\b|তাবারাকা?\s*পারা|جزء تبارك/i, 29],
];
const JUZ_COUNT = /\bhow many\s+(?:juz|jooz|para|paras|siparah|sipara)\b|কয়টি\s*পারা|কতটি\s*পারা|কয়টা\s*পারা|কত\s*পারা|كم جزء/i;

// What a person asks about a surah itself: Meccan or Medinan, which para, its number, what its name means.
const SURAH_FACTS = /\b(meccan|makkan|medinan|madinan|makki|madani)\b|মক্কী|মাদানী|মাক্কী|মাদানি|مكي|مدني|مكية|مدنية|\b(?:which|kon|koto|kotho)\s*(?:number\s*)?(?:para|juz|siparah)\b|কোন\s*পারা|কত\s*নম্বর\s*পারা|\b(?:para|juz)\b.{0,12}\b(?:te|e|mein)\b|পারায়|পারাতে|\bwhat\s+(?:does|is)\s+(?:the\s+)?(?:name|meaning)\b|\bname\b.{0,30}\bmean|\bmeans?\b|নামের অর্থ|নামকরণ|\brevealed\b|নাযিল|অবতীর্ণ|\bwhich\s+juz\b/i;

// Famous passages that people ask for by name.
const PASSAGES: Array<{ re: RegExp; name: Record<Lang, string>; refs?: Array<[number, number]>; surahs?: number[] }> = [
  { re: /\b(amana|amanar|amanar-?rasul\w*|amanarrasul\w*|ama?naar?\s*rasul\w*)\b|আমানার\s*রাসূল|আমানার-রাসূলু|آمن الرسول/i, name: { en: 'Amana ar-Rasul (the last two ayahs of Al-Baqarah)', bn: 'আমানার রাসূল (সূরা বাকারার শেষ দুই আয়াত)', ar: 'آمن الرسول (آخر آيتين من سورة البقرة)' }, refs: [[2, 285], [2, 286]] },
  { re: /\b(?:teen|tin|3|three)\s*[- ]?(?:qul|kul|quls|kuls)\b|তিন\s*কুল|তিন\s*কূল/i, name: { en: 'The three Quls', bn: 'তিন কুল', ar: 'السور الثلاث (الإخلاص والفلق والناس)' }, surahs: [112, 113, 114] },
  { re: /\b(?:char|chaar|4|four)\s*[- ]?(?:qul|kul|quls|kuls)\b|চার\s*কুল|চার\s*কূল/i, name: { en: 'The four Quls', bn: 'চার কুল', ar: 'السور الأربع (الكافرون والإخلاص والفلق والناس)' }, surahs: [109, 112, 113, 114] },
  { re: /\bayat(?:ul|e|[\s-]e)?[\s-]*(?:al[\s-]*)?kar[ie]ma\b|আয়াতে\s*কারীমা|আয়াতে\s*করিমা|আয়াতুল\s*কারীমা/i, name: { en: 'Ayat-e-Karima (the supplication of Yunus)', bn: 'আয়াতে কারীমা (ইউনুস (আ.)-এর দোয়া)', ar: 'آية الكريمة (دعاء يونس)' }, refs: [[21, 87]] },
  { re: /\bbismillah(?:ir)?(?:\s*rahman\w*)?\b|বিসমিল্লাহ|بسم الله/i, name: { en: 'Bismillah', bn: 'বিসমিল্লাহ', ar: 'البسملة' }, refs: [[1, 1]] },
];

const WORD_NUMBER: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  ek: 1, dui: 2, tin: 3, char: 4, pach: 5, 'এক': 1, 'দুই': 2, 'দুটি': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5, 'ছয়': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'দশ': 10,
};
const NUM_BEFORE_AYAH = /(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|এক|দুই|তিন|চার|পাঁচ|ছয়|সাত|আট|নয়|দশ|ek|dui|tin|char|pach)\s*(?:টি|টা|ta|ti)?\s*(?:ayah|ayat|ayahs|aya|verses?|আয়াত|آيات|آية)/i;
const LAST_WORDS = /\b(last|final|sesh|shesh|akhiri)\b|শেষ|آخر/i;
const FIRST_WORDS = /\b(first|1st|prothom|pratham|opening)\b|প্রথম|أول/i;
const RANGE_WORDS = /(?:ayah|ayat|aya|verses?|আয়াত|آية|آيات)\s*(?:no\.?|number|নম্বর)?\s*(\d{1,3})\s*(?:-|–|—|to|থেকে|tak|til|إلى|الى)\s*(\d{1,3})|(\d{1,3})\s*(?:-|–|—|to|থেকে)\s*(\d{1,3})\s*(?:no\.?\s*)?(?:ayah|ayat|aya|verses?|আয়াত|নং আয়াত)/i;

const DOMAIN_JOIN = (lang: Lang) => (lang === 'ar' ? '، ' : ', ');

/** "2:285-286", or "112:1-4, 113:1-5" for a list of ayahs. */
function refLabel(list: Array<{ s: number; a: number }>): string {
  const parts: string[] = [];
  let i = 0;
  while (i < list.length) {
    let j = i;
    while (j + 1 < list.length && list[j + 1].s === list[i].s && list[j + 1].a === list[j].a + 1) j++;
    parts.push(j > i ? `${list[i].s}:${list[i].a}-${list[j].a}` : `${list[i].s}:${list[i].a}`);
    i = j + 1;
  }
  return parts.join(', ');
}

export class Engine {
  readonly quran: Quran;
  private readonly index: Index;
  private readonly surahs: SurahFinder;
  private readonly isEnglish: (w: string) => boolean;
  private readonly vocab: Map<string, number>;
  private readonly phrases: PhraseIndex;
  private readonly now: () => number;   // English words of the Quran text and their counts, for spelling mistakes

  constructor(quran: Quran = loadQuran(), now: () => number = Date.now) {
    this.quran = quran;
    this.now = now;
    this.phrases = new PhraseIndex(quran);
    this.index = buildIndex(quran);
    this.surahs = makeSurahFinder(quran);
    this.isEnglish = englishChecker(this.index);
    this.vocab = new Map();
    for (const y of quran.ayahs) for (const w of normEn(y.en).split(/[^a-z]+/)) if (w.length >= 4) this.vocab.set(w, (this.vocab.get(w) ?? 0) + 1);
    for (const t of THEMES) for (const g of [t.words, ...(t.allOf ?? [])]) for (const w of g) if (/^[a-z]{4,}$/.test(w.toLowerCase())) this.vocab.set(w.toLowerCase(), (this.vocab.get(w.toLowerCase()) ?? 0) + 5);
  }

  private reply(kind: Kind, mode: Reply['mode'], lang: Lang, answer: string, extra: Partial<Reply> = {}): Reply {
    return { kind, mode, lang, answer, ayahs: [], notFound: false, translation: lang === 'bn' ? 'bn' : 'en', ...extra };
  }

  private range(s: number, from: number, to: number): Array<{ s: number; a: number }> {
    const n = this.quran.chapters[s - 1].n;
    const end = Math.min(to, from + MAX_RANGE - 1, n);
    const out: Array<{ s: number; a: number }> = [];
    for (let a = from; a <= end; a++) out.push({ s, a });
    return out;
  }

  /** The surah a question is about: by name ("baqara") or by number ("surah 36"). */
  private surahOf(text: string): number | null {
    return this.surahs.find(text) ?? surahNumber(text);
  }

  /** Which juz (para) an ayah is in. */
  private juzOf(s: number, a: number): number {
    let j = 1;
    this.quran.juz.forEach(([js, ja], i) => { if (js < s || (js === s && ja <= a)) j = i + 1; });
    return j;
  }

  /**
   * A spelling mistake in an English word ("patince", "forgivness"): one letter wrong, added or missing,
   * same first letter, and exactly one word of the Quran text is that close. Real English words,
   * Banglish words we know and names are never changed.
   */
  private fix(text: string): string {
    return text.replace(/[A-Za-z]{6,}/g, (word) => {
      const w = americanize(word.toLowerCase());
      if (this.isEnglish(w) || BANGLISH_TO_EN[w] || NAME_TO_EN[w] || this.vocab.has(w)) return word;
      const near: string[] = [];
      for (const cand of this.vocab.keys()) {
        if (cand[0] === w[0] && Math.abs(cand.length - w.length) <= 1 && plausibleTypo(w, cand)) near.push(cand);
      }
      return near.length === 1 ? near[0] : word;
    });
  }

  /** A part of a surah: "last 2 ayat of surah baqarah", "ayat 1 to 5 of surah alaq". */
  private part(text: string, lower: string, s: number): { list: Array<{ s: number; a: number }>; label: string } | null {
    const n = this.quran.chapters[s - 1].n;
    const rg = text.match(RANGE_WORDS);
    if (rg) {
      const from = Number(rg[1] ?? rg[3]);
      const to = Number(rg[2] ?? rg[4]);
      if (from >= 1 && to >= from && from <= n) {
        const list = this.range(s, from, Math.min(to, n));
        return { list, label: refLabel(list) };
      }
    }
    const wantLast = LAST_WORDS.test(lower);
    const wantFirst = FIRST_WORDS.test(lower);
    if (wantLast !== wantFirst) {
      const m = text.match(NUM_BEFORE_AYAH);
      const count = m ? Math.max(1, Math.min(MAX_RANGE, Number(m[1]) || WORD_NUMBER[m[1].toLowerCase()] || 1)) : 1;
      const list = wantLast ? this.range(s, Math.max(1, n - count + 1), n) : this.range(s, 1, count);
      return { list, label: refLabel(list) };
    }
    return null;
  }

  /**
   * "explain 2:255": the translator's own notes for the ayah, word for word. Nothing is written by this assistant.
   * The question is first answered without the word "explain", to find WHICH ayah is meant (and to keep every
   * safety rule: "explain what is jihad" or "explain hadith about patience" still go to a scholar).
   */
  private explain(question: string, history: HistoryTurn[]): Reply {
    const work = question.match(TAFSIR_WORK)?.[0] ?? '';
    const stripped = question.replace(EXPLAIN, ' ').replace(TAFSIR_WORK, ' ').replace(/\s+/g, ' ').trim();
    const base = this.core(stripped, history);
    const lang = base.lang;
    const asked = toAsciiDigits(question).toLowerCase();
    // only a clear target gets notes: one ayah, a range, or a surah (its first ayahs)
    if (!(base.ayahs.length > 0 && (base.kind === 'ref' || base.kind === 'surah'))) {
      const badRef = base.kind === 'notFound' && /\d+\s*[:：]\s*\d+/.test(toAsciiDigits(stripped));
      const passThrough = ['scholar', 'crisis', 'refusal', 'unsupported', 'feedback', 'help', 'about', 'greeting', 'thanks'].includes(base.kind);
      if (badRef || passThrough) return base;
      return this.reply('help', 'general', lang, MSG.explainWhich[lang]);
    }
    const shown = base.ayahs.slice(0, EXPLAIN_MAX_AYAHS);
    const wantEn = asked.search(REQ_EN), wantBn = asked.search(REQ_BN);
    const noteLang: 'en' | 'bn' = wantBn >= 0 && (wantEn < 0 || wantBn > wantEn) ? 'bn' : wantEn >= 0 ? 'en' : lang === 'bn' ? 'bn' : 'en';
    const other: 'en' | 'bn' = noteLang === 'bn' ? 'en' : 'bn';
    const source = noteLang === 'bn' ? NOTE_SOURCE.bn : NOTE_SOURCE.en;
    const notes = shown.flatMap(({ s, a }) => { const text = this.quran.note(noteLang, s, a); return text ? [{ s, a, text, source }] : []; });
    const parts: string[] = [];
    if (work) parts.push(MSG.noTafsirWork(work.trim())[lang]);
    if (notes.length > 0) parts.push(MSG.explainIntro(source)[lang]);
    else {
      parts.push(MSG.noNote[lang]);
      if (shown.some(({ s, a }) => this.quran.note(other, s, a))) parts.push(MSG.noteOtherLang(other)[lang]);
    }
    if (base.ayahs.length > shown.length) parts.push(MSG.explainFirst(shown.length)[lang]);
    return this.reply('explain', 'quran', lang, parts.join(' '), { ayahs: shown, notes, translation: noteLang, rawTranslation: notes.length > 0 });
  }

  /** The answer to a question, with the translation the person asked for (and a note if they asked for a transliteration). */
  ask(question: string, history: HistoryTurn[] = []): Reply {
    EXPLAIN.lastIndex = 0;
    if (EXPLAIN.test(question)) { EXPLAIN.lastIndex = 0; return this.explain(question, history); }
    const r = this.core(question, history);
    if (r.ayahs.length > 0) {
      const lower = toAsciiDigits(question).toLowerCase();
      if (REQ_NONE.test(lower)) r.translation = 'none';
      else {
        const bn = lower.search(REQ_BN), en = lower.search(REQ_EN);
        if (bn >= 0 && (en < 0 || bn > en)) r.translation = 'bn';
        else if (en >= 0) r.translation = 'en';
      }
      if (TRANSLIT.test(lower)) r.answer += ' ' + MSG.noTranslit[r.lang];
    }
    return r;
  }

  private story(text: string, lower: string): Story | null {
    const trigger = STORY_TRIGGER.test(lower);
    const latin = wordsEn(text);
    const flat = lower.replace(/-/g, ' ');
    for (const st of STORIES) {
      if (!trigger && !st.alone) continue;
      for (const name of st.names) {
        const n = name.toLowerCase();
        if (/^[a-z]+$/.test(n)) { if (latin.includes(n)) return st; }
        else if (/^[a-z -]+$/.test(n)) { if (flat.includes(n.replace(/-/g, ' '))) return st; }
        else if (/[\u0980-\u09FF]/.test(n)) { if (new RegExp(`(?<![\\u0980-\\u09FF])${n}`).test(text)) return st; }
        else if (normAr(text).includes(normAr(name))) return st;
      }
    }
    // another spelling of a name (Yousef -> Yusuf): never for a real English word, and never for "quran" (its consonants are Qarun's)
    if (trigger) {
      for (const w of latin) {
        if (w.length < 5 || this.isEnglish(w) || NO_TOPIC_WORDS.has(w)) continue;
        for (const st of STORIES) for (const n of st.names) if (/^[a-z]{5,}$/.test(n) && editDistance(w, n) === 1) return st;
      }
    }
    return null;
  }

  private core(question: string, history: HistoryTurn[]): Reply {
    const q = question.trim();
    const lang = detectLanguage(q);
    const text = toAsciiDigits(q);
    const lower = text.toLowerCase();
    const words = wordCount(q);

    // 1. safety first
    if (anyMatch(CRISIS, lower)) return this.reply('crisis', 'general', lang, MSG.crisis[lang]);
    if (anyMatch(MADE_UP, lower)) return this.reply('refusal', 'quran', lang, MSG.refuseMadeUp[lang], { notFound: true });
    if (anyMatch(FATWA, lower) || anyMatch(FATWA_MORE, lower)) return this.reply('scholar', 'quran', lang, MSG.scholar[lang], { notFound: true });
    if (HADITH.test(lower)) return this.reply('scholar', 'quran', lang, MSG.noHadith[lang], { notFound: true });
    if (SENSITIVE.test(lower)) return this.reply('scholar', 'quran', lang, MSG.sensitive[lang], { notFound: true });

    // 2. small talk and things this assistant cannot do (short messages only, so a real question is never taken for them)
    if (words <= 5 && THANKS.test(lower)) return this.reply('thanks', 'general', lang, MSG.thanks[lang]);
    if (words <= 5 && WISHES.test(lower)) return this.reply('greeting', 'general', lang, MSG.wishes[lang]);
    if (words <= 6 && ABOUT.test(lower)) return this.reply('about', 'general', lang, MSG.about[lang]);
    if (words <= 9 && HELP.test(lower)) return this.reply('help', 'general', lang, MSG.help[lang]);
    if (words <= 8 && FEEDBACK.test(lower)) return this.reply('feedback', 'general', lang, MSG.feedback[lang]);
    if (anyMatch(UNSUPPORTED, lower)) return this.reply('unsupported', 'general', lang, MSG.cannotDo[lang]);
    if (words <= 4 && (GREETING.test(lower) || BN_GREETING.test(lower))) return this.reply('greeting', 'general', lang, MSG.greeting[lang]);

    // 3. numbers and facts
    const stat = this.numbers(text, lang);
    if (stat) return stat;

    // 4. an ayah reference, a famous passage by its name, the ayah of the day
    if (AYAH_OF_DAY.test(text)) {
      const list = GENERAL_AYAHS;
      const pick = /random|র‍্যান্ডম|عشوائية/i.test(lower)
        ? list[Math.floor(Math.random() * list.length)]
        : list[Math.floor(this.now() / 86_400_000) % list.length];
      return this.reply('noTopic', 'quran', lang, MSG.dayIntro[lang], { ayahs: [{ s: pick[0], a: pick[1] }] });
    }
    if (AYATUL_KURSI.test(text) || isAyatulKursi(text)) return this.reply('ref', 'quran', lang, MSG.refIntro('2:255')[lang], { ayahs: [{ s: 2, a: 255 }] });
    for (const p of PASSAGES) {
      if (!p.re.test(text)) continue;
      const list = p.refs ? p.refs.map(([s, a]) => ({ s, a })) : (p.surahs ?? []).flatMap((s) => this.quran.surah(s).map((y) => ({ s, a: y.a })));
      const label = p.refs ? refLabel(list) : (p.surahs ?? []).map((s) => this.quran.chapters[s - 1].tr).join(DOMAIN_JOIN(lang));
      return this.reply('ref', 'quran', lang, MSG.passageIntro(p.name[lang], label)[lang], { ayahs: list });
    }
    const m = text.match(REF);
    const m2 = text.match(REF_WORDS);
    const ref = m ? [Number(m[1]), Number(m[2]), m[3] ? Number(m[3]) : Number(m[2])] : m2 ? [Number(m2[1]), Number(m2[2]), Number(m2[2])] : null;
    if (ref) {
      const [s, from, to] = ref;
      if (s >= 1 && s <= 114 && from >= 1 && from <= this.quran.chapters[s - 1].n && to >= from) {
        const list = this.range(s, from, Math.min(to, this.quran.chapters[s - 1].n));
        return this.reply('ref', 'quran', lang, MSG.refIntro(refLabel(list))[lang], { ayahs: list });
      }
      return this.reply('notFound', 'quran', lang, MSG.notFound[lang], { notFound: true });
    }

    // a page of the mushaf: "page 50"
    const pm = text.match(PAGE_NO);
    const pageNo = pm ? Number(pm.slice(1).find((x) => x !== undefined)) : 0;
    if (pageNo >= 1 && pageNo <= 604) {
      const [ps, pa] = this.quran.pages[pageNo - 1];
      const list = this.range(ps, pa, this.quran.chapters[ps - 1].n);
      return this.reply('ref', 'quran', lang, MSG.pageIntro(pageNo, `${ps}:${pa}`, list.length)[lang], { ayahs: list });
    }

    // a juz (para): "para 3", "3 নং পারা", "Bakara 3 para", "Amma para"
    const named = JUZ_NAMED.find(([re]) => re.test(text));
    const jm = text.match(JUZ);
    const juzNo = named ? named[1] : jm ? Number(jm.slice(1).find((x) => x !== undefined)) : 0;
    if (juzNo >= 1 && juzNo <= 30) {
      const [js, ja] = this.quran.juz[juzNo - 1];
      const list = this.range(js, ja, this.quran.chapters[js - 1].n);
      return this.reply('juz', 'quran', lang, MSG.juzIntro(juzNo, `${js}:${ja}`, list.length)[lang], { ayahs: list });
    }

    // "the first ayah of the Quran"
    if (FIRST_LAST.test(lower)) {
      const last = /\b(last)\b|শেষ|آخر/i.test(lower);
      const a = last ? { s: 114, a: 6 } : { s: 1, a: 1 };
      return this.reply('ref', 'quran', lang, MSG.refIntro(`${a.s}:${a.a}`)[lang], { ayahs: [a] });
    }

    // 5. a surah, by name or by number: all of it, a part of it, or one ayah ("ayat 255 of surah baqarah")
    let surah = this.surahOf(text);
    // "sincerity ikhlas": a bare name that is also a theme word, with a real topic word next to it, is the topic
    if (surah && words >= 2 && !SURAH_WORD_RE.test(text) && !/سورة|সূরা/.test(text) && !surahNumber(text) && matchThemes(text, this.isEnglish).ayahs.length > 0) surah = null;
    if (surah) {
      const c = this.quran.chapters[surah - 1];
      const part = this.part(text, lower, surah);
      if (part) return this.reply('ref', 'quran', lang, MSG.partIntro(c.tr, part.label)[lang], { ayahs: part.list });
      const an = text.match(AYAH_NUMBER);
      const ayahNo = an ? Number(an[1] ?? an[2]) : 0;
      if (ayahNo >= 1 && ayahNo <= c.n) {
        return this.reply('ref', 'quran', lang, MSG.refIntro(`${surah}:${ayahNo}`)[lang], { ayahs: [{ s: surah, a: ayahNo }] });
      }
      const list = this.range(surah, 1, c.n);
      return this.reply('surah', 'quran', lang, MSG.surahIntro(c.tr, list.length, c.n, surah)[lang], { ayahs: list });
    }

    // 6. "what is the meaning?" after earlier ayahs
    if (words <= 6 && FOLLOW_UP.test(lower)) {
      const last = [...history].reverse().find((h) => h.citations?.length > 0);
      if (last) {
        const list = last.citations.slice(0, MAX_RANGE).map((c) => ({ s: c.surah, a: c.ayah }));
        return this.reply('followup', 'quran', lang, MSG.followUpIntro[lang], { ayahs: list, translation: 'bn' });
      }
      return this.reply('notFound', 'quran', lang, MSG.followUpNone[lang], { notFound: true });
    }

    // 7. "which ayah is this?": the words the person wrote are in an ayah, word for word
    const phrase = this.phrases.find(text);
    if (phrase) return this.reply('search', 'quran', lang, MSG.phraseIntro[lang], { ayahs: phrase });

    // 8. the story of a prophet or another person
    const story = this.story(text, lower);
    if (story) {
      const list = story.ayahs.map(([s, a]) => ({ s, a }));
      return this.reply('story', 'quran', lang, MSG.storyIntro(story.id, refLabel(list))[lang], { ayahs: list });
    }

    // from here on a spelling mistake in an English word is corrected ("patince" -> "patience")
    const fixed = this.fix(text);

    // 9. checked themes
    const themed = matchThemes(fixed, this.isEnglish);
    if (themed.ayahs.length > 0) {
      const label = [...new Set(themed.themes.map((t) => THEME_LABEL[t.id]?.[lang] ?? t.id))].join(DOMAIN_JOIN(lang));
      return this.reply('theme', 'quran', lang, MSG.themeIntro(label)[lang], { ayahs: themed.ayahs.map((x) => ({ s: x.s, a: x.a })) });
    }

    // 10. "give me something from the Quran"
    const toks = fixed.toLowerCase().split(/[^\p{L}\p{M}]+/u).filter(Boolean);
    if (toks.length > 0 && toks.every((w) => NO_TOPIC_WORDS.has(w))) {
      const picks = [...GENERAL_AYAHS].sort(() => Math.random() - 0.5).slice(0, 3);
      return this.reply('noTopic', 'quran', lang, MSG.noTopicIntro[lang], { ayahs: picks.map(([s, a]) => ({ s, a })) });
    }

    // a longer greeting that has no question in it ("assalamu alaikum, apni kemon achen?")
    if (words <= 8 && (GREETING.test(lower) || BN_GREETING.test(lower))) return this.reply('greeting', 'general', lang, MSG.greeting[lang]);

    // 11. search the text
    const found = searchAyahs(this.index, this.quran, fixed);
    if (found.length > 0) {
      return this.reply('search', 'quran', lang, MSG.searchIntro[lang], { ayahs: found.map((f) => ({ s: f.ayah.s, a: f.ayah.a })) });
    }
    return this.reply('notFound', 'quran', lang, MSG.notFound[lang], { notFound: true });
  }

  // computed once, when first needed
  private longest: { s: number; a: number; words: number } | null = null;
  private totals: { words: number; letters: number } | null = null;

  /** Questions that ask for a number, a list or a fact about the Quran or a surah. Returns null if this is not one. */
  private numbers(text: string, lang: Lang): Reply | null {
    const q = this.quran;
    const surah = this.surahOf(text);
    const t = (line: string, answer: string, extra: Partial<Reply> = {}) => this.reply('data', 'data', lang, answer, { data: [line], ...extra });
    const names = (ids: number[]) => ids.map((i) => `${i} ${q.chapters[i - 1].tr}`).join(', ');

    if (JUZ_COUNT.test(text)) return t('The Quran has 30 juz (para).', STAT_TEXT.juzCount[lang]);
    if (PAGES.test(text)) return t(`The Quran has ${q.pages.length} pages in the Madani mushaf (Tanzil data).`, STAT_TEXT.pages(q.pages.length)[lang]);
    if (HIZB.test(text)) return t(`The Quran has ${q.hizbs.length / 4} hizb (${q.hizbs.length} quarters).`, STAT_TEXT.hizb(q.hizbs.length / 4, q.hizbs.length)[lang]);
    if (WORDS_IN_QURAN.test(text) && !HOW_OFTEN.test(text)) {
      if (!this.totals) {
        let w = 0, l = 0;
        for (const y of q.ayahs) { w += y.arc.split(/\s+/).filter(Boolean).length; l += y.arc.replace(/\s/g, '').length; }
        this.totals = { words: w, letters: l };
      }
      const { words, letters } = this.totals;
      return t(`Arabic text (Tanzil simple-clean): ${words} words, ${letters} letters.`, STAT_TEXT.wordCount(words, letters)[lang]);
    }
    if (LONGEST_AYAH.test(text)) {
      if (!this.longest) {
        let best = q.ayahs[0];
        for (const y of q.ayahs) if (y.arc.length > best.arc.length) best = y;
        this.longest = { s: best.s, a: best.a, words: best.arc.split(/\s+/).filter(Boolean).length };
      }
      const l = this.longest;
      return t(`Longest ayah: ${l.s}:${l.a}, ${l.words} words.`, STAT_TEXT.longestAyah(`${l.s}:${l.a}`, l.words)[lang], { ayahs: [{ s: l.s, a: l.a }] });
    }
    if (SAJDA.test(text)) {
      const list = q.sajdas.map(([s, a]) => ({ s, a }));
      if (HOW_MANY.test(text) && !LIST_WORD.test(text)) return t(`${q.sajdas.length} sajdah ayahs: ${refLabel(list)}.`, STAT_TEXT.sajdaCount(q.sajdas.length)[lang]);
      return this.reply('ref', 'quran', lang, STAT_TEXT.sajdaList[lang], { ayahs: list });
    }
    if (LIST_SURAHS.test(text)) {
      const all = q.chapters.map((c) => c.id);
      return t(`${q.chapters.length} surahs: ${names(all)}.`, STAT_TEXT.surahList(all.length, names(all))[lang]);
    }
    if (REVEL.test(text) && LIST_WORD.test(text) && !HOW_MANY.test(text) && !surah) {
      const type = /\b(medinan|madinan|madani)\b|মাদানী|মাদানি|مدني|مدنية/i.test(text) && !/\b(meccan|makkan|makki)\b|মক্কী|مكي|مكية/i.test(text) ? 'medinan' : 'meccan';
      const ids = q.chapters.filter((c) => c.type === type).map((c) => c.id);
      return t(`${ids.length} ${type} surahs: ${names(ids)}.`, STAT_TEXT.typeList(type, ids.length, names(ids))[lang]);
    }
    // the surah before or after another
    if (surah && (SURAH_WORD_RE.test(text) || /সূরা/.test(text)) && (NEIGHBOR_AFTER.test(text) || NEIGHBOR_BEFORE.test(text)) && !HOW_MANY.test(text)) {
      const dir = NEIGHBOR_BEFORE.test(text) && !NEIGHBOR_AFTER.test(text) ? 'before' : 'after';
      const other = dir === 'after' ? surah + 1 : surah - 1;
      const me = q.chapters[surah - 1].tr;
      if (other < 1 || other > 114) return t(`${dir === 'after' ? 'Last' : 'First'} surah: ${surah} ${me}.`, STAT_TEXT.noNeighbor(me, dir)[lang]);
      const o = q.chapters[other - 1];
      return t(`${dir === 'after' ? 'After' : 'Before'} surah ${surah} ${me}: surah ${other} ${o.tr}.`, STAT_TEXT.neighbor(me, dir, o.tr, other)[lang]);
    }
    // how many ayahs in a juz
    if (HOW_MANY.test(text) && AYAH_WORD.test(text)) {
      const jm = text.match(JUZ);
      const n = jm ? Number(jm.slice(1).find((x) => x !== undefined)) : 0;
      if (n >= 1 && n <= 30) {
        const [s0, a0] = q.juz[n - 1];
        const [s1, a1] = n < 30 ? q.juz[n] : [115, 1];
        const count = q.ayahs.filter((y) => (y.s > s0 || (y.s === s0 && y.a >= a0)) && (y.s < s1 || (y.s === s1 && y.a < a1))).length;
        return t(`Juz ${n}: ${count} ayahs (from ${s0}:${a0}).`, STAT_TEXT.juzAyahs(n, count)[lang]);
      }
    }

    if (JUZ_COUNT.test(text)) return t('The Quran has 30 juz (para).', STAT_TEXT.juzCount[lang]);
    if (HOW_OFTEN.test(text)) {
      const w = extractWord(text);
      if (!w) return this.reply('data', 'data', lang, MSG.dataNotUnderstood[lang]);
      const r = countWord(q, w.word, w.lang);
      const src = w.lang === 'en' ? 'Saheeh International' : w.lang === 'ar' ? 'Arabic text' : 'Bengali translation';
      return t(r.line, STAT_TEXT.word(w.word, r.total, r.ayahs, src)[lang]);
    }
    // facts about ONE surah: Meccan or Medinan, which para, what its name means
    if (surah && SURAH_FACTS.test(text) && !(HOW_MANY.test(text) && AYAH_WORD.test(text))) {
      const c = q.chapters[surah - 1];
      const juz = this.juzOf(surah, 1);
      const type = STAT_TEXT.type(c.type)[lang];
      const line = `Surah ${surah}: ${c.tr} (${c.ar}), "${c.en}", ${c.n} ayahs, ${c.type === 'meccan' ? 'Meccan' : 'Medinan'}; begins in juz ${juz}.`;
      return t(line, STAT_TEXT.surahFacts(c.tr, surah, c.en, c.n, type, juz)[lang]);
    }
    if (REVEL.test(text) && (HOW_MANY.test(text) || SURAH_WORD_RE.test(text))) {
      const r = revelationCounts(q);
      const ma = q.chapters.filter((c) => c.type === 'meccan').reduce((a, c) => a + c.n, 0);
      const da = q.chapters.filter((c) => c.type === 'medinan').reduce((a, c) => a + c.n, 0);
      return t(r.line, STAT_TEXT.revelation(r.meccan, r.medinan, ma, da)[lang]);
    }
    if ((MOST.test(text) || FEWEST.test(text)) && (AYAH_WORD.test(text) || SURAH_WORD_RE.test(text))) {
      const which = FEWEST.test(text) && !MOST.test(text) ? 'fewest' : 'most';
      const r = extremeSurahs(q, which);
      const nm = r.ids.map((i) => q.chapters[i - 1].tr).join(', ');
      return t(r.line, STAT_TEXT.extreme(which, nm, r.value)[lang]);
    }
    if (HOW_MANY.test(text) && AYAH_WORD.test(text) && surah) {
      const s = surahInfo(q, surah);
      const c = q.chapters[surah - 1];
      return t(s.line, STAT_TEXT.surahCount(c.tr, c.n, STAT_TEXT.type(c.type)[lang])[lang]);
    }
    if (HOW_MANY.test(text) && (AYAH_WORD.test(text) || SURAH_WORD_RE.test(text)) && !surah) {
      const s = totals(q);
      return t(s.line, STAT_TEXT.totals(q.chapters.length, q.ayahs.length)[lang]);
    }
    return null;
  }
}

export { THEMES };
