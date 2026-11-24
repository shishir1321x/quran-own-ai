/**
 * Islamic etiquette, emotional consolation, and calm vulgarity guard.
 * Zero external APIs: purely local, deterministic regex + curated real ayahs.
 */

export const CONSOLATION_AYAHS: ReadonlyArray<{ s: number; a: number }> = [
  { s: 94, a: 5 },  // With hardship comes ease
  { s: 94, a: 6 },  // Indeed, with hardship comes ease
  { s: 2, a: 286 }, // Allah does not burden a soul beyond what it can bear
  { s: 13, a: 28 }, // In the remembrance of Allah do hearts find rest
  { s: 39, a: 53 }, // Do not despair of the mercy of Allah
];

/** Questions asking where or how a beginner should begin reading the Quran. */
export const START_READING_RE = new RegExp(
  [
    String.raw`(?:where|how|what)\s+(?:should|can|do)\s+i\s+(?:start|begin)\s+(?:reading|learning|studying)?\s*(?:the\s+)?(?:quran|qur['’]?an|koran)`,
    String.raw`which\s+surah\s+(?:should|can)\s+i\s+(?:read|start\s+with)\s+first`,
    String.raw`(?:কুরআন|কোরআন)\s*(?:পড়া\s*)?(?:কোথা\s*থেকে|কীভাবে|কিভাবে)\s*(?:পড়া\s*)?শুরু\s*(?:করব|করবো|করা\s*উচিত|করতে\s*পারি)`,
    String.raw`কোন\s*সূরা\s*(?:দিয়ে|থেকে)\s*(?:পড়া\s*)?শুরু\s*(?:করব|করবো)`,
    String.raw`(?:quran|kuran|koran)\s+(?:pora\s+)?(?:kotha\s+theke|kivabe|kibhabe)\s+(?:pora\s+)?shuru\s+korb[eo]`,
    String.raw`kon\s+surah\s+(?:diye|theke)\s+(?:pora\s+)?shuru\s+korb[eo]`,
    String.raw`من\s+أين\s+أبدأ\s+(?:قراءة\s+)?القرآن`,
  ].join('|'),
  'i',
);

const VULGAR_EN_RE = new RegExp(
  [
    String.raw`\b(?:f+u+c+k+(?:ing|ed|er|ers|off)?|fck+|fuk+|motherfucker(?:s)?|mfer|stfu|gtfo|wtf)\b`,
    String.raw`\b(?:bullshit|shitty|shithead|dipshit|shit)\b`,
    String.raw`\b(?:bitch(?:es|ing|y)?|son\s+of\s+a\s+bitch|bastard(?:s)?|asshole(?:s)?|dumbass(?:es)?|jackass(?:es)?)\b`,
    String.raw`\b(?:cunt(?:s)?|dickhead(?:s)?|dick(?:s)?|cock(?:s)?|pussy|whore(?:s)?|slut(?:s)?|douche(?:bag)?)\b`,
    String.raw`\b(?:idiot(?:s)?|moron(?:s)?|retard(?:ed|s)?|imbecile(?:s)?)\b`,
    String.raw`\b(?:porn|pornography|hentai|nude(?:s)?|sexting|horny|boob(?:s)?|tits|masturbat(?:e|ing|ion))\b`,
    String.raw`\b(?:go\s+to\s+hell|screw\s+you|piss\s+off|shut\s+the\s+fuck\s+up|you\s+suck|suck\s+my)\b`,
  ].join('|'),
  'i',
);

const VULGAR_BN_RE = /(?<![\u0980-\u09FF])(?:শালা(?:র)?|কুত্তা(?:র)?|হারামি|হারামজাদা|খানকি(?:র)?|মাগি(?:র)?|চোদা|বোকাচোদা|মাদারচোদ|বালের|ভোদা|রান্ডি|বেশ্যা|চুদ(?:ি|ো))(?![\u0980-\u09FF])/u;

const VULGAR_BANGLISH_RE = /\b(?:madarchod|bokachoda|banchod|behenchod|bhosdike|khanki(?:r)?|magi(?:r)?|harami|haramjada|haramzada|choda|chuda|chudi|chud|kutta(?:r)?|shala(?:r)?|gandu|lauda|lawda|randi|beshya|voda|bhoda|baler)\b/i;

const VULGAR_AR_RE = /(?<![\u0600-\u06FF])(?:شرموط[ةه]|قحب[ةه]|منيوك|ابن\s*الكلب|يا\s*كلب|يا\s*حمار|يلعن(?:ك|كم)?|لعن[ةه]\s*عليك|كل\s*زق|اخرس|انقلع|سافل|حقير)(?![\u0600-\u06FF])/u;

/** True when input contains specifically Romanized-Bengali (Banglish) profanity. */
export function isBanglishVulgar(text: string): boolean {
  const q = text.trim();
  return !!q && VULGAR_BANGLISH_RE.test(q);
}

/** True when input contains profanity, insults, or sexually explicit harassment. */
export function isVulgar(text: string): boolean {
  const q = text.trim();
  if (!q) return false;
  return VULGAR_EN_RE.test(q) || VULGAR_BN_RE.test(q) || VULGAR_BANGLISH_RE.test(q) || VULGAR_AR_RE.test(q);
}

const EXCLUDE_CONSOLATION_RE = new RegExp(
  [
    String.raw`\b\d{1,3}:\d{1,3}\b`,
    String.raw`\bsurah\b|সূরা|سورة`,
    String.raw`\b(?:guilt|guilty|sin|sins|sinned|repent|repentance|taubah|tawbah|rizq|salary|job|debt|financially|angry|anger|rege)\b|তওবা|রিজিক|রাগ`,
    String.raw`\b(?:mother|father|mom|dad|brother|sister|friend|wife|husband)\s+(?:is|are|was|feels?)\s+sick\b`,
  ].join('|'),
  'i',
);

const CONSOLATION_EN_RE = new RegExp(
  [
    String.raw`(?:my|this)\s+heart\s+(?:is|feels?)\s+(?:so\s+|very\s+|really\s+)?(?:heavy|broken|empty|sad|hurting|aching)`,
    String.raw`(?:i\s+)?(?:am\s+|m\s+)?feel(?:ing)?\s+(?:so\s+|very\s+|really\s+)?(?:broken|lost|alone|lonely|hopeless|helpless|empty|exhausted|overwhelmed|worthless|miserable|depressed|heartbroken)`,
    String.raw`had\s+a\s+(?:very\s+|really\s+)?(?:bad|terrible|horrible|rough|hard|tough|awful|worst)\s+day`,
    String.raw`everything\s+(?:is|feels?)\s+(?:falling\s+apart|going\s+wrong|ruined|too\s+much)`,
    String.raw`(?:nothing\s+(?:is\s+going\s+right|makes\s+sense|feels\s+right)|no\s+one\s+cares(?:\s+about\s+me)?|nobody\s+cares)`,
    String.raw`i\s+(?:just\s+)?(?:want|need)\s+(?:to\s+talk\s+to\s+someone|someone\s+to\s+talk\s+to|some\s+comfort|peace\s+of\s+mind|hope)`,
    String.raw`(?:life\s+feels?\s+(?:so\s+)?(?:hard|heavy|meaningless|unfair)|why\s+is\s+life\s+so\s+hard|can(?:'|no)?t\s+stop\s+crying)`,
  ].join('|'),
  'i',
);

const CONSOLATION_BN_RE = /(?:(?:আজ|এখন)?\s*(?:আমার\s*)?(?:একদম|কিছুই|মোটেও)?\s*ভালো\s*লাগছে\s*না|মন(?:টা)?\s*(?:খুব|অনেক|একদম)?\s*(?:ভেঙে\s*গেছে|ভালো\s*নেই|ভারী|অস্থির|অশান্ত)|(?:খুব|বড্ড|অনেক)\s*একা\s*লাগছে|খুব\s*কষ্ট\s*হচ্ছে|কান্না\s*(?:আসছে|পাচ্ছে)|কিছুই\s*ভালো\s*লাগে\s*না|সব\s*কিছু\s*এলোমেলো|মনে\s*শান্তি\s*পাচ্ছি\s*না|কারো\s*সাথে\s*কথা\s*বলতে\s*ইচ্ছে\s*করছে)/u;

const CONSOLATION_BANGLISH_RE = /(?:(?:amar\s+)?(?:aj\s+|ajke\s+)?(?:ekdom\s+|kicchu\s+|kichu\s+)?(?:valo|bhalo|vlo|bhlo)\s+(?:lagche|lagchhe|lagse|lage)\s+na|mon(?:ta)?\s+(?:khub\s+|onek\s+|ekdom\s+)?(?:bhenge|venge|osthir|ashanto|vari|bhari|kharap)|(?:khub\s+|onek\s+)eka\s+(?:lagche|lagchhe|lagse|lage)|kosto\s+(?:hocche|hoche|hosse|lagche)|kanna\s+(?:ashche|asche|pacche)|shanti\s+(?:pacchi|pachi)\s+na|jibon(?:ta)?\s+(?:khub\s+)?kothin)/i;

const CONSOLATION_AR_RE = /(?:قلبي\s*(?:حزين|متعب|مكسور|ضيق|يؤلمني)|[أا]شعر\s*(?:بالحزن|بالوحد[ةه]|بالضيق|بالإحباط|بالأسى)|لا\s*[أا]شعر\s*بخير|ضاقت\s*بي\s*(?:الدنيا|الأرض)|نفسي\s*تعبان[ةه]|حاسس\s*(?:بضيق|بوحد[ةه]|بحزن))/u;

/** True when a multi-word message expresses distress, sadness, heaviness, or loneliness. */
export function isEmotionalConsolation(text: string): boolean {
  const q = text.trim();
  if (!q || EXCLUDE_CONSOLATION_RE.test(q)) return false;
  return (
    CONSOLATION_EN_RE.test(q) ||
    CONSOLATION_BN_RE.test(q) ||
    CONSOLATION_BANGLISH_RE.test(q) ||
    CONSOLATION_AR_RE.test(q)
  );
}

