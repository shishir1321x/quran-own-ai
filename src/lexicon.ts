// Word lists copied from the Worker project (src/quran/tools.ts), so that both projects agree.
// HAVE THE THEME LIST (THEMES, GENERAL_AYAHS) CHECKED by a person who knows the Quran.

// Common Banglish / transliterated Islamic or Bengali words -> English Quran search terms.
export const BANGLISH_TO_EN: Record<string, string> = {
  namaz: 'prayer', namaj: 'prayer', salat: 'prayer', salah: 'prayer',
  roza: 'fasting', roja: 'fasting', sawm: 'fasting', siyam: 'fasting', ramadan: 'fasting', ramzan: 'fasting',
  dhairjo: 'patience', dhoirjo: 'patience', sabr: 'patience', sobor: 'patience', shobor: 'patience',
  zakat: 'charity', jakat: 'charity', sadaqah: 'charity', sadaka: 'charity',
  tawba: 'repent', touba: 'repent', tauba: 'repent', khoma: 'forgive', maf: 'forgive', maaf: 'forgive',
  jannat: 'paradise', behesht: 'paradise',
  jahannam: 'hell', dozokh: 'hell', dojokh: 'hell',
  baba: 'parents', ma: 'parents', pita: 'parents', mata: 'parents',
  riba: 'usury', shud: 'usury', sud: 'usury',
  gunah: 'sin', pap: 'sin', paap: 'sin',
  biye: 'marry', bibaho: 'marry', nikah: 'marry',
  talak: 'divorce', talaq: 'divorce',
  porda: 'garments', hijab: 'garments',
  koshto: 'hardship', kosto: 'hardship', koshte: 'hardship', koster: 'hardship', koshter: 'hardship',
  shosti: 'relief', swosti: 'relief', asha: 'hope',
  doa: 'supplication', dua: 'supplication',
  zikir: 'remember', jikir: 'remember', dhikr: 'remember',
  akash: 'heavens', akas: 'heavens', asman: 'heavens',
  jomin: 'earth', jominer: 'earth', zamin: 'earth', prithibi: 'earth', prithibir: 'earth',
  nur: 'light', noor: 'light',
  mash: 'month', masher: 'months', mas: 'month', maser: 'months', baro: 'twelve', baroti: 'twelve',
  brishti: 'rain', bristi: 'rain', pani: 'water',
  srishti: 'created', sristi: 'created',
  tartil: 'measured', murti: 'idols', murtigulo: 'idols',
  uttoradhikar: 'inheritance', mirash: 'inheritance', miras: 'inheritance',
  // Common Bengali script words -> English fallback if bn search misses
  'নামাজ': 'prayer', 'নামায': 'prayer', 'সালাত': 'prayer',
  'রোজা': 'fasting', 'রোযা': 'fasting', 'সিয়াম': 'fasting',
  'ধৈর্য': 'patience', 'সবর': 'patience',
  'যাকাত': 'charity', 'জাকাত': 'charity', 'দান': 'charity',
  'তওবা': 'repent', 'ক্ষমা': 'forgive', 'মাফ': 'forgive',
  'জান্নাত': 'paradise', 'জাহান্নাম': 'hell',
  'পিতা': 'parents', 'মাতা': 'parents', 'বাবা': 'parents', 'মা': 'parents',
  'সুদ': 'usury', 'সূদ': 'usury', 'গুনাহ': 'sin', 'পাপ': 'sin',
  'বিয়ে': 'marry', 'বিবাহ': 'marry', 'তালাক': 'divorce',
  'মাস': 'month', 'মাসের': 'months', 'বারো': 'twelve', 'বারটি': 'twelve',
};


export type Ref = readonly [surah: number, ayah: number];
/** A theme matches when ANY of `words` is in the question, or, if `allOf` is set, when EVERY group has a word in the
 *  question ("dua" AND "parents"). A theme with `allOf` is more specific, so it wins over the plain ones. */
export interface Theme { id: string; words: string[]; ayahs: Ref[]; allOf?: string[][]; pattern?: RegExp }

const DUA_WORDS = ['dua', 'duaa', 'duas', 'doa', 'doas', 'dowa', 'dowas', 'supplication', 'supplications', 'দোয়া', 'দুআ', 'দোআ', 'দু\'আ', 'دعاء', 'دعا', 'ادعية', 'أدعية'];

const CORE_THEMES: Theme[] = [
  // supplications (duas) that are in the Quran, by what the person asks for
  { id: 'dua for parents', words: [], allOf: [DUA_WORDS, ['parents', 'parent', 'mother', 'father', 'baba', 'মাতা', 'পিতা', 'বাবা', 'মা', 'বাবা-মা', 'والدين', 'الوالدين']],
    ayahs: [[17, 24], [14, 41], [46, 15], [71, 28]] },
  { id: 'dua for forgiveness', words: [], allOf: [DUA_WORDS, ['forgive', 'forgiveness', 'forgiving', 'repent', 'repentance', 'sin', 'sins', 'maf', 'maaf', 'gunah', 'maghfirat', 'maghfirater', 'magfirat', 'magfirater', 'istighfar', 'istigfar', 'ক্ষমা', 'মাফ', 'গুনাহ', 'তওবা', 'মাগফিরাত', 'মাগফেরাত', 'ইস্তিগফার', 'مغفرة', 'استغفار']],
    ayahs: [[7, 23], [3, 147], [23, 118], [2, 286]] },
  { id: 'dua for knowledge', words: [], allOf: [DUA_WORDS, ['knowledge', 'ilm', 'study', 'exam', 'learning', 'জ্ঞান', 'ইলম', 'পরীক্ষা', 'علم']],
    ayahs: [[20, 114], [20, 25], [20, 26], [20, 27], [20, 28]] },
  { id: 'dua for health', words: [], allOf: [DUA_WORDS, ['health', 'healthy', 'sick', 'sickness', 'ill', 'illness', 'disease', 'cure', 'healing', 'shifa', 'স্বাস্থ্য', 'সুস্থ', 'অসুস্থ', 'অসুখ', 'রোগ', 'শিফা', 'مرض', 'شفاء']],
    ayahs: [[26, 80], [21, 83], [17, 82], [10, 57]] },
  { id: 'dua for family', words: [], allOf: [DUA_WORDS, ['family', 'spouse', 'spouses', 'wife', 'husband', 'children', 'child', 'kids', 'সন্তান', 'পরিবার', 'স্ত্রী', 'স্বামী', 'أسرة', 'ذرية']],
    ayahs: [[25, 74], [46, 15], [14, 40]] },
  { id: 'supplications (dua)', words: DUA_WORDS, ayahs: [[2, 201], [2, 286], [3, 8], [7, 23], [21, 87]] },
  { id: 'patience', ayahs: [[2, 153], [2, 155], [39, 10], [3, 200], [103, 3]],
    words: ['patience', 'patient', 'sabr', 'sobor', 'shobor', 'dhairjo', 'dhoirjo', 'ধৈর্য', 'সবর', 'صبر', 'الصبر'] },
  { id: 'hardship and comfort', ayahs: [[94, 5], [94, 6], [2, 286], [13, 28], [65, 3], [93, 3], [3, 139]],
    words: ['hardship', 'difficulty', 'difficult', 'trouble', 'problem', 'problems', 'sad', 'sadness', 'grief', 'anxiety', 'anxious',
      'worry', 'worried', 'stress', 'stressed', 'fear', 'afraid', 'scared', 'bhoy', 'bhay', 'ভয়', 'depressed', 'depression', 'comfort', 'relief', 'lonely', 'peace', 'tranquility',
      'koshto', 'kosto', 'koster', 'koshter', 'dukkho', 'dukho', 'dukkher', 'chinta', 'chintar', 'somossa', 'samossa', 'shanti', 'shosti', 'swosti', 'কষ্ট', 'দুঃখ', 'চিন্তা', 'সমস্যা', 'শান্তি', 'স্বস্তি', 'বিপদ', 'হতাশা', 'হতাশ'] },
  { id: 'mercy and forgiveness', ayahs: [[39, 53], [4, 110], [3, 135], [12, 87]],
    words: ['mercy', 'forgive', 'forgiveness', 'repent', 'repentance', 'despair', 'hope', 'hopeless', 'sin', 'sins', 'guilt', 'guilty',
      'tawba', 'tauba', 'touba', 'khoma', 'maf', 'maaf', 'gunah', 'asha', 'maghfirat', 'ক্ষমা', 'তওবা', 'গুনাহ', 'পাপ', 'রহমত', 'হতাশা', 'হতাশ', 'আশা', 'মাগফিরাত'] },
  { id: 'gratitude', ayahs: [[14, 7], [2, 152], [31, 12]],
    words: ['gratitude', 'grateful', 'thankful', 'shukr', 'shukria', 'কৃতজ্ঞতা', 'শুকরিয়া', 'শোকর'] },
  { id: 'parents', ayahs: [[17, 23], [17, 24], [31, 14], [46, 15]],
    words: ['parents', 'parent', 'mother', 'father', 'baba', 'মাতা', 'পিতা', 'বাবা', 'মা', 'والدين', 'الوالدين'] },
  { id: 'charity', ayahs: [[2, 261], [2, 271], [2, 274]],
    words: ['charity', 'zakat', 'sadaqah', 'sadaka', 'spend', 'দান', 'যাকাত', 'জাকাত', 'সদকা'] },
  { id: 'prayer', ayahs: [[29, 45], [20, 14], [2, 45], [2, 238]],
    words: ['prayer', 'prayers', 'salah', 'salat', 'namaz', 'namaj', 'নামায', 'নামাজ', 'সালাত', 'صلاة', 'الصلاة'] },
  { id: 'fasting', ayahs: [[2, 183], [2, 185]],
    words: ['fasting', 'sawm', 'siyam', 'roza', 'roja', 'ramadan', 'ramzan', 'রোজা', 'রোযা', 'সিয়াম', 'রমযান', 'রমজান', 'صيام'] },
  { id: 'trust in Allah', ayahs: [[65, 3], [3, 159], [9, 51]],
    words: ['trust', 'tawakkul', 'reliance', 'rely', 'তাওয়াক্কুল', 'ভরসা', 'توكل'] },
  { id: 'justice', ayahs: [[4, 135], [5, 8], [16, 90]],
    words: ['justice', 'fairness', 'insaf', 'ন্যায়', 'ইনসাফ', 'عدل'] },
  { id: 'honesty', ayahs: [[9, 119], [33, 70]],
    words: ['honesty', 'honest', 'truthful', 'truthfulness', 'truth', 'lying', 'mittha', 'mithya', 'shottobadita', 'sottobadita', 'shotota', 'sotota', 'sadiq', 'sidq', 'সততা', 'সত্যবাদিতা', 'সত্যবাদী', 'সত্যতা', 'সত্য', 'মিথ্যা', 'صدق', 'الصدق'] },
  { id: 'knowledge', ayahs: [[20, 114], [39, 9], [96, 1]],
    words: ['knowledge', 'ilm', 'জ্ঞান', 'ইলম', 'علم'] },
  { id: 'anger and patience with people', ayahs: [[3, 134], [42, 37]],
    words: ['anger', 'angry', 'rag', 'raag', 'rege', 'gussa', 'রাগ', 'ক্রোধ', 'রেগে'] },
  { id: 'the Day of Judgment', ayahs: [[99, 7], [99, 8], [82, 19], [101, 6], [101, 8]],
    words: ['judgment', 'judgement', 'resurrection', 'qiyamah', 'qiyamat', 'kiyamat', 'kiyamot', 'doomsday', 'কিয়ামত', 'কিয়ামাহ', 'কেয়ামত', 'القيامة', 'قيامة'] },
  { id: 'Paradise', ayahs: [[2, 25], [3, 133], [9, 72], [4, 57], [56, 12]],
    words: ['paradise', 'jannah', 'jannat', 'জান্নাত', 'জান্নাতে', 'বেহেশত', 'جنة', 'الجنة'] },
  { id: 'illness and healing', ayahs: [[26, 80], [21, 83], [17, 82], [10, 57], [16, 69]],
    words: ['sick', 'sickness', 'ill', 'illness', 'disease', 'healing', 'cure', 'shifa', 'osukh', 'osukho', 'rog', 'অসুখ', 'অসুস্থ', 'রোগ', 'শিফা', 'مرض', 'شفاء'] },
  { id: 'death and the hereafter', ayahs: [[3, 185], [29, 57], [62, 8]],
    words: ['death', 'dying', 'hereafter', 'afterlife', 'মৃত্যু', 'আখিরাত', 'موت'] },
  { id: 'spouses', ayahs: [[30, 21]],
    words: ['marriage', 'spouse', 'spouses', 'wife', 'husband', 'বিয়ে', 'বিবাহ', 'নিকাহ'] },
  { id: 'gossip', ayahs: [[49, 12], [49, 11]],
    words: ['backbiting', 'gossip', 'গীবত'] },
  { id: 'humility', ayahs: [[31, 18], [25, 63]],
    words: ['pride', 'arrogance', 'arrogant', 'humble', 'humility', 'অহংকার'] },
];

// For "give me something from the Quran" (no topic): a few of these, chosen at random so the
// answers are not always the same.
export const GENERAL_AYAHS: ReadonlyArray<readonly [number, number, string]> = [
  [2, 153, 'patience and prayer'], [2, 286, 'no soul is burdened beyond its capacity'],
  [13, 28, 'hearts find rest in remembering Allah'], [14, 7, 'gratitude'], [17, 23, 'kindness to parents'],
  [39, 53, "do not despair of Allah's mercy"], [49, 13, 'people differ so they may know one another'],
  [94, 5, 'with hardship comes ease'],
];


// Words that carry no topic: a query made ONLY of these means "something from the Quran".
export const NO_TOPIC_WORDS = new Set([
  'teach', 'teaching', 'teaches', 'learn', 'something', 'anything', 'lesson', 'lessons', 'advice', 'guidance',
  'motivate', 'motivation', 'inspire', 'inspiration', 'ayah', 'ayat', 'verse', 'verses', 'quran', 'koran', 'quraan',
  'me', 'give', 'show', 'tell', 'some', 'from', 'the', 'a', 'an', 'of', 'one', 'please', 'us',
  'kisu', 'kichu', 'dao', 'den', 'shikao', 'sikao', 'shekhao', 'shikhao', 'upodesh', 'kuran', 'kuraner', 'theke', 'ek', 'ekta', 'bolo',
  'কিছু', 'দাও', 'দেন', 'শিখাও', 'শেখাও', 'শেখান', 'শিখান', 'উপদেশ', 'কুরআন', 'কোরআন', 'কুরান', 'থেকে', 'একটা', 'একটি', 'আয়াত', 'বলো', 'বল',
  'أعطني', 'علمني', 'شيئا', 'شيء', 'القرآن', 'آية', 'من',
]);


// Names of prophets and people as the English translation writes them (it says "Abraham", not "Ibrahim").
export const NAME_TO_EN: Record<string, string> = {
  ibrahim: 'abraham', ibraheem: 'abraham', musa: 'moses', moosa: 'moses', isa: 'jesus', eesa: 'jesus', yusuf: 'joseph', yousuf: 'joseph',
  nuh: 'noah', nooh: 'noah', yaqub: 'jacob', yaqoob: 'jacob', dawud: 'david', dawood: 'david', sulaiman: 'solomon', sulayman: 'solomon',
  ayyub: 'job', ayub: 'job', yunus: 'jonah', ismail: 'ishmael', ishaq: 'isaac', zakariya: 'zechariah', zakaria: 'zechariah', maryam: 'mary',
  firaun: 'pharaoh', 'fir\'aun': 'pharaoh', iblis: 'satan', shaitan: 'satan', shaytan: 'satan',
  'ইব্রাহিম': 'abraham', 'ইবরাহীম': 'abraham', 'ইবরাহিম': 'abraham', 'মূসা': 'moses', 'মুসা': 'moses', 'ঈসা': 'jesus', 'ইসা': 'jesus', 'ইউসুফ': 'joseph',
  'নূহ': 'noah', 'নুহ': 'noah', 'দাউদ': 'david', 'সুলাইমান': 'solomon', 'আইয়ুব': 'job', 'ইউনুস': 'jonah', 'ইসমাইল': 'ishmael', 'মারইয়াম': 'mary', 'ফিরাউন': 'pharaoh', 'ফেরাউন': 'pharaoh',
  'إبراهيم': 'abraham', 'موسى': 'moses', 'عيسى': 'jesus', 'يوسف': 'joseph', 'نوح': 'noah', 'داود': 'david', 'سليمان': 'solomon', 'مريم': 'mary', 'فرعون': 'pharaoh',
};

// The core themes above, then the many more in themes_more.ts. (A theme that has `allOf` is more specific and wins.)
import { MORE_THEMES } from './themes_more.js';
export const THEMES: Theme[] = [...CORE_THEMES, ...MORE_THEMES];
