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
import { MSG, STAT_TEXT, SUGGEST, THEME_LABEL } from './templates.js';
import { americanize, normEn, normAr, normBn, tokensAr, tokensEn, wordsBn, wordsEn } from './text.js';
import { lookupGlossary } from './glossary.js';
import { animalKindsIn, animalsIn, withoutSurahName, type AnimalKind } from './animals.js';
import { isAllahForm, tiedTop, wordFrequency } from './wordfreq.js';
import { prophetsIn, prophetsNamedIn } from './prophets.js';
import type { Lang } from './types.js';
import { detectLanguage } from './language.js';
import { conversation, type Conversation } from './conversation.js';

export type Kind =
  | 'greeting' | 'thanks' | 'about' | 'scholar' | 'refusal' | 'crisis'
  | 'theme' | 'surah' | 'ref' | 'juz' | 'story' | 'explain' | 'search' | 'noTopic' | 'followup' | 'data' | 'help' | 'unsupported' | 'feedback' | 'notFound'
  | 'chat' | 'terms';

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
  /** Tappable next questions, in the language of the reply (every one is a question this engine answers). */
  suggestions?: string[];
  /** A page of this site to open (the Terms page, for "what is this?" and "what are your terms?"). */
  link?: { href: string; label: string };
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
const ASBAB = /\b(?:asbab(?:\s*al[-\s]*nuzul)?|shane\s*nuzul|shan[- ]e[- ]nuzul|reasons?\s+(?:of|for)\s+(?:the\s+)?revelation|historical\s+(?:reason|cause|occasion|context)\s+(?:of|for)\s+(?:the\s+)?revelation|why\s+(?:was\s+)?[^.!?\n]{0,45}\brevealed\b)\b|শানে\s*নুযূল|শানে\s*নুজুল|আসবাব(?:ুন|ু)\s*নুযূল|আসবাব(?:ুন|ু)\s*নুজুল|(?:নাজিলের|নাযিলের|অবতরণের)\s*(?:কারণ|ঐতিহাসিক\s*কারণ|পেছনের\s*ঘটনা|পটভূমি)|কেন\s*(?:নাজিল|নাযিল|অবতীর্ণ)\s*(?:হয়েছে|হয়েছিল|হয়)|(?:naziler|najiler|obotoroner)\s*karon|keno\s*(?:nazil|najil)\s*(?:hoyeche|hoyechilo|hoise|holo)|أسباب\s*النزول|سبب\s*(?:نزول|النزول)|لماذا\s*نزل(?:ت)?/i;
const HADITH = /\b(hadith|hadis|hadees|fazilat|fazilah|fazail|virtues? of|sawab|thawab|reward for (?:reading|reciting)|heart of the (?:quran|koran)|greatest (?:surah|ayah|verse)|best (?:surah|ayah|verse)|most rewarding|who is (?:better|best|greater|greatest|superior|more virtuous)|benefits? of (?:reading|reciting|listening))\b|(?:important|best|greatest|top|most important) (?:surah|ayah|ayat|verse)|(?:surah|ayah|ayat)\s+(?:is|er)?\s*(?:the\s+)?(?:most\s+)?(?:important|best|greatest)|(?:ইম্পর্টেন্ট|ইমপর্টেন্ট|ইম্পরট্যান্ট|গুরুত্বপূর্ণ|শ্রেষ্ঠ|সেরা|সবচেয়ে ভালো|সবচেয়ে উত্তম).{0,14}(?:সূরা|আয়াত)|(?:সূরা|আয়াত).{0,14}(?:ইম্পর্টেন্ট|ইমপর্টেন্ট|গুরুত্বপূর্ণ|শ্রেষ্ঠ|সেরা)|\b(?:shreshtho|sreshtho|shera|sera)\s+(?:surah|ayat)|হাদীস|হাদিস|ফজিলত|ফযীলত|সওয়াব|ছওয়াব|সাওয়াব|حديث|فضل سورة/i;
const PERSONAL_GUIDANCE = /\bwhat\s+(?:does\s+)?(?:allah|god)\s+wants?\s+(?:me|us)\s+to\s+do\b|\b(?:tell|show)\s+me\s+what\s+to\s+do\s+(?:about|in)\s+my\s+(?:personal|life|situation)\b|\bmy\s+personal\s+situation\b/i;
const NO_FATWA = /\b(?:without|no|not|don'?t|do\s+not)\s+(?:giving|give|issuing|issue|making|make|any)?\s*(?:a\s+)?(?:fatwa|fatawa|ruling|legal\s+ruling)\b|ফতোয়া\s*(?:দেবেন\s*না|দিবেন\s*না|দেবে\s*না|দিও\s*না|ছাড়া|ব্যতীত)|(?:fatwa|hukum|raay)\s*(?:dio\s*na|diben\s*na|deben\s*na|chara)/i;
const VERSE_ASK = /\b(?:show|give|find|list|verses?|ayahs?|ayats?)\b|আয়াত|দেখান|দেখাও|দাও|দিন/i;
const WISHES = /\b(eid\s*mubarak|ramadan\s*mubarak|ramzan\s*mubarak|jumma\s*mubarak|jumuah\s*mubarak|jumu'?ah\s*mubarak)\b|ঈদ\s*মোবারক|ঈদ\s*মুবারক|রমজান\s*মোবারক|রমযান\s*মুবারক|জুমা\s*মোবারক|عيد مبارك|رمضان مبارك|جمعة مباركة/i;
// Topics that need context and knowledge of Islamic law: no ayahs are picked out for them.
const SENSITIVE = /\b(jihad|jihaad|terror|terrorism|terrorist|terrorists|war|wars|apostasy|apostate|blasphemy|slavery|slaves?|infidels?|kuffar|kafirs?|kafir|stoning|flogging|amputat\w*|hudud|thief|theft|steal(?:ing)?|beheading|honou?r killing)\b|(?<![\u0980-\u09FF])(?:জিহাদ|যুদ্ধ|সন্ত্রাস|দাসত্ব|ক্রীতদাস|কাফির(?![ুূ]ন)|কাফের(?![ুূ]ন)|মুরতাদ|হুদুদ|চুরি|হাত কাটা|পাথর মেরে)|جهاد|إرهاب|ردة|(?<!سور[ةه]\s*ال)كافر|حد السرقة/i;
// (the surah name Al-Kafirun is not that topic: "সূরা কাফিরুন", "سورة الكافرون")
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
// "what is this chatbot about?", "what's this?", "tell me about yourself", "tumi k?", "eta ki", "এটা কী?", "এই চ্যাটবটটি কী নিয়ে?"
const ABOUT_MORE = /^\s*(?:what(?:'s|\s+is)|whats|wats)\s+(?:this|that)(?:\s+(?:chat\s*bot|chatbot|bot|app|application|assistant|site|website|web\s*site|page|tool|thing))?(?:\s+(?:about|for|all\s+about))?\s*[?!.]*$|^\s*(?:tell\s+me\s+)?about\s+(?:this|the)\s+(?:chat\s*bot|chatbot|bot|app|assistant|site|website)\b|\btell\s+me\s+about\s+(?:yourself|this\s+(?:chat\s*bot|chatbot|bot|app|assistant|site|website))\b|\bwhat\s+is\s+(?:the\s+)?quran\s+assistant\b|^\s*(?:tumi|apni|tui)\s+(?:k|ke)\s*[?!.]*$|^\s*(?:eta|eita|eti)\s+(?:ki|kisher|kiser)(?:\s+(?:app|chatbot|bot))?\s*[?!.]*$|(?:এটা|এটি|এই\s*(?:চ্যাটবট|চ্যাটবটটি|অ্যাপ|অ্যাপটি|সাইট|ওয়েবসাইট))\s*(?:কী|কি|কিসের|কীসের)|(?:চ্যাটবটটি|চ্যাটবট|অ্যাপটি)\s*(?:কী|কি)\s*(?:নিয়ে|সম্পর্কে)|^\s*(?:তুমি|আপনি)\s*(?:কে)\s*[?!।]*$|ما\s*هذا|ما\s*هذه|عن\s*ماذا\s*(?:هذا|هذه)/i;
// "what are your terms?", "privacy policy", "do you store my questions?", "তোমার শর্তাবলী কী?", "الشروط"
const TERMS_Q = /\bterms\s*(?:and|&)\s*conditions?\b|\bterms\s+of\s+(?:use|service)\b|^\s*(?:the\s+|your\s+)?terms\s*[?!.]*$|\b(?:your|ur|the\s+app'?s?|this\s+(?:app|bot|chatbot|site)'?s?)\s+terms\b|\bprivacy(?:\s+policy)?\b|\bdisclaimer\b|\b(?:do|will|did|does)\s+(?:you|u|this\s+(?:app|bot|chatbot|site))\s+(?:store|save|keep|record|log|collect|share|sell|track)\b|\b(?:is|are)\s+my\s+(?:data|questions?|chats?|messages?|voice|information|info)\s+(?:safe|private|saved|stored|recorded)\b|(?:তোমার|আপনার|এই\s*\S+|ব্যবহারের)\s*শর্তাবলী|গোপনীয়তা|প্রাইভেসি|আমার\s*(?:প্রশ্ন|তথ্য|ডেটা).{0,20}(?:সংরক্ষণ|রাখ|সেভ|জমা)|الشروط|الخصوصيه|الخصوصية|بياناتي/i;

// Talking to the assistant itself. Never used when the question has anything about the Quran in it (QURAN_WORD):
// "whenever I ask something from the Quran, it should answer from the Quran".
const QURAN_WORD = /\b(?:quran|koran|qur'?an|quraan|ayahs?|ayats?|ayat|verses?|surahs?|suras?|allah|god|lord|prophets?|nabi|rasul|messenger|dua|tafsir|juz|para)\b|কুরআন|কোরআন|আয়াত|সূরা|আল্লাহ|নবী|রাসূল|দোয়া|قران|القران|ايه|سوره|الله|النبي|دعاء/i;
// "what is your name?", "tomar nam ki", "তোমার নাম কী?", "ما اسمك؟"
const CHAT_NAME = /\b(?:your|ur|yo)\s+(?:good\s+)?name\b|\bwhat\s+(?:should|do|can|shall)\s+(?:i|we)\s+call\s+(?:you|u)\b|\bname\s+of\s+(?:this|the)\s+(?:bot|assistant|app|chatbot)\b|(?:তোমার|আপনার|তোর)\s*নাম|\b(?:tomar|apnar|tor)\s+(?:nam|naam)\b|اسمك/i;
// "are you a muslim?", "how old are you", "do you pray?", "your favourite colour", "তুমি কি মুসলিম?", "هل أنت مسلم؟"
const CHAT_PERSONAL = /^\s*(?:are|r)\s+(?:you|u)\s+(?:a\s+|an\s+)?(?:muslim|christian|hindu|jew|believer|human|person|alive|real|male|female|man|woman|boy|girl|married|happy|sad|ok|okay|fine|religious)\b|^\s*do\s+(?:you|u)\s+(?:pray|believe|fast|love|like|feel|sleep|eat|dream|know me|remember me|have feelings)\b|\bhow\s+old\s+(?:are|r)\s+(?:you|u)\b|\bwhere\s+(?:are|do)\s+(?:you|u)\s+(?:from|live)\b|^\s*(?:what(?:'s|\s+is|\s+are)?|whats|tell\s+me|which\s+is)\s+(?:your|ur)\s+(?:age|religion|faith|gender|feelings?|favou?rite\w*|hobby|hobbies|birthday|job|work|purpose)\b|(?:তুমি|আপনি)\s*কি\s*(?:মুসলিম|মুসলমান|মানুষ|জীবিত|ছেলে|মেয়ে|বিবাহিত|নামাজ)|(?:তোমার|আপনার)\s*(?:বয়স|ধর্ম|প্রিয়)|\b(?:tumi|apni)\s+ki\s+(?:muslim|musolman|manush|jibito)\b|\b(?:tomar|apnar)\s+(?:boyos|boyosh|dhormo|priyo)\b|هل\s*(?:انت|أنت)\s*(?:مسلم|انسان|إنسان|حي)|كم\s*عمرك|من\s*(?:اين|أين)\s*(?:انت|أنت)|هل\s*تصلي/i;
// "you are very helpful", "i love you", "good bot", "তুমি খুব ভালো", "أحبك": the WHOLE message (so "you are the best nation",
// the words of 3:110, is not taken for praise)
const CHAT_PRAISE = /^\s*(?:i\s+)?love\s+(?:you|u)(?:\s+(?:so\s+much|a\s+lot|bot))?[\s!.]*$|^\s*(?:you|u|ur)(?:'re|\s+are|\s+r)?\s+(?:so\s+|very\s+|really\s+|too\s+)?(?:good|great|nice|smart|clever|awesome|amazing|helpful|cool|wonderful|brilliant|perfect|excellent)(?:\s+(?:bot|assistant|app))?[\s!.]*$|^\s*(?:good|great|nice)\s+(?:bot|job|work|answer)[\s!.]*$|^\s*well\s+done[\s!.]*$|(?:তুমি|আপনি)\s*(?:খুব|অনেক)?\s*(?:ভালো|ভাল|দারুণ|সুন্দর|চমৎকার)|(?:তোমাকে|আপনাকে)\s*ভালোবাসি|\b(?:tumi|apni)\s+(?:khub\s+|onek\s+)?(?:valo|bhalo|darun|sundor)\b|احبك|أحبك|(?:انت|أنت)\s*(?:رائع|ممتاز|جميل|ذكي)/i;
// "tell me a joke", "let's chat", "what do you think ...": not something this assistant does
const CHAT_OTHER = /^\s*(?:tell|say|give)\s+(?:me\s+|us\s+)?(?:a\s+|some\s+|another\s+)?jokes?\b|^\s*(?:a\s+)?jokes?\s*(?:please|pls)?[\s!?.]*$|\bsing\b.{0,15}\bsong\b|\bplay\s+(?:a\s+)?game\b|\blet'?s\s+(?:chat|talk)\b|\bchat\s+with\s+me\b|\bi(?:'m|\s+am)\s+bored\b|\bwhat\s+(?:do|can)\s+(?:you|u)\s+think\b|\byour\s+opinion\b|কৌতুক|জোকস|গল্প কর|\bjokes?\s+bolo\b|نكته|نكتة|لنتحدث/i;
// any other request or question put to the assistant ("can you dance?", "what is your job?"), checked just before the search.
// Not "do you / did you / have you / are you ...": the Quran itself asks people that ("did you think We created you in vain?").
const CHAT_TO_YOU = /^\s*(?:can|could|will|would)\s+(?:you|u)\b|^\s*(?:what|who|where|when|why|how)(?:'s|\s+is|\s+are|\s+was|\s+do|\s+does|\s+did)?\s+(?:your|ur)\b|\byourself\b|^\s*(?:tumi|apni|tomar|apnar)\b|^\s*(?:তুমি|আপনি|তোমার|আপনার)|(?:^|\s)(?:انت|أنت)(?:\s|$)/i;

const TRANSLIT =/\btransliterat\w*|\bromani[sz]ed\b|\broman letters\b|\benglish letters\b|উচ্চারণ|النطق/i;
// Which translation does the person want?
const REQ_BN = /\b(?:in|into)\s+(?:bangla|bengali)\b|\b(?:bangla|bengali)\s+(?:translation|onubad|e|te|ay)\b|\bbanglay\b|\bbangla\b|বাংলা/i;
const REQ_EN = /\b(?:in|into)\s+english\b|\benglish\s+(?:translation|e|te|ay|version)\b|\benglish\b|ইংরেজি|ইংরেজী|ইংলিশ/i;
const REQ_NONE = /\b(?:only|just)\s+arabic\b|\barabic\s+only\b|\bwithout\s+(?:the\s+)?translation\b|\bno\s+translation\b|শুধু\s*আরবি|আরবি\s*শুধু|অনুবাদ ছাড়া|بدون ترجمة|العربية فقط/i;
const STORY_TRIGGER = /\b(?:story|stories|tale|about|who (?:is|was)|life of|history of|kahini|kahinir|kahani|kahanir|ghotona|ghotonar|gotona|gotonar|qissa|qisas)\b|কাহিনী|কাহিনি|ঘটনা|জীবনী|সম্পর্কে|সম্বন্ধে|বিষয়ে|কে ছিলেন|قصة|قصص/i;
const ONE_BY_ONE = /\b(?:one\s+(?:ayah|ayat|verse)\s+at\s+a\s+time|ayah\s+by\s+ayah|verse\s+by\s+verse|one\s+by\s+one|ayat\s+ayat\s+kore)\b|একে\s*একে|একটা\s*একটা\s*করে|একটি\s*একটি\s*করে|আয়াত\s*আয়াত\s*করে|آية\s*بآية|آية\s*آية/i;
const REF_ONLY = /\b(?:references?|refs?)\s+only\b|\bonly\s+(?:the\s+)?(?:surah\s+and\s+)?(?:verse|ayah)?\s*references?\b|শুধু\s*রেফারেন্স/i;
const AYAH_OF_DAY = /\b(?:ayah|ayat|verse|aya)\b.{0,15}\b(?:of the day|for today|today|daily)\b|\b(?:today'?s|daily|random)\s+(?:ayah|ayat|verse|aya)\b|আজকের আয়াত|প্রতিদিনের আয়াত|দৈনিক আয়াত|آية اليوم|آية عشوائية/i;
const LIST_SURAHS = /\b(?:list|names?|all)\b.{0,12}\b(?:surahs?|suras?)\b|\b(?:surahs?|suras?)\b.{0,10}\b(?:list|names?)\b|সূরার (?:তালিকা|নাম)|সব সূরার|সূরাগুলোর নাম|قائمة السور|أسماء السور/i;
const LIST_WORD = /\b(?:list|names?|which|name)\b|তালিকা|নাম|কোন কোন|قائمة|أسماء/i;
const NEIGHBOR_AFTER = /\b(?:after|next|following|porer|porey|parer)\b|পরের|পরে|بعد/i;
const NEIGHBOR_BEFORE = /\b(?:before|previous|preceding|agher|agey|ager)\b|আগের|আগে|قبل/i;
const LONGEST_AYAH = /\b(?:longest|biggest|largest)\s+(?:ayah|ayat|verse|aya)\b|সবচেয়ে (?:বড়|লম্বা|দীর্ঘ) আয়াত|أطول آية/i;
// every spelling of the word: sajda, sajdah, sajdas, sejda, sijda, sijhda, sijdar, shijda ... (not "sajadah", a prayer mat), and sujud
const SAJDA = /\b(?:s|sh)[aei][jz]h?d(?:a|ah|ar|as|ahs|e|er|ay)\b|\b(?:sujud|sujood|sujuud|prostrations?)\b|সিজদা|সেজদা|সিজদার|سجدة|آيات السجدة/i;
const PAGES = /\bhow many pages\b|কয়টি পৃষ্ঠা|কত পৃষ্ঠা|কয় পৃষ্ঠা|كم صفحة/i;
const PAGE_NO = /\bpage\s*(?:no\.?|number)?\s*(\d{1,3})\b|পৃষ্ঠা\s*(?:নং|নম্বর)?\s*(\d{1,3})|صفحة\s*(\d{1,3})/i;
const HIZB = /\bhow many hizb\b|কয়টি হিযব|কয়টি হিজব|كم حزب/i;
const WORDS_IN_QURAN = /\bhow many\s+(?:words|letters)\b|কয়টি শব্দ|কত শব্দ|কয়টি হরফ|كم كلمة|كم حرف/i;
// "explain 2:255", "tafsir of Ayat al-Kursi", "আয়াতুল কুরসির ব্যাখ্যা": show the translator's notes for the ayah.
const EXPLAIN = /\b(explain|explanation|explaining|elaborate|interpret|interpretation|commentary|tafsir|tafseer|tafsier|tafsiir)\b|ব্যাখ্যা|তাফসীর|তাফসির|শরহ|شرح|تفسير|توضيح/gi;
// "which surah talks about ...?", "kon surah te ...", "কোন সূরায় ...", "في أي سورة ...": the answer also names the surahs
const WHICH_SURAH = /\b(?:which|what)\s+(?:surahs?|suras?|chapters?)\b|\bin\s+which\s+(?:surahs?|suras?)\b|\bkon\s+(?:kon\s+)?(?:surah|sura|surat|shura)\w*|কোন\s*(?:কোন\s*)?(?:সূরা|সুরা)|(?:أي|اي)\s*(?:سورة|سوره)|ما\s*(?:السورة|السوره)/i;

// "what does this mean?", "what do these mean?": about the ayahs just shown, answered like "explain these" (the notes)
const MEANING_BACK = /^\s*what\s+(?:does|do|is|are)\s+(?:this|that|it|these|those)(?:\s+(?:ayah|ayat|verse|ayahs|verses|one|ones))?\s+means?\s*[?!.]*$|^\s*what\s+(?:is|are)\s+the\s+meanings?\s+of\s+(?:this|that|it|these|those)(?:\s+(?:ayah|ayat|verse|ayahs|verses))?\s*[?!.]*$/i;
// Words of "explain these / this / it" that only point back to what was shown (no target of their own)
const POINT_BACK = new Set([
  'can', 'could', 'would', 'will', 'you', 'me', 'us', 'please', 'pls', 'plz', 'the', 'these', 'this', 'those', 'them', 'it', 'that',
  'ayah', 'ayahs', 'ayat', 'aya', 'verse', 'verses', 'to', 'for', 'bit', 'little', 'more', 'again', 'briefly', 'ok', 'okay', 'now',
  'also', 'all', 'of', 'what', 'does', 'do', 'is', 'are', 'mean', 'means', 'meaning', 'tell', 'give', 'about', 'one', 'ones', 'above',
  'egulo', 'egular', 'eta', 'etar', 'eti', 'ei', 'amake', 'ektu', 'koro', 'korun', 'dao', 'din', 'den', 'to', 'er', 'ki', 'bolo', 'gulo',
  'এগুলো', 'এগুলোর', 'এগুলোকে', 'এটা', 'এটার', 'এটাকে', 'এটি', 'এটির', 'এই', 'সেগুলো', 'সেগুলোর', 'ওগুলো', 'ওগুলোর', 'আয়াত',
  'আয়াতগুলো', 'আয়াতগুলোর', 'আয়াতটি', 'আয়াতটির', 'আমাকে', 'একটু', 'আরেকটু', 'করো', 'করুন', 'কর', 'দাও', 'দিন', 'দেন', 'তো', 'এর',
  'কি', 'কী', 'বলো', 'বলুন',
  'هذه', 'هذا', 'هذي', 'لي', 'من', 'فضلك', 'الايات', 'الايه', 'ايه', 'ايات', 'ما', 'معني',
].map((w) => normAr(normBn(w))));

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
const HOW_MANY = /\b(how many|how much|number of|count|koyta|koyti|koyto|kotogulo|koto|kototi|kotota|kototo)\b|কয়টি|কয়টা|কতটি|কতগুলো|কতগুলি|কত|كم/i;
const HOW_OFTEN = /\b(how many times|how often|how frequently|koybar|kotobar|koto bar)\b|কতবার|কত বার|কতবারই|كم مرة|كم مره/i;
const AYAH_WORD = /\b(ayah|ayahs|ayat|verse|verses)\b|আয়াত|আয়াতে|آية|آيات|ايه/i;
const SURAH_WORD_RE = /\b(surah|surahs|sura|suras)\b|সূরা|সূরাতে|সূরায়|سورة|سور/i;
const MOST = /\b(most|longest|biggest|largest|maximum|sobcheye boro|sobcheye beshi)\b|সবচেয়ে বেশি|সবচেয়ে বড়|সর্বাধিক|সবচেয়ে লম্বা|أطول|أكثر/i;
const FEWEST = /\b(fewest|least|shortest|smallest|minimum|sobcheye choto|sobcheye kom)\b|সবচেয়ে কম|সবচেয়ে ছোট|সর্বনিম্ন|أقصر|أقل/i;
const REVEL = /\b(meccan|makkan|medinan|madinan|makki|madani)\b|মক্কী|মাদানী|মাক্কী|মাদানি|مكي|مدني|مكية|مدنية/i;

// "how many animals are mentioned in the Quran?", "which animals ...?", "কুরআনে কয়টি প্রাণীর নাম আছে?" (src/animals.ts)
const ANIMAL_WORD = /\b(?:animals?|prani|poshu|pashu|poshupakhi|jibjontu|jontu|janwar|janowar)\b|প্রাণী|পশুপাখি|পশু-পাখি|পশু|জীবজন্তু|জীব-জন্তু|জন্তু|حيوان/i;
const ANIMAL_ASK = /\b(?:which|what|list|names?|named|mention\w*|kinds?|types?|all|different)\b|কোন কোন|কী কী|কি কি|কোনগুলো|তালিকা|নাম|উল্লেখ|কথা|\b(?:kon kon|ki ki|naam|nam|talika|kotha)\b|ما هي|ما الحيوانات|اي الحيوانات|اسماء|المذكور|ذكر|اذكر/i;
// not a request for the list: what the Quran SAYS about animals (the theme), how to treat or eat them (a ruling), a word count
const ANIMAL_NOT_LIST = /\b(?:say|says|said|teach|teaches|taught)\b.{0,25}\babout\b|\b(?:treat\w*|kindness|kindly|cruel\w*|rights?|care|eat|eating|eaten|slaughter\w*|sacrific\w*|halal|haram|forbidden|allowed|lawful|unlawful|times|word)\b|সম্পর্কে|নিয়ে কী|খাওয়া|খেতে|জবাই|কুরবানি|কোরবানি|দয়া|শব্দ|يقول|ذبح|اكل|كلمه/i;

// "which prophets are mentioned in the Quran?", "কুরআনে কতজন নবীর নাম আছে?", "ما الأنبياء المذكورون؟" (src/prophets.ts)
const PROPHET_WORD = /\b(?:prophets?|messengers?|nabi|nobi|nobir|nobider|nabider|nobira|rasul|rasool|paygambar|payghambar)\b|নবী|নবীগণ|রাসূল|রসুল|পয়গম্বর|انبياء|الانبياء|نبي|الرسل|رسل/i;
// not a request for the list of names: a story, a dua, who was first or best (that needs knowledge this assistant does not have)
const PROPHET_NOT_LIST = /\b(?:say|says|said|teach|teaches|taught)\b.{0,25}\babout\b|\b(?:story|stories|kahini|dua|duas|doa|miracles?|wives?|wife|sons?|father|mother|first|last|best|greatest|times|word)\b|কাহিনী|কাহিনি|দোয়া|মুজিযা|শ্রেষ্ঠ|প্রথম|শেষ|শব্দ|قصه|قصص|دعاء|اول|اخر|افضل|كلمه/i;

// "how many ayahs MENTION the camel", "কতবার এসেছে", "كم مرة ذكر": asks how often one animal is named
const MENTION = /\b(?:mention\w*|named?|names|talks?|talking|appears?|appeared|occurs?|occurred|comes?|came|refer\w*|speaks?|spoken)\b|উল্লেখ|কথা|এসেছে|বলা|ذكر|ورد/i;
// "how many times does the WORD cow appear": the person asks for that exact word, not for the animal
const WORD_ASKED = /\bwords?\b|\bshobdo\w*|শব্দ|كلمه|كلمة/i;

// "what is the most used word in the Quran?", "সবচেয়ে বেশি ব্যবহৃত শব্দ", "أكثر كلمة تكررت" (src/wordfreq.ts)
const WORD_FREQ = /\b(?:most|mostly|top|commonest|highest|maximum)\b.{0,30}\bwords?\b|\bwords?\b.{0,40}\b(?:most|mostly|maximum|highest|frequent\w*|commonest|repeated)\b|\b(?:frequent|common|repeated|used)\s+words?\b|বেশি.{0,40}শব্দ|শব্দ.{0,40}বেশি|সর্বাধিক.{0,40}শব্দ|শব্দ.{0,40}সর্বাধিক|\bbeshi\b.{0,40}\b(?:shobdo|sobdo|shabdo)\w*|\b(?:shobdo|sobdo|shabdo)\w*\b.{0,40}\bbeshi\b|اكثر.{0,20}(?:كلمه|الكلمات|كلمات)|(?:كلمه|الكلمات|كلمات).{0,20}(?:اكثر|تكرارا|ورودا)/i;
// "which surah has the most words" asks about surahs, not about words
const WORD_FREQ_NOT = /\b(?:which|what)\s+surahs?\b|কোন সূরা|ای سوره|اي سوره|أي سورة/i;
// "how many times is Allah mentioned?": nothing in the question but the name, "how many times", "mentioned", "in the Quran"
const ALLAH = /\ballah\b|আল্লাহ|الله/i;
const ALLAH_FILLER = new Set([
  'how', 'many', 'much', 'times', 'time', 'often', 'frequently', 'is', 'are', 'was', 'were', 'does', 'do', 'did', 'has', 'have',
  'been', 'the', 'a', 'an', 'word', 'name', 'names', 'of', 'allah', 'allahs', 'mentioned', 'mention', 'mentions', 'appear', 'appears',
  'appeared', 'occur', 'occurs', 'occurred', 'come', 'comes', 'came', 'used', 'use', 'written', 'repeated', 'said', 'in', 'quran',
  'koran', 'quraan', 'holy', 'whole', 'entire', 'total', 'number', 'count', 'al', 'karim', 'kareem', 'exactly', 'there', 'it', 's',
  'shobdo', 'shobdoti', 'shobdota', 'nam', 'namti', 'koybar', 'kotobar', 'koto', 'bar', 'e', 'kuran', 'kurane', 'ache', 'ase',
  'asche', 'esheche', 'eseche', 'ullekh', 'kora', 'hoyeche', 'mot',
  'কতবার', 'কত', 'বার', 'আল্লাহ', 'আল্লাহর', 'শব্দ', 'শব্দটি', 'শব্দটা', 'নাম', 'নামটি', 'কুরআনে', 'কোরআনে', 'কুরআন', 'পবিত্র',
  'এসেছে', 'আছে', 'উল্লেখ', 'করা', 'হয়েছে', 'মোট', 'পুরো', 'মধ্যে',
  'كم', 'مره', 'ذكر', 'ذكرت', 'ورد', 'وردت', 'يرد', 'اسم', 'لفظ', 'لفظه', 'كلمه', 'الله', 'الجلاله', 'في', 'القران', 'الكريم',
  'تكرر', 'تكررت', 'جاء', 'جاءت', 'عدد',
].map((w) => normAr(normBn(w))));

// "give me the count number", "how many?", "মোট কয়টি?": a number asked for with no topic of its own (a follow-up)
const COUNT_WORD = /\b(?:count|number|total|how many|how much|koyta|koyti|koyto|koto|kotogulo|kototi|kotota|kototo|mot)\b|কয়টি|কয়টা|কতটি|কতগুলো|কতগুলি|কত|সংখ্যা|মোট|كم|عدد/i;
const COUNT_FILLER = new Set([
  'give', 'me', 'the', 'a', 'an', 'count', 'counts', 'number', 'numbers', 'total', 'how', 'many', 'much', 'tell', 'show',
  'what', 'whats', 's', 'is', 'are', 'was', 'it', 'its', 'them', 'they', 'there', 'of', 'please', 'pls', 'plz', 'exact',
  'exactly', 'just', 'only', 'i', 'want', 'need', 'can', 'you', 'could', 'would', 'in', 'all', 'so', 'then', 'ok', 'okay',
  'and', 'now', 'again', 'final', 'answer', 'do', 'does', 'know', 'say', 'your', 'that', 'those', 'these', 'this', 'us',
  'let', 'to', 'sum', 'overall', 'altogether', 'kinds', 'types', 'are', 'be', 'will',
  'koyta', 'koyti', 'koto', 'kotogulo', 'ache', 'ase', 'achhe', 'ta', 'ti', 'bolo', 'bolen', 'bolun', 'dao', 'din', 'den',
  'mot', 'sonkha', 'songkha', 'shonkha', 'ekhon', 'tahole', 'gune', 'sob', 'shob', 'egulo', 'ogulo', 'segulo', 'ki', 'amake', 'jante', 'chai',
  'কয়টি', 'কয়টা', 'কতটি', 'কতগুলো', 'কতগুলি', 'কত', 'কতো', 'সংখ্যা', 'সংখ্যাটা', 'সংখ্যাটি', 'মোট', 'বলো', 'বলুন', 'বল', 'দাও', 'দিন',
  'দেন', 'আছে', 'টি', 'টা', 'তাহলে', 'এখন', 'গুনে', 'গুণে', 'সেগুলো', 'ওগুলো', 'এগুলো', 'তাদের', 'এদের', 'কি', 'কী', 'আমাকে', 'জানতে', 'চাই',
  'সব', 'সবগুলো', 'হবে', 'হয়',
  'كم', 'عدد', 'العدد', 'عددها', 'عددهم', 'ما', 'هو', 'هي', 'اعطني', 'قل', 'لي', 'كلها', 'المجموع', 'اذكر', 'اذن', 'و',
].map((w) => normAr(normBn(w))));

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
// "surah 2 ayah 255"; "chapter 2 verse 255" is how speech-to-text often writes it
const REF_WORDS = /(?:surah|sura|chapter|সূরা|سورة)\s*(\d{1,3}).{0,14}?(?:ayah|ayat|verse|আয়াত|آية)\s*(\d{1,3})/i;
const AYATUL_KURSI = /ayat(?:ul)?[\s-]*(?:al[\s-]*)?kursi|আয়াতুল\s*কুরস|آية\s*الكرسي/i;
const FIRST_LAST = /\b(first|1st|last)\s+(ayah|ayat|aya|verse)\b.{0,20}\b(quran|koran)\b|কুরআনের\s+(প্রথম|শেষ)\s+আয়াত|أول آية|آخر آية/i;
const AYAH_NUMBER = /(?:ayah|ayat|aya|verse|আয়াত|آية|ايه)\s*(?:no\.?|number|নম্বর|رقم)?\s*(\d{1,3})\b|\b(\d{1,3})\s*(?:no\.?\s*)?(?:ayah|ayat|aya|verse|নম্বর আয়াত|নং আয়াত)/i;
const JUZ = /\b(?:para|paara|siparah|sipara|juz|jus|joz|jooz|juzz)\s*(?:no\.?|number)?\s*(\d{1,2})\b|\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:para|paara|siparah|sipara|juz|jus)\b|পারা\s*(?:নং|নম্বর)?\s*(\d{1,2})|(\d{1,2})\s*(?:নং|নম্বর)?\s*পারা|জুয\s*(\d{1,2})|জুজ\s*(\d{1,2})|(?:الجزء|جزء)\s*(\d{1,2})/i;
const FOLLOW_UP = /\b(ortho|er ortho|meaning|translate|translation|onubad|banglay|bangla te)\b|অর্থ|মানে|অনুবাদ|বাংলায়|معنى|ترجمة|ترجم/i;

const MEANING_REJECT = new Set([
  'this', 'that', 'it', 'its', 'these', 'those', 'they', 'them', 'above', 'earlier', 'previous', 'last', 'here', 'there',
  'ayah', 'ayat', 'ayats', 'aya', 'verse', 'verses', 'surah', 'sura', 'surahs', 'chapter', 'passage', 'text', 'line', 'lines',
  'quran', 'koran', 'word', 'words', 'term', 'terms', 'phrase', 'meaning', 'definition', 'translation', 'name',
  'is', 'are', 'am', 'was', 'were', 'be', 'the', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'my', 'your',
  'please', 'pls', 'can', 'could', 'you', 'tell', 'me', 'give', 'show', 'mean', 'means', 'translate', 'explain',
  'eta', 'etar', 'eita', 'eitar', 'ei', 'ota', 'otar', 'ta', 'tar', 'er', 'r', 'seita', 'agertar', 'shobdo', 'shobder', 'shobdoti',
  'english', 'englishe', 'bangla', 'bengali', 'banglay', 'banglate', 'arabic', 'arabi', 'arbi', 'arabite', 'islam',
  'what', 'which', 'who', 'how', 'why', 'where', 'when', 'ki', 'kya', 'kotha', 'hoy', 'ache',
  'এটা', 'এটার', 'এটি', 'এটির', 'এই', 'এইটা', 'এইটার', 'ওটা', 'ওটার', 'তা', 'তার', 'এর', 'এগুলোর', 'এগুলো',
  'আয়াত', 'আয়াতটি', 'আয়াতটির', 'আয়াতের', 'আয়াতগুলো', 'আয়াতগুলোর', 'সূরা', 'সূরাটি', 'সূরার', 'সুরা', 'কুরআন',
  'শব্দ', 'শব্দটি', 'শব্দের', 'অর্থ', 'মানে', 'অনুবাদ', 'বাংলা', 'বাংলায়', 'বাংলাতে', 'ইংরেজি', 'ইংরেজিতে', 'ইংলিশ', 'আরবি', 'আরবিতে', 'কী', 'কি',
  'هذا', 'هذه', 'ذلك', 'تلك', 'هو', 'هي', 'هنا', 'الاية', 'اية', 'الايات', 'ايات', 'السورة', 'سورة', 'القران', 'الكلمة', 'كلمة', 'معنى', 'ترجمة',
  'العربية', 'عربي', 'الانجليزية', 'انجليزي', 'البنغالية', 'بنغالي', 'ما', 'ماذا',
]);
const STRUCTURAL_WORDS = new Set([
  'this', 'that', 'it', 'these', 'those', 'ayah', 'ayat', 'ayats', 'aya', 'verse', 'verses', 'surah', 'sura', 'surahs', 'chapter', 'passage',
  'eta', 'etar', 'eita', 'eitar', 'ota', 'er', 'এই', 'এটা', 'এটার', 'এটি', 'আয়াত', 'আয়াতটি', 'আয়াতটির', 'আয়াতের', 'সূরা', 'সূরাটি', 'সূরার',
  'هذا', 'هذه', 'ذلك', 'الاية', 'اية', 'السورة', 'سورة',
]);
const EXPLICIT_WORD_RE = /\b(?:word|term|phrase|shobd\w*)\b|শব্দ(?:টি|টির|ের)?|كلمة|لفظ/i;

function stripMeaningTail(s: string): string {
  let cur = s.trim().replace(/[?!.।؟،]+$/g, '').trim();
  const tailRe = /(?:\s+(?:in\s+(?:english|bangla|bengali|arabic|islam|the\s+quran|quran)|into\s+(?:english|bangla|bengali|arabic)|banglay|banglate|bangla\s+te|englishe|in\s+bd|বাংলায়|বাংলাতে|ইংরেজিতে|ইংলিশে|আরবিতে|কুরআনে|ইসলামে|في\s+القرآن|في\s+الإسلام|بالعربية|بالإنجليزية|بالبنغالية))$/i;
  for (let i = 0; i < 3; i++) {
    const next = cur.replace(tailRe, '').trim().replace(/[?!.।؟،]+$/g, '').trim();
    if (next === cur) break;
    cur = next;
  }
  return cur;
}

function cleanMeaningCandidate(raw: string, explicitWord: boolean): string | null {
  let cur = raw.trim().replace(/^["'“”‘’«»`()[\]]+|["'“”‘’«»`()[\]?!.।؟،]+$/g, '').trim();
  const leadRe = /^(?:the|an?|arabic|quranic|islamic|word|term|phrase|আরবি|কুরআনিক|কুরআনের|ইসলামিক|ইসলামি|শব্দ|শব্দটি|শব্দের|কথা|كلمة|لفظ|مصطلح)\s+/i;
  for (let i = 0; i < 4; i++) {
    const next = cur.replace(leadRe, '').trim();
    if (next === cur) break;
    cur = next;
  }
  cur = cur.replace(/\s+(?:word|term|phrase|shobdo|shobdoti|shobder|শব্দ|শব্দটি|শব্দের)$/i, '')
    .replace(/^["'“”‘’«»`()[\]]+|["'“”‘’«»`()[\]?!.।؟،]+$/g, '')
    .trim();
  if (cur.length < 2 || !/\p{L}/u.test(cur)) return null;
  const toks = cur.toLowerCase().split(/[^\p{L}\p{M}]+/u).filter(Boolean);
  if (toks.length === 0 || toks.length > 4) return null;
  if (toks.every((t) => MEANING_REJECT.has(t) || MEANING_REJECT.has(normAr(t)))) return null;
  if (!explicitWord && toks.some((t) => STRUCTURAL_WORDS.has(t) || STRUCTURAL_WORDS.has(normAr(t)))) return null;
  return cur;
}

function extractMeaningTarget(text: string): { target: string; glossaryOnly: boolean } | null {
  const cleaned = stripMeaningTail(text);
  const explicitWord = EXPLICIT_WORD_RE.test(text);
  const explicitPatterns: RegExp[] = [
    /^(?:(?:please|pls)\s+|(?:can|could)\s+you\s+(?:tell\s+me\s+)?|tell\s+me\s+)?(?:what\s+(?:is|'s)\s+(?:the\s+)?(?:(?:lexical|literal|actual|exact|real|true|arabic|quranic|islamic)\s+)*(?:meaning|definition)\s+(?:of|for)\s+|(?:meaning|definition)\s+(?:of|for)\s+)(.+)$/i,
    /^(?:(?:please|pls)\s+|(?:can|could)\s+you\s+(?:tell\s+me\s+)?|tell\s+me\s+)?what\s+(?:does|do)\s+(.+?)\s+means?$/i,
    /^(?:(?:please|pls)\s+|(?:can|could)\s+you\s+(?:tell\s+me\s+)?|tell\s+me\s+)what\s+(.+?)\s+means$/i,
    /^(?:(?:please|pls)\s+|(?:can|could)\s+you\s+)?define\s+(.+)$/i,
    /^(?!(?:what|which|how|who|why|where|when|translate|explain)\b)(.+?)\s+(?:(?:shobder|shobdo(?:\s*(?:tir|tar|ti))?)\s+)?(?:er\s+|r\s+)?(?:(?:banglay|banglate|bangla\s+te|englishe)\s+)?(?:ortho|orthho|mane|meaning)(?:\s+(?:ki|kya|ki\s+hoy|hoy|ache))?$/i,
    /^(.+?)\s*(?:(?:শব্দটির|শব্দের|শব্দটি|শব্দ)\s*)?(?:এর\s+)?(?:শাব্দিক\s+|আক্ষরিক\s+|আসল\s+|প্রকৃত\s+|সাধারণ\s+)?(?:বাংলায়\s+|বাংলা\s+)?(?:অর্থ|মানে)\s*(?:কী|কি|কিতা|হয়|বলেন|বলুন)?$/,
    /^(?:ما\s*(?:هو|هي)?\s*)?(?:معنى|المقصود\s+ب?|تعريف)\s+(?:كلمة\s+|لفظ\s+|مصطلح\s+)?(.+)$/,
  ];
  for (const re of explicitPatterns) {
    const m = cleaned.match(re);
    const raw = m?.[1]?.trim();
    if (!raw) continue;
    const target = cleanMeaningCandidate(raw, explicitWord);
    if (target) return { target, glossaryOnly: false };
  }
  const barePatterns: RegExp[] = [
    /^(?:(?:please|pls)\s+|(?:can|could)\s+you\s+(?:tell\s+me\s+)?|tell\s+me\s+)?what(?:'s|\s+is)\s+(.+)$/i,
    /^(.+?)\s+(?:ki|kya|কি|কী)(?:\s+(?:jinish|hoy))?$/i,
    /^ما\s+(?:هو|هي)\s+(.+)$/,
  ];
  for (const re of barePatterns) {
    const m = cleaned.match(re);
    const raw = m?.[1]?.trim();
    if (!raw) continue;
    const target = cleanMeaningCandidate(raw, explicitWord);
    if (target) return { target, glossaryOnly: true };
  }
  return null;
}

function resolveGlossaryEntry(target: string) {
  const direct = lookupGlossary(target);
  if (direct) return direct;
  const bn = normBn(target);
  if (/(?<=\S{2,})ের$/.test(bn)) {
    const stemmed = lookupGlossary(bn.slice(0, -2));
    if (stemmed) return stemmed;
  }
  if (/(?<=\S{2,}[ািীেোৌ])র$/.test(bn)) {
    const stemmed = lookupGlossary(bn.slice(0, -1));
    if (stemmed) return stemmed;
  }
  const latinTrimmed = target.replace(/^(?:al|ar|as|ash|at|an|az|ad)[-\s]+/i, '').trim();
  if (latinTrimmed && latinTrimmed !== target) {
    const hit = lookupGlossary(latinTrimmed);
    if (hit) return hit;
  }
  return null;
}

// Follow-ups that continue from the ayahs already shown. Each must be the WHOLE message (after punctuation is taken off).
const FU_MORE = /^(?:(?:please\s+)?(?:show|give|tell)\s+(?:me\s+|us\s+)?)?(?:some\s+)?more(?:\s+(?:ayahs?|ayats?|verses?))?(?:\s+(?:please|pls))?$|^(?:continue|go on|keep going|next\s+(?:10|ten|part|page))$|^(?:aro|aaro)(?:\s+(?:dekhao|den|dao|ayat))?$|^(?:আরও|আরো)(?:\s*(?:দেখাও|দেখান|দিন|দাও|আয়াত))?$|^বাকিটা(?:\s*দেখাও)?$|^(?:المزيد|اكمل|تابع)$/;
const FU_NEXT = /^(?:(?:the|show|show me|give me)\s+)?next(?:\s+(?:ayah|ayat|aya|verse|one))?(?:\s+please)?$|^(?:porer|poror)\s+(?:ayat|ayah)$|^পরের\s*আয়াত$|^(?:الايه)\s*التاليه$/;
const FU_PREV = /^(?:(?:the|show|show me|give me)\s+)?(?:previous|prev)(?:\s+(?:ayah|ayat|aya|verse|one))?(?:\s+please)?$|^(?:the\s+)?(?:ayah|ayat|verse)\s+before$|^(?:ager|aager)\s+(?:ayat|ayah)$|^আগের\s*আয়াত$|^(?:الايه)\s*السابقه$/;
const FU_NEXT_SURAH = /^(?:the\s+)?next\s+(?:surah|sura)$|^porer\s+(?:surah|sura)$|^পরের\s*সূরা$|^السوره\s*التاليه$/;
const FU_LANG = /^(?:(?:in|into)\s+)?(?:english|bangla|bengali)(?:\s+(?:please|translation))?$|^(?:only\s+arabic|arabic\s+only|just\s+arabic)$|^(?:banglay|banglate|bangla\s+te|englishe|english\s+e)$|^(?:বাংলায়|বাংলাতে|ইংরেজিতে|ইংলিশে|শুধু\s*আরবি)$|^(?:بالانجليزيه|بالبنغاليه|بالعربيه\s*فقط)$/;
const FU_WHAT_ABOUT = /^(?:what|how)\s+about\s+(.+)$|^and\s+(?:in\s+|for\s+|about\s+)?(.+)$|^ar\s+(.+)$|^আর\s+(.+)$|^(?:وماذا عن|ماذا عن|وعن)\s+(.+)$/;

// A juz (para) by its famous name: "Amma para" is the 30th, "Tabarak para" the 29th.
const JUZ_NAMED: Array<[RegExp, number]> = [
  [/\b(amma|ammaa)\b.{0,12}\b(para|juz|jus|sipara|siparah)\b|\b(para|juz|jus|sipara|siparah)\b.{0,12}\b(amma|ammaa)\b|আম্মা\s*পারা|পারা\s*আম্মা|جزء عم/i, 30],
  [/\btabarak\w*\b.{0,12}\b(para|juz|sipara|siparah)\b|\b(para|juz|sipara|siparah)\b.{0,12}\btabarak\w*\b|তাবারাকা?\s*পারা|جزء تبارك/i, 29],
];
const JUZ_COUNT = /\bhow many\s+(?:juz|jooz|para|paras|siparah|sipara)\b|কয়টি\s*পারা|কতটি\s*পারা|কয়টা\s*পারা|কত\s*পারা|كم جزء/i;

// What a person asks about a surah itself: Meccan or Medinan, which para, its number, what its name means.
const SURAH_FACTS = /\b(meccan|makkan|medinan|madinan|makki|madani)\b|মক্কী|মাদানী|মাক্কী|মাদানি|مكي|مدني|مكية|مدنية|\b(?:which|kon|koto|kotho)\s*(?:number\s*)?(?:para|juz|siparah)\b|কোন\s*পারা|কত\s*নম্বর\s*পারা|\b(?:para|juz)\b.{0,12}\b(?:te|e|mein)\b|পারায়|পারাতে|\bwhat\s+(?:does|is)\s+(?:the\s+)?(?:name|meaning)\b|\bname\b.{0,30}\bmean|\bmeans?\b|নামের অর্থ|নামকরণ|(?:where|when)\s+(?:was|were|is)[^.!?\n]{0,30}\brevealed\b|\brevealed\s+in\s+(?:makkah|mecca|madinah|medina)\b|(?:কোথায়|কখন)\s*(?:নাযিল|নাজিল|অবতীর্ণ)|\bwhich\s+juz\b/i;

// Famous passages that people ask for by name.
const PASSAGES: Array<{ re: RegExp; name: Record<Lang, string>; refs?: Array<[number, number]>; surahs?: number[] }> = [
  { re: /\b(amana|amanar|amanar-?rasul\w*|amanarrasul\w*|ama?naar?\s*rasul\w*)\b|আমানার\s*রাসূল|আমানার-রাসূলু|آمن الرسول/i, name: { en: 'Amana ar-Rasul (the last two ayahs of Al-Baqarah)', bn: 'আমানার রাসূল (সূরা বাকারার শেষ দুই আয়াত)', ar: 'آمن الرسول (آخر آيتين من سورة البقرة)' }, refs: [[2, 285], [2, 286]] },
  { re: /\b(?:teen|tin|3|three)\s*[- ]?(?:qul|kul|quls|kuls)\b|তিন\s*কুল|তিন\s*কূল/i, name: { en: 'The three Quls', bn: 'তিন কুল', ar: 'السور الثلاث (الإخلاص والفلق والناس)' }, surahs: [112, 113, 114] },
  { re: /\b(?:char|chaar|4|four)\s*[- ]?(?:qul|kul|quls|kuls)\b|চার\s*কুল|চার\s*কূল/i, name: { en: 'The four Quls', bn: 'চার কুল', ar: 'السور الأربع (الكافرون والإخلاص والفلق والناس)' }, surahs: [109, 112, 113, 114] },
  { re: /\bayat(?:ul|e|[\s-]e)?[\s-]*(?:al[\s-]*)?kar[ie]ma\b|আয়াতে\s*কারীমা|আয়াতে\s*করিমা|আয়াতুল\s*কারীমা/i, name: { en: 'Ayat-e-Karima (the supplication of Yunus)', bn: 'আয়াতে কারীমা (ইউনুস (আ.)-এর দোয়া)', ar: 'آية الكريمة (دعاء يونس)' }, refs: [[21, 87]] },
  { re: /\bbismillah(?:ir)?(?:\s*rahman\w*)?\b|বিসমিল্লাহ|بسم الله/i, name: { en: 'Bismillah', bn: 'বিসমিল্লাহ', ar: 'البسملة' }, refs: [[1, 1]] },
  { re: /\brabbana\s+atina\s+fid[-\s]*dunya\s+hasanah\b|রব্বানা\s+আতিনা\s+ফিদ্দুনিয়া\s+হাসানাহ/i, name: { en: 'Rabbana atina fid-dunya hasanah', bn: 'রব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ', ar: 'ربنا آتنا في الدنيا حسنة' }, refs: [[2, 201]] },
  { re: /\binna\s+ma['’‘`ʼ]?al\s+usri\s+yusra\b|ইন্না\s+মা['’‘`ʼ]?আল\s+উসরি\s+ইউসরা/i, name: { en: 'Inna ma’al usri yusra', bn: 'ইন্না মাআল উসরি ইউসরা', ar: 'إن مع العسر يسرا' }, refs: [[94, 5], [94, 6]] },
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

  /** The ayahs from..to of surah s: at most `cap` of them (10 for a para or "show more"; a surah or a range is shown whole). */
  private range(s: number, from: number, to: number, cap = MAX_RANGE): Array<{ s: number; a: number }> {
    const n = this.quran.chapters[s - 1].n;
    const end = Math.min(to, from + cap - 1, n);
    const out: Array<{ s: number; a: number }> = [];
    for (let a = from; a <= end; a++) out.push({ s, a });
    return out;
  }

  /** The surah a question is about: by name ("baqara") or by number ("surah 36"). */
  private surahOf(text: string): number | null {
    // "সূরা সিজদা" is Surah As-Sajdah; "সিজদা" alone is a prostration, so the name needs the word সূরা in front
    return this.surahs.find(text) ?? surahNumber(text) ?? (/সূরা\s*(?:আস-?\s*)?সিজদা/.test(text) ? 32 : null);
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
        const list = this.range(s, from, Math.min(to, n), Infinity);   // exactly the range asked
        return { list, label: refLabel(list) };
      }
    }
    const wantLast = LAST_WORDS.test(lower);
    const wantFirst = FIRST_WORDS.test(lower);
    if (wantLast !== wantFirst) {
      const m = text.match(NUM_BEFORE_AYAH);
      const count = m ? Math.max(1, Math.min(n, Number(m[1]) || WORD_NUMBER[m[1].toLowerCase()] || 1)) : 1;
      const list = wantLast ? this.range(s, Math.max(1, n - count + 1), n, Infinity) : this.range(s, 1, count, Infinity);
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
    // "شرح 2:255": without the word "explain" only "2:255" is left, which has no language: take the whole question's
    const lang = /\p{L}/u.test(stripped) ? base.lang : detectLanguage(question);
    const asked = toAsciiDigits(question).toLowerCase();
    // every answer to "explain ..." first says that nothing is explained in the assistant's own words
    const own = MSG.ownWords[lang];
    // only a clear target gets notes: one ayah, a range, or a surah (its first ayahs) ...
    let target: Array<{ s: number; a: number }> | null = base.ayahs.length > 0 && (base.kind === 'ref' || base.kind === 'surah') ? base.ayahs : null;
    // ... or, for "explain these / this / it", "what does this mean?", the ayahs that were just shown in the chat
    const last = [...history].reverse().find((h) => h.citations?.length > 0);
    if (!target && last && this.onlyPointsBack(stripped)) target = last.citations.map((c) => ({ s: c.surah, a: c.ayah }));
    if (!target) {
      const badRef = base.kind === 'notFound' && /\d+\s*[:：]\s*\d+/.test(toAsciiDigits(stripped));
      const passThrough = ['scholar', 'crisis', 'refusal', 'unsupported', 'feedback', 'help', 'about', 'greeting', 'thanks'].includes(base.kind);
      if (badRef || passThrough) return base;
      return this.reply('help', 'general', lang, `${own} ${MSG.explainWhich[lang]}`);
    }
    const shown = target.slice(0, EXPLAIN_MAX_AYAHS);
    const wantEn = asked.search(REQ_EN), wantBn = asked.search(REQ_BN);
    const noteLang: 'en' | 'bn' = wantBn >= 0 && (wantEn < 0 || wantBn > wantEn) ? 'bn' : wantEn >= 0 ? 'en' : lang === 'bn' ? 'bn' : 'en';
    const other: 'en' | 'bn' = noteLang === 'bn' ? 'en' : 'bn';
    const source = noteLang === 'bn' ? NOTE_SOURCE.bn : NOTE_SOURCE.en;
    const notes = shown.flatMap(({ s, a }) => { const text = this.quran.note(noteLang, s, a); return text ? [{ s, a, text, source }] : []; });
    const parts: string[] = [own];
    if (work) parts.push(MSG.noTafsirWork(work.trim())[lang]);
    if (notes.length > 0) parts.push(MSG.explainIntro(source)[lang]);
    else {
      parts.push(MSG.noNote[lang]);
      if (shown.some(({ s, a }) => this.quran.note(other, s, a))) parts.push(MSG.noteOtherLang(other)[lang]);
    }
    if (target.length > shown.length) parts.push(MSG.explainFirst(shown.length)[lang]);
    return this.reply('explain', 'quran', lang, parts.join(' '), { ayahs: shown, notes, translation: noteLang, rawTranslation: notes.length > 0 });
  }

  /** "explain these", "explain it", "এগুলোর ব্যাখ্যা দাও", "اشرح هذه": nothing in it but words that point back to what was shown. */
  private onlyPointsBack(text: string): boolean {
    const toks = normAr(normBn(text)).toLowerCase().split(/[^\p{L}\p{M}]+/u).filter((w) => w.length > 1);
    return toks.every((w) => POINT_BACK.has(w));
  }

  /** The answer to a question, with the translation the person asked for (and a note if they asked for a transliteration). */
  ask(question: string, history: HistoryTurn[] = []): Reply {
    const q = question.normalize('NFC');
    const withoutNegExplain = q
      .replace(/\bwithout\b[^.!?;।\n]{0,40}\b(?:explain\w*|interpret\w*|tafsir\w*|commentary)\b/gi, ' ')
      .replace(/(?:ব্যাখ্যা|তাফসীর|তাফসির)\s*(?:করবেন\s*না|করো\s*না|যোগ\s*করবেন\s*না|দেবেন\s*না|দিও\s*না|ছাড়া|ব্যতীত)/g, ' ');
    EXPLAIN.lastIndex = 0;
    if (EXPLAIN.test(withoutNegExplain) || MEANING_BACK.test(q.trim())) {
      EXPLAIN.lastIndex = 0;
      const e = this.explain(q, history);
      e.suggestions = this.suggest(e, q);
      return e;
    }
    const r = this.core(q, history);
    if (r.ayahs.length > 0) {
      const lower = toAsciiDigits(q).toLowerCase();
      if (REQ_NONE.test(lower)) r.translation = 'none';
      else {
        const bn = lower.search(REQ_BN), en = lower.search(REQ_EN);
        if (bn >= 0 && (en < 0 || bn > en)) r.translation = 'bn';
        else if (en >= 0) r.translation = 'en';
      }
      if (TRANSLIT.test(lower)) r.answer += ' ' + MSG.noTranslit[r.lang];
      // "which surah talks about sacrifice?": name the surahs of the ayahs shown (in the order they are shown)
      const askedSurah = ['theme', 'search', 'story', 'ref'].includes(r.kind) && r.ayahs.length <= 10 && WHICH_SURAH.test(`${lower} ${normAr(q)}`);
      if (askedSurah) {
        const bySurah = new Map<number, number[]>();
        for (const { s, a } of r.ayahs) bySurah.set(s, [...(bySurah.get(s) ?? []), a]);
        const parts = (join: string, name: (s: number) => string) =>
          [...bySurah.entries()].map(([s, as]) => `${name(s)} (${as.map((a) => `${s}:${a}`).join(join)})`).join(join);
        const c = (s: number) => this.quran.chapters[s - 1];
        r.answer += MSG.inSurahs(parts(', ', (s) => `Surah ${c(s).tr}`), parts(', ', (s) => `সূরা ${c(s).tr}`), parts('، ', (s) => `سورة ${c(s).ar}`))[r.lang];
      } else if (REF_ONLY.test(lower)) {
        r.answer += MSG.refsSuffix(refLabel(r.ayahs))[r.lang];
      }
    }
    r.suggestions = this.suggest(r, q);
    return r;
  }

  /**
   * What to ask next, as tappable suggestions (SUGGEST in templates.ts). After ayahs: more of them (or the next ayah,
   * or the next surah at the end of one), the translator's notes for the first, and another translation. After a number:
   * other numbers. After small talk or "not found": examples. Nothing after a crisis, a ruling or a refusal.
   */
  private suggest(r: Reply, question: string): string[] {
    const L = r.lang;
    if (['crisis', 'scholar', 'refusal'].includes(r.kind)) return [];
    const asked = question.trim().toLowerCase().replace(/[?؟]+$/, '');
    if (r.kind === 'data') return SUGGEST.facts[L].filter((s) => s.toLowerCase().replace(/[?؟]+$/, '') !== asked).slice(0, 3);
    if (r.ayahs.length === 0) return SUGGEST.starters[L];
    const first = r.ayahs[0], end = r.ayahs[r.ayahs.length - 1];
    const other = L === 'ar'
      ? (r.translation === 'none' ? SUGGEST.inEnglish : SUGGEST.arabicOnly)
      : (r.translation === 'bn' ? SUGGEST.inEnglish : SUGGEST.inBengali);
    const inOrder = r.ayahs.every((y, i) => i === 0 || (y.s === r.ayahs[i - 1].s && y.a === r.ayahs[i - 1].a + 1));
    const go = inOrder && end.a >= this.quran.chapters[end.s - 1].n ? (end.s < 114 ? SUGGEST.nextSurah : null)
      : r.ayahs.length === 1 ? SUGGEST.nextAyah : SUGGEST.more;
    return [go?.[L], r.kind === 'explain' ? null : SUGGEST.explain(`${first.s}:${first.a}`)[L], other[L]].filter((s): s is string => !!s);
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

  /** `lang`: answer in this language instead of the question's own (a follow-up is answered in the follow-up's language). */
  private core(question: string, history: HistoryTurn[], forceLang?: Lang): Reply {
    const q = question.trim().normalize('NFC');
    const lang = forceLang ?? detectLanguage(q);
    const text = toAsciiDigits(q);
    const lower = text.toLowerCase();
    const words = wordCount(q);

    // 1. safety first
    if (anyMatch(CRISIS, lower)) return this.reply('crisis', 'general', lang, MSG.crisis[lang]);
    if (anyMatch(MADE_UP, lower)) return this.reply('refusal', 'quran', lang, MSG.refuseMadeUp[lang], { notFound: true });
    if (PERSONAL_GUIDANCE.test(lower)) return this.reply('scholar', 'quran', lang, MSG.personalGuidance[lang], { notFound: true });
    if (ASBAB.test(lower)) return this.reply('scholar', 'quran', lang, MSG.noAsbab[lang], { notFound: true });
    if (HADITH.test(lower)) return this.reply('scholar', 'quran', lang, MSG.noHadith[lang], { notFound: true });
    if (SENSITIVE.test(lower)) return this.reply('scholar', 'quran', lang, MSG.sensitive[lang], { notFound: true });
    if (anyMatch(FATWA, lower) || anyMatch(FATWA_MORE, lower)) {
      if (NO_FATWA.test(lower) && VERSE_ASK.test(lower)) {
        const subQ = text
          .replace(NO_FATWA, ' ')
          .split(/[?!।\n]+/)
          .map((s) => s.trim())
          .filter((s) => s && !anyMatch(FATWA, s.toLowerCase()) && !anyMatch(FATWA_MORE, s.toLowerCase()))
          .join(' ')
          .trim();
        if (subQ) {
          const sub = this.core(subQ, history, lang);
          if (!sub.notFound && sub.ayahs.length > 0) {
            return { ...sub, answer: `${MSG.scholar[lang]} ${sub.answer}` };
          }
        }
      }
      return this.reply('scholar', 'quran', lang, MSG.scholar[lang], { notFound: true });
    }

    // 2. a little conversation, in a humble manner: "how are you?", "I'm fine", "bye", "sorry", "assalamu alaikum" ...
    // (src/conversation.ts: the WHOLE message only, so a question about the Quran is never taken for it)
    const conv = words <= 12 ? conversation(q, this.askedHowAreYou(history)) : null;
    if (conv) return this.converse(conv, lang);
    // small talk and things this assistant cannot do (short messages only, so a real question is never taken for them)
    if (words <= 5 && THANKS.test(lower)) return this.reply('thanks', 'general', lang, MSG.thanks[lang]);
    if (words <= 5 && WISHES.test(lower)) return this.reply('greeting', 'general', lang, MSG.wishes[lang]);
    // what this assistant is, and its terms: a specific answer and a link to the Terms page (never when the Quran is asked about)
    const termsLink = { href: '/terms', label: MSG.termsLink[lang] };
    const aboutQuran = QURAN_WORD.test(`${lower} ${normAr(text)}`);
    if ((words <= 6 && ABOUT.test(lower)) || (words <= 8 && !aboutQuran && ABOUT_MORE.test(lower))) {
      return this.reply('about', 'general', lang, MSG.about[lang], { link: termsLink });
    }
    if (words <= 12 && !aboutQuran && TERMS_Q.test(lower)) return this.reply('terms', 'general', lang, MSG.termsShort[lang], { link: termsLink });
    if (words <= 9 && HELP.test(lower)) return this.reply('help', 'general', lang, MSG.help[lang]);
    if (words <= 8 && FEEDBACK.test(lower)) return this.reply('feedback', 'general', lang, MSG.feedback[lang]);
    if (anyMatch(UNSUPPORTED, lower)) return this.reply('unsupported', 'general', lang, MSG.cannotDo[lang]);
    if (words <= 4 && (GREETING.test(lower) || BN_GREETING.test(lower))) return this.reply('greeting', 'general', lang, MSG.greeting[lang]);
    // talk to the assistant itself: its name, "are you a muslim?", praise, a joke (short, and nothing about the Quran in it)
    const talk = words <= 8 ? this.talk(text, lower, words, lang) : null;
    if (talk) return talk;

    // 3. numbers and facts
    // a follow-up that continues the conversation: "show more", "next ayah", "in english", "what about surah kahf?"
    const follow = words <= 8 ? this.followUp(q, lang, history) : null;
    if (follow) return follow;
    // a number with no topic of its own ("give me the count number", "how many?"): about the question before it
    if (words <= 8 && this.isCountOnly(q)) return this.countFollowUp(q, lang, history);
    const animals = this.animals(text, lang);
    if (animals) return animals;
    const prophets = this.prophets(text, lang);
    if (prophets) return prophets;
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
        const list = this.range(s, from, Math.min(to, this.quran.chapters[s - 1].n), Infinity);   // exactly the range asked
        return this.reply('ref', 'quran', lang, MSG.refIntro(refLabel(list))[lang], { ayahs: list });
      }
      return this.reply('notFound', 'quran', lang, MSG.notFound[lang], { notFound: true });
    }

    // a page of the mushaf: "page 50"
    const pm = text.match(PAGE_NO);
    const pageNo = pm ? Number(pm.slice(1).find((x) => x !== undefined)) : 0;
    if (pageNo >= 1 && pageNo <= 604) {
      // the whole page: from where it starts to where the next page starts (a page can hold the end of one surah and
      // the start of the next: page 604 is Al-Ikhlas, Al-Falaq and An-Nas)
      const [ps, pa] = this.quran.pages[pageNo - 1];
      const next = this.quran.pages[pageNo];   // undefined after page 604: to the end of the Quran
      const startAt = this.quran.ayahs.findIndex((y) => y.s === ps && y.a === pa);
      const stopAt = next ? this.quran.ayahs.findIndex((y) => y.s === next[0] && y.a === next[1]) : this.quran.ayahs.length;
      const list = this.quran.ayahs.slice(startAt, stopAt).map((y) => ({ s: y.s, a: y.a }));
      const last = list[list.length - 1];
      return this.reply('ref', 'quran', lang, MSG.pageWhole(pageNo, `${ps}:${pa}`, `${last.s}:${last.a}`, list.length)[lang], { ayahs: list });
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

    // If the user explicitly asks for the story of a prophet/person (and did not say "Surah <name>"), prefer story over surah name.
    const earlyStory = STORY_TRIGGER.test(lower) ? this.story(text, lower) : null;
    if (earlyStory) {
      const explicitSurah = earlyStory.names.some((name) => {
        const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const end = /^[a-z -]+$/i.test(name) ? '\\b' : '';
        return new RegExp(`(?:surah|sura|surat|soorah|সূরা|সুরা|سورة)\\s*(?:al[-\\s]*|an[-\\s]*|ar[-\\s]*|as[-\\s]*|at[-\\s]*|আ[লনরসত][-\\s]*)?${esc}${end}|${esc}${end}\\s+(?:surah|sura|সূরা|সুরা)`, 'i').test(text);
      });
      if (!explicitSurah) {
        const list = earlyStory.ayahs.map(([s, a]) => ({ s, a }));
        return this.reply('story', 'quran', lang, MSG.storyIntro(earlyStory.id, refLabel(list))[lang], { ayahs: list });
      }
    }

    // 5. a surah, by name or by number: all of it, a part of it, or one ayah ("ayat 255 of surah baqarah")
    let surah = this.surahOf(text);
    // "sincerity ikhlas": a bare name that is also a theme word, with a real topic word next to it, is the topic
    if (surah && words >= 2 && !SURAH_WORD_RE.test(text) && !/سورة|সূরা/.test(text) && !surahNumber(text) && matchThemes(text, this.isEnglish).ayahs.length > 0) surah = null;
    const bareMeaningReq = extractMeaningTarget(text);
    if (surah && bareMeaningReq && !bareMeaningReq.glossaryOnly && !SURAH_WORD_RE.test(text) && !/سورة|সূরা|সুরা/.test(text) && !surahNumber(text) && resolveGlossaryEntry(bareMeaningReq.target)) {
      surah = null;
    }
    if (surah) {
      const c = this.quran.chapters[surah - 1];
      const part = this.part(text, lower, surah);
      if (part) return this.reply('ref', 'quran', lang, MSG.partIntro(c.tr, part.label)[lang], { ayahs: part.list });
      const an = text.match(AYAH_NUMBER);
      const ayahNo = an ? Number(an[1] ?? an[2]) : 0;
      if (ayahNo >= 1 && ayahNo <= c.n) {
        return this.reply('ref', 'quran', lang, MSG.refIntro(`${surah}:${ayahNo}`)[lang], { ayahs: [{ s: surah, a: ayahNo }] });
      }
      if (ONE_BY_ONE.test(text)) {
        return this.reply('ref', 'quran', lang, MSG.oneAtATime(c.tr, c.n, `${surah}:1`)[lang], { ayahs: [{ s: surah, a: 1 }] });
      }
      const list = this.range(surah, 1, c.n, Infinity);   // the whole surah (Al-Baqarah: all 286 ayahs)
      return this.reply('surah', 'quran', lang, MSG.surahIntro(c.tr, list.length, c.n, surah)[lang], { ayahs: list });
    }

    // 6. asking for the meaning of a specific word or Quranic term (EN/BN/Banglish/AR)
    const meaning = this.wordMeaning(text, lang);
    if (meaning) return meaning;

    // follow-up "what is the meaning?" after earlier ayahs (only when no specific target word was asked)
    if (words <= 6 && FOLLOW_UP.test(lower)) {
      const last = [...history].reverse().find((h) => h.citations?.length > 0);
      if (last) {
        const list = last.citations.map((c) => ({ s: c.surah, a: c.ayah }));   // the same ayahs, all of them
        return this.reply('followup', 'quran', lang, MSG.followUpIntro[lang], { ayahs: list, translation: 'bn' });
      }
      return this.reply('notFound', 'quran', lang, MSG.followUpNone[lang], { notFound: true });
    }

    // 7. "which ayah is this?": the words the person wrote are in an ayah, word for word
    const quoted = text.match(/["“«]([^"”»]{5,200})["”»]/)?.[1]?.trim();
    const afterColon = text.match(/:\s*([^.!?\n]{5,200})/)?.[1]?.trim();
    const phrase = (quoted ? this.phrases.find(quoted) : null)
      ?? (afterColon ? this.phrases.find(afterColon) : null)
      ?? this.phrases.find(text);
    if (phrase) return this.reply('search', 'quran', lang, MSG.phraseIntro[lang], { ayahs: phrase });

    // 8. the story of a prophet or another person
    const story = this.story(text, lower);
    if (story) {
      const list = story.ayahs.map(([s, a]) => ({ s, a }));
      return this.reply('story', 'quran', lang, MSG.storyIntro(story.id, refLabel(list))[lang], { ayahs: list });
    }

    // Multi-word quoted paraphrase/Banglish quote ("Allah akash o jominer nur"): search the quoted phrase before broad themes
    if (quoted && wordCount(quoted) >= 3) {
      const quotedSearch = searchAyahs(this.index, this.quran, this.fix(quoted));
      if (quotedSearch.length > 0) {
        return this.reply('search', 'quran', lang, MSG.searchIntro[lang], { ayahs: quotedSearch.map((f) => ({ s: f.ayah.s, a: f.ayah.a })) });
      }
    }

    // from here on a spelling mistake in an English word is corrected ("patince" -> "patience")
    const fixed = this.fix(text);

    // 9. checked themes
    const themed = matchThemes(fixed, this.isEnglish);
    if (themed.ayahs.length > 0) {
      const label = [...new Set(themed.themes.map((t) => THEME_LABEL[t.id]?.[lang] ?? t.id))].join(DOMAIN_JOIN(lang));
      const hint = themed.themes.some((t) => t.id === 'animals') ? ' ' + MSG.animalsHint[lang] : '';
      return this.reply('theme', 'quran', lang, MSG.themeIntro(label)[lang] + hint, { ayahs: themed.ayahs.map((x) => ({ s: x.s, a: x.a })) });
    }

    // 10. "give me something from the Quran"
    const toks = fixed.toLowerCase().split(/[^\p{L}\p{M}]+/u).filter(Boolean);
    if (toks.length > 0 && toks.every((w) => NO_TOPIC_WORDS.has(w))) {
      const picks = [...GENERAL_AYAHS].sort(() => Math.random() - 0.5).slice(0, 3);
      return this.reply('noTopic', 'quran', lang, MSG.noTopicIntro[lang], { ayahs: picks.map(([s, a]) => ({ s, a })) });
    }

    // a longer greeting that has no question in it ("assalamu alaikum, apni kemon achen?")
    if (words <= 8 && (GREETING.test(lower) || BN_GREETING.test(lower))) return this.reply('greeting', 'general', lang, MSG.greeting[lang]);

    // any other question put to the assistant ("can you dance?"): say what it does, instead of searching for its words
    if (words <= 10 && CHAT_TO_YOU.test(`${lower} ${normAr(text)}`) && !QURAN_WORD.test(`${lower} ${normAr(text)}`)) {
      return this.reply('chat', 'general', lang, MSG.chat[lang], { notFound: true });
    }

    // 11. search the text
    const found = searchAyahs(this.index, this.quran, fixed);
    if (found.length > 0) {
      return this.reply('search', 'quran', lang, MSG.searchIntro[lang], { ayahs: found.map((f) => ({ s: f.ayah.s, a: f.ayah.a })) });
    }
    return this.reply('notFound', 'quran', lang, MSG.notFound[lang], { notFound: true });
  }

  /** Answer "what does <word> mean?" from the curated Quranic glossary first, then surah names or real ayah context. */
  private wordMeaning(text: string, lang: Lang): Reply | null {
    const extracted = extractMeaningTarget(text);
    if (!extracted) return null;
    const { target, glossaryOnly } = extracted;

    const entry = resolveGlossaryEntry(target);
    if (entry) {
      const ayahs = (entry.ayahs ?? []).map(([s, a]) => ({ s, a }));
      return this.reply('search', 'quran', lang, MSG.wordMeaning(entry.term[lang], entry.meaning[lang], ayahs.length > 0)[lang], { ayahs });
    }
    if (glossaryOnly) return null;

    const surah = this.surahOf(target);
    if (surah) {
      const c = this.quran.chapters[surah - 1];
      const juz = this.juzOf(surah, 1);
      const type = STAT_TEXT.type(c.type)[lang];
      const line = `Surah ${surah}: ${c.tr} (${c.ar}), "${c.en}", ${c.n} ayahs, ${c.type === 'meccan' ? 'Meccan' : 'Medinan'}; begins in juz ${juz}.`;
      return this.reply('data', 'data', lang, STAT_TEXT.surahFacts(c.tr, surah, c.en, c.n, type, juz)[lang], { data: [line] });
    }

    const arHits: Array<{ s: number; a: number }> = [];
    if (/[\u0600-\u06FF]/.test(target)) {
      const want = tokensAr(target);
      if (want.length > 0) {
        const cleanArTok = (t: string) => t.replace(/^و?ال(?=\S{2,})/, '').replace(/^و(?=\S{3,})/, '');
        for (const y of this.quran.ayahs) {
          const toks = tokensAr(y.arc);
          const ok = want.every((w) => toks.some((t) => t === w || cleanArTok(t) === w));
          if (ok) {
            arHits.push({ s: y.s, a: y.a });
            if (arHits.length >= 5) break;
          }
        }
      }
    }

    const fixed = this.fix(target);
    const phraseHits = wordCount(target) >= 3 ? this.phrases.find(target) : null;
    const themeHits = matchThemes(fixed, this.isEnglish).ayahs.slice(0, 5).map((x) => ({ s: x.s, a: x.a }));
    const searchHits = searchAyahs(this.index, this.quran, fixed).map((f) => ({ s: f.ayah.s, a: f.ayah.a }));
    const rawHits = phraseHits ?? (arHits.length > 0 ? arHits : themeHits.length > 0 ? themeHits : searchHits);
    if (rawHits.length > 0) {
      return this.reply('search', 'quran', lang, MSG.wordMeaningContext(target)[lang], { ayahs: rawHits.slice(0, 5) });
    }
    return this.reply('notFound', 'quran', lang, MSG.wordMeaningNotFound(target)[lang], { notFound: true });
  }

  /**
   * A follow-up that continues from the chat so far. Only the ayahs already shown (the citations of the history) and the
   * earlier question are used; nothing is guessed. Returns null when the message is not one of these follow-ups.
   */
  private followUp(q: string, lang: Lang, history: HistoryTurn[]): Reply | null {
    const plain = q.toLowerCase().replace(/[?!.,;:।؟،]+/g, ' ').replace(/\s+/g, ' ').trim();
    const ar = normAr(plain);
    const is = (re: RegExp) => re.test(plain) || re.test(ar);
    const about = plain.match(FU_WHAT_ABOUT) ?? ar.match(FU_WHAT_ABOUT);
    const kind = is(FU_MORE) ? 'more' : is(FU_NEXT) ? 'next' : is(FU_PREV) ? 'prev' : is(FU_NEXT_SURAH) ? 'nextSurah' : is(FU_LANG) ? 'lang' : about ? 'about' : null;
    if (!kind) return null;

    // "what about X?": the same question as before, for another surah, animal or prophet; otherwise X on its own
    if (kind === 'about') {
      const x = (about!.slice(1).find((g) => g !== undefined) ?? '').trim();
      if (!x) return null;
      if (/^(?:you|u|yourself)$/.test(x)) return this.reply('about', 'general', lang, MSG.about[lang]);
      const prev = [...history].reverse().find((h) => h.question && !this.isCountOnly(h.question));
      if (prev && this.core(prev.question, [], lang).kind === 'data') {
        const prevNamed = animalKindsIn(prev.question).length > 0 || prophetsNamedIn(prev.question).length > 0;
        const xNamed = animalKindsIn(x).length > 0 || prophetsNamedIn(x).length > 0;
        const prevSurah = SURAH_WORD_RE.test(prev.question) ? this.surahOf(prev.question) : null;
        let again: string | null = null;
        if (prevNamed && xNamed) again = `how many times is ${x} mentioned${prevSurah ? ` surah ${prevSurah}` : ''}`;
        else {
          const xSurah = this.surahOf(x);
          if (xSurah) again = `${withoutSurahName(prev.question)} surah ${xSurah}`;
        }
        if (again) {
          const r = this.core(again, [], lang);
          if (r.kind === 'data') return r;
        }
      }
      return this.core(x, [], lang);
    }

    // the rest move on from the ayahs already shown
    const last = [...history].reverse().find((h) => h.citations?.length > 0);
    if (!last) return this.reply('notFound', 'quran', lang, MSG.followUpNone[lang], { notFound: true });
    const cites = last.citations.map((c) => ({ s: c.surah, a: c.ayah }));
    const first = cites[0], end = cites[cites.length - 1];
    const n = (s: number) => this.quran.chapters[s - 1].n;
    const one = (s: number, a: number) => this.reply('ref', 'quran', lang, MSG.refIntro(`${s}:${a}`)[lang], { ayahs: [{ s, a }] });

    if (kind === 'lang') {
      const which: 'en' | 'bn' | 'none' = /arabic|আরবি|بالعربيه/.test(plain + ' ' + ar) ? 'none' : /bangla|bengali|বাংলা|بالبنغاليه/.test(plain + ' ' + ar) ? 'bn' : 'en';
      return this.reply('followup', 'quran', lang, MSG.sameAyahs(which)[lang], { ayahs: cites, translation: which });
    }
    if (kind === 'next') {
      if (end.a < n(end.s)) return one(end.s, end.a + 1);
      if (end.s < 114) return one(end.s + 1, 1);
      return this.reply('ref', 'quran', lang, MSG.edgeOfQuran('last')[lang]);
    }
    if (kind === 'prev') {
      if (first.a > 1) return one(first.s, first.a - 1);
      if (first.s > 1) return one(first.s - 1, n(first.s - 1));
      return this.reply('ref', 'quran', lang, MSG.edgeOfQuran('first')[lang]);
    }
    if (kind === 'nextSurah') {
      if (end.s >= 114) return this.reply('ref', 'quran', lang, MSG.edgeOfQuran('last')[lang]);
      return this.core(`surah ${end.s + 1}`, [], lang);
    }
    // "show more": ayahs read in order go on from where they stopped; a topic or a search shows ayahs not shown yet
    const inOrder = cites.every((c, i) => i === 0 || (c.s === cites[i - 1].s && c.a === cites[i - 1].a + 1));
    if (inOrder) {
      if (end.a >= n(end.s)) return this.reply('ref', 'quran', lang, MSG.endOfSurah(this.quran.chapters[end.s - 1].tr)[lang]);
      const list = this.range(end.s, end.a + 1, n(end.s));
      return this.reply('ref', 'quran', lang, MSG.moreIntro(refLabel(list))[lang], { ayahs: list });
    }
    const shown = new Set(cites.map((c) => `${c.s}:${c.a}`));
    const more = searchAyahs(this.index, this.quran, this.fix(toAsciiDigits(last.question)), 25)
      .map((f) => ({ s: f.ayah.s, a: f.ayah.a })).filter((y) => !shown.has(`${y.s}:${y.a}`)).slice(0, 5);
    if (more.length === 0) return this.reply('notFound', 'quran', lang, MSG.noMore[lang], { notFound: true });
    return this.reply('search', 'quran', lang, MSG.moreSearch[lang], { ayahs: more });
  }

  /** Did the assistant's last answer ask "How are you?" (then "good" or "valo" is the person's answer). */
  private askedHowAreYou(history: HistoryTurn[]): boolean {
    const last = history[history.length - 1]?.answer ?? '';
    return (['en', 'bn', 'ar'] as const).some((l) => last.includes(MSG.howAreYouAsked[l]));
  }

  /** What to say back in a little conversation: a greeting word first (salam is answered with salam), then the rest. */
  private converse(c: Conversation, lang: Lang): Reply {
    const open = c.opener && c.opener !== 'welcome' ? `${MSG.opener[c.opener][lang]} ` : '';
    switch (c.talk) {
      case 'notWell': {   // a kind word, then the checked ayahs about hardship and comfort (as for "I am sad")
        const themed = matchThemes('sad', this.isEnglish);
        const label = [...new Set(themed.themes.map((t) => THEME_LABEL[t.id]?.[lang] ?? t.id))].join(DOMAIN_JOIN(lang));
        return this.reply('theme', 'quran', lang, `${open}${MSG.sorryToHear[lang]} ${MSG.themeIntro(label)[lang]}`,
          { ayahs: themed.ayahs.map((x) => ({ s: x.s, a: x.a })) });
      }
      case 'jazakallah': return this.reply('thanks', 'general', lang, open + MSG.jazakallah[lang]);
      case 'praise': return this.reply('thanks', 'general', lang, open + MSG.compliment[lang]);
      case 'greeting': return this.reply('greeting', 'general', lang, open + MSG.greetingBody[lang]);
      default: return this.reply('greeting', 'general', lang, open + MSG[c.talk][lang]);
    }
  }

  /** A short message to the assistant itself: its name, a personal question, praise, or a joke. Never when the Quran is asked about. */
  private talk(text: string, lower: string, words: number, lang: Lang): Reply | null {
    // each form on its own: some patterns must match the WHOLE message (^...$)
    const ar = normAr(text);
    const has = (re: RegExp) => re.test(lower) || re.test(ar);
    if (has(QURAN_WORD)) return null;
    if (has(CHAT_NAME)) return this.reply('about', 'general', lang, MSG.myName[lang]);
    if (has(CHAT_PERSONAL)) return this.reply('about', 'general', lang, MSG.personal[lang]);
    if (words <= 7 && has(CHAT_PRAISE)) return this.reply('thanks', 'general', lang, MSG.compliment[lang]);
    if (has(CHAT_OTHER)) return this.reply('chat', 'general', lang, MSG.chat[lang], { notFound: true });
    return null;
  }

  /** Only count words and filler ("give me the count number", "how many?", "মোট কয়টি?", "كم عددها؟"). */
  private isCountOnly(q: string): boolean {
    if (!COUNT_WORD.test(q)) return false;
    const toks = normAr(normBn(q)).toLowerCase().split(/[^\p{L}\p{M}]+/u).filter(Boolean);
    return toks.length > 0 && toks.every((w) => COUNT_FILLER.has(w));
  }

  /**
   * "how many?" after another question. Only two cases are safe to answer:
   *   - the answer before was already a number or a list ("which animals ...?"): the same answer again;
   *   - it was a surah or a para: how many ayahs it has.
   * Anything else ("Ayat al-Kursi", "patience") has no number to give: say what can be counted.
   * (Joining the two questions is NOT safe: "Ayat al-Kursi how many" would count all the ayahs of the Quran.)
   */
  private countFollowUp(q: string, lang: Lang, history: HistoryTurn[]): Reply {
    const prev = [...history].reverse().find((h) => h.question && !this.isCountOnly(h.question));
    if (prev) {
      // answered in the language of the follow-up ("মোট কয়টি?" after an English question gets a Bengali answer)
      const before = this.core(prev.question, [], lang);
      if (before.kind === 'data' && before.data?.length) return before;
      if (before.kind === 'surah' || before.kind === 'juz') {
        const count = this.core(`${prev.question} ${q} ayahs আয়াত آيات`, [], lang);
        if (count.kind === 'data' && count.data?.length) return count;
      }
    }
    return this.reply('data', 'data', lang, MSG.dataNotUnderstood[lang]);
  }

  /**
   * Questions about animals, counted from the text (src/animals.ts):
   *   "how many times is the cow mentioned?" (one animal by name) and
   *   "how many animals are mentioned in the Quran?", "which animals are in surah Al-Baqarah?" (the list).
   */
  private animals(text: string, lang: Lang): Reply | null {
    const both = `${text} ${normAr(text)}`;
    // one animal by name: how many times, in how many ayahs. "the WORD cow" stays a count of that exact word.
    const kinds = animalKindsIn(text);
    const asksCount = HOW_OFTEN.test(text) || (HOW_MANY.test(text) && (MENTION.test(both) || (AYAH_WORD.test(text) && !SURAH_WORD_RE.test(text))));
    if (kinds.length > 0 && asksCount && !WORD_ASKED.test(both)) return this.animalMentions(kinds, text, lang);
    if (!ANIMAL_WORD.test(both) || ANIMAL_NOT_LIST.test(both) || HOW_OFTEN.test(text)) return null;
    if (!HOW_MANY.test(text) && !ANIMAL_ASK.test(both)) return null;
    const surah = this.surahOf(text);
    const hits = animalsIn(this.quran, surah ?? undefined);
    const names = hits.map((h) => h.kind.name[lang]).join(DOMAIN_JOIN(lang));
    const where = surah ? { tr: this.quran.chapters[surah - 1].tr, ar: this.quran.chapters[surah - 1].ar } : null;
    const lines = [STAT_TEXT.animalsMethod, ...hits.map((h) => `${h.kind.name.en} (${h.kind.name.ar}): ${refLabel(h.ayahs)}`)];
    return this.reply('data', 'data', lang, STAT_TEXT.animals(hits.length, names, where)[lang], { data: lines });
  }

  /**
   * The prophets named in the Quran (src/prophets.ts): "how many times is Musa mentioned (in surah X)?" and
   * "which / how many prophets are mentioned (in surah X)?". Counted from the text, never interpreted.
   */
  private prophets(text: string, lang: Lang): Reply | null {
    const both = `${text} ${normAr(text)}`;
    const named = prophetsNamedIn(text);
    const asksCount = HOW_OFTEN.test(text) || (HOW_MANY.test(text) && (MENTION.test(both) || (AYAH_WORD.test(text) && !SURAH_WORD_RE.test(text))));
    const surah = SURAH_WORD_RE.test(text) ? this.surahOf(text) : null;
    const where = surah ? { tr: this.quran.chapters[surah - 1].tr, ar: this.quran.chapters[surah - 1].ar } : null;
    if (named.length > 0 && asksCount) {
      const all = prophetsIn(this.quran, surah ?? undefined);
      const found = named.map((p) => {
        const ayahs = all.find((h) => h.prophet.id === p.id)?.ayahs ?? [];
        return { p, ayahs, times: ayahs.reduce((n, y) => n + y.times, 0) };
      });
      const every = found.flatMap((f) => f.ayahs).sort((x, y) => x.s - y.s || x.a - y.a)
        .filter((y, i, l) => i === 0 || y.s !== l[i - 1].s || y.a !== l[i - 1].a);
      const shown = every.slice(0, MAX_RANGE).map(({ s, a }) => ({ s, a }));
      const lines = [STAT_TEXT.animalsMethod.replace('The list of kinds', 'The list of names'), ...found.map((f) =>
        `${f.p.name.en} (Arabic: ${f.p.ar.join(', ')}): ${f.times} times in ${f.ayahs.length} ayahs${where ? ` of surah ${surah} ${where.tr}` : ''}${f.ayahs.length ? `: ${refLabel(f.ayahs)}` : ''}`)];
      const items = found.map((f) => ({ name: f.p.name, times: f.times, ayahs: f.ayahs.length }));
      return this.reply('data', 'data', lang, STAT_TEXT.prophetMentions(items, where, shown.length, every.length)[lang], { data: lines, ayahs: shown });
    }
    if (!PROPHET_WORD.test(both) || PROPHET_NOT_LIST.test(both) || HOW_OFTEN.test(text) || WORD_ASKED.test(both)) return null;
    if (!HOW_MANY.test(text) && !ANIMAL_ASK.test(both)) return null;
    const hits = prophetsIn(this.quran, surah ?? undefined);
    const names = hits.map((h) => h.prophet.name[lang]).join(DOMAIN_JOIN(lang));
    const lines = hits.map((h) => `${h.prophet.name.en}: ${h.ayahs.reduce((n, y) => n + y.times, 0)} times in ${h.ayahs.length} ayahs`);
    // the whole list comes with 40:78: the Quran itself says it has not told the stories of all the messengers
    return this.reply('data', 'data', lang, STAT_TEXT.prophets(hits.length, names, where)[lang], { data: lines, ayahs: surah ? [] : [{ s: 40, a: 78 }] });
  }

  /** "how many times is the cow mentioned (in surah X)?": the number of times and of ayahs, and the first ayahs themselves. */
  private animalMentions(kinds: AnimalKind[], text: string, lang: Lang): Reply {
    // only a surah that is NAMED as a surah limits the count ("the cow" alone is not Surah Al-Baqarah)
    const surah = SURAH_WORD_RE.test(text) ? this.surahOf(text) : null;
    const all = animalsIn(this.quran, surah ?? undefined);
    const found = kinds.map((kind) => {
      const ayahs = all.find((h) => h.kind.id === kind.id)?.ayahs ?? [];
      return { kind, ayahs, times: ayahs.reduce((n, y) => n + y.times, 0) };
    });
    const every = found.flatMap((f) => f.ayahs).sort((x, y) => x.s - y.s || x.a - y.a)
      .filter((y, i, l) => i === 0 || y.s !== l[i - 1].s || y.a !== l[i - 1].a);
    const shown = every.slice(0, MAX_RANGE).map(({ s, a }) => ({ s, a }));
    const where = surah ? { tr: this.quran.chapters[surah - 1].tr, ar: this.quran.chapters[surah - 1].ar } : null;
    const items = found.map((f) => ({ name: f.kind.name, times: f.times, ayahs: f.ayahs.length }));
    const lines = [STAT_TEXT.animalsMethod, ...found.map((f) =>
      `${f.kind.name.en} (Arabic: ${f.kind.ar.join(', ')}): ${f.times} times in ${f.ayahs.length} ayahs${where ? ` of surah ${surah} ${where.tr}` : ''}${f.ayahs.length ? `: ${refLabel(f.ayahs)}` : ''}`)];
    return this.reply('data', 'data', lang, STAT_TEXT.animalMentions(items, where, shown.length, every.length)[lang], { data: lines, ayahs: shown });
  }

  /** "What is the most used word (in surah X)?": counted in the Arabic text, with the most used content words after it. */
  private wordFreq(surah: number | null, lang: Lang): Reply {
    const f = wordFrequency(this.quran, surah ?? undefined);
    const content = tiedTop(f.content);
    const allahIsTop = content.some((w) => w.word === 'الله');
    const shownAlready = new Set(content.map((w) => w.word));
    const next = f.content.filter((w) => !shownAlready.has(w.word) && !(allahIsTop && isAllahForm(w.word))).slice(0, 8);
    const name = surah ? { tr: this.quran.chapters[surah - 1].tr, ar: this.quran.chapters[surah - 1].ar } : null;
    const scope = name ? `surah ${surah} ${name.tr}` : 'the Quran';
    const lines = [
      `Arabic text (Tanzil simple-clean), ${scope}: ${f.total} words. Most used written forms: ${f.ranked.slice(0, 12).map((w) => `${w.word} ${w.n}`).join(', ')}.`,
      `Small words left out for the second ranking: particles, pronouns and the like (src/wordfreq.ts), also with و or ف in front.`,
    ];
    return this.reply('data', 'data', lang, STAT_TEXT.wordFreq({
      surah: name, total: f.total, most: tiedTop(f.ranked), content,
      allah: allahIsTop ? { alone: f.allah.alone, all: f.allah.all } : null, next,
    })[lang], { data: lines });
  }

  /** "How many times is Allah mentioned (in surah X)?": the name in the Arabic text, alone and with a joined letter. */
  private allahCount(surah: number | null, lang: Lang): Reply {
    const { allah } = wordFrequency(this.quran, surah ?? undefined);
    const name = surah ? { tr: this.quran.chapters[surah - 1].tr, ar: this.quran.chapters[surah - 1].ar } : null;
    const line = `The name Allah in the Arabic text (Tanzil simple-clean)${name ? `, surah ${surah} ${name.tr}` : ''}: ${allah.all} times; الله alone ${allah.alone}${allah.forms.map((w) => `, ${w.word} ${w.n}`).join('')}; اللهم ${allah.allahumma} (not counted in the ${allah.all}).`;
    return this.reply('data', 'data', lang, STAT_TEXT.allahCount({ surah: name, ...allah })[lang], { data: [line] });
  }

  /** The question asks only how often the name Allah is there (not "how many times does Allah mention patience"). */
  private onlyAllahAsked(text: string): boolean {
    const rest = withoutSurahName(text);
    const toks = normAr(normBn(rest)).toLowerCase().split(/[^\p{L}\p{M}]+/u).filter(Boolean);
    return toks.length > 0 && toks.every((w) => ALLAH_FILLER.has(w));
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

    // the most used words, and how often the name Allah is there (src/wordfreq.ts), in the whole Quran or a named surah
    const both = `${text} ${normAr(text)}`;
    const named = SURAH_WORD_RE.test(text) ? surah : null;
    if (WORD_FREQ.test(both) && !WORD_FREQ_NOT.test(both)) return this.wordFreq(named, lang);
    if (ALLAH.test(both) && (HOW_OFTEN.test(text) || (HOW_MANY.test(text) && MENTION.test(both))) && this.onlyAllahAsked(text)) return this.allahCount(named, lang);

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
    // "surah as-sajdah" is Surah 32 (its name means "the prostration"), not the list of sajdah places
    if (SAJDA.test(text) && !(surah === 32 && SURAH_WORD_RE.test(text))) {
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
    const meaningCandidate = extractMeaningTarget(text);
    const preferGlossary = !!(
      meaningCandidate && !meaningCandidate.glossaryOnly
      && !SURAH_WORD_RE.test(text) && !/\b(?:name|nam|نام)\b|নাম/i.test(text)
      && !/\b(?:al|ar|as|at|an|az|ash)[-\s]/i.test(text)
      && resolveGlossaryEntry(meaningCandidate.target)
    );
    if (surah && SURAH_FACTS.test(text) && !(HOW_MANY.test(text) && AYAH_WORD.test(text)) && !preferGlossary) {
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
    const TOTALS_ASK = /(?:how many|number of|total|count(?: of)?|koyta|koyti|koyto|kotogulo|kototi|kotota|koto)\s+(?:total\s+)?(?:ayahs?|ayat|verses?|surahs?|suras?)\b|(?:কয়টি|কয়টা|কতটি|কতগুলো|কতগুলি|কতটা|কত|মোট)\s*(?:টি|টা)?\s*(?:সূরা|সুরা|আয়াত)|(?:সূরা|সুরা|আয়াত)\s*(?:কয়টি|কয়টা|কতটি|কতগুলো|কতটা|কত)|كم\s*(?:عدد\s*)?(?:آية|آيات|ايه|سورة|سور)/i;
    if (!surah && TOTALS_ASK.test(text)) {
      const s = totals(q);
      return t(s.line, STAT_TEXT.totals(q.chapters.length, q.ayahs.length)[lang]);
    }
    return null;
  }
}

export { THEMES };
