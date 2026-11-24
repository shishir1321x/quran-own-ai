// A little conversation, in a humble manner: "how are you?", "I'm fine", "bye", "sorry", "assalamu alaikum" ... in
// English, Bengali, Banglish and Arabic. Only a WHOLE short message counts, so a question about the Quran that contains
// "how are you" or "good" is never taken for chat. What is said back is in MSG (src/templates.ts); src/engine.ts
// asks this right after the safety checks.
import { normAr, normBn } from './text.js';

export type Opener = 'salam' | 'welcome' | 'hello' | 'morning' | 'afternoon' | 'evening';
export type Talk = 'greeting' | 'howAreYou' | 'userWell' | 'userWellBack' | 'notWell' | 'bye' | 'goodNight' | 'sorry'
  | 'areYouThere' | 'whatDoing' | 'niceToMeet' | 'ack' | 'praise' | 'jazakallah'
  | 'barakallah' | 'duaForBot' | 'makeDua' | 'ameen' | 'goodDay' | 'welcomeBack' | 'userHappy' | 'canYouHelp';
/** A greeting at the start (answered first) and what the rest of the message is. */
export interface Conversation { opener?: Opener; talk: Talk }

/** Lower case, letters and spaces only, no apostrophes: "How's it going?!>" is "hows it going". */
export function plainMessage(s: string): string {
  return normAr(normBn(s)).toLowerCase().replace(/['’‘`ʼ]/g, '').replace(/[^\p{L}\p{M}\s]+/gu, ' ').replace(/\s+/g, ' ').trim();
}

// The patterns are written like the message after plainMessage (Arabic without hamza forms: normAr).
const src = (s: string) => normAr(s).normalize('NFC');
const whole = (s: string) => new RegExp(`^(?:${src(s)})$`, 'u');
const atStart = (s: string) => new RegExp(`^(?:${src(s)})(?=\\s|$)`, 'u');

// ---- a greeting at the start of the message
const RAHMA = String.raw`(?:\s+(?:wa\s*)?rahmatullah\w*(?:\s+(?:wa\s*)?barakatuh\w*)?|\s+ওয়া\s*রাহমাতুল্লাহ\S*(?:\s+ওয়া\s*বারাকাতুহ\S*)?|\s+ورحمه\s*الله(?:\s+وبركاته)?)?`;
const OPENERS: Array<[RegExp, Opener]> = [
  // the answer to a salam ("walaikum assalam"): no salam back, just welcome
  [atStart(String.raw`(?:(?:wa\s*)?(?:alaikum|alaykum|alaikom)\s*(?:as+)?\s*salam\w*|w?a+laikum\w*(?:\s+(?:as+|us+)?\s*salam\w*)?|wa\s+alaikumus\s*salam|(?:ওয়া\s*)?(?:আলাইকুম|ওয়ালাইকুম)\S*(?:\s+\S*সালাম\S*)?|و?عليكم\s*السلام)` + RAHMA), 'welcome'],
  [atStart(String.raw`(?:as+\s*s?alamu?\s*(?:a?la[iy]kum|alaikom|alikum)|as+alamu?alaikum|salamu?\s*alaikum|salam|salaam|slm|peace\s+be\s+(?:upon|with|on)\s+(?:you|u)(?:\s+all)?|আস+সালামু\s*আলাইকুম|আসসালামুআলাইকুম|আস্সালামু\s*আলাইকুম|সালাম|السلام\s*عليكم|سلام\s*عليكم|السلام|سلام)` + RAHMA), 'salam'],
  [atStart(String.raw`hi+|hello+|helo|hey+|heya|hallo|hlw|hlo|yo|হাই|হ্যালো|হ্যাল্লো|হেলো|হেল্লো|হেলও|হায়|مرحبا|اهلا|هلا|هاي`), 'hello'],
  [atStart(String.raw`good\s*morning|gm|(?:shuvo|subho|shubho|suvo)\s*(?:sokal|shokal)|শুভ\s*সকাল|সুপ্রভাত|صباح\s*الخير|صباح\s*النور`), 'morning'],
  [atStart(String.raw`good\s*afternoon|শুভ\s*অপরাহ্ন|শুভ\s*দুপুর`), 'afternoon'],
  [atStart(String.raw`good\s*evening|(?:shuvo|subho|shubho|suvo)\s*(?:sondha|shondha|sondhya|shondhya)|শুভ\s*সন্ধ্যা|مساء\s*الخير|مساء\s*النور`), 'evening'],
];

// Words that only address the assistant ("bye bro", "kemon acho vai", "ভাই, কেমন আছেন"): left out before matching
const ADDRESS = String.raw`vai|vaia|bhai|bhaiya|bhaia|vaiya|bhaijan|vaijan|bro|brother|sis|sister|apu|apa|dear|friend|buddy|sir|madam|maam|man|mate|please|pls|plz|bot|chatbot|assistant|amal|ভাই|ভাইয়া|ভাইজান|আপু|আপা|বন্ধু|জনাব|স্যার|يا\s*اخي|اخي|يا\s*صديقي|صديقي`;
const LEAD = new RegExp(`^(?:(?:${src(ADDRESS)}|ji|jee|জি|জ্বি)\\s+)+`, 'u');
const TRAIL = new RegExp(`(?:\\s+(?:${src(ADDRESS)}|there|everyone|all|again|today|too))+$`, 'u');
const ADDRESS_ONLY = new RegExp(`^(?:${src(ADDRESS)}|ji|jee|জি|জ্বি)+$`, 'u');
const stripAddress = (s: string) => s.replace(LEAD, '').replace(TRAIL, '').trim();

// ---- what the rest of the message is
const BYE_WORDS = String.raw`bye+|bye\s*bye|byebye|bubye|goodbye|good\s*bye|see\s+(?:you|u|ya)(?:\s+(?:later|soon|tomorrow|again|next\s+time))?|take\s+care|allah\s*hafe?[zi]z?|allah\s*hafiz|khuda\s*hafe?[zi]z?|khoda\s*hafe?[zi]z?|gtg|got\s+to\s+go(?:\s+now)?|gotta\s+go(?:\s+now)?|(?:i\s+)?(?:have|need)\s+to\s+go(?:\s+now)?|(?:im|i\s+am)\s+(?:leaving|going)(?:\s+now)?|catch\s+you\s+later|ttyl|talk\s+(?:to\s+you\s+)?later|fi\s*amanillah|bidai|bidae|pore\s+dekha\s+hobe|(?:valo|bhalo)\s+(?:theko|thakben|thakun|thako|thakis)|(?:pore\s+)?kotha\s+hobe(?:\s+pore)?|abar\s+kotha\s+hobe|আল্লাহ\s*হাফেজ|আল্লাহ\s*হাফিজ|খোদা\s*হাফেজ|খোদা\s*হাফিজ|বিদায়|ভালো\s*(?:থেকো|থাকবেন|থাকুন|থাকো|থাকিস)|সাবধানে\s*থাকবেন|(?:পরে\s+)?কথা\s*হবে(?:\s*পরে)?|আবার\s*কথা\s*হবে|আজ\s*আসি|বাই|টাটা|ফি\s*আমানিল্লাহ|مع\s*السلامه|في\s*امان\s*الله|وداعا|الى\s*اللقاء|الي\s*اللقاء`;
const BEFORE_BYE = String.raw`ok|okay|alright|thanks|thank\s+you|thank\s+u|so|then|well|acha|accha|thik\s+ache|ঠিক\s*আছে|আচ্ছা|ধন্যবাদ|শুকরিয়া|dhonnobad|حسنا|شكرا`;
const AFTER_BYE = String.raw`and|thanks|thank\s+you|for\s+now|ধন্যবাদ|dhonnobad|شكرا`;
const NIGHT = String.raw`good\s*night|gn|nighty?\s*night|শুভ\s*রাত্রি|শুভ\s*রাত|(?:shuvo|subho|shubho|suvo)\s*(?:ratri|rat)|تصبح\s*على\s*خير|تصبحون\s*على\s*خير|ليله\s*سعيده`;

// the person is well ("I'm fine", "ভালো আছি", "valo achi", "الحمد لله بخير"), alone or with "and you?"
const WELL = [
  String.raw`(?:alhamdulillah\s+)?(?:(?:im|i\s+am|iam|i\s+m)\s+(?:(?:also|too|really|very|so|pretty|quite|doing|feeling|all)\s+)*(?:fine|good|ok|okay|well|great|alright|all\s+right|not\s+bad|excellent|happy)|(?:doing|feeling)\s+(?:fine|good|ok|okay|well|great|alright)|fine|not\s+bad|pretty\s+good|very\s+well|all\s+good|(?:good|great|ok|okay)\s+(?:thanks|thank\s+you|thank\s+u|thx|alhamdulillah))(?:\s+(?:too|also|as\s+well|alhamdulillah|thanks|thank\s+you|thank\s+u|thx|by\s+the\s+grace\s+of\s+allah))*`,
  String.raw`alhamdulillah(?:\s+(?:fine|good|well|great|ok|okay|all\s+good|im\s+fine|im\s+good|i\s+am\s+fine|i\s+am\s+good))?(?:\s+(?:thanks|thank\s+you|thx))?`,
  String.raw`(?:আলহামদুলিল্লাহ\s*)?(?:(?:জি|জ্বি|হ্যাঁ)\s*)?(?:(?:আমি|আমিও)\s*)?(?:(?:খুব|অনেক|বেশ|মোটামুটি|একদম)\s*)?(?:ভালো|ভাল|ভালোই|ভালই|ঠিক|ঠিকঠাক)\s*আছি(?:\s*আলহামদুলিল্লাহ)?`,
  String.raw`আলহামদুলিল্লাহ(?:\s*(?:ভালো|ভাল|ভালোই|ভালই))?(?:\s*ধন্যবাদ)?`,
  String.raw`(?:alhamdulillah\s+)?(?:(?:ji|jee|ha|haan)\s+)?(?:(?:ami|amio)\s+)?(?:(?:khub|onek|besh|motamuti|ekdom)\s+)?(?:valo|bhalo|vlo|bhlo|valoi|bhaloi|thik|thikthak)\s+(?:achi|asi|aci|achhi)(?:\s+alhamdulillah)?`,
  String.raw`alhamdulillah\s+(?:valo|bhalo|vlo|bhlo|valoi|bhaloi)`,
  String.raw`(?:الحمد\s*لله\s*)?(?:انا\s*)?(?:بخير|كويس|منيح|زين)(?:\s*(?:الحمد\s*لله|والحمد\s*لله|شكرا))?|الحمد\s*لله(?:\s*(?:بخير|تمام))?`,
].join('|');
// only right after the assistant asked "How are you?": a short "good", "valo", "ঠিক আছে", "تمام" is the answer
const WELL_AFTER_ASK = String.raw`good|great|ok|okay|alright|all\s+right|well|very\s+good|good\s+good|so\s+so|valo|bhalo|vlo|bhlo|valoi|bhaloi|thik|thik\s+ache|thik\s+ase|motamuti|ভালো|ভাল|ভালোই|ঠিক\s*আছে|মোটামুটি|تمام|جيد|كويس`;
const NOT_WELL_AFTER_ASK = String.raw`bad|not\s+so\s+good|not\s+really|kharap|valo\s+na|bhalo\s+na|খারাপ|ভালো\s*না|সেরকম\s*না|سيء|مش\s*كويس`;
const THANKS_AFTER = String.raw`(?:\s+(?:thanks|thank\s+you|alhamdulillah|ধন্যবাদ|আলহামদুলিল্লাহ|dhonnobad|الحمد\s*لله|شكرا))*`;
const ASK_BACK = String.raw`(?:and|what\s+about|how\s+about|n)\s+(?:you|u|yourself)|(?:and\s+)?how\s+(?:are|r)\s+(?:you|u)|wbu|hbu|(?:and\s+)?(?:you|u)|(?:tumi|apni|tui)(?:\s+(?:kemon|kmn)\s+(?:acho|achen|aso|asen|achis))?|(?:tomar|apnar)\s+(?:ki\s+)?(?:khobor|obostha)|(?:তুমি|আপনি|তুই)(?:\s*(?:কেমন\s*(?:আছো|আছেন|আছ|আছিস)|ভালো\s*(?:আছো|আছেন)))?|(?:তোমার|আপনার)\s*(?:কি|কী)?\s*(?:খবর|অবস্থা)|و?(?:انت|انتي)(?:\s*كيف\s*حالك)?|كيف\s*حالك(?:\s*انت)?`;

const TALK: Array<[RegExp, Talk]> = [
  [whole(`(?:(?:${BEFORE_BYE})\\s+)*(?:${NIGHT})(?:\\s+(?:${BYE_WORDS}|${AFTER_BYE}|sweet\\s+dreams))*`), 'goodNight'],
  [whole(`(?:(?:${BEFORE_BYE})\\s+)*(?:${BYE_WORDS})(?:\\s+(?:${BYE_WORDS}|${AFTER_BYE}))*`), 'bye'],
  [whole(String.raw`jazak\s*allah\w*(?:\s+(?:khair\w*|khayr\w*|khoir\w*))?|jazakumullah\w*(?:\s+(?:khair\w*|khayr\w*))?|jzk(?:\s*allah)?(?:\s+khair\w*)?|জাযাকাল্লাহ\S*(?:\s*খা(?:ই|য়)র\S*)?|জাজাকাল্লাহ\S*(?:\s*খা(?:ই|য়)র\S*)?|جزاك\s*الله(?:\s*خيرا?)?|جزاكم\s*الله(?:\s*خيرا?)?`), 'jazakallah'],
  [whole(`(?:${WELL})\\s+(?:${ASK_BACK})`), 'userWellBack'],
  // "how are you?" and the like ("are you good?", "kemon acho", "তুমি কি ভালো আছো?", "كيف حالك")
  [whole([
    String.raw`how\s+(?:are|r|re)\s+(?:you|u|ya|yu)(?:\s+(?:doing|today|now|these\s+days|feeling))*|howre\s+(?:you|u)(?:\s+doing)?|how\s+ru|hru|how\s+(?:you|u)\s+doing|how\s+(?:is|was)\s+(?:it\s+going|everything|life|your\s+day|ur\s+day|the\s+day)|hows\s+(?:it\s+going|everything|life|your\s+day|ur\s+day|things|you)|how\s+are\s+things|how\s+do\s+you\s+do|how\s+have\s+you\s+been|whats\s+up|whatsup|wassup|wazzup|sup`,
    String.raw`(?:are|r)\s+(?:you|u)\s+(?:good|ok|okay|fine|well|alright|all\s+right|doing\s+(?:well|good|ok|okay|fine|alright))(?:\s+today)?|(?:you|u)\s+(?:good|ok|okay|alright|doing\s+(?:well|good|ok))|everything\s+(?:ok|okay|good|fine|alright)`,
    String.raw`(?:(?:তুমি|আপনি|তুই)\s*(?:কি|কী)?\s*)?(?:কেমন\s*(?:আছ|আছো|আছেন|আছিস|আছে|যাচ্ছে|কাটছে)|(?:ভালো|ভাল)\s*(?:আছ|আছো|আছেন|আছিস))(?:\s*(?:তুমি|আপনি|তুই|তো))*|সব\s*ঠিক\s*(?:আছে|আছেন)`,
    String.raw`(?:কি|কী)\s*(?:অবস্থা|খবর)(?:\s*(?:তোমার|আপনার|তোর))?|(?:তোমার|আপনার|তোর)\s*(?:কি|কী)\s*(?:অবস্থা|খবর)|(?:অবস্থা|খবর)\s*(?:কি|কী)|দিন(?:কাল)?\s*কেমন\s*(?:যাচ্ছে|কাটছে)`,
    String.raw`(?:(?:tumi|apni|tui)\s+(?:ki\s+)?)?(?:(?:kemon|kmn|kmon|kamon|kemn)\s+(?:acho|achen|aso|asen|achis|asis|achho|achhen|ache|ase|aco|acen|jacche|jay|katche)|(?:valo|bhalo|vlo|bhlo)\s+(?:acho|achen|aso|asen|achis|asis|achho|achhen|aco|acen))(?:\s+(?:tumi|apni|tui|to|toh))*`,
    String.raw`ki\s+(?:obostha|obosta|obstha|khobor|khbr|khabar|haal|hal)(?:\s+(?:tomar|apnar|tor))?|(?:tomar|apnar|tor)\s+(?:ki\s+)?(?:obostha|obosta|khobor|khbr|khabar)(?:\s+ki)?|(?:obostha|khobor|khabar)\s+ki|(?:din|dinkal|dinkaal)\s+(?:kemon|kmn)\s+(?:jacche|jay|katche|cholche)`,
    String.raw`كيف\s*(?:حالك|حالكم|الحال|انت)(?:\s*اليوم)?|كيفك|شلونك|اخبارك|ازيك|(?:هل\s*)?انت\s*بخير`,
  ].join('|')), 'howAreYou'],
  [whole(WELL), 'userWell'],
  // not well: the ayahs about hardship and comfort, after a kind word ("not good", "mon kharap", "ভালো নেই")
  [whole([
    String.raw`(?:(?:im|i\s+am|iam|i\s+m)\s+)?(?:not\s+(?:(?:so|too|very|that|really|feeling|doing)\s+)*(?:good|fine|well|ok|okay|great|alright|all\s+right|happy)|(?:(?:i\s+feel|feeling|i\s+am\s+feeling|m\s+feeling|very|so|really)\s+)*(?:sad|down|low|upset|unwell|unhappy|terrible|awful|lonely|alone|broken|heartbroken|depressed|hopeless))(?:\s+(?:today|now|right\s+now|these\s+days|at\s+all))*`,
    String.raw`i\s+(?:feel|am\s+feeling|m\s+feeling)\s+(?:(?:very|so|really)\s+)?(?:bad|sad|down|low|upset|unwell|unhappy|terrible|awful|lonely|alone|broken|hopeless|overwhelmed|tired\s+of\s+everything)|(?:im|i\s+am)\s+(?:feeling\s+)?bad|feeling\s+bad`,
    String.raw`(?:আমি\s*)?(?:(?:একদম|তেমন)\s*)?(?:ভালো|ভাল)\s*(?:নেই|নাই)(?:\s*(?:আজ|এখন))?|(?:আমার\s*)?মন\s*(?:(?:খুব|অনেক|একটু)\s*)?(?:খারাপ|ভালো\s*নেই|ভাল\s*নেই|ভালো\s*না|ভেঙে\s*গেছে|ভারী|অস্থির)(?:\s*(?:আছে|লাগছে|আজ))?|(?:আমি\s*)?(?:(?:খুব|অনেক|একটু)\s*)?(?:খারাপ\s*আছি|মন\s*মরা|একা\s*লাগছে|কষ্টে\s*আছি)`,
    String.raw`(?:ami\s+)?(?:(?:ekdom|temon)\s+)?(?:valo|bhalo|vlo|bhlo)\s+(?:nei|nai)(?:\s+(?:aj|ajke|ekhon))?|(?:amar\s+)?mon\s+(?:(?:khub|onek|ektu)\s+)?(?:kharap|kharaap|valo\s+nei|bhalo\s+nei|valo\s+na|bhalo\s+na|bhenge\s+geche|vari|bhari|osthir)(?:\s+(?:ache|ase|lagche|lagse|aj|ajke))?|(?:ami\s+)?(?:(?:khub|onek|ektu)\s+)?(?:kharap\s+(?:achi|asi|aci)|eka\s+(?:lagche|lagse))`,
    String.raw`(?:انا\s*)?(?:لست\s*بخير|مش\s*كويس|مش\s*بخير|مو\s*زين|حزين|حزينه|متضايق|متضايقه|زعلان|زعلانه|قلبي\s*مكسور|اشعر\s*بالوحد[ةه])`,
  ].join('|')), 'notWell'],
  [whole(String.raw`(?:(?:im|i\s+am)\s+)?(?:(?:so|very|really)\s+)?(?:sorry|sry|sorri|soory|sowwy)(?:\s+(?:for\s+(?:that|this|the\s+(?:mistake|typo|confusion)|my\s+(?:mistake|typo)|bothering\s+you|disturbing\s+you|asking)|about\s+that))?|excuse\s+me|pardon\s+me|never\s*mind|no\s+worries|my\s+(?:bad|mistake)|oops+|oopsie|whoops|apologies|i\s+apologi[sz]e|সরি|স্যরি|(?:মাফ|ক্ষমা)\s*(?:করবেন|করো|করেন|কোরো)|sori|dukkhito|dukhito|(?:maf|maaf|khoma)\s+(?:koren|korben|koro|kore\s+diyen|kore\s+dio)|(?:انا\s*)?اسف(?:ه)?|عذرا|معذره|المعذره`), 'sorry'],
  [whole(String.raw`(?:are|r)\s+(?:you|u)\s+(?:there|here|online|awake|still\s+there|listening|available)|(?:you|u)\s+there|(?:is\s+)?(?:anyone|anybody|someone|somebody)\s+(?:there|here|home)|hello\s+(?:anyone|anybody)(?:\s+there)?|hello+\s+hello+|(?:(?:তুমি|আপনি|তুই)\s*(?:কি\s*)?)?(?:আছো|আছেন|আছ|আছিস|এখানে\s*(?:আছো|আছেন))|কেউ\s*(?:আছেন|আছে|আছো)|(?:(?:tumi|apni|tui)\s+(?:ki\s+)?)?(?:acho|achen|aso|asen|achis|aco|acen)|keu\s+(?:ache|achen|ase|asen)|(?:هل\s*)?(?:انت|انتي)\s*(?:هنا|موجود|موجوده)|هل\s*يوجد\s*احد|في\s*احد`), 'areYouThere'],
  [whole(String.raw`what\s+(?:are|r)\s+(?:you|u)\s+(?:doing|up\s+to)(?:\s+(?:now|today|right\s+now))?|what\s+(?:you|u)\s+doing|wyd|whatcha\s+doing|(?:(?:তুমি|আপনি|তুই)\s*)?(?:এখন\s*)?(?:কি|কী)\s*(?:করছো|করছ|করছেন|করো|করেন|করিস|করছিস|করতেছো|করতেছেন)(?:\s*(?:এখন|তুমি|আপনি))?|(?:(?:tumi|apni|tui)\s+)?(?:ekhon\s+|akhon\s+)?ki\s+(?:koro|korcho|korchen|koren|korchis|korsen|korso|kortecho|kortechen|korteso|kortesen|koros)(?:\s+(?:ekhon|akhon|tumi|apni))?|ماذا\s*(?:تفعل|تعمل)(?:\s*الان)?|شو\s*(?:عم\s*)?(?:تعمل|بتعمل)|ايش\s*تسوي|بتعمل\s*ايه`), 'whatDoing'],
  [whole(String.raw`(?:(?:it\s+(?:is|was)|its|was)\s+)?(?:(?:very|so|really)\s+)?(?:nice|glad|pleased|good|great|happy|lovely)\s+(?:to\s+)?(?:meet(?:ing)?|talk(?:ing)?\s+(?:to|with)|chat(?:ting)?\s+with)\s+(?:you|u)(?:\s+(?:too|as\s+well))?|(?:(?:আপনার|তোমার)\s*সাথে\s*)?(?:পরিচিত\s*হয়ে|কথা\s*বলে)\s*(?:(?:খুব|অনেক)\s*)?ভালো\s*লাগ(?:লো|ল|ছে)|(?:(?:tomar|apnar)\s+(?:sathe|shathe)\s+)?(?:kotha\s+bole|porichito\s+hoye|porichoy\s+hoye)\s+(?:(?:khub|onek)\s+)?(?:valo|bhalo)\s+(?:laglo|lagse|lagche|lagchhe)|تشرفت(?:\s*بمعرفتك)?|سعدت\s*بلقائك|سعيده?\s*بلقائك|فرصه\s*سعيده`), 'niceToMeet'],
  [whole(String.raw`(?:(?:ok+|okay+|alright)\s+)?(?:got\s+it|i\s+see|understood|noted|then|fine)|ok+|okay+|okey|okie|oky|k+|alright|all\s+right|hmm+|hm+|ah+|oh+|i\s+understand|cool|fine\s+then|sure|yes|yeah|yep|yup|ya|no|nope|nah|আচ্ছা(?:\s*ঠিক\s*আছে)?|ঠিক\s*আছে|ওকে|হুম+|বুঝেছি|বুঝলাম|বুঝতে\s*পেরেছি|জি|জ্বি|হ্যাঁ|হ্যা|না|আহ|ও|acha|accha|achha|acca|thik\s+(?:ache|ase|ace|achhe)|ok\s+(?:vai|bhai)|bujhsi|bujhechi|bujhlam|bujhte\s+parsi|ji|jee|jii|ha|haa|haan|hu+|na|حسنا|طيب|تمام|اوكي|اوك|فهمت|نعم|ايوه|اه|لا`), 'ack'],
  [whole(String.raw`(?:(?:very|so|really|too)\s+)?(?:good|great|nice|awesome|excellent|perfect|amazing|wonderful|brilliant|super|superb|fantastic|wow)(?:\s+(?:job|work|answer|one))?|well\s+said|(?:you(?:'re|\s+are)\s+the\s+best|you(?:'re|\s+are)\s+(?:so\s+)?awesome|much\s+appreciated)|(?:(?:খুব|অনেক|বেশ)\s*)?(?:ভালো|ভাল|দারুণ|দারুন|চমৎকার|অসাধারণ|সুন্দর)|বাহ|ওয়াও|(?:(?:khub|onek|besh)\s+)?(?:valo|bhalo|darun|osadharon|oshadharon|sundor|shundor|chomotkar)|bah|baah|osthir|oshthir|ممتاز|رائع|جميل|احسنت|جيد(?:\s*جدا)?`), 'praise'],
  // Islamic etiquette & polite conversational turns
  [whole(String.raw`barak\s*allah(?:u)?(?:\s+feek(?:um)?)?|baarakallah(?:u)?(?:\s+feek(?:um)?)?|may\s+allah\s+bless\s+(?:you|u)|allah\s+bless\s+(?:you|u)|আল্লাহ\s+(?:আপনাকে|তোমাকে)\s+(?:বরকত|মঙ্গল)\s*(?:দিন|করুন)|বারাকাল্লাহু\s*ফিক|বারাকাল্লাহ|بارك\s*الله\s*فيك(?:م)?|الله\s*يبارك\s*فيك`), 'barakallah'],
  [whole(String.raw`may\s+allah\s+reward\s+(?:you|u)|allah\s+(?:apnake|tomake|tomay)\s+(?:valo|bhalo)\s+rakhuk|আল্লাহ\s+(?:আপনাকে|তোমাকে)\s+ভালো\s+রাখুন`), 'duaForBot'],
  [whole(String.raw`(?:please\s+)?make\s+dua\s+for\s+me|pray\s+for\s+me|keep\s+me\s+in\s+your\s+(?:duas?|prayers?)|remember\s+me\s+in\s+your\s+(?:duas?|prayers?)|(?:amar|amr)\s+jonno\s+(?:dua|doa)\s+(?:korben|koren|koro|korish)|আমার\s*জন্য\s*(?:দোয়া|দোআ)\s*(?:করবেন|করো|করেন)|ادع\s*لي|ادعولي|لا\s*تنساني\s*من\s*دعائك`), 'makeDua'],
  [whole(String.raw`ameen|amin|aameen|ameen\s+ya\s+rabb|আমিন|আমীন|آمين(?:\s*يا\s*رب)?`), 'ameen'],
  [whole(String.raw`have\s+a\s+(?:good|great|nice|blessed|wonderful)\s+day|jum(?:m)?ah\s+mubarak|জুম্মা\s*মোবারক|জুমুআহ\s*মোবারক|(?:আপনার\s*)?দিনটি\s*শুভ\s*হোক|يوم\s*سعيد|جمعة\s*مباركة`), 'goodDay'],
  [whole(String.raw`(?:i\s+am|im|i\s+m)\s+back|back\s+again|(?:আমি\s*)?(?:আবার\s*(?:আসলাম|এলাম)|ফিরে\s*এলাম)|abar\s+aslam|fire\s+elam|عدت`), 'welcomeBack'],
  [whole(String.raw`(?:alhamdulillah\s+)?(?:(?:i\s+am|im|i\s+m)\s+)?(?:(?:so|very|really)\s+)?happy(?:\s+today)?|feeling\s+(?:so\s+)?happy(?:\s+today)?|(?:আলহামদুলিল্লাহ\s*)?আমি\s*(?:আজ\s*)?(?:খুব|অনেক)\s*খুশি|(?:alhamdulillah\s+)?(?:amar\s+)?(?:khub\s+)?khushi\s+(?:lagche|lagse)|(?:alhamdulillah\s+)?ami\s+(?:aj\s+)?(?:khub\s+)?khushi|أنا\s*سعيد(?:ة)?|سعيد\s*جدا`), 'userHappy'],
  [whole(String.raw`can\s+you\s+help(?:\s+me)?|could\s+you\s+help(?:\s+me)?|i\s+need\s+(?:some\s+)?help|(?:আপনি|তুমি)\s*কি\s*(?:আমাকে\s*)?সাহায্য\s*করতে\s*(?:পারেন|পারো|পারবেন)|(?:amake\s+)?(?:help|sahajjo)\s+korte\s+parben|هل\s*يمكنك\s*مساعدتي`), 'canYouHelp'],
];
const AFTER_ASK: Array<[RegExp, Talk]> = [
  [whole(`(?:${WELL_AFTER_ASK})${THANKS_AFTER}`), 'userWell'],
  [whole(`(?:${WELL_AFTER_ASK})\\s+(?:${ASK_BACK})`), 'userWellBack'],
  [whole(NOT_WELL_AFTER_ASK), 'notWell'],
];

const talkOf = (s: string, table: Array<[RegExp, Talk]>): Talk | null => {
  for (const cand of [s, stripAddress(s)]) {
    if (!cand) continue;
    for (const [re, talk] of table) if (re.test(cand)) return talk;
  }
  return null;
};

/**
 * What a short message says, if it is only conversation; null for anything else (a question about the Quran, a
 * request ...). `askedHowAreYou`: the assistant's last answer asked "How are you?", so "good" or "valo" is the reply.
 */
export function conversation(question: string, askedHowAreYou = false): Conversation | null {
  const s = plainMessage(question);
  if (!s || s.split(' ').length > 12) return null;
  if (askedHowAreYou) {
    const t = talkOf(s, AFTER_ASK);
    if (t) return { talk: t };
  }
  const t = talkOf(s, TALK);
  if (t) return { talk: t };
  // a greeting first ("hi, how are you?", "assalamu alaikum, apni kemon achen?"), then the rest, or nothing more
  for (const [re, opener] of OPENERS) {
    const m = s.match(re);
    if (!m) continue;
    const rest = stripAddress(s.slice(m[0].length).trim());
    if (!rest || ADDRESS_ONLY.test(rest)) return { opener, talk: 'greeting' };
    const after = (askedHowAreYou ? talkOf(rest, AFTER_ASK) : null) ?? talkOf(rest, TALK);
    return after ? { opener, talk: after } : null;
  }
  return null;
}
