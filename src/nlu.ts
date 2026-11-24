/**
 * Local sentence-level pragmatics & meaning-first intent engine (zero third-party AI).
 *
 * Understands the user's SENTENCE MEANING (speech act & personal stance) BEFORE keyword/topic lookup:
 *  1) Personal suicidal / self-harm crisis ("I want to do suicide", "I want to kill myself")
 *     vs objective topic inquiry ("suicide", "what does the Quran say about suicide?").
 *  2) Bot-directed remarks / name-calling -> calm redirection to the Quran.
 *  3) 21 nuanced life situations (struggle, grief, divorce/breakup, marriage hope, worship struggle,
 *     sin/temptation, being wronged, fear of death/hereafter, anger, loneliness, rizq, illness, etc.).
 *  4) Universal personal-sentence stance detector across ALL ~80 Quranic themes so any personal
 *     sentence on any topic receives empathetic, meaning-aware guidance rather than a generic textbook blurb.
 *  5) Casual everyday chatter & clear out-of-scope triggers.
 */

export type SituationId =
  | 'life_struggle'
  | 'anxiety_worry'
  | 'loneliness'
  | 'guilt_repentance'
  | 'anger_injustice'
  | 'financial_rizq'
  | 'grief_loss'
  | 'illness_pain'
  | 'purpose_growth'
  | 'trials_why'
  | 'gratitude_joy'
  | 'study_career'
  | 'faith_waswas'
  | 'family_relations'
  | 'character_habits'
  | 'divorce_heartbreak'
  | 'marriage_hope'
  | 'worship_struggle'
  | 'sin_temptation'
  | 'fear_hereafter'
  | 'harm_others'
  | 'decision_confusion'
  | 'reconcile_peace'
  | 'rumor_verify'
  | 'insult_provocation'
  | 'debtor_charity_adab';

export type PersonalStance = 'distress' | 'remorse' | 'aspiration' | 'recommendation' | 'context';

export type GentleFallbackKind = 'health' | 'social' | 'general';

export interface SituationMatch {
  id: SituationId;
  ayahs: ReadonlyArray<{ s: number; a: number }>;
  themeId: string;
}

// ------------------------------------------------------------------ 1. Personal Crisis vs Topic Inquiry
const DIRECT_CRISIS_EN_RE =
  /\b(?:kill\s+myself|end(?:ing)?\s+my\s+life|take\s+my\s+own\s+life|wanna\s+die|(?:want|going|wish\s+i\s+could|ready)\s+to\s+die|can'?t\s+go\s+on|cannot\s+go\s+on|no\s+reason\s+to\s+live|(?:don'?t|do\s+not)\s+want\s+to\s+live|hurt\s+myself|harm\s+myself|nothing\s+matters|nobody\s+would\s+miss\s+me\s+if\s+i\s+die|no\s+one\s+would\s+miss\s+me\s+if\s+i\s+die)\b/i;

const DIRECT_CRISIS_BN_RE =
  /মরে\s*যেতে|মরতে\s*ইচ্ছ|মরতে\s*চাই|বাঁচতে\s*ইচ্ছ|বাঁচতে\s*চাই\s*না|আর\s*বাঁচতে\s*ইচ্ছা\s*নেই|জীবন\s*শেষ|নিজেকে\s*শেষ|আর\s*পারছি\s*না|নিজেকে\s*আঘাত/u;

const DIRECT_CRISIS_BANGLISH_RE =
  /\b(?:morte\s+ichha|morte\s+chai|bachte\s+ichha|bachte\s+chai\s+na|jibon\s+shesh|nijeke\s+shesh)\b/i;

const DIRECT_CRISIS_AR_RE =
  /أريد\s*أن\s*أموت|أقتل\s*نفسي|لا\s*أريد\s*أن\s*أعيش|لا\s*أستطيع\s*المتابعة|لا\s*فائدة\s*من\s*الحياة|سأنتحر/u;

const THIRD_PERSON_BEREAVEMENT_SUICIDE_RE =
  /\b(?:my\s+(?:friend|brother|sister|cousin|uncle|aunt|father|mother|son|daughter|colleague|classmate|neighbor)|someone\s+i\s+know)\s+(?:committed|died\s+by|took\s+(?:his|her|their)\s+life|killed\s+(?:himself|herself|themselves))\b/i;

const TOPIC_QUERY_SUICIDE_RE =
  /\b(?:what\s+does|verses?\s+(?:about|on)|ayahs?\s+(?:about|on)|ayats?\s+(?:about|on)|(?:say|says|talk|talks|tell\s+me|teach|read)\s+about|in\s+(?:the\s+)?(?:quran|koran|islam)|according\s+to\s+(?:the\s+)?(?:quran|islam)|punishment\s+for|ruling\s+on|is\s+suicide\s+(?:haram|a\s+sin|allowed|forbidden|mentioned)|meaning\s+of\s+suicide)\b|সম্পর্কে|বিষয়ে|নিয়ে\s*(?:কুরআন|আয়াত|কী\s*বলে)|কুরআনে?\s*আত্মহত্যা|في\s*(?:القرآن|الإسلام)|حكم\s*الانتحار|ما\s*يقول\s*القرآن\s*عن\s*الانتحار/i;

const PERSONAL_SUICIDE_EN_RE =
  /\b(?:(?:i|im|i'm|ive|i've|me|my|myself)\b[^.!?\n]{0,35}\b(?:suicid\w*|self[- ]?harm\w*)|(?:suicid\w*|self[- ]?harm\w*)\b[^.!?\n]{0,25}\b(?:tonight|today|right\s+now|thoughts?|urges?)|(?:want(?:ing)?|wanna|going\s+to|gonna|think(?:ing)?\s+(?:of|about)|consider(?:ing)?|plan(?:ning)?|ready\s+to|about\s+to|feel(?:ing)?|how\s+to|ways?\s+to|do|commit|attempt)\s+(?:commit(?:ting)?\s+|do(?:ing)?\s+)?(?:suicid\w*|self[- ]?harm\w*)|suicidal\s+(?:thoughts?|urges?|right\s+now|lately|today))\b/i;

const PERSONAL_SUICIDE_BN_RE =
  /(?:আমি|আমার|নিজে\S*|করতে|করব|করবো|চাই|ভাবছি|ইচ্ছা|ইচ্ছে|কীভাবে|কিভাবে|উপায়)[^।!?\n]{0,25}আত্মহত্যা|আত্মহত্যা\s*(?:করতে|করব|করবো|চাই|ভাবছি|করার\s*উপায়|করতে\s*ইচ্ছে)/u;

const PERSONAL_SUICIDE_BANGLISH_RE =
  /\b(?:(?:ami|amar|nijeke|korte|korbo|chai|vabchi|bhabchi|ichha|kivabe|kibhabe)\b.{0,25}\b(?:atmohotta|atmahatya)\b|(?:atmohotta|atmahatya)\s*(?:korte|korbo|chai|vabchi|bhabchi|korar\s+upay))\b/i;

const PERSONAL_SUICIDE_AR_RE =
  /(?:أريد|أفكر|أنوي|أشعر|كيف)\s*(?:في\s*|بـ?\s*)?(?:الانتحار|انتحار|أن\s*أنتحر)|(?:انتحار|الانتحار)\s*(?:اليوم|الآن|الليلة)/u;

/**
 * True ONLY when the sentence expresses personal suicidal / self-harm distress or asks how to self-harm.
 * Returns FALSE for bare topic queries ("suicide", "আত্মহত্যা", "الانتحار") and Quran topic questions
 * ("what does the Quran say about suicide?"), allowing the engine to show real Quranic verses on the sanctity of life.
 */
export function isPersonalCrisis(text: string): boolean {
  const q = text.trim().normalize('NFC');
  if (!q) return false;
  if (THIRD_PERSON_BEREAVEMENT_SUICIDE_RE.test(q)) return false;
  if (
    DIRECT_CRISIS_EN_RE.test(q) ||
    DIRECT_CRISIS_BN_RE.test(q) ||
    DIRECT_CRISIS_BANGLISH_RE.test(q) ||
    DIRECT_CRISIS_AR_RE.test(q)
  ) {
    return true;
  }
  if (TOPIC_QUERY_SUICIDE_RE.test(q) && !/\b(?:i|im|i'm|my|myself|ami|amar)\b|আমি|আমার|أريد|أفكر/i.test(q)) {
    return false;
  }
  return (
    PERSONAL_SUICIDE_EN_RE.test(q) ||
    PERSONAL_SUICIDE_BN_RE.test(q) ||
    PERSONAL_SUICIDE_BANGLISH_RE.test(q) ||
    PERSONAL_SUICIDE_AR_RE.test(q)
  );
}

// ------------------------------------------------------------------ 2. Bot-Directed Remarks
const INFO_REQUEST_FRAME_RE = new RegExp(
  [
    String.raw`\b(?:tell\s+me|show\s+me|give\s+me|explain|what\s+does|say\s+about|verses?\s+about|ayahs?\s+about)\b`,
    String.raw`বলো|বলুন|দেখাও|দেখান|জানাও|দাও|নিয়ে|সম্পর্কে|বিষয়ে`,
    String.raw`\b(?:bolo|bolun|dekhao|dekhan|dao|den|niye|somporke|shomporke|bishoye)\b`,
  ].join('|'),
  'i',
);

const BOT_DIRECTED_EN_COPULA_RE =
  /^(?:hey\s+|hi\s+)?(?:(?:you(?:'re|\s+are|\s+r)|u(?:'re|\s+are|\s+r)|ur)\s+(?:not\s+)?(?:so\s+|very\s+|really\s+|too\s+|just\s+|such\s+|totally\s+|completely\s+)?(?:a\s+|an\s+|the\s+)?[a-z]+(?:\s+[a-z]+){0,3}|(?:are|r)\s+(?:you|u)\s+(?:dumb|stupid|crazy|blind|deaf|annoying|useless|mad|insane|ugly|boring))[\s!?.]*$/i;

const BOT_DIRECTED_EN_BEHAVIOR_RE =
  /^(?:you|u)\s+(?:look|act|sound|talk|seem|behave|suck|fail|stink|make\s+no\s+sense|know\s+nothing|have\s+no\s+(?:brain|sense|idea|clue|feelings)|don'?t\s+(?:understand|know|listen|care|make\s+sense)|do\s+not\s+(?:understand|know|listen|care)|can'?t\s+(?:understand|think|do\s+anything)|never\s+(?:understand|listen|help))\b|^(?:i\s+hate\s+(?:you|u)|nobody\s+likes\s+(?:you|u)|you(?:'re|\s+are)\s+fired)\b/i;

const BOT_DIRECTED_EN_CMD_RE =
  /^(?:shut\s+up|be\s+quiet|stop\s+talking|go\s+away|get\s+lost|leave\s+me\s+alone|(?:bad|dumb|stupid|crazy|useless|weird|silly|fake|broken)\s+(?:bot|ai|assistant|chatbot)|hey\s+(?:donkey|cow|fool|crazy|loser|clown|dummy))\b/i;

const BOT_DIRECTED_BN_RE =
  /^(?:(?:তুমি|তুই|আপনি)\s+(?:একটা|একজন|খুব|অনেক|পুরাই|একদম|সত্যিই|আসলেই)?\s*(?:গাধা|গরু|ছাগল|বানর|পাগল|বোকা|ফালতু|বাজে|বিরক্তিকর|অকেজো|রোবট|ভুয়া|মিথ্যুক|কিছুই?\s*(?:বোঝো|বুঝো|বোঝেন|জানো|জানেন|পারো|পারেন)\s*না|কথা\s*(?:বোঝো|বুঝো)\s*না|কোনো\s*কাজের\s*না)|(?:তুমি|তুই)\s+(?:একটা|একজন)\s+[\u0980-\u09FF]+(?:\s+[\u0980-\u09FF]+){0,2}[\s!?.।]*$|আমি\s+তোমাকে\s+ঘৃণা\s+করি|চুপ\s*(?:থাক|থাকো|কর|করো)|ভাগ\s*এখান\s*থেকে|(?:বাজে|ফালতু)\s*বট)/u;

const BOT_DIRECTED_BANGLISH_RE =
  /^(?:(?:tumi|tui|apni)\s+(?:ekta|ekjon|khub|onek|purai|ekdom|shotti)?\s*(?:gadha|gada|goru|chagol|banor|pagol|pagla|boka|faltu|baje|biroktikor|okejo|robot|bhuya|vuya|mitthuk|kichu(?:i)?\s*(?:bujho|bojho|bujhen|jano|janen|paro|paren)\s*na|kotha\s*(?:bujho|bojho)\s*na|kono\s*kajer\s*na)\b|(?:tumi|tui)\s+ekta\s+[a-z]+(?:\s+[a-z]+){0,2}[\s!?.]*$|(?:chup\s*(?:thak|thako|kor|koro)|bhag|vag|(?:baje|faltu)\s+bot)\b)/i;

const BOT_DIRECTED_AR_RE =
  /^(?:(?:أنت|انت|أنتي|انتي)\s+(?:حمار|بقرة|بقره|كلب|قرد|مجنون|مجنونه|غبي|غبيه|أحمق|احمق|تافه|ممل|كذاب|روبوت|آلي|لا\s*تفهم|لا\s*تعرف\s*شيئا|مزعج)|أكرهك|اسكت|اصمت|توقف\s*عن\s*الكلام)/u;

/**
 * True when the user is addressing or labeling the assistant itself
 * (e.g. "you are donkey", "you are crazy", "you don't understand me", "tumi ekta goru").
 * Caller must already check `!aboutQuran` and `!phrases.find(rawText)`.
 */
export function isBotDirected(text: string): boolean {
  const q = text.trim();
  if (!q || INFO_REQUEST_FRAME_RE.test(q)) return false;
  return (
    BOT_DIRECTED_EN_COPULA_RE.test(q) ||
    BOT_DIRECTED_EN_BEHAVIOR_RE.test(q) ||
    BOT_DIRECTED_EN_CMD_RE.test(q) ||
    BOT_DIRECTED_BN_RE.test(q) ||
    BOT_DIRECTED_BANGLISH_RE.test(q) ||
    BOT_DIRECTED_AR_RE.test(q)
  );
}

// ------------------------------------------------------------------ 3. Sentence-Meaning Situation Classifier
const EXCLUDE_SITUATION_RE = new RegExp(
  [
    String.raw`\b\d{1,3}:\d{1,3}\b`,
    String.raw`\b(?:quran|koran|qur'?an|ayahs?|ayats?|verses?|surah|sura|juz|para|page)\b|কুরআন|কোরআন|আয়াত|সূরা|পারা|القرآن|آي[ةه]|سورة|جزء`,
    String.raw`\b(?:dua|duas|doa|doas|supplication)\b|দোয়া|দুআ|دعاء`,
    String.raw`\b(?:how\s+many|how\s+often|which\s+surah|longest|shortest|count)\b|কয়টি|কতটি|কতবার|কোন\s*সূরা|كم\s`,
    String.raw`\b(?:meaning\s+of|what\s+does\b.{0,30}\bmean|explain|tafsir|story\s+of)\b|অর্থ\s*কী|ব্যাখ্যা|তাফসীর|কাহিনী|معنى|تفسير|قصة`,
  ].join('|'),
  'i',
);

const FIRST_PERSON_RE =
  /\b(?:i|im|i'm|ive|i've|me|my|myself|we|our|ami|amar|amr|amake|amader|lagche|lagchhe|lagse|jacche|hocche|parchi\s+na|parchina|achi|chai|chacchi|mon\s+ta)\b|^(?:feeling|worried|struggling|nervous|scared|going\s+through|trying\s+to|want\s+to)\b|আমি|আমার|আমাকে|আমরা|চাই|চাচ্ছি|দিশেহারা|মনে\s*হচ্ছে|মনে\s*হয়|লাগছে|লাগসে|যাচ্ছে|পাচ্ছি\s*না|পারছি\s*না|বসছে\s*না|আছি|পেয়েছি|হয়ে\s*গেছি|মনটা|أنا|انا|لست|إيماني|قلبي|حياتي|نفسي|أهلي|أشعر|اشعر|أخاف|اخاف|أعاني|أحس|حاسس|أريد|اريد|مستقبلي|يومي|عملي|ذنوبي|أخطائي|فقدت|وظيفتي|أستطيع|أقصر/i;

const ADVICE_FRAME_RE =
  /\b(?:what\s+(?:should|can|could|would|must)\s+(?:i|we|one|someone|they|a\s+person|people)\s+do|what\s+(?:to|is\s+best\s+to)\s+do|how\s+(?:do|can|should)\s+(?:i|we|one|someone)|how\s+to\s+(?:overcome|deal\s+with|control|stop|quit|build|be|become|handle|manage|focus|improve|stay|forgive|heal|cope|strengthen|get\s+rid|resist|avoid|respond|react|make\s+peace|resolve)|suggest\w*|recommend\w*|advis(?:e|ing)|advice|any\s+(?:tips|guidance|ideas)\s+(?:for|on|when|if|about)|in\s+(?:this|such\s+a|that|a\s+difficult|any)\s+(?:circumstance|situation|moment|case)|why\s+(?:is\s+life|do\s+bad\s+things|am\s+i|does\s+allah)|help\s+me|ki\s+korbo|ki\s+kora\s+uchit|koroniyo|poramorsho|upodesh|kivabe|kibhabe)\b|কী\s*করব|কি\s*করব|কী\s*করা\s*উচিত|কি\s*করা\s*উচিত|করণীয়|পরামর্শ|উপদেশ|সাজেস্ট|রিকমেন্ড|কীভাবে|কিভাবে|ماذا\s*(?:أفعل|نفعل|يفعل|ينبغي)|ما\s*العمل|كيف\s*(?:أتعامل|أتصرف|أتخلص|أترك|أواظب)|اقترح|اقتراح|نصيحة|تنصح\w*|أنصحني|ما\s*(?:هو\s*)?(?:هدف|معنى)\s*الحياة/i;

const LIFE_CONTEXT_RE =
  /\b(?:life|living|world|heart|mind|soul|future|lately|anymore|everything|nothing|jibon|jibone|jiboner|duniya|mon|monta)\b|জীবন|জীবনে|জীবনের|মন|মনটা|দুনিয়া|ভবিষ্যৎ|الحياة|حياتي|الدنيا|قلبي|مستقبلي/i;

interface SituationSpec {
  id: SituationId;
  themeId: string;
  priority: number;
  ayahs: ReadonlyArray<{ s: number; a: number }>;
  strong: RegExp;
  supporting?: RegExp;
}

const SITUATION_SPECS: ReadonlyArray<SituationSpec> = [
  {
    id: 'harm_others',
    themeId: 'anger and patience with people',
    priority: 15,
    ayahs: [{ s: 5, a: 32 }, { s: 3, a: 134 }, { s: 41, a: 34 }],
    strong: /\b(?:(?:want|wanna|going|plan(?:ning)?|feel\s+like)\s+to\s+(?:kill|murder|hurt|attack|beat|stab|shoot)\s+(?:someone|him|her|them|people|my\s+\w+|a\s+person)|কাউকে\s*(?:মেরে\s*ফেলতে|হত্যা\s*করতে|আঘাত\s*করতে)\s*চাই|মানুষ\s*খুন\s*করতে\s*চাই|أريد\s*(?:قتل|إيذاء)\s*(?:شخص|أحد))\b/i,
  },
  {
    id: 'grief_loss',
    themeId: 'death and the hereafter',
    priority: 12,
    ayahs: [{ s: 2, a: 155 }, { s: 2, a: 156 }, { s: 2, a: 157 }, { s: 3, a: 185 }, { s: 94, a: 5 }],
    strong: /\b(?:passed\s+away|died|lost\s+(?:my|a)\s+(?:mother|father|mom|dad|parent|brother|sister|wife|husband|child|son|daughter|friend|cousin|uncle|aunt|grandmother|grandfather|loved\s+one)|committed\s+suicide|died\s+by\s+suicide|funeral|grieving|bereaved|mourning|miss\s+my\s+late|mara\s+(?:geche\w*|gese\w*)|intekal)\b|মারা\s*গেছে\S*|ইন্তেকাল|শোকাহত|توفي|مات(?:ت)?\s*(?:أبي|أمي|أخي|أختي|صديقي|والدي|والدتي|قريبي)/i,
    supporting: /\b(?:grief|loss|death)\b/i,
  },
  {
    id: 'divorce_heartbreak',
    themeId: 'divorce',
    priority: 11,
    ayahs: [{ s: 65, a: 2 }, { s: 65, a: 3 }, { s: 2, a: 231 }, { s: 94, a: 5 }, { s: 94, a: 6 }],
    strong: /\b(?:going\s+through\s+(?:a\s+)?(?:divorce|breakup|separation)|(?:husband|wife|spouse)\s+(?:divorced\s+me|left\s+me|wants?\s+(?:a\s+)?divorce)|getting\s+divorced|want\s+(?:a\s+)?divorce|filed\s+for\s+divorce|broke\s+up\s+with\s+me|had\s+a\s+breakup|marriage\s+is\s+(?:ending|over|broken|falling\s+apart)|divorce\s+hocche|talak\s+hoye\s+geche|breakup\s+hoyeche)\b|ডিভোর্স\s*(?:হচ্ছে|হয়ে\s*গেছে|চাই)|তালাক\s*(?:হয়ে\s*গেছে|দিয়েছে|চাই)|ব্রেকআপ\s*হয়েছে|সংসার\s*ভেঙে\s*যাচ্ছে|طلقت|طلقني|أمر\s*بالطلاق|انفصلت/i,
    supporting: /\b(?:divorce|breakup|separated|talak|talaq)\b/i,
  },
  {
    id: 'financial_rizq',
    themeId: 'trust in Allah',
    priority: 10,
    ayahs: [{ s: 65, a: 2 }, { s: 65, a: 3 }, { s: 11, a: 6 }, { s: 51, a: 58 }, { s: 29, a: 60 }],
    strong: /\b(?:financially|financial|rizq|rizik|lost\s+my\s+job|no\s+job|jobless|unemployed|broke|no\s+money|in\s+debt|drowning\s+in\s+debt|(?:can(?:'|no)?t|unable\s+to)\s+(?:afford|repay)|pay\s+(?:my\s+)?(?:bills|debt|loan|rent)|worried\s+about\s+(?:my\s+)?job|poverty|taka\s+nei|chakri\s+nei|rin|obhab|arthik|bekar)\b|টাকা\s*নেই|চাকরি\s*নেই|ঋণগ্রস্ত|ঋণের\s*বোঝা|অভাব|আর্থিক|বেকার|রিজিক|রিযিক|فقدت\s*وظيفتي|ديون|فقر|رزق|وظيفة/i,
    supporting: /\b(?:money|debt|salary|income|job|work|rent|bills)\b/i,
  },
  {
    id: 'fear_hereafter',
    themeId: 'death and the hereafter',
    priority: 9,
    ayahs: [{ s: 39, a: 53 }, { s: 3, a: 185 }, { s: 89, a: 27 }, { s: 89, a: 28 }, { s: 2, a: 286 }],
    strong: /\b(?:(?:afraid|scared|terrified|fear(?:ful)?)\s+of\s+(?:dying|death|the\s+grave|barzakh|hell|hellfire|jahannam|judgment\s+day|the\s+hereafter|standing\s+before\s+allah)|death\s+(?:scares|terrifies)\s+me|keep\s+thinking\s+about\s+(?:dying|death|the\s+grave)|mrittur\s+(?:bhoy|voy)|koborer\s+(?:bhoy|voy)|jahannamer\s+(?:bhoy|voy))\b|(?:মৃত্যুর|মরণের|কবরের|জাহান্নামের|কিয়ামতের)\s*ভয়|মরতে\s*ভয়\s*লাগে|أخاف\s*من\s*(?:الموت|القبر|جهنم|النار|يوم\s*القيامة)/i,
  },
  {
    id: 'sin_temptation',
    themeId: 'mercy and forgiveness',
    priority: 9,
    ayahs: [{ s: 39, a: 53 }, { s: 3, a: 135 }, { s: 25, a: 70 }, { s: 29, a: 45 }, { s: 4, a: 110 }],
    strong: /\b(?:(?:quit|stop|overcome|give\s+up|leave|addicted\s+to|struggling\s+with)\s+(?:drinking|alcohol|wine|drugs|weed|smoking|gambling|betting|zina|adultery|fornication|porn\w*|lust|lying|stealing|riba|interest|bribery|haram|sinning|bad\s+habits?)|(?:drank\s+alcohol|gambled|committed\s+(?:zina|adultery)|fell\s+into\s+(?:sin|zina|haram|temptation)|lied\s+to|took\s+(?:a\s+)?bribe|consumed\s+riba)|resist\s+temptation|mod\s+charte|nesha\s+charte|juya\s+charte|zina\s+kore|pap\s+theke\s+bachte)\b|(?:মদ|নেশা|জুয়া|যিনা|জিনা|সুদ|ঘুষ|পাপ|গুনাহ)\s*(?:ছাড়তে|থেকে\s*বাঁচতে|থেকে\s*ফিরে\s*আসতে|করে\s*ফেলেছি)|أريد\s*ترك\s*(?:الخمر|القمار|الزنا|المعاصي|الذنوب|الكذب|الربا)|وقعت\s*في\s*(?:الزنا|المعصية|الحرام)/i,
    supporting: /\b(?:addiction|temptation|haram|sin|zina|alcohol|gambling)\b/i,
  },
  {
    id: 'worship_struggle',
    themeId: 'prayer',
    priority: 8,
    ayahs: [{ s: 14, a: 40 }, { s: 29, a: 45 }, { s: 2, a: 45 }, { s: 2, a: 238 }, { s: 39, a: 53 }],
    strong: /\b(?:(?:hard|difficult|struggl\w*|lazy|laziness|fail\w*|can(?:'|no)?t|forgot|miss(?:ed|ing)?)\s+(?:to\s+)?(?:pray\w*|salah|salat|namaz|fajr|tahajjud|fast\w*|read\s+quran)|(?:start|begin|be\s+consistent\s+in|be\s+regular\s+in|wake\s+up\s+for)\s+(?:praying|prayer|salah|namaz|fajr|tahajjud)|namaj\s+porte\s+(?:parchi\s+na|aloshota|mon\s+chay\s+na)|fajr\s+e\s+uthte\s+pari\s+na|niyomito\s+namaj)\b|নিয়মিত\s*নামাজ\s*পড়তে\s*পারি\s*না|নামাজ\s*কাজা\s*হয়ে\s*যায়|ফজরে\s*উঠতে\s*পারি\s*না|নামাজে\s*অলসতা|নামাজ\s*শুরু\s*করতে\s*চাই|(?:أقصر|أتكاسل)\s*في\s*الصلاة|لا\s*(?:أصلي|أواظب\s*على\s*الصلاة)|كيف\s*أحافظ\s*على\s*الصلاة/i,
  },
  {
    id: 'illness_pain',
    themeId: 'illness and healing',
    priority: 8,
    ayahs: [{ s: 26, a: 80 }, { s: 21, a: 83 }, { s: 17, a: 82 }, { s: 10, a: 57 }, { s: 2, a: 286 }],
    strong: /\b(?:(?:is|am|feel|feeling|very)\s+sick|illness|disease|hospital|surgery|chronic\s+pain|health\s+problem|oshustho|osustho|osukh|rog)\b|অসুস্থ|অসুখ|রোগ|হাসপাতাল|مريض|مرض|مستشفى/i,
    supporting: /\b(?:pain|sick|doctor|medicine|heal|healing)\b/i,
  },
  {
    id: 'faith_waswas',
    themeId: 'hardship and comfort',
    priority: 8,
    ayahs: [{ s: 7, a: 200 }, { s: 23, a: 97 }, { s: 23, a: 98 }, { s: 114, a: 1 }, { s: 13, a: 28 }],
    strong: /\b(?:waswas\w*|intrusive\s+thoughts|bad\s+thoughts|doubts?\s+in\s+(?:my\s+)?(?:prayer|faith|islam|heart)|focus\s+in\s+(?:my\s+)?prayer|khushu|low\s+iman|weak\s+iman|iman\s+dip|distant\s+from\s+allah|namaje\s+mon\s+(?:boshe|bose)\s+na|iman\s+durbol)\b|ওয়াসওয়াসা|নামাজে\s*মন\s*বসে\s*না|নামাজে\s*মনোযোগ|ইমান\s*দুর্বল|ঈমান\s*\S*\s*দুর্বল|আল্লাহর\s*থেকে\s*দূরে|দূরে\s*সরে\s*গেছি|وسواس|خشوع|ضعف\s*الإيمان|إيماني\s*ضعيف|بعيد\s*عن\s*الله/i,
    supporting: /\b(?:iman|prayer|salah|namaz|khushu|doubts)\b|ঈমান|ইমান/i,
  },
  {
    id: 'guilt_repentance',
    themeId: 'mercy and forgiveness',
    priority: 7,
    ayahs: [{ s: 39, a: 53 }, { s: 4, a: 110 }, { s: 25, a: 70 }, { s: 3, a: 135 }, { s: 2, a: 222 }],
    strong: /\b(?:guilty|guilt|ashamed|shame|regret\w*|sinned|big\s+mistake|made\s+a\s+mistake|forgive\s+myself|bad\s+muslim|far\s+from\s+allah|repent\w*|onutopto|lojjito|tauba|tawba|touba|gunah\s+kore|pap\s+kore|vul\s+kore|bhul\s+kore)\b|অনুতপ্ত|লজ্জিত|তওবা|পাপ\s*করেছি|গুনাহ\s*করেছি|ভুল\s*করেছি|مذنب|ندم|توبة|أخطأت|أخطائي|بالذنب|ذنوب/i,
    supporting: /\b(?:mistake|sin|sins|forgive|forgiveness|iman)\b/i,
  },
  {
    id: 'study_career',
    themeId: 'knowledge',
    priority: 7,
    ayahs: [{ s: 20, a: 114 }, { s: 2, a: 286 }, { s: 53, a: 39 }, { s: 94, a: 5 }, { s: 65, a: 3 }],
    strong: /\b(?:exams?|test\s+tomorrow|failing\s+(?:class|school|exams?|tests?)|focus\s+on\s+study\w*|studying|career|interview|time\s+management|academic|grades|pora[- ]?shona\w*|parikkha|porikkha|boshate\s+parchi\s+na)\b|পড়াশোনা\S*|পরীক্ষা\S*|ক্যারিয়ার|ইন্টারভিউ|امتحان|دراسة|التركيز\s*في\s*الدراسة|وظيفتي/i,
    supporting: /\b(?:study|studies|university|college|work|job|nervous|stress)\b|মন\s*বসে\s*না/i,
  },
  {
    id: 'marriage_hope',
    themeId: 'spouses',
    priority: 7,
    ayahs: [{ s: 30, a: 21 }, { s: 25, a: 74 }, { s: 24, a: 32 }],
    strong: /\b(?:want\s+to\s+(?:get\s+married|marry)|getting\s+married|looking\s+for\s+(?:a\s+)?(?:righteous\s+|good\s+)?(?:spouse|husband|wife|partner)|ready\s+for\s+marriage|pray\s+i\s+get\s+married|biye\s+korte\s+chai|bhalo\s+(?:jibonshongi|swami|stri)\s+chai)\b|বিয়ে\s*করতে\s*চাই|নেককার\s*(?:স্বামী|স্ত্রী|জীবনসঙ্গী)|বিয়ের\s*জন্য\s*চিন্তা|أريد\s*الزواج|أبحث\s*عن\s*(?:زوج|زوجة)/i,
  },
  {
    id: 'rumor_verify',
    themeId: 'verifying news and avoiding rumors',
    priority: 10,
    ayahs: [{ s: 49, a: 6 }, { s: 24, a: 12 }, { s: 17, a: 36 }, { s: 49, a: 12 }],
    strong: /\b(?:hear(?:d|ing)?\s+(?:a\s+)?(?:rumou?r\w*|gossip|bad\s+story|accusation|unverified\s+news)|spread(?:ing)?\s+rumou?rs?|false\s+accusation|fake\s+news\s+about\s+someone|someone\s+told\s+me\s+(?:a\s+rumou?r|something\s+bad\s+about)|gujob\s+(?:shunle|chorale))\b|গুজব\s*(?:শুনলে|ছড়ালে|নিয়ে)|অপবাদ\s*শুনলে|কথা\s*যাচাই|سمعت\s*إشاعة|نقل\s*(?:خبر|كلام)\s*كاذب/i,
  },
  {
    id: 'debtor_charity_adab',
    themeId: 'debt',
    priority: 9,
    ayahs: [{ s: 2, a: 280 }, { s: 2, a: 282 }, { s: 17, a: 28 }, { s: 93, a: 10 }],
    strong: /\b(?:owes?\s+me\s+money|can(?:'|no)?t\s+(?:repay|pay\s+me\s+back)|lend(?:ing)?\s+money|borrow(?:ing)?\s+money|(?:beggar|needy\s+person|petitioner)\s+asks?\b.{0,30}\b(?:nothing\s+to\s+give|cannot\s+give|can'?t\s+help)|taka\s+dhar\s+(?:dile|nile|diye\s+ferot))\b|টাকা\s*ধার\s*(?:নিয়ে\s*দিতে\s*না\s*পারলে|দেওয়ার|নেওয়ার)|ভিক্ষুক\s*চাইলে|مدين\s*معسر|أقرضت\s*شخصا|سائل\s*ولا\s*أملك/i,
  },
  {
    id: 'reconcile_peace',
    themeId: 'peacemaking and reconciliation',
    priority: 8,
    ayahs: [{ s: 49, a: 9 }, { s: 49, a: 10 }, { s: 4, a: 114 }, { s: 4, a: 86 }, { s: 17, a: 53 }],
    strong: /\b(?:two\s+(?:friends?|brothers?|people|relatives?|sides|groups?)\s+(?:are\s+)?(?:fighting|arguing|quarrel\w*)|make\s+peace\s+between|reconcil\w*\s+(?:two|friends?|family|people|spouses?)|mediat\w*\s+a\s+(?:dispute|conflict|fight)|when\s+someone\s+greets\s+me|duijon\s+jhogra\s+korle|mitmat\s+korar)\b|(?:দুইজন|দুজনের\s*মধ্যে)\s*ঝগড়া|মিটমাট\s*করার|মীমাংসা\s*করার|কেউ\s*সালাম\s*দিলে|إصلاح\s*بين\s*(?:متخاصمين|صديقين|أخوين)|إذا\s*حياني\s*أحد/i,
  },
  {
    id: 'insult_provocation',
    themeId: 'anger and patience with people',
    priority: 8,
    ayahs: [{ s: 25, a: 63 }, { s: 41, a: 34 }, { s: 3, a: 134 }, { s: 7, a: 199 }],
    strong: /\b(?:(?:someone|people|they|he|she)\s+(?:insults?|mocks?|ridicules?|provokes?|disrespects?|curses?|abuses?|yells?\s+at|shouts?\s+at|speaks?\s+harshly\s+to)\s+(?:me|us)|respond\s+to\s+(?:rude|ignorant|harsh|toxic|mean|mocking|insulting)\s+people|keu\s+(?:opoman|baje\s+kotha|gali)\s+(?:korle|bolle|dile))\b|কেউ\s*(?:অপমান|বাজে\s*কথা|গালি|তুচ্ছতাচ্ছিল্য)\s*(?:করলে|বললে|দিলে)|অজ্ঞ\s*লোক\s*তর্ক\s*করলে|إذا\s*(?:شتمني|أهانني|استفزني|جهل\s*علي)\s*أحد/i,
  },
  {
    id: 'decision_confusion',
    themeId: 'consultation and leadership',
    priority: 7,
    ayahs: [{ s: 3, a: 159 }, { s: 42, a: 38 }, { s: 18, a: 10 }, { s: 20, a: 25 }, { s: 65, a: 3 }],
    strong: /\b(?:can(?:'|no)?t\s+decide|hard\s+to\s+decide|making\s+a\s+(?:big|major|tough|difficult|important)\s+decision|confused\s+between\s+two|unsure\s+what\s+choice|dilemma|crossroads|before\s+starting\s+a\s+new\s+(?:venture|business|project|journey|chapter)|siddhanto\s+nite\s+parchi\s+na|kon\s+poth\s+beche\s+nebo)\b|সিদ্ধান্ত\s*নিতে\s*(?:পারছি\s*না|কষ্ট\s*হচ্ছে)|দোটানায়\s*আছি|নতুন\s*কাজ\s*শুরু\s*করার\s*আগে|محتار\s*في\s*(?:قرار|أمري)|اتخاذ\s*قرار\s*صعب/i,
  },
  {
    id: 'anger_injustice',
    themeId: 'anger and patience with people',
    priority: 6,
    ayahs: [{ s: 3, a: 134 }, { s: 41, a: 34 }, { s: 49, a: 12 }, { s: 42, a: 40 }, { s: 14, a: 42 }],
    strong: /\b(?:angry|anger|furious|lost\s+my\s+temper|mad\s+at|betrayed|backstab\w*|gossip\w*\s+about\s+me|talking\s+behind\s+my\s+back|lied\s+about\s+me|slander\w*\s+me|cheated\s+me|scammed\s+me|stole\s+(?:from\s+me|my)|robbed\s+me|unfair\w*|mistreat\w*|oppressed|hurt\s+me|insulted\s+me|mocked\s+me|bullied|revenge|hate\s+them|rag|raag|rege|gussa|thokiyeche|obichar|opoman|gibot\s+korche)\b|রাগ|রেগে|ঠকিয়েছে|বিশ্বাসঘাতকতা|অবিচার|অপমান|গীবত\s*করছে|মিথ্যা\s*অপবাদ|চুরি\s*করেছে\s*আমার|غاضب|ظلمني|خيانة|أذاني|يغتابونني|سرق\s*مني/i,
    supporting: /\b(?:betray\w*|unjust|cruel|hurt|forgive\s+someone)\b/i,
  },
  {
    id: 'family_relations',
    themeId: 'parents',
    priority: 6,
    ayahs: [{ s: 17, a: 23 }, { s: 17, a: 24 }, { s: 30, a: 21 }, { s: 4, a: 36 }, { s: 25, a: 74 }],
    strong: /\b(?:difficult\s+(?:parents?|mother|father|family|husband|wife|spouse|in-laws)|parents?\s+(?:don'?t|do\s+not|never)\s+understand|(?:arguing|fighting|disagreement\w*|conflict)\s+with\s+(?:my\s+)?(?:parents?|mother|father|mom|dad|spouse|husband|wife|family|brother|sister|neighbor\w*|friend\w*)|shouted\s+at\s+my\s+(?:mom|dad|mother|father|parents?)|marital|toxic\s+friends?|noisy\s+neighbor|get\s+along\s+with\s+(?:my\s+)?neighbors?|set\s+(?:healthy\s+)?boundaries\s+with\s+family|baba.?ma\w*\s+sathe|poribare\s+oshanti|family\s+jhamela|boss-er\s+sathe\s+jhamela)\b|বাবা-মা\S*\s*সাথে|পরিবারে\s*অশান্তি|স্বামী-স্ত্রী\S*\s*(?:ঝগড়া|অশান্তি|মিল\s*হচ্ছে\s*না)|পারিবারিক\s*সমস্যা|প্রতিবেশীর\s*সাথে|مشاكل\s*عائلية|أهلي\s*لا\s*يفهمونني|خلاف\s*مع\s*(?:الوالدين|زوجي|زوجتي)/i,
    supporting: /\b(?:family|parents|marriage|husband|wife|spouse|relatives|neighbors)\b|পরিবার/i,
  },
  {
    id: 'loneliness',
    themeId: 'hardship and comfort',
    priority: 5,
    ayahs: [{ s: 2, a: 186 }, { s: 50, a: 16 }, { s: 57, a: 4 }, { s: 93, a: 3 }, { s: 13, a: 28 }],
    strong: /\b(?:lonely|loneliness|isolated|abandoned|no\s*one\s+(?:cares|understands|listens)|nobody\s+(?:cares|understands|listens)|no\s+friends|left\s+out|feel(?:ing)?\s+(?:so\s+|very\s+|really\s+)?alone|ekaki|ekla|keu\s+(?:nei|nai|bojhe\s+na|bujhe\s+na))\b|একা\s*লাগছে|একাকী|একাকীত্ব|কেউ\s*(?:নেই|নাই|বোঝে\s*না)|وحيد|وحدة|لا\s*أحد\s*(?:يفهمني|يهتم)/i,
    supporting: /\b(?:alone|lonely|eka|nobody|no\s*one)\b|একা/i,
  },
  {
    id: 'character_habits',
    themeId: 'humility',
    priority: 5,
    ayahs: [{ s: 68, a: 4 }, { s: 2, a: 153 }, { s: 31, a: 18 }, { s: 49, a: 12 }, { s: 13, a: 11 }],
    strong: /\b(?:(?:stop|overcome|control)\s+(?:being\s+)?(?:jealous\w*|envy|greedy|lazy|lying|gossip\w*|backbit\w*|arrogant|pride|ego|comparing\s+myself)|good\s+character|akhlaq|better\s+habit|self-discipline|be\s+more\s+patient|apologize\s+sincerely|laziness|jealousy|envy|arrogance|hingsha|gibot|ohongkar|mittha|oloshota|choritro)\b|হিংসা|গীবত|অহংকার|মিথ্যা\s*বলা|অলসতা|চরিত্র\s*ভালো|ধৈর্যশীল\s*হতে\s*চাই|تحسين\s*الأخلاق|الحسد|الغيبة|الكبر/i,
    supporting: /\b(?:character|habit|honest|humble|patient|patience)\b|চরিত্র/i,
  },
  {
    id: 'anxiety_worry',
    themeId: 'hardship and comfort',
    priority: 4,
    ayahs: [{ s: 13, a: 28 }, { s: 9, a: 51 }, { s: 65, a: 3 }, { s: 2, a: 286 }, { s: 94, a: 5 }],
    strong: /\b(?:anxious|anxiety|worried|worry(?:ing)?|stressed|stress|panic\w*|scared|afraid|terrified|overthink\w*|restless|tense|tension|can(?:'|no)?t\s+sleep|dushchinta|ashanti|oshanti|(?:voy|bhoy)\s+(?:lagche|lagse|korche)|ghum\s+(?:asche|ashche)\s+na)\b|দুশ্চিন্তা|উদ্বেগ|টেনশন|ভয়\s*(?:লাগছে|পাচ্ছি|আছি)|অশান্তি|ঘুম\s*আসছে\s*না|قلق|توتر|خائف|أفكر\s*كثيرا/i,
    supporting: /\b(?:future|worry|fear|bhoy|voy|nervous)\b|ভবিষ্যৎ|ভয়/i,
  },
  {
    id: 'trials_why',
    themeId: 'patience',
    priority: 4,
    ayahs: [{ s: 2, a: 155 }, { s: 2, a: 156 }, { s: 29, a: 2 }, { s: 67, a: 2 }, { s: 94, a: 5 }],
    strong: /\b(?:why\s+do\s+bad\s+things\s+happen|why\s+(?:is|does)\s+(?:allah|god)\s+test(?:ing)?\s+me|why\s+am\s+i\s+(?:being\s+)?tested|why\s+is\s+life\s+so\s+(?:hard|unfair)|why\s+always\s+me|keno\s+eto\s+(?:porikkha|kosto|koshto)|keno\s+amar\s+sathe)\b|কেন\s*এত\s*(?:পরীক্ষা|কষ্ট)|কেন\s*আমার\s*সাথেই|لماذا\s*(?:يبتليني|يحدث\s*لي)/i,
    supporting: /\b(?:tested|trial|trials|unfair|suffering)\b|পরীক্ষা/i,
  },
  {
    id: 'purpose_growth',
    themeId: 'trust in Allah',
    priority: 3,
    ayahs: [{ s: 51, a: 56 }, { s: 67, a: 2 }, { s: 29, a: 69 }, { s: 13, a: 11 }, { s: 2, a: 186 }],
    strong: /\b(?:purpose\s+of\s+(?:my\s+)?life|meaning\s+of\s+life|why\s+am\s+i\s+here|no\s+direction|confused\s+about\s+(?:my\s+)?life|what\s+should\s+i\s+do\s+with\s+my\s+life|how\s+should\s+i\s+live\s+my\s+life|no\s+motivation|procrastinat\w*|become\s+a\s+better\s+(?:person|muslim)|closer\s+to\s+allah|strengthen\s+my\s+(?:faith|iman)|enter\s+(?:jannah|paradise)|go\s+to\s+(?:jannah|paradise)|jiboner\s+uddesho|dishehara|oloshota|valo\s+manush\s+hote|bhalo\s+manush\s+hote|jannate\s+jete\s+chai)\b|জীবনের\s*উদ্দেশ্য|দিকনির্দেশনা\s*(?:পাচ্ছি\s*না|নেই)|দিশেহারা|অলসতা|ভালো\s*মানুষ\s*হতে\s*চাই|আল্লাহর\s*কাছে|জান্নাতে\s*যেতে\s*চাই|معنى\s*الحياة|هدف\s*الحياة|تائه|أتقرب\s*إلى\s*الله|أدخل\s*الجنة/i,
    supporting: /\b(?:purpose|direction|meaningful|better\s+muslim|lazy|motivation)\b/i,
  },
  {
    id: 'gratitude_joy',
    themeId: 'gratitude',
    priority: 3,
    ayahs: [{ s: 14, a: 7 }, { s: 16, a: 18 }, { s: 2, a: 152 }, { s: 31, a: 12 }],
    strong: /\b(?:got\s+(?:the\s+job|accepted|promoted)|passed\s+my\s+exam|good\s+news|feeling\s+blessed|so\s+grateful|practice\s+gratitude|start\s+a\s+gratitude|everything\s+went\s+well|valo\s+khobor|bhalo\s+khobor|pass\s+korechi|chakri\s+peyechi)\b|ভালো\s*খবর|পাস\s*করেছি|চাকরি\s*পেয়েছি|শুকরিয়া\s*আদায়|خبر\s*سار|نجحت\s*في/i,
    supporting: /\b(?:grateful|thankful|blessed|alhamdulillah)\b|শুকরিয়া|কৃতজ্ঞ/i,
  },
  {
    id: 'life_struggle',
    themeId: 'hardship and comfort',
    priority: 1,
    ayahs: [{ s: 94, a: 5 }, { s: 94, a: 6 }, { s: 2, a: 286 }, { s: 13, a: 28 }, { s: 39, a: 53 }],
    strong: /\b(?:struggl\w*|hotash\w*|overwhelm\w*|exhaust\w*|burn\s*out|burnt\s+out|drain\w*|defeat\w*|hopeless\w*|despair\w*|pointless|meaningless|falling\s+apart|going\s+wrong|giv(?:e|ing)\s+up|can(?:'|no)?t\s+(?:take|handle|bear|cope)|suffer\w*|broken|heartbroken|shatter\w*|depress\w*|miserable|unhappy|want\s+(?:to\s+talk\s+to\s+someone|someone\s+to\s+talk\s+to)|heavy\s+heart|heart\s+(?:is|feels?)\s+(?:so\s+|very\s+|really\s+)?(?:heavy|broken|empty|sad|hurting|aching)|(?:bad|terrible|horrible|rough|hard|tough|awful|worst)\s+day|cope\s+with\s+sadness|stay\s+positive\s+in\s+tough\s+times|big\s+setback|handle\s+failure|feel(?:ing)?\s+(?:so\s+|very\s+|really\s+)?(?:sad|down|low|lost|empty|worthless|hurt|stuck|tired\s+of\s+life|tired\s+of\s+everything)|failed|failing|crying|tears|kosto|koshto|dukkho|dukho|osohay|oshohay|nirash|klanto|bhenge|venge|(?:valo|bhalo)\s+(?:lagche|lagchhe|lagse|lage)\s+na|parchi\s+na|parchina|pereshan|jontrona|byartho|bertho|osthir|kanna|jibon\s+ta\s+khub\s+kothin)\b|হতাশ|কষ্ট|দুঃখ|অসহায়|নিরাশ|ক্লান্ত|ভেঙে\s*গে|ভালো\s*লাগছে\s*না|ভালো\s*লাগে\s*না|পারছি\s*না|পেরেশান|যন্ত্রণা|ব্যর্থ|অস্থির|বুক\s*ভারী|কান্না|জীবনটা\s*খুব\s*কঠিন|কারো\s*সাথে\s*কথা\s*বলতে|أعاني|معاناة|محبط|إحباط|يائس|تعبان|متعب|قلبي\s*(?:حزين|متعب|مكسور|ضيق)|ضاقت\s*بي|لست\s*بخير|حزين/i,
    supporting: /\b(?:sad|down|lost|hardship|pain|tired)\b|মন\s*খারাপ/i,
  },
];

const TOPIC_ASK_EXCLUDE_RE = new RegExp(
  [
    String.raw`\b(?:tell\s+me\s+about|show\s+me|give\s+me|what\s+does|what\s+is\s+(?:the\s+)?|verses?\s+about|ayahs?\s+about)\b`,
    String.raw`সম্পর্কে|বিষয়ে|দেখাও|দেখান|বলো|বলুন`,
    String.raw`\b(?:somporke|shomporke|bishoye|dekhao|dekhan|bolo|bolun)\b`,
  ].join('|'),
  'i',
);

/**
 * Classifies first-person emotional/life situations by sentence meaning instead of raw keywords.
 * Returns null for bare topic words ("patience", "suicide", "divorce") and third-person Quran topic questions.
 */
const LOGISTICS_EXCLUDE_SITUATION_RE =
  /\b(?:what\s+(?:should\s+i|to)\s+(?:wear|cook|buy|pack)|suggest\s+(?:a\s+)?gift|gift\s+(?:for|ideas?))\b/i;

export function classifySituation(text: string): SituationMatch | null {
  const q = text.trim();
  if (!q || EXCLUDE_SITUATION_RE.test(q) || LOGISTICS_EXCLUDE_SITUATION_RE.test(q)) return null;
  // Allow "what is the meaning of life?" explicitly while excluding "what is X?" topic definitions
  if (TOPIC_ASK_EXCLUDE_RE.test(q) && !/\b(?:meaning|purpose)\s+of\s+(?:my\s+)?life\b/i.test(q)) return null;
  const firstPerson = FIRST_PERSON_RE.test(q);
  const advice = ADVICE_FRAME_RE.test(q);
  const thirdPersonGrief = THIRD_PERSON_BEREAVEMENT_SUICIDE_RE.test(q);
  if (!firstPerson && !advice && !thirdPersonGrief) return null;

  const lifeBonus = LIFE_CONTEXT_RE.test(q) ? 1 : 0;
  let best: { spec: SituationSpec; score: number } | null = null;
  for (const spec of SITUATION_SPECS) {
    let score = 0;
    if (spec.strong.test(q)) score += 3;
    if (spec.supporting?.test(q)) score += 2;
    if (score > 0) score += lifeBonus;
    if (score < 3) continue;
    if (
      !best ||
      score > best.score ||
      (score === best.score && spec.priority > best.spec.priority)
    ) {
      best = { spec, score };
    }
  }
  return best ? { id: best.spec.id, ayahs: best.spec.ayahs, themeId: best.spec.themeId } : null;
}

// ------------------------------------------------------------------ 4. Universal Personal Stance Detector (All ~80 Themes)
const STANCE_DISTRESS_RE =
  /\b(?:sad|hurt\w*|pain\w*|hard|difficult\w*|struggl\w*|worr(?:y|ied|ying)|afraid|scared|fear\w*|terrified|anxious|stress\w*|suffer\w*|lost|miss(?:ing)?|cry(?:ing)?|upset|problem\w*|trouble\w*|conflict|broken|sick|ill|(?:am|feel|so|very)\s+poor|broke|debt|unfair|wronged|lonely|alone|tired|kosto|koshto|dukkho|somossa|bhoy|voy|oshanti)\b|কষ্ট|দুঃখ|সমস্যা|ভয়|অশান্তি|চিন্তা|অসুস্থ|অভাব|ألم|صعب|خائف|مشكلة|حزين|قلق|ضيق/i;

const STANCE_REMORSE_RE =
  /\b(?:regret\w*|guilt\w*|ashamed|sorry|quit|stop|stopping|overcome|avoid\w*|give\s+up|slipped|mistake\w*|bad\s+habit\w*|wrong|sinned|forgive|repent\w*|charte|bad\s+dite|bhul|vul|onutopto)\b|ছাড়তে|বাদ\s*দিতে|ভুল|অনুতপ্ত|তওবা|পাপ|গুনাহ|ندم|أترك|أتوقف|أخطأت|توبة/i;

const STANCE_ASPIRATION_RE =
  /\b(?:want\s+to|wanna|wish\s+to|would\s+like\s+to|hope\s+to|try(?:ing)?\s+to|plan(?:ning)?\s+to|going\s+to|how\s+(?:can|do|should)\s+i|what\s+should\s+i|help\s+me|teach\s+me|learn\s+to|practice|build|improve|be\s+(?:more|a\s+better|good|kind)|chai|chacchi|chesta|kivabe|kibhabe|ki\s+korbo)\b|চাই|চাচ্ছি|ইচ্ছা|চেষ্টা|কীভাবে|কিভাবে|কী\s*করব|কি\s*করব|أريد|أتمنى|أحاول|أسعى|كيف/i;

/**
 * Detects whether a query that matched a Quranic theme is actually a PERSONAL SENTENCE
 * or SUGGESTION / RECOMMENDATION / CIRCUMSTANCE request vs a bare/informational topic query.
 * Enables EVERY topic in THEMES to respond to sentence meaning first!
 */
export function detectPersonalStance(text: string): PersonalStance | null {
  const q = text.trim();
  if (!q) return null;
  const words = q.split(/\s+/).filter(Boolean).length;
  if (words <= 2) return null;
  const isCircumstanceAsk = !!classifyGentleCircumstance(q);
  if (!isCircumstanceAsk && (EXCLUDE_SITUATION_RE.test(q) || TOPIC_ASK_EXCLUDE_RE.test(q) || INFO_REQUEST_FRAME_RE.test(q))) {
    return null;
  }
  if (!FIRST_PERSON_RE.test(q) && !ADVICE_FRAME_RE.test(q) && !isCircumstanceAsk) return null;

  if (STANCE_DISTRESS_RE.test(q)) return 'distress';
  if (STANCE_REMORSE_RE.test(q)) return 'remorse';
  if (FIRST_PERSON_RE.test(q) && STANCE_ASPIRATION_RE.test(q)) return 'aspiration';
  if (isCircumstanceAsk) return 'recommendation';
  if (STANCE_ASPIRATION_RE.test(q)) return 'aspiration';
  return 'context';
}

const CIRCUMSTANCE_ASK_RE =
  /\b(?:suggest\w*|recommend\w*|advis(?:e|ing)|advice|what\s+(?:should|can|could|would)\s+(?:i|we|one|someone|they|a\s+person|people)\s+(?:do|wear|say|choose|eat|read|try)|what\s+(?:to|is\s+best\s+to)\s+do\s+(?:when|if|in|for|about|before|after|during)|how\s+should\s+(?:i|we|one|someone)\s+(?:act|behave|respond|handle|deal|react|prepare)|any\s+(?:tips|ideas|guidance|thoughts)\s+(?:for|on|when|if|about)|in\s+(?:this|such\s+a|that|a\s+particular|any)\s+(?:circumstance|situation|case|moment)|ki\s+korbo|ki\s+kora\s+uchit|koroniyo\s+ki|poramorsho|upodesh)\b|পরামর্শ|উপদেশ|সাজেস্ট|রিকমেন্ড|সুপারিশ|কী\s*করা\s*উচিত|কি\s*করা\s*উচিত|করণীয়\s*কী|এই\s*(?:অবস্থায়|পরিস্থিতিতে)|اقترح|اقتراح|نصيحة|تنصح\w*|أنصحني|توصية|ماذا\s*(?:أفعل|نفعل|يفعل|ينبغي)|ما\s*العمل|كيف\s*أتصرف/i;

const GENTLE_HEALTH_RE =
  /\b(?:migraine|headache|pain|sleep\w*|insomnia|tired|fatigue|workout|exercise|diet|weight|nutrition|stomach|fever|cough|cold|flu|doctor|health\w*|skin|acne|backache|stretches?)\b|মাথাব্যথা|ব্যায়াম|ডায়েট|স্বাস্থ্য|ঘুম|অসুখ|صداع|نوم|صحة|رياضة/i;

const GENTLE_SOCIAL_RE =
  /\b(?:gift\w*|present|wear|outfit|dress|attire|invit\w*|party|wedding|host\w*|dinner|colleague|coworker|boss|client|neighbor|friend\w*|mother|father|husband|wife|conversation|polite\w*|etiquette|greet\w*|meeting)\b|উপহার|পোশাক|দাওয়াত|মেহমান|সহকর্মী|هدية|ملابس|دعوة|زميل/i;

/**
 * Detects when the user is asking for suggestions, recommendations, or what to do in a circumstance.
 * Used both to frame Quranic answers reflectively AND to give a gentle, culturally grounded Islamic
 * reply when the Quran text does not address that specific worldly circumstance.
 */
export function classifyGentleCircumstance(text: string): GentleFallbackKind | null {
  const q = text.trim();
  if (!q || !CIRCUMSTANCE_ASK_RE.test(q)) return null;
  if (GENTLE_HEALTH_RE.test(q)) return 'health';
  if (GENTLE_SOCIAL_RE.test(q)) return 'social';
  return 'general';
}

export const GENERAL_QURAN_RECOMMEND_RE =
  /^\s*(?:please\s+)?(?:can\s+you\s+|could\s+you\s+)?(?:suggest|recommend|give)\s+(?:me\s+|us\s+)?(?:a\s+|an\s+|some\s+|any\s+)?(?:good\s+|nice\s+|beautiful\s+|comforting\s+|short\s+)?(?:surahs?|ayahs?|ayats?|verses?|something|anything)(?:\s+(?:from\s+(?:the\s+)?(?:quran|koran)|to\s+read|for\s+me|for\s+today))?\s*[?!.]*$|^\s*(?:কুরআন\s*থেকে\s*)?(?:কোনো?\s*)?(?:ভালো\s*|সুন্দর\s*|ছোট\s*)?(?:সূরা|আয়াত|কিছু)\s*(?:পড়ার\s*)?(?:সাজেস্ট|রিকমেন্ড|পরামর্শ)\s*(?:করো|করুন|দাও|দিন)\s*[?!।]*$|^\s*(?:kon\s+|kono\s+)?(?:bhalo\s+|sundor\s+|choto\s+)?(?:surah|ayat|kichu)\s*(?:porar\s+)?(?:suggest|recommend|poramorsho)\s*(?:koro|korun|dao|din)\s*[?!.]*$|^\s*(?:اقترح|أنصحني)\s*(?:علي\s*|لي\s*)?(?:بـ?\s*)?(?:سورة|آية|آيات)(?:\s*للقراءة)?\s*[؟?!.]*$/i;

// ------------------------------------------------------------------ 5. Casual Chatter & Quick Out-of-Scope
const SLEEPY_RE =
  /^(?:i(?:'m|\s+am)\s+)?going\s+to\s+(?:sleep|bed)\b|\b(?:i(?:'m|\s+am)\s+(?:so\s+|very\s+)?(?:sleepy|going\s+to\s+sleep|going\s+to\s+bed)|need\s+sleep|amar\s+ghum\s+(?:pacche|asche)|ami\s+ghumate\s+jacchi)\b|আমার\s*ঘুম\s*(?:পাচ্ছে|আসছে)|আমি\s*ঘুমাতে\s*যাচ্ছি|أنا\s*نعسان|سأنام/i;

const HUNGRY_RE =
  /^(?:i(?:'m|\s+am)\s+)?going\s+to\s+eat\b|\b(?:i(?:'m|\s+am)\s+(?:so\s+|very\s+)?(?:hungry|starving|eating|going\s+to\s+eat)|ami\s+(?:bhat|vat|khabar)\s+khabo|amar\s+(?:khida|khuda)\s+(?:lagse|lagche|legeche))\b|আমার\s*(?:ক্ষুধা|খিদে)\s*লেগেছে|আমি\s*(?:ভাত|খাবার)\s*খাব|أنا\s*جائع/i;

const FRIEND_RE =
  /\b(?:let'?s\s+be\s+friends|will\s+you\s+be\s+my\s+friend|be\s+my\s+friend|are\s+we\s+friends|amar\s+bondhu\s+hobe|bondhu\s+hobe)\b|বন্ধু\s*হবে|আমার\s*বন্ধু\s*হবে|هل\s*نكون\s*أصدقاء/i;

const ROUTINE_RE =
  /^(?:h+a+h+a+|lol|lmao|rofl|hehe+)$|\b(?:just\s+woke\s+up|going\s+to\s+work|i(?:'m|\s+am)\s+at\s+work|studying\s+right\s+now|having\s+coffee|drinking\s+tea|i(?:'m|\s+am)\s+(?:busy|bored)|nothing\s+much|just\s+chilling|it\s+is\s+raining|nice\s+weather|hot\s+today|cold\s+today|office\s+e\s+achi|ajke\s+khub\s+gorom|brishti\s+hocche)\b|কাজে\s*যাচ্ছি|বৃষ্টি\s*হচ্ছে|আজকে\s*খুব\s*গরম|আমি\s*(?:এখন\s*)?ব্যস্ত|আমি\s*বোরিং|أنا\s*مشغول/i;

const OOS_KNOWLEDGE_RE =
  /\b(?:capital\s+of|population\s+of|president\s+of|prime\s+minister\s+of|how\s+(?:far|hot|deep|tall)\s+is|speed\s+of\s+light|gravity|photosynthesis|periodic\s+table|quantum|black\s+hole|dinosaurs|evolution|world\s+war|who\s+(?:invented|discovered|wrote|painted)|when\s+was\s+.{1,25}\s+born|currency\s+of|square\s+root|calculate|solve\s+for\s+x|algebra|calculus)\b|\b\d+\s*[+\-*/×÷^]\s*\d+\b|(?:বাংলাদেশের|ফ্রান্সের)\s*রাজধানী|عاصمة\s+فرنسا/i;

const OOS_TECH_RE =
  /\b(?:python|javascript|typescript|c\+\+|html|css|sql|react|node\.js|debug|fix\s+my\s+code|write\s+(?:a\s+|an\s+|me\s+)?(?:code|script|program|email|letter|resume|cv|cover\s+letter|essay|blog|caption|story|poem|speech|contract)|summarize\s+this|excel\s+formula|spreadsheet|build\s+a\s+website|homework|assignment|translate\s+.{1,30}\s+(?:to|into)\s+(?:spanish|french|german|hindi|japanese|korean|chinese|urdu))\b|ইমেইল\s*লিখে\s*দাও|কোড\s*লিখে\s*দাও|রচনা\s*লিখে|সিভি\s*তৈরি|হোমওয়ার্ক|اكتب\s*لي\s*كود/i;

const OOS_ENTERTAINMENT_RE =
  /\b(?:weather|forecast|temperature\s+outside|cricket|football|soccer|nba|fifa|world\s+cup|olympics|who\s+won\s+the\s+(?:match|game|oscar|cup)|movie|movies|netflix|anime|tv\s+show|song|sing\s+(?:a|me)|beatbox|recipe|how\s+to\s+(?:cook|bake)|biryani|pizza|burger|plan\s+a\s+trip|itinerary|hotel\s+in|flight\s+to|horoscope|zodiac|riddle|roast\s+me|make\s+me\s+laugh|ketchup.{0,15}smoothie|horse-sized\s+duck|eat\s+myself|single\s+socks|chickens.{0,15}lion|aliens.{0,15}restaurant|square\s+root\s+of\s+a\s+banana)\b|আবহাওয়া|ক্রিকেট|ফুটবল|সিনেমা|বিরিয়ানি\s*রান্না|طقس\s*اليوم|مباراة\s*كرة\s*القدم/i;

export type CasualKind =
  | 'sleepy'
  | 'hungry'
  | 'friend'
  | 'routine'
  | 'oos_knowledge'
  | 'oos_tech'
  | 'oos_entertainment';

/** Classifies casual personal chatter or clear out-of-scope domains to avoid spurious BM25 searches. */
export function classifyCasual(text: string): CasualKind | null {
  const q = text.trim();
  if (!q) return null;
  if (SLEEPY_RE.test(q)) return 'sleepy';
  if (HUNGRY_RE.test(q)) return 'hungry';
  if (FRIEND_RE.test(q)) return 'friend';
  if (ROUTINE_RE.test(q)) return 'routine';
  if (OOS_KNOWLEDGE_RE.test(q)) return 'oos_knowledge';
  if (OOS_TECH_RE.test(q)) return 'oos_tech';
  if (OOS_ENTERTAINMENT_RE.test(q)) return 'oos_entertainment';
  return null;
}
