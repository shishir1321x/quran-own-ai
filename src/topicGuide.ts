// Structured, strictly factual leads and bullet points for Quran Assistant answers (EN / BN / AR).
// NO third-party AI, NO fatwas, NO invented hadith, NO tafsir written by us: every point only describes
// what the shown ayahs state, live metadata from data/quran.json, or transparent scope boundaries.
// HAVE THESE WORDINGS CHECKED by native readers and someone with religious knowledge.
import type { Quran } from './data.js';
import type { Lang } from './types.js';

type T = Record<Lang, string>;
type PointsT = Record<Lang, string[]>;

const bd = (n: number | string): string => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const t = (en: string, bn: string, ar: string): T => ({ en, bn, ar });
const pt = (en: string[], bn: string[], ar: string[]): PointsT => ({ en, bn, ar });

export const VERSES_HEADING: T = t('The Quran says', 'কুরআনে যা বলা হয়েছে', 'قال الله تعالى');
export const POINTS_HEADING: T = t('Overview & Notes', 'সংক্ষিপ্ত সারমর্ম ও তথ্য', 'ملخص وملاحظات من النص');
export const FOLLOWUP_PROMPT: T = t(
  'Would you like to explore further?',
  'আরও জানতে নিচের যেকোনো একটি বেছে নিন:',
  'هل تود المتابعة بأحد الخيارات التالية؟',
);

export interface TopicGuideEntry {
  lead: T;
  points: PointsT;
}

const g = (lead: T, points: PointsT): TopicGuideEntry => ({ lead, points });

export const TOPIC_GUIDE: Record<string, TopicGuideEntry> = {
  'prayer times': g(
    t(
      'The Quran does not provide local clock times for prayer, but instructs believers to observe prayer at specified times of the day and night.',
      'কুরআনে নামাজের নির্দিষ্ট ঘড়ির সময়সূচী দেওয়া হয়নি, তবে দিন ও রাতের নির্ধারিত সময়ে নামাজ আদায় করার নির্দেশ দেওয়া হয়েছে।',
      'لا يحدد القرآن مواقيت الصلاة بالساعة المحلية، لكنه يأمر المؤمنين بإقامة الصلاة في أوقات محددة من اليوم والليلة.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:103) states that prayer has been prescribed for believers at specified times.',
        'Surah Al-Israa (17:78), Surah Hud (11:114), and Surah Taa-Haa (20:130) mention prayer and remembrance across parts of the day and night.',
        'Surah Al-Baqara (2:238) emphasizes guarding the prayers carefully.',
        'Exact local clock times depend on location and date; detailed prayer timings and rules come from the Sunnah and qualified scholars.',
      ],
      [
        'সূরা নিসা (4:103)-এ বলা হয়েছে, মুমিনদের ওপর নির্ধারিত সময়ে নামাজ ফরজ করা হয়েছে।',
        'সূরা ইসরা (17:78), সূরা হূদ (11:114) ও সূরা ত্ব-হা (20:130)-তে দিন ও রাতের বিভিন্ন প্রহরে নামাজ ও আল্লাহর স্মরণের কথা এসেছে।',
        'সূরা বাকারা (2:238)-এ নামাজগুলোর প্রতি যত্নবান থাকার নির্দেশ দেওয়া হয়েছে।',
        'এলাকা ও তারিখ ভেদে ঘড়ির নির্দিষ্ট সময়সূচী ভিন্ন হয়; নামাজের বিস্তারিত সময় ও বিধান সুন্নাহ এবং যোগ্য আলেমদের কাছ থেকে জানা যায়।',
      ],
      [
        'تذكر سورة النساء (4:103) أن الصلاة كانت على المؤمنين كتابًا موقوتًا.',
        'وتشير سورة الإسراء (17:78) وهود (11:114) وطه (20:130) إلى إقامة الصلاة والذكر في أطراف النهار والليل.',
        'وتؤكد سورة البقرة (2:238) المحافظة على الصلوات.',
        'تختلف المواقيت المحلية حسب المكان والتاريخ، وتُؤخذ تفاصيل الأوقات والأحكام من السنة وأهل العلم.',
      ],
    ),
  ),

  'how many prayers': g(
    t(
      'The Quran does not list a single numerical count of daily prayers or rak\'ahs in one verse, but commands establishing prayer at specified times across the day and night. The details of the five daily prayers come from the Sunnah and qualified scholars.',
      'কুরআনের কোনো একক আয়াতে দৈনিক নামাজের নির্দিষ্ট সংখ্যা বা রাকাতের তালিকা দেওয়া হয়নি, তবে দিন ও রাতের নির্ধারিত সময়ে বিনয়ের সাথে নামাজ কায়েম করার নির্দেশ দেওয়া হয়েছে। পাঁচ ওয়াক্ত নামাজ ও এর রাকাত-পদ্ধতির বিস্তারিত সুন্নাহ এবং যোগ্য আলেমদের কাছ থেকে জানা যায়।',
      'لا يذكر القرآن عدد الصلوات اليومية أو الركعات في آية واحدة، لكنه يأمر بإقامة الصلاة في أوقات محددة بخشوع. وتفاصيل الصلوات الخمس وهيئتها تؤخذ من السنة وأهل العلم.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:103) describes prayer as a decree of specified times upon the believers.',
        'Surah Al-Israa (17:78) and Surah Hud (11:114) refer to establishing prayer at periods of the day and night.',
        'Surah Al-Mu\'minoon (23:1–2) highlights believers who are humbly focused during their prayer.',
        'For the exact details of the five daily prayers, rak\'ahs, and fiqh rulings, please consult the Sunnah and a qualified scholar.',
      ],
      [
        'সূরা নিসা (4:103)-এ নামাজকে মুমিনদের ওপর নির্ধারিত সময়ের বিধান বলা হয়েছে।',
        'সূরা ইসরা (17:78) ও সূরা হূদ (11:114)-এ দিন ও রাতের বিভিন্ন সময়ে নামাজ কায়েম করার উল্লেখ আছে।',
        'সূরা মুমিনুন (23:1–2)-এ নামাজে বিনয়ী ও মনোযোগী মুমিনদের সফলতার কথা বলা হয়েছে।',
        'পাঁচ ওয়াক্ত নামাজের রাকাত, আদায়ের পদ্ধতি ও শরয়ী বিধানের জন্য সুন্নাহ ও একজন যোগ্য আলেমের শরণাপন্ন হোন।',
      ],
      [
        'تبيّن سورة النساء (4:103) أن الصلاة فريضة ذات أوقات محددة.',
        'وتشير سورة الإسراء (17:78) وهود (11:114) إلى إقامة الصلاة في أوقات من النهار والليل.',
        'وتذكر سورة المؤمنون (23:1–2) فلاح المؤمنين الخاشعين في صلاتهم.',
        'لمعرفة تفاصيل الصلوات الخمس وعدد الركعات والأحكام الفقهية يُرجى الرجوع إلى السنة وسؤال أهل العلم.',
      ],
    ),
  ),

  'prayer': g(
    t(
      'The Quran repeatedly emphasizes establishing prayer (salah) with mindfulness, remembrance of Allah, and regular observance.',
      'কুরআনে বারবার আল্লাহর স্মরণে, মনোযোগসহ ও নিয়মিত নামাজ (সালাত) কায়েম করার নির্দেশ দেওয়া হয়েছে।',
      'يؤكد القرآن مرارًا على إقامة الصلاة بخشوع ومواظبة وذكر لله تعالى.',
    ),
    pt(
      [
        'Surah Al-Ankaboot (29:45) notes that prayer restrains from immorality and wrongdoing.',
        'Surah Taa-Haa (20:14) links establishing prayer directly with remembering Allah.',
        'Surah Al-Baqara (2:45, 2:238) mentions seeking help through patience and prayer and guarding the prayers.',
        'Surah An-Nisaa (4:103) states that prayer is prescribed at specified times.',
      ],
      [
        'সূরা আনকাবুত (29:45)-এ বলা হয়েছে, নামাজ অশ্লীল ও মন্দ কাজ থেকে বিরত রাখে।',
        'সূরা ত্ব-হা (20:14)-এ আল্লাহর স্মরণের উদ্দেশ্যে নামাজ কায়েম করার নির্দেশ এসেছে।',
        'সূরা বাকারা (2:45, 2:238)-এ ধৈর্য ও নামাজের মাধ্যমে সাহায্য চাওয়া এবং নামাজ সংরক্ষণের কথা বলা হয়েছে।',
        'সূরা নিসা (4:103)-এ নির্ধারিত সময়ে নামাজ আদায়ের বিধান উল্লেখ আছে।',
      ],
      [
        'تذكر سورة العنكبوت (29:45) أن الصلاة تنهى عن الفحشاء والمنكر.',
        'وتربط سورة طه (20:14) إقامة الصلاة بذكر الله تعالى.',
        'وتشير سورة البقرة (2:45، 2:238) إلى الاستعانة بالصبر والصلاة والمحافظة عليها.',
        'وتبيّن سورة النساء (4:103) أن الصلاة مؤقتة بأوقات محددة.',
      ],
    ),
  ),

  'patience': g(
    t(
      'The Quran speaks often about patience (sabr), pairing it with prayer, perseverance in trials, and Allah\'s companionship and reward.',
      'কুরআনে ধৈর্য (সবর)-এর গুরুত্ব বারবার এসেছে—নামাজের সাথে সাহায্য প্রার্থনা, পরীক্ষায় অবিচলতা এবং ধৈর্যশীলদের প্রতি আল্লাহর সঙ্গ ও পুরস্কারের কথা এতে উল্লেখ আছে।',
      'يتكرر ذكر الصبر في القرآن مقرونًا بالصلاة والثبات عند البلاء ومعيّة الله وأجره للصابرين.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:153) instructs believers to seek help through patience and prayer, affirming Allah is with the patient.',
        'Surah Al-Baqara (2:155) mentions testing with fear, hunger, and loss, giving glad tidings to those who endure patiently.',
        'Surah Az-Zumar (39:10) states that the patient will be given their reward without account.',
        'Surah Aal-i-Imraan (3:200) and Surah Al-Asr (103:3) encourage perseverance and mutually advising one another to patience.',
      ],
      [
        'সূরা বাকারা (2:153)-এ ধৈর্য ও নামাজের মাধ্যমে সাহায্য চাওয়ার নির্দেশ এবং আল্লাহ ধৈর্যশীলদের সাথে আছেন বলে উল্লেখ আছে।',
        'সূরা বাকারা (2:155)-এ বিভিন্ন পরীক্ষার কথা বলে ধৈর্যশীলদের সুসংবাদ দেওয়া হয়েছে।',
        'সূরা যুমার (39:10)-এ বলা হয়েছে, ধৈর্যশীলদের অগণিত পুরস্কার দেওয়া হবে।',
        'সূরা আলে ইমরান (3:200) ও সূরা আসর (103:3)-এ অবিচলতা ও পরস্পরকে ধৈর্যের উপদেশ দেওয়ার কথা এসেছে।',
      ],
      [
        'تأمر سورة البقرة (2:153) بالاستعانة بالصبر والصلاة، وتبشّر بأن الله مع الصابرين.',
        'وتذكر البقرة (2:155) الابتلاء وتبشّر الصابرين.',
        'وتبيّن سورة الزمر (39:10) أن الصابرين يُوفَّون أجرهم بغير حساب.',
        'وتدعو آل عمران (3:200) والعصر (103:3) إلى المصابرة والتواصي بالصبر.',
      ],
    ),
  ),

  'hardship and comfort': g(
    t(
      'The Quran addresses hardship, worry, and grief with reminders of ease after difficulty, Allah\'s mercy, and reassurance of the heart through His remembrance.',
      'কষ্ট, দুশ্চিন্তা ও দুঃখের সময় কুরআনে কষ্টের সাথে স্বস্তি, সাধ্যের বাইরে বোঝা না দেওয়া এবং আল্লাহর স্মরণে অন্তরের প্রশান্তির কথা বলা হয়েছে।',
      'يخاطب القرآن الشدائد والهموم بالتذكير باليسر مع العسر، ورحمة الله، وطمأنينة القلوب بذكره.',
    ),
    pt(
      [
        'Surah Ash-Sharh (94:5–6) affirms twice that with hardship comes ease.',
        'Surah Al-Baqara (2:286) states that Allah does not burden a soul beyond what it can bear.',
        'Surah Ar-Ra\'d (13:28) states that hearts find assurance in the remembrance of Allah.',
        'Surah At-Talaaq (65:3) and Surah Ad-Dhuhaa (93:3) remind believers of reliance upon Allah and His care.',
      ],
      [
        'সূরা শারহ (94:5–6)-এ দুইবার বলা হয়েছে যে কষ্টের সাথেই স্বস্তি রয়েছে।',
        'সূরা বাকারা (2:286)-এ উল্লেখ আছে, আল্লাহ কোনো সত্তার ওপর তার সাধ্যের বাইরে বোঝা চাপান না।',
        'সূরা রা\'দ (13:28)-এ বলা হয়েছে, আল্লাহর স্মরণেই অন্তর প্রশান্ত হয়।',
        'সূরা তালাক (65:3) ও সূরা দুহা (93:3)-এ আল্লাহর ওপর ভরসা ও তাঁর অনুগ্রহের স্মরণ রয়েছে।',
      ],
      [
        'تؤكد سورة الشرح (94:5–6) مرتين أن مع العسر يسرًا.',
        'وتذكر البقرة (2:286) أن الله لا يكلف نفسًا إلا وسعها.',
        'وتبيّن سورة الرعد (13:28) أن القلوب تطمئن بذكر الله.',
        'وتشير سورة الطلاق (65:3) والضحى (93:3) إلى التوكل على الله ولطفه.',
      ],
    ),
  ),

  'mercy and forgiveness': g(
    t(
      'The Quran emphasizes Allah\'s vast mercy and forgiveness, urging people never to despair and to turn back in sincere repentance.',
      'কুরআনে আল্লাহর অসীম রহমত ও ক্ষমার কথা গুরুত্বের সাথে এসেছে—কখনো নিরাশ না হয়ে আন্তরিক তওবার মাধ্যমে তাঁর দিকে ফিরে আসার আহ্বান জানানো হয়েছে।',
      'يبرز القرآن سعة رحمة الله ومغفرته، ويدعو إلى عدم القنوط والرجوع إليه بالتوبة الصادقة.',
    ),
    pt(
      [
        'Surah Az-Zumar (39:53) calls on those who have transgressed not to despair of Allah\'s mercy, for He forgives all sins.',
        'Surah An-Nisaa (4:110) states that whoever does wrong and seeks Allah\'s forgiveness finds Him Forgiving and Merciful.',
        'Surah Aal-i-Imraan (3:135) describes believers who remember Allah and ask forgiveness when they slip.',
        'Surah Yusuf (12:87) reminds not to despair of Allah\'s soothing mercy.',
      ],
      [
        'সূরা যুমার (39:53)-এ আল্লাহর রহমত থেকে নিরাশ না হওয়ার আহ্বান জানানো হয়েছে, কারণ তিনি সব গুনাহ ক্ষমা করেন।',
        'সূরা নিসা (4:110)-এ বলা হয়েছে, অন্যায় করে আল্লাহর কাছে ক্ষমা চাইলে তাঁকে ক্ষমাশীল ও পরম দয়ালু পাওয়া যায়।',
        'সূরা আলে ইমরান (3:135)-এ ভুলের পর আল্লাহকে স্মরণ করে ক্ষমা প্রার্থনাকারীদের বর্ণনা আছে।',
        'সূরা ইউসুফ (12:87)-এ আল্লাহর রহমত থেকে নিরাশ না হওয়ার উপদেশ রয়েছে।',
      ],
      [
        'تدعو سورة الزمر (39:53) إلى عدم القنوط من رحمة الله لأنه يغفر الذنوب جميعًا.',
        'وتذكر النساء (4:110) أن من يستغفر الله يجد الله غفورًا رحيمًا.',
        'وتصف آل عمران (3:135) الذين يذكرون الله ويستغفرون لذنوبهم.',
        'وتوصي سورة يوسف (12:87) بعدم اليأس من رَوح الله.',
      ],
    ),
  ),

  'parents': g(
    t(
      'The Quran commands kindness, respect, humility, and gratitude toward parents, especially in their old age.',
      'কুরআনে পিতা-মাতার প্রতি সদাচরণ, সম্মান, বিনয় এবং কৃতজ্ঞতা প্রকাশের নির্দেশ দেওয়া হয়েছে—বিশেষ করে তাঁদের বার্ধক্যে।',
      'يأمر القرآن بالإحسان إلى الوالدين واحترامهما وخفض الجناح لهما، لا سيما عند الكبر.',
    ),
    pt(
      [
        'Surah Al-Israa (17:23–24) commands excellent treatment of parents, forbids harsh words, and teaches praying for mercy upon them.',
        'Surah Luqman (31:14) highlights the mother\'s hardship in pregnancy and weaning and commands gratitude to Allah and parents.',
        'Surah Al-Ahqaf (46:15) combines kindness to parents with a supplication for gratitude and righteous offspring.',
      ],
      [
        'সূরা ইসরা (17:23–24)-এ পিতা-মাতার সাথে উত্তম আচরণ, কটু কথা না বলা এবং তাঁদের জন্য রহমতের দোয়া শেখানো হয়েছে।',
        'সূরা লুকমান (31:14)-এ মায়ের কষ্টের কথা উল্লেখ করে আল্লাহ ও পিতা-মাতার প্রতি কৃতজ্ঞ হওয়ার নির্দেশ আছে।',
        'সূরা আহক্বাফ (46:15)-এ পিতা-মাতার প্রতি সদাচরণ ও কৃতজ্ঞতার দোয়া একসাথে এসেছে।',
      ],
      [
        'تأمر سورة الإسراء (17:23–24) بالإحسان إلى الوالدين وتجنّب التأفف والدعاء لهما بالرحمة.',
        'وتذكر سورة لقمان (31:14) مشقة الأم وتأمر بالشكر لله وللوالدين.',
        'وتجمع سورة الأحقاف (46:15) بين الوصية بالوالدين والدعاء بالشكر والصلاح.',
      ],
    ),
  ),

  'gratitude': g(
    t(
      'The Quran links gratitude (shukr) to Allah with recognizing His blessings and the promise of increase.',
      'কুরআনে আল্লাহর প্রতি কৃতজ্ঞতা (শোকর) আদায়কে তাঁর নিয়ামতের স্বীকৃতি ও আরও বৃদ্ধির প্রতিশ্রুতির সাথে যুক্ত করা হয়েছে।',
      'يربط القرآن شكر الله بالاعتراف بنعمه والوعد بالزيادة.',
    ),
    pt(
      [
        'Surah Ibrahim (14:7) states that if people are grateful, Allah will surely increase His favor upon them.',
        'Surah Al-Baqara (2:152) pairs remembering Allah with being grateful to Him.',
        'Surah Luqman (31:12) notes that whoever is grateful is grateful for the benefit of their own soul.',
      ],
      [
        'সূরা ইবরাহীম (14:7)-এ বলা হয়েছে, কৃতজ্ঞ হলে আল্লাহ নিয়ামত আরও বাড়িয়ে দেবেন।',
        'সূরা বাকারা (2:152)-এ আল্লাহর স্মরণের সাথে কৃতজ্ঞ থাকার নির্দেশ এসেছে।',
        'সূরা লুকমান (31:12)-এ বলা হয়েছে, যে কৃতজ্ঞতা প্রকাশ করে সে নিজের কল্যাণের জন্যই তা করে।',
      ],
      [
        'تذكر سورة إبراهيم (14:7) الوعد بالزيادة للشاكرين.',
        'وتجمع البقرة (2:152) بين ذكر الله وشكره.',
        'وتبيّن لقمان (31:12) أن من يشكر فإنما يشكر لنفسه.',
      ],
    ),
  ),

  'charity': g(
    t(
      'The Quran encourages generous, sincere charity (sadaqah and zakah), both privately and openly, while forbidding harm or reminders of generosity.',
      'কুরআনে গোপনে ও প্রকাশ্যে নিষ্ঠার সাথে দান-সদকা ও যাকাত আদায়ে উৎসাহ দেওয়া হয়েছে এবং খোটা বা কষ্ট দেওয়া থেকে নিষেধ করা হয়েছে।',
      'يحث القرآن على الإنفاق والصدقة والزكاة بإخلاص سرًا وعلانية.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:261) uses the parable of a grain growing seven spikes to illustrate the multiplied reward of spending for Allah\'s sake.',
        'Surah Al-Baqara (2:271) praises both open charity and giving discreetly to the poor.',
        'Surah Al-Baqara (2:274) mentions those who spend by night and day, secretly and publicly.',
      ],
      [
        'সূরা বাকারা (2:261)-এ আল্লাহর পথে দানের বহুগুণ সওয়াবকে একটি শস্যদানার উপমায় তুলে ধরা হয়েছে।',
        'সূরা বাকারা (2:271)-এ প্রকাশ্যে দানের পাশাপাশি গোপনে অভাবীদের দান করার উত্তম দিক উল্লেখ আছে।',
        'সূরা বাকারা (2:274)-এ দিন-রাত গোপনে ও প্রকাশ্যে ব্যয়কারীদের পুরস্কারের কথা বলা হয়েছে।',
      ],
      [
        'تضرب البقرة (2:261) مثل الحبة التي أنبتت سبع سنابل لمضاعفة أجر الإنفاق.',
        'وتذكر البقرة (2:271) خير إبداء الصدقات وإخفائها للفقراء.',
        'وتشير البقرة (2:274) إلى الذين ينفقون بالليل والنهار سرًا وعلانية.',
      ],
    ),
  ),

  'fasting': g(
    t(
      'The Quran prescribes fasting (sawm) in the month of Ramadan as a means of developing God-consciousness (taqwa), with concessions for the sick and travelers.',
      'কুরআনে তাকওয়া অর্জনের উদ্দেশ্যে রমজান মাসে রোজা (সিয়াম) ফরজ করার কথা বলা হয়েছে এবং অসুস্থ ও মুসাফিরদের জন্য সহজীকরণের উল্লেখ আছে।',
      'يفرض القرآن الصيام في شهر رمضان لتحقيق التقوى، مع ذكر الرخص للمريض والمسافر.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:183) states that fasting was prescribed for believers as it was for those before them, so they may attain taqwa.',
        'Surah Al-Baqara (2:185) identifies Ramadan as the month in which the Quran was revealed and mentions ease for those who are ill or traveling.',
        'For detailed rulings on fasting exemptions or making up missed days, please ask a qualified scholar.',
      ],
      [
        'সূরা বাকারা (2:183)-এ তাকওয়া অর্জনের লক্ষ্যে পূর্ববর্তীদের মতো রোজা ফরজ হওয়ার কথা বলা হয়েছে।',
        'সূরা বাকারা (2:185)-এ রমজানকে কুরআন নাযিলের মাস বলা হয়েছে এবং অসুস্থ বা মুসাফিরের জন্য ছাড়ের উল্লেখ আছে।',
        'রোজার কাজা, ফিদিয়া বা বিস্তারিত শরয়ী বিধানের জন্য একজন যোগ্য আলেমকে জিজ্ঞেস করুন।',
      ],
      [
        'تذكر البقرة (2:183) فرض الصيام لعلكم تتقون.',
        'وتبيّن البقرة (2:185) أن رمضان هو الشهر الذي أُنزل فيه القرآن وتذكر التيسير للمريض والمسافر.',
        'للأحكام التفصيلية في القضاء والفدية يُرجى سؤال أهل العلم.',
      ],
    ),
  ),

  'trust in Allah': g(
    t(
      'The Quran encourages placing reliance and trust in Allah (tawakkul) alongside taking sound action and consultation.',
      'কুরআনে যথাযথ চেষ্টা ও পরামর্শের পাশাপাশি আল্লাহর ওপর পূর্ণ ভরসা (তাওয়াক্কুল) রাখার নির্দেশ দেওয়া হয়েছে।',
      'يدعو القرآن إلى التوكل على الله والثقة به مع الأخذ بالأسباب والشورى.',
    ),
    pt(
      [
        'Surah At-Talaaq (65:3) states that whoever relies upon Allah, He is sufficient for them.',
        'Surah Aal-i-Imraan (3:159) instructs: once you have decided after consultation, put your trust in Allah.',
        'Surah At-Tawba (9:51) reminds that nothing occurs except by Allah\'s decree.',
      ],
      [
        'সূরা তালাক (65:3)-এ বলা হয়েছে, যে আল্লাহর ওপর ভরসা করে, তিনিই তার জন্য যথেষ্ট।',
        'সূরা আলে ইমরান (3:159)-এ পরামর্শের পর সিদ্ধান্ত নিয়ে আল্লাহর ওপর ভরসা করার নির্দেশ আছে।',
        'সূরা তাওবা (9:51)-এ স্মরণ করানো হয়েছে যে আল্লাহর নির্ধারণ ছাড়া কিছুই ঘটে না।',
      ],
      [
        'تذكر سورة الطلاق (65:3) أن من يتوكل على الله فهو حسبه.',
        'وتأمر آل عمران (3:159) بالمشاورة ثم التوكل على الله عند العزم.',
        'وتؤكد سورة التوبة (9:51) أن لا يصيبنا إلا ما كتب الله لنا.',
      ],
    ),
  ),

  'justice': g(
    t(
      'The Quran commands upholding justice (adl) and fairness steadfastly, even when it is against oneself or close relatives, without letting dislike lead to unfairness.',
      'কুরআনে নিজের বা আত্মীয়স্বজনের বিরুদ্ধে গেলেও ন্যায়বিচার (আদল) প্রতিষ্ঠার নির্দেশ দেওয়া হয়েছে এবং কোনো বিদ্বেষের কারণে অবিচার করতে নিষেধ করা হয়েছে।',
      'يأمر القرآن بإقامة العدل والقسط ولو على النفس أو الأقربين، وينهى عن الظلم بسبب البغض.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:135) instructs standing firmly in justice as witnesses for Allah, even against oneself or relatives.',
        'Surah Al-Maaida (5:8) warns not to let hatred of a people prevent you from being just.',
        'Surah An-Nahl (16:90) pairs justice with good conduct and helping relatives.',
      ],
      [
        'সূরা নিসা (4:135)-এ নিজের বা আত্মীয়দের বিরুদ্ধে গেলেও আল্লাহর জন্য ন্যায়ের সাক্ষী হয়ে দাঁড়ানোর নির্দেশ আছে।',
        'সূরা মায়িদাহ (5:8)-এ কোনো সম্প্রদায়ের প্রতি বিদ্বেষ যেন অবিচারে প্ররোচিত না করে সে বিষয়ে সতর্ক করা হয়েছে।',
        'সূরা নাহল (16:90)-এ ন্যায়বিচার, সদাচরণ ও আত্মীয়দের সহায়তার আদেশ একসাথে এসেছে।',
      ],
      [
        'تأمر النساء (4:135) بالقيام بالقسط شهداء لله ولو على الأنفس أو الأقربين.',
        'وتنهى المائدة (5:8) عن ترك العدل بسبب شنآن قوم.',
        'وتجمع النحل (16:90) بين الأمر بالعدل والإحسان وإيتاء ذي القربى.',
      ],
    ),
  ),

  'honesty': g(
    t(
      'The Quran commands truthfulness, integrity, and speaking clear, upright words.',
      'কুরআনে সত্যবাদিতা অবলম্বন, সত্যবাদীদের সাথে থাকা এবং সঠিক ও সুস্পষ্ট কথা বলার নির্দেশ দেওয়া হয়েছে।',
      'يأمر القرآن بالصدق وملازمة الصادقين والقول السديد.',
    ),
    pt(
      [
        'Surah At-Tawba (9:119) instructs believers to be mindful of Allah and remain with those who are true.',
        'Surah Al-Ahzaab (33:70) commands speaking words of appropriate justice and truthfulness.',
      ],
      [
        'সূরা তাওবা (9:119)-এ তাকওয়া অবলম্বন ও সত্যবাদীদের সাথে থাকার নির্দেশ দেওয়া হয়েছে।',
        'সূরা আহযাব (33:70)-এ সঠিক ও সত্য কথা বলার আদেশ এসেছে।',
      ],
      [
        'تأمر سورة التوبة (9:119) بتقوى الله والكون مع الصادقين.',
        'وتأمر سورة الأحزاب (33:70) بالقول السديد.',
      ],
    ),
  ),

  'knowledge': g(
    t(
      'The Quran honors reading, learning, and seeking beneficial knowledge, distinguishing those who know from those who do not.',
      'কুরআনে পড়া, শেখা এবং জ্ঞান বৃদ্ধির দোয়াকে বিশেষ মর্যাদা দেওয়া হয়েছে এবং জ্ঞানী ও অজ্ঞের পার্থক্য তুলে ধরা হয়েছে।',
      'يكرّم القرآن القراءة وطلب العلم والدعاء بزيادته، ويميّز بين الذين يعلمون والذين لا يعلمون.',
    ),
    pt(
      [
        'Surah Taa-Haa (20:114) teaches the supplication: "My Lord, increase me in knowledge."',
        'Surah Az-Zumar (39:9) asks rhetorically whether those who know and those who do not know are equal.',
        'Surah Al-Alaq (96:1) opens revelation with the command to read in the name of the Lord.',
      ],
      [
        'সূরা ত্ব-হা (20:114)-এ "হে আমার রব, আমার জ্ঞান বৃদ্ধি করে দিন" দোয়াটি শেখানো হয়েছে।',
        'সূরা যুমার (39:9)-এ প্রশ্ন করা হয়েছে, যারা জানে আর যারা জানে না তারা কি সমান?',
        'সূরা আলাক (96:1)-এ স্রষ্টার নামে পড়ার আদেশ দিয়ে ওহী শুরু হয়েছে।',
      ],
      [
        'تعلّم سورة طه (20:114) الدعاء: «ربّ زدني علمًا».',
        'وتتساءل سورة الزمر (39:9): هل يستوي الذين يعلمون والذين لا يعلمون.',
        'وتفتتح سورة العلق (96:1) الوحي بالأمر بالقراءة باسم الرب.',
      ],
    ),
  ),

  'anger and patience with people': g(
    t(
      'The Quran praises those who restrain their anger and pardon people, counting it among the qualities of the righteous.',
      'কুরআনে রাগ সংবরণকারী ও মানুষকে ক্ষমাকারীদের প্রশংসা করা হয়েছে এবং একে মুত্তাকীদের অন্যতম গুণ হিসেবে উল্লেখ করা হয়েছে।',
      'يمدح القرآن الكاظمين الغيظ والعافين عن الناس ويعدّ ذلك من صفات المحسنين.',
    ),
    pt(
      [
        'Surah Aal-i-Imraan (3:134) describes the righteous as those who restrain anger and pardon others.',
        'Surah Ash-Shura (42:37) praises those who forgive when they are angry.',
      ],
      [
        'সূরা আলে ইমরান (3:134)-এ রাগ সংবরণ করা ও মানুষকে ক্ষমা করে দেওয়াকে সৎকর্মশীলদের গুণ বলা হয়েছে।',
        'সূরা শূরা (42:37)-এ রাগান্বিত হয়েও ক্ষমা করে দেওয়ার প্রশংসা করা হয়েছে।',
      ],
      [
        'تصف آل عمران (3:134) المتقين بكظم الغيظ والعفو عن الناس.',
        'وتثني سورة الشورى (42:37) على الذين إذا غضبوا هم يغفرون.',
      ],
    ),
  ),

  'spouses': g(
    t(
      'The Quran describes marriage as one of Allah\'s signs, built upon tranquility, affection, and mercy between spouses.',
      'কুরআনে দাম্পত্য সম্পর্ককে আল্লাহর অন্যতম নিদর্শন হিসেবে বর্ণনা করা হয়েছে, যার ভিত্তি প্রশান্তি, ভালোবাসা ও পারস্পরিক দয়া।',
      'يصف القرآن الزواج بأنه من آيات الله، يقوم على السكينة والمودة والرحمة بين الزوجين.',
    ),
    pt(
      [
        'Surah Ar-Room (30:21) highlights creating spouses so that they may find tranquility in one another, placing affection and mercy between them.',
        'For detailed family law or marriage rulings, please consult a qualified scholar.',
      ],
      [
        'সূরা রূম (30:21)-এ উল্লেখ আছে, আল্লাহ জীবনসঙ্গী সৃষ্টি করেছেন যেন তাদের মাঝে প্রশান্তি, ভালোবাসা ও দয়া সৃষ্টি হয়।',
        'বিয়ে বা দাম্পত্য বিষয়ের বিস্তারিত শরয়ী বিধানের জন্য একজন যোগ্য আলেমের পরামর্শ নিন।',
      ],
      [
        'تذكر سورة الروم (30:21) خلق الأزواج لتسكنوا إليها وجعل المودة والرحمة بينهما.',
        'للأحكام الشرعية التفصيلية في الزواج يُرجى سؤال أهل العلم.',
      ],
    ),
  ),

  'orphans': g(
    t(
      'The Quran strongly instructs caring for orphans, guarding their property justly, and never oppressing or turning them away.',
      'কুরআনে এতিমদের প্রতি সদয় আচরণ, তাদের সম্পদ ন্যায়সঙ্গতভাবে রক্ষা করা এবং তাদের ওপর কোনো জুলুম না করার কঠোর নির্দেশ দেওয়া হয়েছে।',
      'يؤكد القرآن على الإحسان إلى اليتامى وحفظ أموالهم بالعدل، وينهى بشدة عن قهرهم أو أكل أموالهم.',
    ),
    pt(
      [
        'Surah Ad-Dhuhaa (93:9) instructs directly: do not oppress the orphan.',
        'Surah An-Nisaa (4:2, 4:10) commands returning orphans\' property fairly and warns severely against consuming it unjustly.',
        'Surah Al-Maa\'un (107:2) and Surah Al-Baqara (2:220) call for kindness and what is best for orphans.',
      ],
      [
        'সূরা দুহা (93:9)-এ সরাসরি নির্দেশ এসেছে: এতিমের ওপর কঠোরতা করো না।',
        'সূরা নিসা (4:2, 4:10)-এ এতিমদের সম্পদ সঠিকভাবে বুঝিয়ে দেওয়ার আদেশ এবং অন্যায়ভাবে ভক্ষণের কঠোর সতর্কতা রয়েছে।',
        'সূরা মাউন (107:2) ও সূরা বাকারা (2:220)-এ এতিমদের কল্যাণ ও সদাচরণের কথা বলা হয়েছে।',
      ],
      [
        'تأمر سورة الضحى (93:9) بعدم قهر اليتيم.',
        'وتأمر النساء (4:2، 4:10) بإيتاء اليتامى أموالهم وتحذر من أكلها ظلمًا.',
        'وتدعو سورة الماعون (107:2) والبقرة (2:220) إلى الإصلاح لهم والإحسان إليهم.',
      ],
    ),
  ),

  'neighbors': g(
    t(
      'The Quran instructs treating neighbors—both near and distant—with kindness alongside parents, relatives, orphans, and the needy.',
      'কুরআনে পিতা-মাতা, আত্মীয় ও অভাবীদের পাশাপাশি নিকটবর্তী ও দূরবর্তী প্রতিবেশীর সাথে সদাচরণের নির্দেশ দেওয়া হয়েছে।',
      'يأمر القرآن بالإحسان إلى الجار ذي القربى والجار الجنب مع الوالدين والأقربين واليتامى والمساكين.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:36) lists good conduct toward the neighbor who is near of kin and the neighbor who is a stranger.',
        'The same verse pairs worship of Allah with broad social kindness to family, travelers, and companions.',
      ],
      [
        'সূরা নিসা (4:36)-এ নিকট প্রতিবেশী ও দূর প্রতিবেশী উভয়ের সাথে সদ্ব্যবহারের নির্দেশ দেওয়া হয়েছে।',
        'একই আয়াতে আল্লাহর ইবাদতের পাশাপাশি পিতা-মাতা, আত্মীয়, এতিম, অভাবী ও পথিকের প্রতি উত্তম আচরণের কথা এসেছে।',
      ],
      [
        'تأمر سورة النساء (4:36) بالإحسان إلى الجار ذي القربى والجار الجنب.',
        'وتجمع الآية نفسها بين عبادة الله والإحسان إلى مختلف فئات المجتمع.',
      ],
    ),
  ),

  'purpose of life': g(
    t(
      'The Quran describes the creation of humanity and life as purposeful—centered on worshipping Allah, being tested in good deeds, and returning to Him.',
      'কুরআনে মানুষ ও জীবনের সৃষ্টিকে উদ্দেশ্যপূর্ণ হিসেবে বর্ণনা করা হয়েছে—আল্লাহর ইবাদত করা, কে কাজে উত্তম তা পরীক্ষা করা এবং তাঁর কাছেই প্রত্যাবর্তন।',
      'يبيّن القرآن أن خلق الإنسان والحياة لحكمة وغاية: عبادة الله والابتلاء في أحسن العمل والرجوع إليه.',
    ),
    pt(
      [
        'Surah Adh-Dhaariyat (51:56) states that jinn and mankind were created to worship Allah.',
        'Surah Al-Mulk (67:2) states that Allah created death and life to test who is best in deed.',
        'Surah Al-Mu\'minoon (23:115) and Surah Aal-i-Imraan (3:191) affirm that creation was not made in vain.',
      ],
      [
        'সূরা যারিয়াত (51:56)-এ বলা হয়েছে, জিন ও মানুষকে একমাত্র আল্লাহর ইবাদতের জন্য সৃষ্টি করা হয়েছে।',
        'সূরা মুলক (67:2)-এ উল্লেখ আছে, কে কর্মে উত্তম তা পরীক্ষার জন্যই মৃত্যু ও জীবন সৃষ্টি করা হয়েছে।',
        'সূরা মুমিনুন (23:115) ও সূরা আলে ইমরান (3:191)-এ বলা হয়েছে, এই সৃষ্টি অনর্থক নয়।',
      ],
      [
        'تذكر سورة الذاريات (51:56) أن الجن والإنس خُلقوا لعبادة الله.',
        'وتبيّن سورة الملك (67:2) أن خلق الموت والحياة للابتلاء بأحسن العمل.',
        'وتؤكد المؤمنون (23:115) وآل عمران (3:191) أن الخلق لم يكن عبثًا ولا باطلًا.',
      ],
    ),
  ),

  'remembrance of Allah (dhikr)': g(
    t(
      'The Quran encourages abundant remembrance of Allah (dhikr), describing it as a source of inner peace and connection with Him.',
      'কুরআনে বেশি বেশি আল্লাহর স্মরণ (যিকির) করার উৎসাহ দেওয়া হয়েছে এবং একে অন্তরের প্রশান্তির উৎস হিসেবে বর্ণনা করা হয়েছে।',
      'يحث القرآن على الإكثار من ذكر الله ويصفه بأنه سبب طمأنينة القلوب.',
    ),
    pt(
      [
        'Surah Ar-Ra\'d (13:28) states that hearts find tranquility in the remembrance of Allah.',
        'Surah Al-Baqara (2:152) says: "So remember Me; I will remember you."',
        'Surah Al-Ahzaab (33:41) and Surah Al-A\'raaf (7:205) encourage remembering Allah frequently and with humility.',
      ],
      [
        'সূরা রা\'দ (13:28)-এ বলা হয়েছে, আল্লাহর স্মরণেই অন্তর প্রশান্তি লাভ করে।',
        'সূরা বাকারা (2:152)-এ এসেছে: "তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব।"',
        'সূরা আহযাব (33:41) ও সূরা আরাফ (7:205)-এ বিনয়ের সাথে অধিক যিকিরের নির্দেশ আছে।',
      ],
      [
        'تؤكد الرعد (13:28) أن بذكر الله تطمئن القلوب.',
        'وتذكر البقرة (2:152): «فاذكروني أذكركم».',
        'وتدعو الأحزاب (33:41) والأعراف (7:205) إلى كثرة الذكر بتضرع وخيفة.',
      ],
    ),
  ),

  'good deeds and righteousness': g(
    t(
      'The Quran connects true righteousness with faith, charity, prayer, honesty, patience, and good conduct—promising full reward for every good deed.',
      'কুরআনে প্রকৃত পুণ্য ও সৎকর্মকে ঈমান, দান, নামাজ, সততা ও ধৈর্যের সাথে যুক্ত করা হয়েছে এবং প্রতিটি ভালো কাজের পূর্ণ পুরস্কারের প্রতিশ্রুতি দেওয়া হয়েছে।',
      'يربط القرآن البر والعمل الصالح بالإيمان والإنفاق والصلاة والصدق والصبر، ويبشّر بحفظ أجر كل خير.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:177) outlines righteousness across belief, caring for those in need, prayer, keeping promises, and patience.',
        'Surah An-Nahl (16:97) promises a good life and reward to every believer, male or female, who does righteous deeds.',
        'Surah Az-Zalzala (99:7) and Surah Al-Kahf (18:30) affirm that not even an atom\'s weight of good is lost.',
      ],
      [
        'সূরা বাকারা (2:177)-এ ঈমান, দান, নামাজ, ওয়াদা পালন ও ধৈর্যকে প্রকৃত সৎকর্ম হিসেবে বর্ণনা করা হয়েছে।',
        'সূরা নাহল (16:97)-এ ঈমানসহ সৎকর্মশীল নারী ও পুরুষ উভয়ের জন্য উত্তম জীবন ও পুরস্কারের কথা বলা হয়েছে।',
        'সূরা যিলযাল (99:7) ও সূরা কাহফ (18:30)-এ বলা হয়েছে, অণু পরিমাণ ভালো কাজও নষ্ট হয় না।',
      ],
      [
        'تجمع البقرة (2:177) أصول البر في الإيمان والإنفاق والصلاة والوفاء والصبر.',
        'وتعد سورة النحل (16:97) من عمل صالحًا من ذكر أو أنثى وهو مؤمن بحياة طيبة وأجر كريم.',
        'وتؤكد الزلزلة (99:7) والكهف (18:30) أن مثقال ذرة من خير لا يضيع.',
      ],
    ),
  ),

  'character and good manners (akhlaq)': g(
    t(
      'The Quran emphasizes noble character, humility, gentle speech, and mutual respect while forbidding mockery and arrogance.',
      'কুরআনে উত্তম চরিত্র (আখলাক), বিনয়, ভদ্র আচরণ ও পারস্পরিক সম্মানের গুরুত্ব তুলে ধরা হয়েছে এবং উপহাস ও অহংকার নিষেধ করা হয়েছে।',
      'يؤكد القرآن على مكارم الأخلاق والتواضع ولين القول واحترام الناس، وينهى عن السخرية والكبر.',
    ),
    pt(
      [
        'Surah Al-Qalam (68:4) praises the great moral character of the Prophet.',
        'Surah Al-Hujuraat (49:11, 49:13) forbids mocking others and affirms honor lies in God-consciousness (taqwa).',
        'Surah Luqman (31:18) and Surah Al-Furqaan (25:63) encourage walking humbly and responding gently.',
      ],
      [
        'সূরা কলম (68:4)-এ মহান চরিত্রের প্রশংসা করা হয়েছে।',
        'সূরা হুজুরাত (49:11, 49:13)-এ অন্যকে উপহাস করতে নিষেধ করা হয়েছে এবং তাকওয়াকে মর্যাদার মাপকাঠি বলা হয়েছে।',
        'সূরা লুকমান (31:18) ও সূরা ফুরকান (25:63)-এ বিনয়ের সাথে চলা ও নম্র আচরণের উপদেশ আছে।',
      ],
      [
        'تثني سورة القلم (68:4) على الخلق العظيم.',
        'وتنهى سورة الحجرات (49:11، 49:13) عن السخرية وتجعل التقوى ميزان الكرامة.',
        'وتدعو سورة لقمان (31:18) والفرقان (25:63) إلى التواضع والسكينة في التعامل.',
      ],
    ),
  ),

  'kindness and mercy to others': g(
    t(
      'The Quran calls believers to good conduct, compassion, fairness, and doing good to others across family and society.',
      'কুরআনে পরিবার ও সমাজের সবার প্রতি সদাচরণ, দয়া, ন্যায় ও কল্যাণকর কাজের নির্দেশ দেওয়া হয়েছে।',
      'يدعو القرآن إلى الإحسان والرحمة والعدل وفعل الخير للناس كافة.',
    ),
    pt(
      [
        'Surah An-Nahl (16:90) commands justice, good conduct (ihsan), and helping relatives.',
        'Surah Al-Balad (90:17) highlights advising one another to patience and compassion.',
        'Surah Al-Qasas (28:77) says: "Do good as Allah has done good to you."',
      ],
      [
        'সূরা নাহল (16:90)-এ ন্যায়, সদাচরণ ও আত্মীয়দের সহায়তার আদেশ দেওয়া হয়েছে।',
        'সূরা বালাদ (90:17)-এ পরস্পরকে ধৈর্য ও দয়ার উপদেশ দেওয়ার প্রশংসা আছে।',
        'সূরা কাসাস (28:77)-এ বলা হয়েছে: "আল্লাহ যেমন তোমার প্রতি অনুগ্রহ করেছেন, তুমিও তেমনি অনুগ্রহ করো।"',
      ],
      [
        'تأمر النحل (16:90) بالعدل والإحسان وإيتاء ذي القربى.',
        'وتذكر البلد (90:17) التواصي بالصبر والمرحمة.',
        'وتقول القصص (28:77): «وأحسن كما أحسن الله إليك».',
      ],
    ),
  ),

  'family and kinship': g(
    t(
      'The Quran emphasizes upholding ties of kinship, giving relatives their due kindness, and warns against severing family bonds.',
      'কুরআনে আত্মীয়তার সম্পর্ক অটুট রাখা ও আত্মীয়দের প্রাপ্য অধিকার আদায়ের নির্দেশ দেওয়া হয়েছে এবং সম্পর্ক ছিন্ন করার বিষয়ে সতর্ক করা হয়েছে।',
      'يأمر القرآن بصلة الأرحام وإيتاء ذي القربى حقه، ويحذّر من قطع الأرحام.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:1) reminds people to be mindful of Allah and the wombs (ties of kinship).',
        'Surah Al-Israa (17:26) commands giving relatives, the needy, and travelers their due without wastefulness.',
        'Surah Muhammad (47:22) and Surah Ar-Ra\'d (13:21) warn against severing kinship and praise those who maintain what Allah ordered joined.',
      ],
      [
        'সূরা নিসা (4:1)-এ আল্লাহকে ভয় করা এবং আত্মীয়তার সম্পর্ক রক্ষার বিষয়ে সচেতন থাকার নির্দেশ আছে।',
        'সূরা ইসরা (17:26)-এ আত্মীয়, অভাবী ও মুসাফিরকে তাদের প্রাপ্য দেওয়ার কথা বলা হয়েছে।',
        'সূরা মুহাম্মদ (47:22) ও সূরা রা\'দ (13:21)-এ আত্মীয়তার সম্পর্ক ছিন্ন করার সতর্কতা ও তা বজায় রাখার প্রশংসা এসেছে।',
      ],
      [
        'تذكّر النساء (4:1) بتقوى الله ومراعاة الأرحام.',
        'وتأمر الإسراء (17:26) بإيتاء ذي القربى والمسكين وابن السبيل حقهم.',
        'وتحذّر سورة محمد (47:22) من تقطيع الأرحام، وتمدح الرعد (13:21) الواصلين لما أمر الله به أن يوصل.',
      ],
    ),
  ),

  'supplications (dua)': g(
    t(
      'The Quran contains many supplications (duas) spoken by prophets and believers—asking for goodness in this world and the Hereafter, forgiveness, guidance, and relief.',
      'কুরআনে নবী-রাসূল ও মুমিনদের অনেক দোয়া রয়েছে—যেগুলোতে দুনিয়া ও আখিরাতের কল্যাণ, ক্ষমা, হেদায়াত ও বিপদ থেকে মুক্তি প্রার্থনা করা হয়েছে।',
      'يضم القرآن أدعية كثيرة على لسان الأنبياء والمؤمنين لطلب خير الدنيا والآخرة والمغفرة والهداية والفرج.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:201) asks for good in this world, good in the Hereafter, and protection from the Fire.',
        'Surah Al-Baqara (2:286) and Surah Aal-i-Imraan (3:8) ask for forgiveness, ease, and steadfastness of heart.',
        'Surah Al-A\'raaf (7:23) and Surah Al-Anbiyaa (21:87) record the repentant supplications of Adam and Yunus.',
      ],
      [
        'সূরা বাকারা (2:201)-এ দুনিয়া ও আখিরাতের কল্যাণ এবং জাহান্নাম থেকে মুক্তির দোয়া রয়েছে।',
        'সূরা বাকারা (2:286) ও সূরা আলে ইমরান (3:8)-এ ক্ষমা, সহজতা ও অন্তরের অবিচলতার দোয়া আছে।',
        'সূরা আরাফ (7:23) ও সূরা আম্বিয়া (21:87)-এ আদম (আ.) ও ইউনুস (আ.)-এর তওবার দোয়া বর্ণিত হয়েছে।',
      ],
      [
        'تجمع البقرة (2:201) الدعاء بخير الدنيا والآخرة والوقاية من النار.',
        'وتذكر البقرة (2:286) وآل عمران (3:8) الدعاء بالمغفرة وثبات القلب.',
        'وتنقل الأعراف (7:23) والأنبياء (21:87) دعاء آدم ويونس عليهما السلام.',
      ],
    ),
  ),

  'usury (interest)': g(
    t(
      'The Quran distinguishes lawful trade from usury (riba), prohibiting interest and urging charity and relief for borrowers in difficulty.',
      'কুরআনে বৈধ ব্যবসা ও সুদ (রিবা)-এর মধ্যে স্পষ্ট পার্থক্য করা হয়েছে, সুদ নিষিদ্ধ ঘোষণা করা হয়েছে এবং ঋণগ্রস্তের প্রতি সদয় হওয়ার নির্দেশ দেওয়া হয়েছে।',
      'يفرّق القرآن بوضوح بين البيع والربا، ويحرّم الربا ويدعو إلى التيسير على المعسر.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:275–276) states that Allah has permitted trade and forbidden interest (riba), while blessing charity.',
        'Surah Al-Baqara (2:278–279) instructs believers to give up remaining interest and take only principal without wronging others.',
        'For modern financial or banking rulings, please consult a qualified scholar.',
      ],
      [
        'সূরা বাকারা (2:275–276)-এ বলা হয়েছে, আল্লাহ ব্যবসাকে হালাল ও সুদকে হারাম করেছেন এবং দান-সদকায় বরকত দেন।',
        'সূরা বাকারা (2:278–279)-এ বকেয়া সুদ ছেড়ে দেওয়ার ও কেবল মূলধন গ্রহণের নির্দেশ রয়েছে।',
        'আধুনিক ব্যাংকিং বা আর্থিক লেনদেনের বিস্তারিত বিধানের জন্য একজন যোগ্য আলেমের পরামর্শ নিন।',
      ],
      [
        'تبيّن البقرة (2:275–276) أن الله أحلّ البيع وحرّم الربا ويمحق الربا ويربي الصدقات.',
        'وتأمر البقرة (2:278–279) بترك ما بقي من الربا وأخذ رؤوس الأموال دون ظلم.',
        'للمسائل المالية والمصرفية المعاصرة يُرجى سؤال أهل العلم.',
      ],
    ),
  ),

  'death and the hereafter': g(
    t(
      'The Quran reminds humanity that every soul will taste death and return to Allah for accountability in the Hereafter.',
      'কুরআনে স্মরণ করিয়ে দেওয়া হয়েছে যে প্রতিটি প্রাণকেই মৃত্যুর স্বাদ গ্রহণ করতে হবে এবং আখিরাতে হিসাবের জন্য আল্লাহর কাছে ফিরে যেতে হবে।',
      'يذكّر القرآن بأن كل نفس ذائقة الموت وأن المرجع إلى الله للحساب في الآخرة.',
    ),
    pt(
      [
        'Surah Aal-i-Imraan (3:185) and Surah Al-Ankaboot (29:57) state that every soul will taste death and return to Allah.',
        'Surah Al-Jumu\'a (62:8) emphasizes that death will inevitably meet every person before returning to the Knower of the unseen and witnessed.',
      ],
      [
        'সূরা আলে ইমরান (3:185) ও সূরা আনকাবুত (29:57)-এ বলা হয়েছে, প্রতিটি প্রাণ মৃত্যুর স্বাদ আস্বাদন করবে এবং আল্লাহর কাছেই ফিরে যাবে।',
        'সূরা জুমুআ (62:8)-এ স্মরণ করানো হয়েছে যে মৃত্যু থেকে পালানো সম্ভব নয়।',
      ],
      [
        'تذكر آل عمران (3:185) والعنكبوت (29:57) أن كل نفس ذائقة الموت ثم إلى الله تُرجع.',
        'وتؤكد سورة الجمعة (62:8) حتمية الموت والرجوع إلى عالم الغيب والشهادة.',
      ],
    ),
  ),

  'hijab and modesty': g(
    t(
      'The Quran instructs both believing men and believing women to lower their gaze, guard their modesty, and dress modestly.',
      'কুরআনে মুমিন নারী ও পুরুষ উভয়কে দৃষ্টি সংযত রাখা, লজ্জাস্থান হেফাজত করা এবং শালীন পোশাক পরিধানের নির্দেশ দেওয়া হয়েছে।',
      'يأمر القرآن المؤمنين والمؤمنات بغض البصر وحفظ الفروج والستر والعفة.',
    ),
    pt(
      [
        'Surah An-Noor (24:30–31) addresses believing men first and then believing women regarding lowering the gaze and guarding modesty.',
        'Surah Al-Ahzaab (33:59) mentions drawing outer garments over oneself for modesty and recognition.',
        'For specific fiqh rulings on dress codes, please consult a qualified scholar.',
      ],
      [
        'সূরা নূর (24:30–31)-এ প্রথমে মুমিন পুরুষ ও পরে মুমিন নারীদের দৃষ্টি সংযত রাখা ও পর্দা-শালীনতার নির্দেশ দেওয়া হয়েছে।',
        'সূরা আহযাব (33:59)-এ শালীন আবরণ ও পরিচয়ের কথা উল্লেখ আছে।',
        'পর্দা ও পোশাকের বিস্তারিত শরয়ী বিধানের জন্য একজন যোগ্য আলেমের পরামর্শ নিন।',
      ],
      [
        'تخاطب سورة النور (24:30–31) المؤمنين ثم المؤمنات بغض البصر وحفظ الفروج والستر.',
        'وتشير سورة الأحزاب (33:59) إلى إدناء الجلابيب.',
        'للأحكام الفقهية التفصيلية في الحجاب يُرجى سؤال أهل العلم.',
      ],
    ),
  ),

  'provision (rizq)': g(
    t(
      'The Quran reassures believers that provision (rizq) is in Allah\'s hands—granted to every living creature—and encourages reliance on Him alongside lawful effort.',
      'কুরআনে আশ্বস্ত করা হয়েছে যে রিযিক একমাত্র আল্লাহর হাতে—তিনি প্রতিটি প্রাণীর জীবিকার ব্যবস্থা করেন—এবং বৈধ চেষ্টার পাশাপাশি তাঁর ওপর ভরসার নির্দেশ দেওয়া হয়েছে।',
      'يطمئن القرآن بأن الرزق بيد الله تعالى الذي تكفّل بأرزاق الخلق، مع السعي الحلال والتوكل عليه.',
    ),
    pt(
      [
        'Surah At-Talaaq (65:3) mentions that Allah provides for the God-conscious from where they do not expect.',
        'Surah Hud (11:6) and Surah Al-Ankaboot (29:60) state that there is no creature on earth except that its provision is upon Allah.',
        'Surah Adh-Dhaariyat (51:58) names Allah as the Provider (Ar-Razzaaq), Possessor of Firm Strength.',
      ],
      [
        'সূরা তালাক (65:3)-এ বলা হয়েছে, আল্লাহ মুত্তাকীদের এমন উৎস থেকে রিযিক দেন যা তারা কল্পনাও করে না।',
        'সূরা হূদ (11:6) ও সূরা আনকাবুত (29:60)-এ উল্লেখ আছে, পৃথিবীর প্রতিটি প্রাণীর রিযিকের দায়িত্ব আল্লাহর।',
        'সূরা যারিয়াত (51:58)-এ আল্লাহকে মহান রিযিকদাতা (আর-রায্যাক) হিসেবে উল্লেখ করা হয়েছে।',
      ],
      [
        'تذكر الطلاق (65:3) أن الله يرزق المتقين من حيث لا يحتسبون.',
        'وتؤكد هود (11:6) والعنكبوت (29:60) تكفّل الله برزق كل دابة في الأرض.',
        'وتسمي الذاريات (51:58) الله بالرزاق ذي القوة المتين.',
      ],
    ),
  ),

  'tawhid (the oneness of Allah)': g(
    t(
      'The Quran centers its entire message on Tawhid—the absolute Oneness and uniqueness of Allah, with no partner or equal.',
      'কুরআনের মূল বার্তা হলো তাওহীদ—আল্লাহর একত্ববাদ, যাঁর কোনো শরীক বা সমকক্ষ নেই।',
      'يدور القرآن كله حول التوحيد: إفراد الله تعالى بالوحدانية المطلقة بلا شريك ولا مثيل.',
    ),
    pt(
      [
        'Surah Al-Ikhlaas (112:1–2) declares Allah is One, the Eternal Refuge (As-Samad).',
        'Ayat al-Kursi (2:255) and Surah Al-Hashr (59:22) proclaim there is no deity except Him, the Ever-Living Sustainer.',
        'Surah Aal-i-Imraan (3:18) records the testimony to Allah\'s Oneness and justice.',
      ],
      [
        'সূরা ইখলাস (112:1–2)-এ ঘোষণা করা হয়েছে, আল্লাহ এক ও অমুখাপেক্ষী (আস-সামাদ)।',
        'আয়াতুল কুরসি (2:255) ও সূরা হাশর (59:22)-এ চিরঞ্জীব ও সর্বসত্তার ধারক এক আল্লাহর পরিচয় দেওয়া হয়েছে।',
        'সূরা আলে ইমরান (3:18)-এ আল্লাহর একত্ববাদের সাক্ষ্য বর্ণিত হয়েছে।',
      ],
      [
        'تعلن سورة الإخلاص (112:1–2) أن الله أحد صمد.',
        'وتبيّن آية الكرسي (2:255) والحشر (59:22) أنه لا إله إلا هو الحي القيوم.',
        'وتذكر آل عمران (3:18) شهادة الله وملائكته وأولي العلم بالتوحيد.',
      ],
    ),
  ),

  'who Allah is': g(
    t(
      'The Quran introduces Allah as One, Eternal, All-Knowing, and Merciful—nothing is comparable to Him.',
      'কুরআনে আল্লাহকে এক ও অদ্বিতীয়, চিরঞ্জীব, সর্বজ্ঞ ও পরম দয়ালু স্রষ্টা হিসেবে পরিচয় করিয়ে দেওয়া হয়েছে—তাঁর সমকক্ষ কেউ নেই।',
      'يعرّف القرآن بالله تعالى أنه الواحد الأحد الحي القيوم العالم بكل شيء، وليس كمثله شيء.',
    ),
    pt(
      [
        'Surah Al-Ikhlaas (112:1–2) describes Allah as One and As-Samad (Eternal Refuge).',
        'Surah Al-Baqara (2:255) — Ayat al-Kursi — describes His life, sovereignty, and knowledge encompassing the heavens and earth.',
        'Surah Al-Hashr (59:22) and Surah Taa-Haa (20:14) declare His oneness, mercy, and sole right to worship.',
      ],
      [
        'সূরা ইখলাস (112:1–2)-এ আল্লাহকে এক ও অমুখাপেক্ষী হিসেবে বর্ণনা করা হয়েছে।',
        'আয়াতুল কুরসি (2:255)-এ তাঁর চিরন্তন জীবন, সার্বভৌমত্ব ও অসীম জ্ঞানের বর্ণনা রয়েছে।',
        'সূরা হাশর (59:22) ও সূরা ত্ব-হা (20:14)-এ তাঁর একত্ববাদ, দয়া ও একক ইবাদতের কথা এসেছে।',
      ],
      [
        'تصف الإخلاص (112:1–2) الله بالأحد الصمد.',
        'وتبيّن آية الكرسي (2:255) حياته وقيوميته وملكه وعلمه.',
        'وتذكر الحشر (59:22) وطه (20:14) وحدانيته ورحمته واستحقاقه للعبادة.',
      ],
    ),
  ),

  'gossip': g(
    t(
      'The Quran forbids backbiting, spying, suspicion, and mocking others, comparing backbiting to eating the flesh of one\'s dead brother.',
      'কুরআনে গীবত (পরনিন্দা), গোয়েন্দাগিরি, কুধারণা ও উপহাস নিষিদ্ধ করা হয়েছে এবং গীবতকে মৃত ভাইয়ের গোশত খাওয়ার সাথে তুলনা করা হয়েছে।',
      'ينهى القرآن عن الغيبة والتجسس وسوء الظن والسخرية، ويشبّه الغيبة بأكل لحم الأخ ميتًا.',
    ),
    pt(
      [
        'Surah Al-Hujuraat (49:12) prohibits much suspicion, spying, and backbiting one another.',
        'Surah Al-Hujuraat (49:11) forbids ridicule, defamation, and calling others by offensive nicknames.',
      ],
      [
        'সূরা হুজুরাত (49:12)-এ অতিরিক্ত অনুমান, দোষ খোঁজা ও একে অপরের গীবত করতে নিষেধ করা হয়েছে।',
        'সূরা হুজুরাত (49:11)-এ উপহাস, কটূক্তি ও মন্দ নামে ডাকা থেকে বিরত থাকার নির্দেশ আছে।',
      ],
      [
        'تنهى سورة الحجرات (49:12) عن كثير من الظن والتجسس والغيبة.',
        'وتنهى الحجرات (49:11) عن السخرية واللمز والتنابز بالألقاب.',
      ],
    ),
  ),

  'humility': g(
    t(
      'The Quran urges humility in conduct and speech, warning against arrogance and boasting.',
      'কুরআনে চলাফেরা ও আচরণে বিনয় অবলম্বনের উপদেশ দেওয়া হয়েছে এবং অহংকার ও দম্ভ থেকে সতর্ক করা হয়েছে।',
      'يدعو القرآن إلى التواضع في المشي والتعامل، ويحذّر من الكبر والاختيال.',
    ),
    pt(
      [
        'Surah Luqman (31:18) advises not to turn one\'s cheek in contempt or walk arrogantly on the earth.',
        'Surah Al-Furqaan (25:63) describes the servants of the Most Merciful as those who walk humbly and respond with words of peace.',
      ],
      [
        'সূরা লুকমান (31:18)-এ অহংকারভরে মুখ ফিরিয়ে না নেওয়া ও দম্ভভরে না চলার উপদেশ দেওয়া হয়েছে।',
        'সূরা ফুরকান (25:63)-এ রহমানের বান্দাদের বৈশিষ্ট্য হিসেবে বিনয়ের সাথে চলা ও শান্তিপূর্ণ জবাব দেওয়ার কথা বলা হয়েছে।',
      ],
      [
        'توصي سورة لقمان (31:18) بعدم تصعير الخد والمشي مرحًا.',
        'وتصف سورة الفرقان (25:63) عباد الرحمن بالمشي هونًا والقول بالسلام.',
      ],
    ),
  ),

  'business and trade': g(
    t(
      'The Quran permits honest trade by mutual consent, commands writing down financial agreements fairly, and forbids devouring wealth unjustly.',
      'কুরআনে পারস্পরিক সম্মতিতে সৎ ব্যবসার অনুমতি দেওয়া হয়েছে, আর্থিক লেনদেন লিখে রাখার নির্দেশ আছে এবং অন্যায়ভাবে সম্পদ ভক্ষণ নিষিদ্ধ করা হয়েছে।',
      'يبيح القرآن التجارة عن تراضٍ، ويأمر بتوثيق العقود بالعدل، وينهى عن أكل الأموال بالباطل.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:29) forbids consuming one another\'s wealth unjustly and permits trade by mutual consent.',
        'Surah Al-Baqara (2:275, 2:282) distinguishes lawful trade from usury and instructs documenting debts fairly.',
        'Surah Al-Jumu\'a (62:10) encourages seeking Allah\'s bounty lawfully after completing prayer.',
      ],
      [
        'সূরা নিসা (4:29)-এ অন্যায়ভাবে সম্পদ ভক্ষণ নিষেধ এবং পারস্পরিক সম্মতিতে ব্যবসার অনুমতি দেওয়া হয়েছে।',
        'সূরা বাকারা (2:275, 2:282)-এ সুদ ও ব্যবসার পার্থক্য এবং ঋণ লিখে রাখার নির্দেশ এসেছে।',
        'সূরা জুমুআ (62:10)-এ নামাজের পর হালাল উপার্জনে ছড়িয়ে পড়ার কথা বলা হয়েছে।',
      ],
      [
        'تنهى النساء (4:29) عن أكل المال بالباطل وتبيح التجارة عن تراضٍ.',
        'وتفرّق البقرة (2:275) بين البيع والربا، وتأمر البقرة (2:282) بكتابة الدَّين بالعدل.',
        'وتدعو الجمعة (62:10) إلى الابتغاء من فضل الله بعد الصلاة.',
      ],
    ),
  ),

  'inheritance': g(
    t(
      'The Quran sets out clear principles and designated shares for inheritance for both men and women after debts and bequests are settled.',
      'কুরআনে ঋণ ও অসিয়ত আদায়ের পর নারী ও পুরুষ উভয়ের জন্য উত্তরাধিকার বণ্টনের স্পষ্ট নীতি ও অংশ নির্ধারণ করা হয়েছে।',
      'يحدد القرآن أصول الميراث وأنصبة الورثة من الرجال والنساء بعد قضاء الدَّين والوصية.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:7) establishes that both men and women have a rightful share in what parents and relatives leave.',
        'Surah An-Nisaa (4:11–12, 4:176) detail shares for children, parents, spouses, and siblings.',
        'Calculating exact shares for a specific estate requires a qualified scholar or Islamic inheritance specialist.',
      ],
      [
        'সূরা নিসা (4:7)-এ পিতা-মাতা ও আত্মীয়দের রেখে যাওয়া সম্পদে পুরুষ ও নারী উভয়ের অধিকার প্রতিষ্ঠা করা হয়েছে।',
        'সূরা নিসা (4:11–12, 4:176)-এ সন্তান, পিতা-মাতা, স্বামী-স্ত্রী ও ভাই-বোনের অংশের বিবরণ রয়েছে।',
        'নির্দিষ্ট কোনো পরিবারের উত্তরাধিকার হিসাবের জন্য একজন যোগ্য আলেম বা ফারায়েয বিশেষজ্ঞের সাহায্য নিন।',
      ],
      [
        'تقرر النساء (4:7) نصيبًا للرجال ونصيبًا للنساء مما ترك الوالدان والأقربون.',
        'وتفصّل النساء (4:11–12، 4:176) أنصبة الأولاد والوالدين والزوجين والإخوة.',
        'لحساب تركة محددة يُرجى الرجوع إلى عالم مؤهل في الفرائض.',
      ],
    ),
  ),

  'divorce': g(
    t(
      'The Quran instructs that marital separation, if unavoidable, must be handled with fairness, waiting periods, and kindness—without harming one another.',
      'কুরআনে নির্দেশ দেওয়া হয়েছে যে বিচ্ছেদ অনিবার্য হলে তা যেন ন্যায়সঙ্গতভাবে, ইদ্দত মেনে ও সদাচরণের সাথে হয় এবং কোনো ক্ষতি না করা হয়।',
      'يأمر القرآن عند وقوع الطلاق بالعدل ومراعاة العدة والإمساك بمعروف أو التسريح بإحسان دون إضرار.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:229, 2:231) instructs either retaining in honor or parting in kindness, without causing harm.',
        'Surah At-Talaaq (65:1) outlines observing the waiting period (iddah) and being mindful of Allah.',
        'For any personal divorce ruling or legal procedure, please consult a qualified scholar.',
      ],
      [
        'সূরা বাকারা (2:229, 2:231)-এ উত্তমভাবে একসাথে থাকা অথবা সদয়ভাবে বিচ্ছেদ করার এবং ক্ষতি না করার নির্দেশ আছে।',
        'সূরা তালাক (65:1)-এ ইদ্দত গণনা ও তাকওয়া অবলম্বনের কথা বলা হয়েছে।',
        'ব্যক্তিগত তালাক বা পারিবারিক বিধানের জন্য অবশ্যই একজন যোগ্য আলেমের পরামর্শ নিন।',
      ],
      [
        'تأمر البقرة (2:229، 2:231) بالإمساك بمعروف أو التسريح بإحسان دون إضرار.',
        'وتبيّن سورة الطلاق (65:1) إحصاء العدة وتقوى الله.',
        'في مسائل الطلاق الشخصية يُرجى الرجوع إلى عالم مؤهل.',
      ],
    ),
  ),

  'Hajj and Umrah': g(
    t(
      'The Quran instructs completing Hajj and Umrah for Allah, maintaining peace and good conduct during the pilgrimage, and making provisions of taqwa.',
      'কুরআনে আল্লাহর উদ্দেশ্যে হজ্জ ও উমরাহ পূর্ণ করা, এ সময় সংযম ও শালীন আচরণ বজায় রাখা এবং তাকওয়ার পাথেয় সংগ্রহের নির্দেশ দেওয়া হয়েছে।',
      'يأمر القرآن بإتمام الحج والعمرة لله، وترك الرفث والفسوق والجدال، والتزوّد بالتقوى.',
    ),
    pt(
      [
        'Surah Aal-i-Imraan (3:97) mentions pilgrimage to the Sacred House for whoever is able to find a way.',
        'Surah Al-Baqara (2:196–197) instructs completing Hajj and Umrah for Allah and avoiding wrongdoing and arguing during Hajj.',
        'Surah Al-Hajj (22:27) records the proclamation to mankind for pilgrimage.',
      ],
      [
        'সূরা আলে ইমরান (3:97)-এ সামর্থ্যবানদের ওপর আল্লাহর ঘরের হজ্জ পালনের কথা বলা হয়েছে।',
        'সূরা বাকারা (2:196–197)-এ আল্লাহর জন্য হজ্জ ও উমরাহ পূর্ণ করা এবং অশালীনতা ও ঝগড়া থেকে বিরত থাকার নির্দেশ আছে।',
        'সূরা হজ্জ (22:27)-এ মানুষের মাঝে হজ্জের ঘোষণার বর্ণনা রয়েছে।',
      ],
      [
        'تذكر آل عمران (3:97) وجوب الحج لمن استطاع إليه سبيلًا.',
        'وتأمر البقرة (2:196–197) بإتمام الحج والعمرة واجتناب الرفث والفسوق والجدال.',
        'وتذكر سورة الحج (22:27) الأذان في الناس بالحج.',
      ],
    ),
  ),

  'taqwa (being mindful of Allah)': g(
    t(
      'The Quran describes taqwa (God-consciousness and mindfulness of Allah) as the true measure of honor and the best provision for life.',
      'কুরআনে তাকওয়া (আল্লাহভীতি ও সচেতনতা)-কে মানুষের প্রকৃত মর্যাদার মাপকাঠি এবং জীবনের শ্রেষ্ঠ পাথেয় হিসেবে বর্ণনা করা হয়েছে।',
      'يجعل القرآن التقوى ميزان الكرامة عند الله وخير الزاد للإنسان.',
    ),
    pt(
      [
        'Surah Al-Hujuraat (49:13) states that the most noble in the sight of Allah is the most righteous (atqakum).',
        'Surah Al-Baqara (2:2, 2:197) describes the Quran as guidance for the God-conscious and calls taqwa the best provision.',
        'Surah Aal-i-Imraan (3:102) urges believers to be mindful of Allah as He should be revered.',
      ],
      [
        'সূরা হুজুরাত (49:13)-এ বলা হয়েছে, আল্লাহর কাছে সর্বাধিক সম্মানিত সেই ব্যক্তি যে সর্বাধিক মুত্তাকী।',
        'সূরা বাকারা (2:2, 2:197)-এ কুরআনকে মুত্তাকীদের জন্য হেদায়াত এবং তাকওয়াকে শ্রেষ্ঠ পাথেয় বলা হয়েছে।',
        'সূরা আলে ইমরান (3:102)-এ যথাযথভাবে আল্লাহকে ভয় করার নির্দেশ দেওয়া হয়েছে।',
      ],
      [
        'تقرر الحجرات (49:13) أن أكرم الناس عند الله أتقاهم.',
        'وتصف البقرة (2:2، 2:197) القرآن بأنه هدى للمتقين، وأن خير الزاد التقوى.',
        'وتأمر آل عمران (3:102) بتقوى الله حق تقاته.',
      ],
    ),
  ),

  'faith (iman)': g(
    t(
      'The Quran describes faith (iman) as sincere conviction in Allah, His angels, His books, His messengers, and the Last Day—reflected in humility, trust, and good deeds.',
      'কুরআনে ঈমানকে আল্লাহ, ফেরেশতা, কিতাবসমূহ, রাসূলগণ ও আখিরাতের প্রতি দৃঢ় বিশ্বাস হিসেবে বর্ণনা করা হয়েছে, যা বিনয়, ভরসা ও সৎকর্মের মাধ্যমে প্রকাশ পায়।',
      'يصف القرآن الإيمان بالتصديق الصادق بالله وملائكته وكتبه ورسله واليوم الآخر مع العمل الصالح والخشوع.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:285) summarizes belief in Allah, His angels, His scriptures, and His messengers.',
        'Surah Al-Anfaal (8:2) describes true believers whose hearts feel awe when Allah is mentioned and whose faith increases upon hearing His verses.',
        'Surah Al-Hujuraat (49:14–15) distinguishes outward profession from firm faith in the heart.',
      ],
      [
        'সূরা বাকারা (2:285)-এ আল্লাহ, ফেরেশতা, কিতাব ও রাসূলগণের প্রতি ঈমানের মূল কথা এসেছে।',
        'সূরা আনফাল (8:2)-এ প্রকৃত মুমিনদের বৈশিষ্ট্য হিসেবে আল্লাহর স্মরণে অন্তর কেঁপে ওঠা ও আয়াত শুনে ঈমান বৃদ্ধির কথা বলা হয়েছে।',
        'সূরা হুজুরাত (49:14–15)-এ মৌখিক দাবির চেয়ে অন্তরের দৃঢ় ঈমানের গুরুত্ব তুলে ধরা হয়েছে।',
      ],
      [
        'تجمع البقرة (2:285) أركان الإيمان بالله وملائكته وكتبه ورسله.',
        'وتصف الأنفال (8:2) المؤمنين بوجل القلوب عند ذكر الله وزيادة الإيمان بتلاوة آياته.',
        'وتفرّق الحجرات (49:14–15) بين القول الظاهر والإيمان الراسخ.',
      ],
    ),
  ),

  'wudu and purification': g(
    t(
      'The Quran outlines ritual washing (wudu) before prayer and permits dry ablution (tayammum) with clean earth when water is unavailable or harmful.',
      'কুরআনে নামাজের আগে ওযু করার নিয়ম উল্লেখ আছে এবং পানি না থাকলে বা অসুবিধা হলে পবিত্র মাটি দিয়ে তায়াম্মুম করার সহজীকরণ দেওয়া হয়েছে।',
      'يبيّن القرآن خطوات الوضوء قبل الصلاة، ويرخّص بالتيمم بالصعيد الطيب عند فقد الماء أو المرض.',
    ),
    pt(
      [
        'Surah Al-Maaida (5:6) specifies washing the face and arms to the elbows, wiping the head, and washing the feet to the ankles.',
        'Surah Al-Maaida (5:6) and Surah An-Nisaa (4:43) mention tayammum when ill, traveling, or without water.',
        'For detailed fiqh questions about what breaks wudu or tayammum, please consult a qualified scholar.',
      ],
      [
        'সূরা মায়িদাহ (5:6)-এ মুখমণ্ডল ও কনুই পর্যন্ত হাত ধোয়া, মাথা মাসেহ করা এবং গোড়ালি পর্যন্ত পা ধোয়ার নির্দেশ আছে।',
        'সূরা মায়িদাহ (5:6) ও সূরা নিসা (4:43)-এ অসুস্থতা, সফর বা পানির অভাবে তায়াম্মুমের কথা বলা হয়েছে।',
        'ওযু ভঙ্গের কারণ বা বিস্তারিত ফিকহী মাসআলার জন্য একজন যোগ্য আলেমের পরামর্শ নিন।',
      ],
      [
        'تبيّن المائدة (5:6) غسل الوجه واليدين إلى المرافق ومسح الرأس وغسل الرجلين إلى الكعبين.',
        'وتذكر المائدة (5:6) والنساء (4:43) التيمم عند المرض أو السفر أو عدم وجود الماء.',
        'لتفاصيل نواقض الوضوء وأحكامه الفقهية يُرجى سؤال أهل العلم.',
      ],
    ),
  ),

  'Friday': g(
    t(
      'The Quran commands believers to hasten to the remembrance of Allah when called to the Friday (Jumu\'ah) prayer, pausing trade, and then resuming lawful work afterward.',
      'কুরআনে শুক্রবার জুমুআর নামাজের আহ্বান জানানো হলে বেচাকেনা ছেড়ে আল্লাহর স্মরণে দ্রুত এগিয়ে আসার এবং নামাজের পর জীবিকা অন্বেষণে ফিরে যাওয়ার নির্দেশ দেওয়া হয়েছে।',
      'يأمر القرآن بالسعي إلى ذكر الله وترك البيع عند النداء لصلاة الجمعة، ثم الانتشار في الأرض لابتغاء فضل الله بعدها.',
    ),
    pt(
      [
        'Surah Al-Jumu\'a (62:9) instructs believers to proceed to the remembrance of Allah and leave trade when the call to Friday prayer is made.',
        'Surah Al-Jumu\'a (62:10) encourages dispersing after the prayer to seek Allah\'s bounty while remembering Him much.',
      ],
      [
        'সূরা জুমুআ (62:9)-এ জুমুআর আযান হলে কেনাবেচা ছেড়ে আল্লাহর স্মরণে এগিয়ে আসার নির্দেশ দেওয়া হয়েছে।',
        'সূরা জুমুআ (62:10)-এ নামাজ শেষে হালাল রুজির সন্ধানে বের হওয়া এবং আল্লাহকে বেশি বেশি স্মরণ করার কথা বলা হয়েছে।',
      ],
      [
        'تأمر سورة الجمعة (62:9) بالسعي إلى ذكر الله وترك البيع عند النداء يوم الجمعة.',
        'وتشجع الجمعة (62:10) على الانتشار بعد الصلاة وابتغاء فضل الله وكثرة ذكره.',
      ],
    ),
  ),

  'Laylatul Qadr': g(
    t(
      'The Quran describes Laylatul Qadr (the Night of Decree) as the night the Quran was sent down—better than a thousand months and filled with peace until dawn.',
      'কুরআনে লাইলাতুল কদরকে কুরআন নাযিলের মহিমান্বিত রাত হিসেবে বর্ণনা করা হয়েছে, যা হাজার মাসের চেয়েও উত্তম এবং ফজর পর্যন্ত শান্তিময়।',
      'يصف القرآن ليلة القدر بأنها الليلة التي أُنزل فيها القرآن، وهي خير من ألف شهر وسلام حتى مطلع الفجر.',
    ),
    pt(
      [
        'Surah Al-Qadr (97:1–5) states that the Quran was sent down on Laylatul Qadr, which is better than a thousand months.',
        'The surah mentions the descent of the angels and the Spirit (Jibril) by their Lord\'s permission, with peace until the emergence of dawn.',
      ],
      [
        'সূরা কদর (97:1–5)-এ বলা হয়েছে, এই রাতেই কুরআন নাযিল হয়েছে এবং এটি হাজার মাসের চেয়েও উত্তম।',
        'এতে ফেরেশতাদের ও রূহ (জিবরীল আ.)-এর অবতরণ এবং ফজর উদয় হওয়া পর্যন্ত শান্তির বর্ণনা রয়েছে।',
      ],
      [
        'تذكر سورة القدر (97:1–5) إنزال القرآن فيها وأنها خير من ألف شهر.',
        'وتبيّن تنزّل الملائكة والروح بإذن ربهم وأنها سلام حتى مطلع الفجر.',
      ],
    ),
  ),

  'intoxicants and gambling': g(
    t(
      'The Quran prohibits intoxicants and gambling, stating that their harm far outweighs any benefit and that they breed hostility and turn people away from prayer.',
      'কুরআনে মদ (নেশাদ্রব্য) ও জুয়াকে নিষিদ্ধ করা হয়েছে এবং বলা হয়েছে যে এগুলো শত্রুতা সৃষ্টি করে ও নামাজ ও আল্লাহর স্মরণ থেকে বিরত রাখে।',
      'يحرّم القرآن الخمر والميسر، ويبيّن أن إثمهما أكبر من نفعهما وأنهما يوقعان العداوة ويصدّان عن ذكر الله والصلاة.',
    ),
    pt(
      [
        'Surah Al-Maaida (5:90–91) instructs believers to avoid intoxicants and gambling completely, noting they sow enmity and distract from remembrance of Allah and prayer.',
        'Surah Al-Baqara (2:219) notes that while people may see some worldly benefit in them, their sin is greater than their benefit.',
      ],
      [
        'সূরা মায়িদাহ (5:90–91)-এ মদ ও জুয়া সম্পূর্ণ বর্জনের নির্দেশ দেওয়া হয়েছে এবং বলা হয়েছে এগুলো শত্রুতা সৃষ্টি করে ও নামাজ থেকে গাফেল করে।',
        'সূরা বাকারা (2:219)-এ উল্লেখ আছে যে এগুলোর উপকারের চেয়ে গুনাহ ও ক্ষতি অনেক বেশি।',
      ],
      [
        'تأمر المائدة (5:90–91) باجتناب الخمر والميسر وتبيّن أنهما يوقعان العداوة والبغضاء ويصدّان عن الصلاة.',
        'وتذكر البقرة (2:219) أن إثمهما أكبر من نفعهما.',
      ],
    ),
  ),

  'Paradise': g(
    t(
      'The Quran describes Paradise (Jannah) as the eternal reward of peace, gardens beneath which rivers flow, and Allah\'s pleasure for those who believe and do good.',
      'কুরআনে জান্নাতকে ঈমানদার ও সৎকর্মশীলদের জন্য চিরস্থায়ী শান্তির আবাস, প্রবহমান ঝর্ণাধারা ও আল্লাহর সন্তুষ্টির পুরস্কার হিসেবে বর্ণনা করা হয়েছে।',
      'يصف القرآن الجنة بأنها دار السلام والنعيم المقيم والأنهار الجارية ورضوان الله للمؤمنين الصالحين.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:25) and Surah At-Tawba (9:72) describe gardens beneath which rivers flow, with Allah\'s approval as the greatest blessing.',
        'Surah Aal-i-Imraan (3:133) encourages hastening to forgiveness and a Paradise as wide as the heavens and earth.',
      ],
      [
        'সূরা বাকারা (2:25) ও সূরা তাওবা (9:72)-এ জান্নাতের বাগান ও ঝর্ণাধারার পাশাপাশি আল্লাহর সন্তুষ্টিকে সর্বশ্রেষ্ঠ অর্জন বলা হয়েছে।',
        'সূরা আলে ইমরান (3:133)-এ ক্ষমা ও আসমান-জমিনের সমান প্রশস্ত জান্নাতের দিকে দ্রুত অগ্রসর হওয়ার আহ্বান আছে।',
      ],
      [
        'تصف البقرة (2:25) والتوبة (9:72) جنات تجري من تحتها الأنهار، وتجعل رضوان الله أكبر نعيم.',
        'وتدعو آل عمران (3:133) إلى المسارعة إلى مغفرة وجنة عرضها السماوات والأرض.',
      ],
    ),
  ),

  'the Day of Judgment': g(
    t(
      'The Quran reminds that on the Day of Judgment every person will stand accountable before Allah, and every deed—even an atom\'s weight of good or evil—will be shown.',
      'কুরআনে স্মরণ করিয়ে দেওয়া হয়েছে যে কিয়ামতের দিন প্রত্যেক মানুষকে আল্লাহর সামনে হিসাব দিতে হবে এবং অণু পরিমাণ ভালো বা মন্দ কাজও সামনে উপস্থিত করা হবে।',
      'يذكّر القرآن بأن كل إنسان سيحاسب أمام الله يوم القيامة، وسيُرى مثقال ذرة من خير أو شر.',
    ),
    pt(
      [
        'Surah Az-Zalzala (99:7–8) states that whoever does an atom\'s weight of good or evil will see it.',
        'Surah Al-Infitaar (82:19) affirms that on that Day all command belongs solely to Allah.',
        'Surah Al-Qaari\'a (101:6, 101:8) describes the weighing of deeds on the scales.',
      ],
      [
        'সূরা যিলযাল (99:7–8)-এ বলা হয়েছে, কেউ অণু পরিমাণ ভালো বা মন্দ কাজ করলে তা সেদিন দেখতে পাবে।',
        'সূরা ইনফিতার (82:19)-এ উল্লেখ আছে, সেদিন কর্তৃত্ব থাকবে একমাত্র আল্লাহর হাতে।',
        'সূরা কারিয়াহ (101:6, 101:8)-এ আমলের ওজনের বর্ণনা এসেছে।',
      ],
      [
        'تبيّن الزلزلة (99:7–8) أن كل مثقال ذرة من خير أو شر سيُرى.',
        'وتؤكد الانفطار (82:19) أن الأمر يومئذٍ لله وحده.',
        'وتصف القارعة (101:6، 101:8) موازين الأعمال.',
      ],
    ),
  ),

  'magic and sihr': g(
    t(
      'The Quran condemns magic (sihr), states that magicians do not succeed, clarifies nothing harms anyone except by Allah\'s permission, and teaches seeking refuge in Allah.',
      'কুরআনে জাদু ও সিহরের নিন্দা করা হয়েছে, বলা হয়েছে জাদুকর কখনো সফল হয় না, আল্লাহর অনুমতি ছাড়া কেউ কারো ক্ষতি করতে পারে না এবং আল্লাহর কাছে আশ্রয় চাওয়ার শিক্ষা দেওয়া হয়েছে।',
      'يذمّ القرآن السحر ويؤكد أن الساحر لا يفلح، وأن الضر والنفع بيد الله وحده، ويعلّم الاستعاذة بالله.',
    ),
    pt(
      [
        'Surah Al-Baqara (2:102) affirms that sorcerers cannot harm anyone except by Allah\'s permission.',
        'Surah Yunus (10:81) and Surah Taa-Haa (20:69) state that Allah nullifies magic and the magician will not succeed.',
        'Surah Al-Falaq (113:4) teaches seeking refuge in Allah from the evil of those who practice magic.',
      ],
      [
        'সূরা বাকারা (2:102)-এ বলা হয়েছে, আল্লাহর অনুমতি ছাড়া জাদুকররা কারো কোনো ক্ষতি করতে পারে না।',
        'সূরা ইউনুস (10:81) ও সূরা ত্ব-হা (20:69)-এ বলা হয়েছে, আল্লাহ জাদু ব্যর্থ করে দেবেন এবং জাদুকর কখনো সফল হয় না।',
        'সূরা ফালাক (113:4)-এ জাদুকরদের অনিষ্ট থেকে আল্লাহর কাছে আশ্রয় চাওয়ার দোয়া শেখানো হয়েছে।',
      ],
      [
        'تؤكد البقرة (2:102) أنهم ليسوا بضارّين به من أحد إلا بإذن الله.',
        'وتبيّن يونس (10:81) وطه (20:69) أن الله سيبطل السحر ولا يفلح الساحر.',
        'وتعلّم سورة الفلق (113:4) الاستعاذة بالله من شر النفاثات في العقد.',
      ],
    ),
  ),

  'signs in creation and reflection': g(
    t(
      'The Quran is a book of guidance rather than a science textbook, and frequently invites people to observe the signs in creation, reflect, and seek knowledge.',
      'কুরআন মূলত হেদায়াতের কিতাব, কোনো বিজ্ঞান-পাঠ্যবই নয়; তবে এতে বারবার আকাশ, পৃথিবী ও সৃষ্টির নিদর্শন নিয়ে চিন্তাভাবনা এবং জ্ঞান অন্বেষণের আহ্বান জানানো হয়েছে।',
      'القرآن كتاب هداية لا كتاب علوم تجريبية، وهو يدعو مرارًا إلى التفكر في آيات الخلق وطلب العلم.',
    ),
    pt(
      [
        'Surah Aal-i-Imraan (3:190–191) highlights the alternation of night and day and creation of the heavens and earth as signs for people of understanding.',
        'Surah Al-Anbiyaa (21:30) and Surah Fussilat (41:53) point to Allah\'s signs across the horizons and within ourselves.',
        'Surah Az-Zumar (39:9) emphasizes the value of knowledge and reflection.',
      ],
      [
        'সূরা আলে ইমরান (3:190–191)-এ আকাশ-পৃথিবীর সৃষ্টি ও রাত-দিনের আবর্তনকে জ্ঞানীদের জন্য নিদর্শন বলা হয়েছে।',
        'সূরা আম্বিয়া (21:30) ও সূরা ফুসসিলাত (41:53)-এ দিগন্তে ও মানুষের নিজের মধ্যে আল্লাহর নিদর্শনের কথা এসেছে।',
        'সূরা যুমার (39:9)-এ জ্ঞান ও চিন্তার মর্যাদা তুলে ধরা হয়েছে।',
      ],
      [
        'تذكر آل عمران (3:190–191) خلق السماوات والأرض واختلاف الليل والنهار كآيات لأولي الألباب.',
        'وتشير الأنبياء (21:30) وفصلت (41:53) إلى آيات الله في الآفاق وفي الأنفس.',
        'وتبرز الزمر (39:9) فضل العلم والتفكر.',
      ],
    ),
  ),

  'tahajjud (night prayer)': g(
    t(
      'The Quran praises those who rise in the night for prayer and worship (tahajjud) alongside recitation, supplication, and seeking forgiveness.',
      'কুরআনে রাতের শেষভাগে উঠে নামাজ (তাহাজ্জুদ), তিলাওয়াত, দোয়া ও ক্ষমা প্রার্থনার প্রশংসা করা হয়েছে।',
      'يثني القرآن على القائمين في الليل للصلاة والتهجد وتلاوة القرآن والاستغفار.',
    ),
    pt(
      [
        'Surah Al-Israa (17:79) mentions rising in part of the night for voluntary prayer, hoping to be raised to a praised station.',
        'Surah Al-Muzzammil (73:20) notes reciting what is easy from the Quran during the night while showing Allah\'s mercy for circumstances.',
        'Surah As-Sajda (32:16) and Surah Adh-Dhaariyat (51:17) describe believers whose sides forsake their beds to call on their Lord in hope and fear.',
      ],
      [
        'সূরা ইসরা (17:79)-এ রাতের কিছু অংশে নফল নামাজ (তাহাজ্জুদ) পড়ার এবং প্রশংসিত মাকামে পৌঁছানোর কথা বলা হয়েছে।',
        'সূরা মুযযাম্মিল (73:20)-এ রাতের অংশে যতটুকু সহজ ততটুকু কুরআন পাঠ করার এবং ওজরের ক্ষেত্রে সহজীকরণের উল্লেখ আছে।',
        'সূরা সিজদা (32:16) ও সূরা যারিয়াত (51:17)-এ শয্যা ত্যাগ করে ভয়ে ও আশায় রবকে ডাকার বর্ণনা রয়েছে।',
      ],
      [
        'تذكر الإسراء (17:79) التهجد في الليل نافلةً وعسى أن يبعثك ربك مقامًا محمودًا.',
        'وتبيّن المزمل (73:20) قراءة ما تيسّر من القرآن في قيام الليل.',
        'وتصف السجدة (32:16) والذاريات (51:17) الذين تتجافى جنوبهم عن المضاجع يدعون ربهم خوفًا وطمعًا.',
      ],
    ),
  ),

  'racism and equality': g(
    t(
      'The Quran affirms that all humanity originates from a single soul and single pair, making righteousness and mindfulness of Allah (taqwa) the sole measure of honor.',
      'কুরআনে বলা হয়েছে সব মানুষ একই উৎস থেকে সৃষ্ট, এবং জাতি-গোত্র নয় বরং তাকওয়াই (আল্লাহভীতি) আল্লাহর কাছে সম্মানের একমাত্র মাপকাঠি।',
      'يؤكد القرآن أن البشر جميعًا من أصل واحد، وأن ميزان الكرامة والتفاضل عند الله هو التقوى لا اللون أو النسب.',
    ),
    pt(
      [
        'Surah Al-Hujuraat (49:13) states that humanity was created from a male and a female into nations and tribes to know one another, and the most noble in the sight of Allah is the most righteous.',
        'Surah Ar-Room (30:22) counts the diversity of human languages and colors among Allah\'s signs.',
        'Surah An-Nisaa (4:1) reminds people to be mindful of their Lord who created them all from one soul.',
      ],
      [
        'সূরা হুজুরাত (49:13)-এ বলা হয়েছে, মানুষকে বিভিন্ন জাতি ও গোত্রে ভাগ করা হয়েছে পরিচিতির জন্য, আর আল্লাহর কাছে সবচেয়ে সম্মানিত সে-ই যে সবচেয়ে বেশি মুত্তাকী।',
        'সূরা রূম (30:22)-এ মানুষের ভাষা ও বর্ণের বৈচিত্র্যকে আল্লাহর নিদর্শন বলা হয়েছে।',
        'সূরা নিসা (4:1)-এ স্মরণ করানো হয়েছে যে সব মানুষকে এক প্রাণ থেকেই সৃষ্টি করা হয়েছে।',
      ],
      [
        'تؤكد الحجرات (49:13) أن أكرمكم عند الله أتقاكم وأن اختلاف الشعوب والقبائل للتعارف.',
        'وتعدّ الروم (30:22) اختلاف الألسنة والألوان من آيات الله.',
        'وتذكّر النساء (4:1) بأن الله خلق الناس جميعًا من نفس واحدة.',
      ],
    ),
  ),

  'cheating and fraud': g(
    t(
      'The Quran strongly condemns fraud, cheating in weights and measures, and taking others\' property unjustly.',
      'কুরআনে মাপে বা ওজনে কম দেওয়া, প্রতারণা করা এবং অন্যের সম্পদ অন্যায়ভাবে গ্রাস করার ব্যাপারে কঠোর সতর্কবার্তা দেওয়া হয়েছে।',
      'يحذّر القرآن تحذيرًا شديدًا من الغش والتطفيف في الكيل والميزان وأكل أموال الناس بالباطل.',
    ),
    pt(
      [
        'Surah Al-Mutaffifin (83:1–3) warns those who take full measure from others yet give less when measuring or weighing for them.',
        'Surah Hud (11:85) and Surah Al-Israa (17:35) command giving full measure and weighing with an accurate balance.',
      ],
      [
        'সূরা মুতাফফিফীন (83:1–3)-এ যারা মানুষের কাছ থেকে নেওয়ার সময় পূর্ণ নেয় কিন্তু দেওয়ার সময় কম দেয়, তাদের জন্য ধ্বংসের সতর্কবাণী এসেছে।',
        'সূরা হূদ (11:85) ও সূরা ইসরা (17:35)-এ সঠিক ওজন ও ন্যায়সঙ্গত পরিমাপ বজায় রাখার নির্দেশ দেওয়া হয়েছে।',
      ],
      [
        'تتوعد سورة المطففين (83:1–3) الذين يستوفون على الناس ويخسرونهم إذا كالوا أو وزنوا.',
        'وتأمر سورة هود (11:85) والإسراء (17:35) بإيفاء الكيل والوزن بالقسطاس المستقيم.',
      ],
    ),
  ),

  "Isra and Mi'raj (the Night Journey)": g(
    t(
      'The Quran mentions the Night Journey (al-Isra) from Al-Masjid al-Haram to Al-Masjid al-Aqsa and the Prophet witnessing some of Allah\'s great signs.',
      'কুরআনে মসজিদুল হারাম থেকে মসজিদুল আকসা পর্যন্ত নৈশভ্রমণ (ইসরা) এবং মহান নিদর্শনসমূহ প্রত্যক্ষ করার কথা উল্লেখ করা হয়েছে।',
      'يذكر القرآن رحلة الإسراء من المسجد الحرام إلى المسجد الأقصى ومشاهدة آيات الله الكبرى.',
    ),
    pt(
      [
        'Surah Al-Israa (17:1) describes how Allah took His Servant by night from Al-Masjid al-Haram to Al-Masjid al-Aqsa to show him of His signs.',
        'Surah An-Najm (53:13–14) mentions seeing great signs near Sidrat al-Muntaha (the Lote Tree of the Utmost Boundary).',
        'Detailed narratives of the Ascension (Mi\'raj) come from Hadith and Seerah collections; ask a qualified scholar for further study.',
      ],
      [
        'সূরা ইসরা (17:1)-এ মসজিদুল হারাম থেকে মসজিদুল আকসা পর্যন্ত রাতের ভ্রমণ ও নিদর্শন দেখানোর কথা এসেছে।',
        'সূরা নাজম (53:13–14)-এ সিদরাতুল মুনতাহার নিকটে মহান নিদর্শন দেখার উল্লেখ রয়েছে।',
        'মিরাজের বিস্তারিত ঘটনা হাদীস ও সীরাত গ্রন্থ থেকে জানা যায়; বিস্তারিত জানতে একজন যোগ্য আলেমের পরামর্শ নিন।',
      ],
      [
        'تذكر الإسراء (17:1) إسرَاءَ الله بعبده ليلاً من المسجد الحرام إلى المسجد الأقصى ليريه من آياته.',
        'وتشير النجم (53:13–14) إلى الرؤية عند سدرة المنتهى.',
        'وترد تفاصيل المعراج في كتب الحديث والسيرة؛ يُرجى سؤال عالم مؤهل.',
      ],
    ),
  ),

  'Trinity and oneness of Allah': g(
    t(
      'The Quran affirms strict monotheism (Tawhid), stating that Allah is One and explicitly rejecting the claim that Allah is three.',
      'কুরআনে আল্লাহর একত্ববাদ (তাওহীদ) স্পষ্টভাবে ঘোষণা করা হয়েছে এবং "তিন" বা ত্রিত্ববাদের ধারণাকে পরিষ্কারভাবে প্রত্যাখ্যান করা হয়েছে।',
      'يؤكد القرآن التوحيد الخالص بأن الله واحد أحد، ويرفض القول بالتثليث.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:171) calls upon the People of the Scripture not to say "Three" and affirms that Allah is only one God.',
        'Surah Al-Maaida (5:73, 5:116) states there is no deity except one God and recounts Isa (Jesus) affirming he only called people to worship Allah.',
        'Surah Al-Ikhlaas (112:1) declares succinctly: "Say, He is Allah, [who is] One."',
      ],
      [
        'সূরা নিসা (4:171)-এ আহলে কিতাবকে "তিন" না বলার আহ্বান জানিয়ে বলা হয়েছে যে আল্লাহ একমাত্র ইলাহ।',
        'সূরা মায়িদাহ (5:73, 5:116)-এ এক ইলাহ ছাড়া কোনো মাবুদ নেই বলে উল্লেখ এবং ঈসা (আ.)-এর শুধু আল্লাহর ইবাদতের আহ্বানের কথা এসেছে।',
        'সূরা ইখলাস (112:1)-এ ঘোষণা করা হয়েছে: "বলুন, তিনি আল্লাহ, একক।"',
      ],
      [
        'تنهى النساء (4:171) عن القول «ثلاثة» وتؤكد أن الله إله واحد.',
        'وتؤكد المائدة (5:73، 5:116) الوحدانية ونفي الشريك، وقول عيسى عليه السلام بعبادة الله وحده.',
        'وتقرر سورة الإخلاص (112:1): ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾.',
      ],
    ),
  ),

  'crucifixion of Isa (Jesus)': g(
    t(
      'Regarding the crucifixion of Prophet Isa (Jesus), the Quran states that he was neither killed nor crucified, but rather it appeared so to people, and Allah raised him up to Himself.',
      'নবী ঈসা (আ.)-কে ক্রুশবিদ্ধ করার বিষয়ে কুরআনে স্পষ্ট বলা হয়েছে যে তাঁকে হত্যা করা হয়নি এবং ক্রুশবিদ্ধও করা হয়নি, বরং তাঁদের কাছে সেরূপ মনে হয়েছিল এবং আল্লাহ তাঁকে নিজের কাছে তুলে নিয়েছেন।',
      'يبيّن القرآن بشأن صلب عيسى عليه السلام أنه لم يُقتل ولم يُصلب، ولكن شُبّه لهم، ورفعه الله إليه.',
    ),
    pt(
      [
        'Surah An-Nisaa (4:157) states they did not kill him nor crucify him, but it was made to appear so to them.',
        'Surah An-Nisaa (4:158) states that Allah raised him up to Himself, and Allah is Exalted in Might and Wise.',
      ],
      [
        'সূরা নিসা (4:157)-এ বলা হয়েছে, তারা তাঁকে হত্যা করেনি এবং শূলেও চড়ায়নি, বরং তাদের কাছে সাদৃশ্য তৈরি হয়েছিল।',
        'সূরা নিসা (4:158)-এ বলা হয়েছে, বরং আল্লাহ তাঁকে নিজের দিকে তুলে নিয়েছেন।',
      ],
      [
        'تذكر سورة النساء (4:157) أنهم ما قتلوه وما صلبوه ولكن شُبّه لهم.',
        'وتبيّن النساء (4:158) أن الله رفعه إليه، وكان الله عزيزًا حكيمًا.',
      ],
    ),
  ),

  'Yajuj and Majuj (Gog and Magog)': g(
    t(
      'The Quran mentions Yajuj and Majuj (Gog and Magog) in the account of Dhul-Qarnayn building a barrier and notes their future release before the Hour.',
      'কুরআনে যুলকারনাইনের বিবরণে ইয়াজুজ ও মাজুজের ফাসাদ ও প্রতিবন্ধক নির্মাণের কথা এবং কেয়ামতের পূর্বে তাদের মুক্ত হওয়ার উল্লেখ রয়েছে।',
      'يذكر القرآن يأجوج ومأجوج في قصة ذي القرنين وبناء السدّ، ويشير إلى فتحهم قبيل الساعة.',
    ),
    pt(
      [
        'Surah Al-Kahf (18:94, 18:98) recounts people asking Dhul-Qarnayn for protection from Yajuj and Majuj and his reply that when Allah\'s promise comes, the barrier will be leveled.',
        'Surah Al-Anbiyaa (21:96) mentions when Yajuj and Majuj are opened and swarm from every elevation.',
      ],
      [
        'সূরা কাহফ (18:94, 18:98)-এ যুলকারনাইনের কাছে ইয়াজুজ ও মাজুজের বিপর্যয় থেকে রক্ষার আবেদন এবং প্রতিবন্ধক নির্মাণের বিবরণ এসেছে।',
        'সূরা আম্বিয়া (21:96)-এ কিয়ামতের পূর্বে তাদের উন্মুক্ত হয়ে ছড়িয়ে পড়ার উল্লেখ আছে।',
      ],
      [
        'تذكر الكهف (18:94، 18:98) قصة السد الذي بناه ذو القرنين لردّ إفساد يأجوج ومأجوج.',
        'وتشير الأنبياء (21:96) إلى فتح يأجوج ومأجوج ونسلهم من كل حدب.',
      ],
    ),
  ),

  'previous scriptures (Torah, Zabur, Injeel)': g(
    t(
      'The Quran affirms that Allah revealed earlier scriptures—including the Tawrat (Torah) to Musa, Zabur (Psalms) to Dawud, and Injeel (Gospel) to Isa—and confirms what remained true while standing as a guardian over them.',
      'কুরআনে পূর্বে নাজিলকৃত আসমানি কিতাব—যেমন মূসা (আ.)-এর প্রতি তাওরাত, দাউদ (আ.)-এর প্রতি যাবুর এবং ঈসা (আ.)-এর প্রতি ইঞ্জিল—নাজিলের সত্যতা উল্লেখ করা হয়েছে।',
      'يذكر القرآن إنزال الكتب السماوية السابقة كالتوراة على موسى والزبور على داود والإنجيل على عيسى عليهم السلام.',
    ),
    pt(
      [
        'Surah Al-Maaida (5:44, 5:46) states Allah revealed the Tawrat containing guidance and light, and followed with the Injeel confirming what came before it.',
        'Surah An-Nisaa (4:163) mentions giving the Zabur to Dawud alongside revelation to other prophets.',
        'Surah Aal-i-Imraan (3:3) mentions the Quran confirming the scriptures that preceded it.',
      ],
      [
        'সূরা মায়িদাহ (5:44, 5:46)-এ হিদায়াত ও নূরসহ তাওরাত এবং পূর্ববর্তী কিতাবের সত্যায়নকারী হিসেবে ইঞ্জিল নাজিলের কথা এসেছে।',
        'সূরা নিসা (4:163)-এ দাউদ (আ.)-কে যাবুর প্রদানের উল্লেখ রয়েছে।',
        'সূরা আলে ইমরান (3:3)-এ কুরআনকে পূর্ববর্তী কিতাবসমূহের সত্যায়নকারী হিসেবে উল্লেখ করা হয়েছে।',
      ],
      [
        'تذكر المائدة (5:44، 5:46) إنزال التوراة فيها هدى ونور، وإنزال الإنجيل مصدقًا لما بين يديه.',
        'وتشير النساء (4:163) إلى إيتاء داود زبورًا.',
        'وتبيّن آل عمران (3:3) إنزال الكتاب مصدقًا لما بين يديه من التوراة والإنجيل.',
      ],
    ),
  ),

  'success and striving': g(
    t(
      'The Quran defines true success (falah) through faith, humility in prayer, purification of the soul, and sincere righteous effort.',
      'কুরআনে ঈমান, নামাজে বিনয়, আত্মশুদ্ধি এবং সৎ কর্মপ্রচেষ্টার মাধ্যমেই প্রকৃত সফলতা (ফালাহ) অর্জনের কথা বলা হয়েছে।',
      'يربط القرآن الفلاح الحقيقي بالإيمان والخشوع وتزكية النفس والسعي الصالح.',
    ),
    pt(
      [
        'Surah Al-Mu\'minoon (23:1) opens with the declaration that the believers have indeed succeeded.',
        'Surah Ash-Shams (91:9) affirms that the one who purifies their soul has succeeded.',
        'Surah An-Najm (53:39) and Surah At-Tawba (9:105) state that a person receives what they strive for and urge believers to work righteously.',
      ],
      [
        'সূরা মুমিনুন (23:1)-এ ঘোষণা করা হয়েছে, নিশ্চয় মুমিনগণ সফল হয়েছে।',
        'সূরা শামস (91:9)-এ বলা হয়েছে, যে আত্মাকে পরিশুদ্ধ করেছে সে-ই সফল হয়েছে।',
        'সূরা নাজম (53:39) ও সূরা তাওবা (9:105)-এ মানুষের চেষ্টা অনুযায়ী প্রতিদান ও সৎকাজে প্রচেষ্টার নির্দেশ এসেছে।',
      ],
      [
        'تفتتح المؤمنون (23:1) بقوله تعالى: ﴿قَدْ أَفْلَحَ الْمُؤْمِنُونَ﴾.',
        'وتؤكد الشمس (91:9) فلاح من زكّى نفسه.',
        'وتبيّن النجم (53:39) والتوبة (9:105) أن للإنسان ما سعى والأمر بالعمل الصالح.',
      ],
    ),
  ),

  'companions (Sahaba) and Hijrah': g(
    t(
      'The Quran praises the early Muhajirin (emigrants) and Ansar (helpers) for their faith, sacrifice, mutual support, and striving in Allah\'s cause.',
      'কুরআনে প্রথমাগ্রগামী মুহাজির ও আনসার সাহাবীদের ঈমান, ত্যাগ, পারস্পরিক ভালোবাসা ও আনুগত্যের উচ্চ প্রশংসা করা হয়েছে।',
      'يثني القرآن على السابقين الأولين من المهاجرين والأنصار، ويصف إيمانهم وتعاونهم وإيثارهم.',
    ),
    pt(
      [
        'Surah At-Tawba (9:100) mentions Allah being pleased with the foremost of the Muhajirin and the Ansar and those who followed them with goodness.',
        'Surah Al-Fath (48:29) describes Muhammad and those with him as compassionate among themselves and devoted in prayer.',
        'Surah Al-Hashr (59:8–9) highlights the sacrifices of the poor emigrants and the generosity of the Ansar who loved those who migrated to them.',
      ],
      [
        'সূরা তাওবা (9:100)-এ প্রথম অগ্রগামী মুহাজির ও আনসার এবং তাঁদের অনুসারীদের প্রতি আল্লাহর সন্তুষ্টির কথা এসেছে।',
        'সূরা ফাতহ (48:29)-এ নবী (সা.) ও তাঁর সাথীদের পারস্পরিক দয়া, রুকু ও সিজদার গুণাবলি বর্ণিত হয়েছে।',
        'সূরা হাশর (59:8–9)-এ মুহাজিরদের ত্যাগ এবং আনসারদের নিঃস্বার্থ আতিথেয়তা ও ভালোবাসার প্রশংসা রয়েছে।',
      ],
      [
        'تذكر التوبة (9:100) رضوان الله على السابقين الأولين من المهاجرين والأنصار.',
        'وتصف الفتح (48:29) محمدًا والذين معه بالرحمة بينهم وكثرة الركوع والسجود.',
        'وتبرز الحشر (59:8–9) تضحيات المهاجرين وإيثار الأنصار.',
      ],
    ),
  ),
};

const NOTE_SOURCE_LABEL = { en: 'Saheeh International', bn: 'Dr. Abu Bakr Muhammad Zakaria' } as const;

function surahListSummary(quran: Quran, ayahs: Array<{ s: number; a: number }>, lang: Lang): string {
  const bySurah = new Map<number, number[]>();
  for (const { s, a } of ayahs) {
    const arr = bySurah.get(s);
    if (arr) arr.push(a);
    else bySurah.set(s, [a]);
  }
  const join = lang === 'ar' ? '، ' : ', ';
  const entries = [...bySurah.entries()].slice(0, 5).map(([s, list]) => {
    const c = quran.chapters[s - 1];
    const refs = list.length <= 3
      ? list.map((a) => `${s}:${a}`).join(join)
      : `${s}:${list[0]}–${list[list.length - 1]}`;
    return lang === 'ar' ? `سورة ${c.ar} (${refs})` : lang === 'bn' ? `সূরা ${c.tr} (${refs})` : `Surah ${c.tr} (${refs})`;
  });
  const more = bySurah.size > 5 ? (lang === 'bn' ? ' এবং আরও সূরা' : lang === 'ar' ? ' وغيرها' : ' and more') : '';
  if (lang === 'bn') return `দেখানো আয়াতগুলোর অবস্থান: ${entries.join(join)}${more}।`;
  if (lang === 'ar') return `الآيات المعروضة من: ${entries.join(join)}${more}.`;
  return `Shown ayahs appear in: ${entries.join(join)}${more}.`;
}

function noteHint(quran: Quran, ayahs: Array<{ s: number; a: number }>, lang: Lang, translation: 'en' | 'bn' | 'none'): string | null {
  if (ayahs.length === 0) return null;
  const first = ayahs[0];
  const noteLang: 'en' | 'bn' = translation === 'bn' || (translation !== 'en' && lang === 'bn') ? 'bn' : 'en';
  const hasSame = !!quran.note(noteLang, first.s, first.a);
  const other: 'en' | 'bn' = noteLang === 'bn' ? 'en' : 'bn';
  const hasOther = !hasSame && !!quran.note(other, first.s, first.a);
  if (!hasSame && !hasOther) return null;
  const ref = `${first.s}:${first.a}`;
  const src = hasSame ? NOTE_SOURCE_LABEL[noteLang] : NOTE_SOURCE_LABEL[other];
  if (lang === 'bn') {
    return `প্রকাশিত অনুবাদকের টীকা (${src}) দেখতে নিচের "${ref} এর ব্যাখ্যা" বাটনে চাপুন।`;
  }
  if (lang === 'ar') {
    return `لقراءة ملاحظات المترجم المنشورة (${src}) للآية الأولى اضغط على «شرح ${ref}» أدناه.`;
  }
  return `Published translator's notes (${src}) are available — tap "explain ${ref}" below to read them word for word.`;
}

function juzOf(quran: Quran, s: number, a: number): number {
  let j = 1;
  for (let i = 0; i < quran.juz.length; i++) {
    const [js, ja] = quran.juz[i];
    if (s > js || (s === js && a >= ja)) j = i + 1;
  }
  return j;
}

/** Build strictly factual, scholar-safe overview bullets for replies with ayahs (never AI tafsir or fatwas). */
export function buildReplyPoints(
  quran: Quran,
  opts: {
    kind: string;
    lang: Lang;
    translation: 'en' | 'bn' | 'none';
    ayahs: Array<{ s: number; a: number }>;
    themeIds?: string[];
    glossary?: { term: string; meaning: string };
  },
): string[] {
  const { kind, lang, translation, ayahs, themeIds, glossary } = opts;
  if (ayahs.length === 0 && !glossary) return [];
  if (kind === 'explain') return [];

  // 1. Glossary / word-meaning reply
  if (glossary) {
    const out: string[] = [];
    if (lang === 'bn') {
      out.push(`শাব্দিক অর্থ: ${glossary.term} — ${glossary.meaning}।`);
      if (ayahs.length > 0) out.push(surahListSummary(quran, ayahs, lang));
      const nh = noteHint(quran, ayahs, lang, translation);
      if (nh) out.push(nh);
      out.push('এটি সাধারণ আভিধানিক অর্থ; বিস্তারিত তাফসীর বা শরয়ী বিধানের জন্য একজন যোগ্য আলেমের পরামর্শ নিন।');
    } else if (lang === 'ar') {
      out.push(`المعنى اللغوي: ${glossary.term} — ${glossary.meaning}.`);
      if (ayahs.length > 0) out.push(surahListSummary(quran, ayahs, lang));
      const nh = noteHint(quran, ayahs, lang, translation);
      if (nh) out.push(nh);
      out.push('هذا معنى لغوي عام؛ وللتفسير المفصّل أو الأحكام الشرعية يُرجى سؤال أهل العلم.');
    } else {
      out.push(`Lexical meaning: ${glossary.term} — ${glossary.meaning}.`);
      if (ayahs.length > 0) out.push(surahListSummary(quran, ayahs, lang));
      const nh = noteHint(quran, ayahs, lang, translation);
      if (nh) out.push(nh);
      out.push('General lexical meaning only — read each ayah in full surah context, and consult a qualified scholar for tafsir or rulings.');
    }
    return out;
  }

  // 2. Theme reply: curated factual points if available, otherwise live surah/context points
  if (kind === 'theme' && themeIds && themeIds.length > 0) {
    const curated: string[] = [];
    for (const id of themeIds) {
      const entry = TOPIC_GUIDE[id];
      if (!entry) continue;
      for (const p of entry.points[lang]) {
        if (!curated.includes(p)) curated.push(p);
      }
    }
    if (curated.length > 0) {
      const out = curated.slice(0, 4);
      const nh = noteHint(quran, ayahs, lang, translation);
      if (nh && out.length < 4) out.push(nh);
      return out;
    }
  }

  // 3. Surah / ref / story / juz / search / noTopic / followup: 100% live metadata from data/quran.json
  const out: string[] = [];
  if (kind === 'surah' || (kind === 'ref' && ayahs.every((x) => x.s === ayahs[0].s))) {
    const first = ayahs[0];
    const c = quran.chapters[first.s - 1];
    const j = juzOf(quran, first.s, first.a);
    if (lang === 'bn') {
      const typeBn = c.type === 'meccan' ? 'মক্কী' : 'মাদানী';
      out.push(`সূরা ${c.tr} (নং ${bd(c.id)}, অর্থ "${c.en}") — ${typeBn} সূরা, মোট ${bd(c.n)}টি আয়াত, পারা ${bd(j)}।`);
    } else if (lang === 'ar') {
      const typeAr = c.type === 'meccan' ? 'مكية' : 'مدنية';
      out.push(`سورة ${c.ar} (رقم ${c.id}) — سورة ${typeAr}، عدد آياتها ${c.n} آية، في الجزء ${j}.`);
    } else {
      const typeEn = c.type === 'meccan' ? 'Meccan' : 'Medinan';
      out.push(`Surah ${c.tr} (Surah ${c.id}, "${c.en}") — ${typeEn}, ${c.n} ayahs total, located in Juz ${j}.`);
    }
  } else {
    out.push(surahListSummary(quran, ayahs, lang));
  }

  const nh = noteHint(quran, ayahs, lang, translation);
  if (nh) out.push(nh);

  if (lang === 'bn') {
    out.push('আয়াতগুলো মূল কুরআন ও প্রকাশিত অনুবাদ থেকে হুবহু দেখানো হয়েছে; পূর্ণ প্রসঙ্গ বুঝতে আশেপাশের আয়াতগুলোও পড়ুন।');
  } else if (lang === 'ar') {
    out.push('تُعرض الآيات كما وردت في المصحف مع ترجمتها المنشورة؛ يُنصح بقراءة السياق كاملًا.');
  } else {
    out.push('Ayahs are shown verbatim from the Quran with a published translation; read surrounding ayahs for full context.');
  }
  return out;
}

