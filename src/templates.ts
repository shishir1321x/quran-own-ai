// Every sentence the assistant says. Written by people, in three languages: no AI makes up an answer.
// HAVE THE ARABIC AND BENGALI WORDING CHECKED by native readers (and the care messages by a counsellor).
import type { Lang } from './types.js';

type T = Record<Lang, string>;
/** Digits for a Bengali sentence: 114 -> ১১৪. */
const bd = (n: number | string): string => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const t = (en: string, bn: string, ar: string): T => ({ en, bn, ar });

// Pieces of the conversation answers in MSG (a greeting, "how are you?", "I'm fine")
const GREETING_BODY = t(
  'Welcome to Quran Assistant from Amal, a small helper for reading the Quran. You can ask me about a topic, a surah or an ayah, or a number (for example "how many ayahs are in Al-Baqarah?"). How can I help you today?',
  'কুরআন সহকারীতে স্বাগতম! এটি Amal-এর একটি ছোট সহায়ক, কুরআন পড়ার জন্য। কুরআনের কোনো বিষয়, সূরা, আয়াত বা সংখ্যা সম্পর্কে জিজ্ঞেস করুন (যেমন "আল-বাকারায় কয়টি আয়াত?")। কীভাবে সাহায্য করতে পারি?',
  'مرحبًا بك في مساعد القرآن من Amal، وهو مساعد صغير لقراءة القرآن. اسألني عن موضوع في القرآن أو سورة أو آية أو عدد (مثل "كم آية في سورة البقرة؟"). كيف أستطيع مساعدتك اليوم؟');
const HOW_ARE_YOU = t('How are you?', 'আপনি কেমন আছেন?', 'كيف حالك أنت؟');
const READ_TODAY = t(
  'What would you like to read from the Quran today? For example: ayahs about patience, Surah Al-Mulk, or the story of Yusuf.',
  'আজ কুরআন থেকে কী পড়তে চান? যেমন: ধৈর্য নিয়ে আয়াত, সূরা মুলক, বা ইউসুফ (আ.)-এর কাহিনী।',
  'ماذا تحب أن تقرأ من القرآن اليوم؟ مثلًا: آيات عن الصبر، أو سورة الملك، أو قصة يوسف.');
/** An Arabic counted noun, as Arabic grammar wants it: 1 آية واحدة, 2 آيتين, 3-10 آيات, 11 and more آية. */
const arCount = (n: number, one: string, two: string, few: string): string =>
  n === 1 ? `${one} واحدة` : n === 2 ? two : n >= 3 && n <= 10 ? `${n} ${few}` : `${n} ${one}`;
const arAyahs = (n: number) => arCount(n, 'آية', 'آيتين', 'آيات');
const arTimes = (n: number) => arCount(n, 'مرة', 'مرتين', 'مرات');
const enN = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const THEME_LABEL: Record<string, T> = {
  'patience': t('patience', 'ধৈর্য', 'الصبر'),
  'hardship and comfort': t('hardship and comfort', 'কষ্ট ও সান্ত্বনা', 'الشدائد والطمأنينة'),
  'mercy and forgiveness': t('mercy and forgiveness', 'রহমত ও ক্ষমা', 'الرحمة والمغفرة'),
  'gratitude': t('gratitude', 'কৃতজ্ঞতা', 'الشكر'),
  'parents': t('parents', 'পিতা-মাতা', 'الوالدان'),
  'charity': t('charity', 'দান', 'الصدقة'),
  'prayer times': t('prayer times', 'নামাজের সময়', 'أوقات الصلاة'),
  'how many prayers': t('daily prayers and prayer times', 'দৈনিক নামাজ ও এর সময়', 'الصلوات اليومية وأوقاتها'),
  'prayer': t('prayer', 'নামায', 'الصلاة'),
  'fasting': t('fasting', 'রোজা', 'الصيام'),
  'trust in Allah': t('trust in Allah', 'আল্লাহর ওপর ভরসা', 'التوكل على الله'),
  'justice': t('justice', 'ন্যায়বিচার', 'العدل'),
  'honesty': t('honesty', 'সততা', 'الصدق'),
  'knowledge': t('knowledge', 'জ্ঞান', 'العلم'),
  'anger and patience with people': t('anger and forgiving people', 'রাগ সংবরণ ও ক্ষমা', 'كظم الغيظ والعفو'),
  'death and the hereafter': t('death and the hereafter', 'মৃত্যু ও আখিরাত', 'الموت والآخرة'),
  'spouses': t('spouses', 'দাম্পত্য সম্পর্ক', 'الزواج'),
  'gossip': t('gossip and backbiting', 'গীবত', 'الغيبة'),
  'humility': t('humility', 'বিনয়', 'التواضع'),
  'the Day of Judgment': t('the Day of Judgment', 'কিয়ামতের দিন', 'يوم القيامة'),
  'Paradise': t('Paradise', 'জান্নাত', 'الجنة'),
  'dua for parents': t('a supplication for parents', 'পিতা-মাতার জন্য দোয়া', 'دعاء للوالدين'),
  'dua for forgiveness': t('a supplication for forgiveness', 'ক্ষমা চেয়ে দোয়া', 'دعاء المغفرة'),
  'dua for knowledge': t('a supplication for knowledge', 'জ্ঞানের জন্য দোয়া', 'دعاء العلم'),
  'dua for health': t('a supplication for health', 'সুস্থতার জন্য দোয়া', 'دعاء الشفاء'),
  'dua for family': t('a supplication for family', 'পরিবারের জন্য দোয়া', 'دعاء للأسرة'),
  'supplications (dua)': t('supplications (dua) in the Quran', 'কুরআনের দোয়া', 'الأدعية في القرآن'),
  'illness and healing': t('illness and healing', 'অসুস্থতা ও আরোগ্য', 'المرض والشفاء'),
  'sacrifice (qurbani)': t('sacrifice (qurbani)', 'কুরবানি', 'القربان والأضحية'),
  'jealousy and envy': t('jealousy and envy', 'হিংসা ও বিদ্বেষ', 'الحسد'),
  'hijab and modesty': t('hijab and modesty', 'হিজাব ও পর্দা', 'الحجاب والعفة'),
  'divorce': t('divorce', 'তালাক', 'الطلاق'),
  'friendship and brotherhood': t('friendship and brotherhood', 'বন্ধুত্ব ও ভ্রাতৃত্ব', 'الصداقة والأخوة'),
  'the environment': t('the environment', 'পরিবেশ ও প্রকৃতি', 'البيئة'),
  'animals': t('animals', 'প্রাণী', 'الحيوانات'),
  'business and trade': t('business and trade', 'ব্যবসা ও বাণিজ্য', 'التجارة'),
  'debt': t('debt', 'ঋণ', 'الدَّين'),
  'freedom of religion': t('freedom of religion', 'ধর্মীয় স্বাধীনতা', 'حرية العقيدة'),
  'people of other faiths': t('people of other faiths', 'অন্যান্য ধর্মাবলম্বী', 'أهل الكتاب وغيرهم'),
  'the poor and needy': t('the poor and needy', 'দরিদ্র ও অভাবী', 'الفقراء والمساكين'),
  'Hajj and Umrah': t('Hajj and Umrah', 'হজ্জ ও উমরাহ', 'الحج والعمرة'),
  'Laylatul Qadr': t('Laylatul Qadr', 'লাইলাতুল কদর', 'ليلة القدر'),
  'Friday': t('Friday', 'জুমুআ', 'الجمعة'),
  'the Kaaba and the qibla': t('the Kaaba and the qibla', 'কাবা ও কিবলা', 'الكعبة والقبلة'),
  'protection': t('protection', 'সুরক্ষা ও আশ্রয়', 'الحماية'),
  'trials and tests': t('trials and tests', 'পরীক্ষা ও বিপদ', 'الابتلاء'),
  'destiny': t('destiny', 'তাকদীর', 'القدر'),
  'faith (iman)': t('faith (iman)', 'ঈমান', 'الإيمان'),
  'sincerity': t('sincerity', 'ইখলাস ও নিয়ত', 'الإخلاص'),
  'taqwa (being mindful of Allah)': t('taqwa (being mindful of Allah)', 'তাকওয়া', 'التقوى'),
  'time': t('time', 'সময়', 'الوقت والعصر'),
  'wudu and purification': t('wudu and purification', 'ওযু ও পবিত্রতা', 'الوضوء والطهارة'),
  'cleanliness': t('cleanliness', 'পরিচ্ছন্নতা ও পবিত্রতা', 'الطهارة والنظافة'),
  'women': t('women', 'নারী', 'النساء'),
  'Satan': t('Satan', 'শয়তান', 'الشيطان'),
  'angels': t('angels', 'ফেরেশতা', 'الملائكة'),
  'jinn': t('jinn', 'জিন', 'الجن'),
  'Hell': t('Hell', 'জাহান্নাম', 'جهنم'),
  'the Quran is protected': t('the Quran is protected', 'কুরআনের সংরক্ষণ', 'حفظ القرآن'),
  'the names of Allah': t('the names of Allah', 'আল্লাহর সুন্দর নামসমূহ', 'أسماء الله الحسنى'),
  'provision (rizq)': t('provision (rizq)', 'রিযিক', 'الرزق'),
  'moderation': t('moderation', 'মিতব্যয়িতা ও অপচয় বর্জন', 'الاعتدال وعدم الإسراف'),
  'promises and trusts': t('promises and trusts', 'ওয়াদা ও আমানত', 'الوفاء بالعهد والأمانة'),
  'consultation and leadership': t('consultation and leadership', 'পরামর্শ ও নেতৃত্ব', 'الشورى والقيادة'),
  'children': t('children', 'সন্তানসন্ততি', 'الأبناء'),
  'old age': t('old age', 'বার্ধক্য', 'الكبر والشيخوخة'),
  'sleep': t('sleep', 'ঘুম', 'النوم'),
  'rain': t('rain', 'বৃষ্টি ও পানি', 'المطر والماء'),
  'the creation of the heavens and the earth': t('the creation of the heavens and the earth', 'আকাশ ও পৃথিবীর সৃষ্টি', 'خلق السماوات والأرض'),
  'the creation of man': t('the creation of man', 'মানুষের সৃষ্টি', 'خلق الإنسان'),
  'the sun, the moon and the sky': t('the sun, the moon and the sky', 'সূর্য, চাঁদ ও আকাশ', 'الشمس والقمر والسماء'),
  'oppression': t('oppression', 'জুলুম ও অবিচার', 'الظلم'),
  'forgiving other people': t('forgiving other people', 'অন্যকে ক্ষমা করা', 'العفو عن الناس'),
  'listening to recitation': t('listening to recitation', 'তিলাওয়াত মনোযোগ দিয়ে শোনা', 'الاستماع لتلاوة القرآن'),
  'recitation of the Quran': t('recitation of the Quran', 'কুরআন তিলাওয়াত', 'تلاوة القرآن'),
  'reflecting on the Quran': t('reflecting on the Quran', 'কুরআন নিয়ে চিন্তা ও গবেষণা', 'تدبر القرآن'),
  'wealth': t('wealth', 'ধনসম্পদ', 'المال'),
  'the grave': t('the grave', 'কবর ও বারযাখ', 'القبر والبرزخ'),
  'Prophet Muhammad': t('Prophet Muhammad', 'নবী মুহাম্মদ (সা.)', 'النبي محمد'),
  'who Allah is': t('who Allah is', 'আল্লাহর পরিচয়', 'معرفة الله'),
  'tawhid (the oneness of Allah)': t('tawhid (the oneness of Allah)', 'তাওহীদ (আল্লাহর একত্ববাদ)', 'التوحيد'),
  'shirk': t('shirk', 'শিরক', 'الشرك'),
  'hypocrisy': t('hypocrisy', 'মুনাফিকি', 'النفاق'),
  'intoxicants and gambling': t('intoxicants and gambling', 'মদ ও জুয়া', 'الخمر والميسر'),
  'forbidden foods': t('forbidden foods', 'হারাম খাদ্য', 'الأطعمة المحرمة'),
  'usury (interest)': t('usury (interest)', 'সুদ (রিবা)', 'الربا'),
  'inheritance': t('inheritance', 'উত্তরাধিকার', 'الميراث'),
  'adultery': t('adultery', 'ব্যভিচার', 'الزنا'),
  'killing': t('killing', 'অন্যায় হত্যা', 'القتل'),
  'bribery': t('bribery', 'ঘুষ', 'الرشوة'),
  'orphans': t('orphans', 'এতিম', 'اليتامى'),
  'neighbors': t('neighbors', 'প্রতিবেশী', 'الجيران'),
  'purpose of life': t('the purpose of life', 'জীবনের উদ্দেশ্য', 'الغاية من الحياة والخلق'),
  'remembrance of Allah (dhikr)': t('remembrance of Allah (dhikr)', 'আল্লাহর স্মরণ (যিকির)', 'ذكر الله'),
  'good deeds and righteousness': t('good deeds and righteousness', 'সৎকর্ম ও নেক আমল', 'الأعمال الصالحة والبر'),
  'character and good manners (akhlaq)': t('character and good manners (akhlaq)', 'উত্তম চরিত্র ও আখলাক', 'الأخلاق الحميدة'),
  'kindness and mercy to others': t('kindness and mercy to others', 'সদাচরণ ও দয়া', 'الإحسان والرحمة بالناس'),
  'family and kinship': t('family and kinship', 'আত্মীয়তার সম্পর্ক', 'صلة الرحم والأقارب'),
  'magic and sihr': t('magic and sihr', 'জাদু ও সিহর', 'السحر'),
  'signs in creation and reflection': t('signs in creation and reflection', 'সৃষ্টির নিদর্শন ও চিন্তাভাবনা', 'آيات الخلق والتفكر'),
};

export const MSG = {
  themeIntro: (label: string): T => t(
    `Ayahs about ${label}. They are shown as they are in the Quran, with a translation. This assistant does not interpret them.`,
    `${label} সম্পর্কে কুরআনের আয়াত। আয়াতগুলো কুরআনে যেমন আছে তেমনই অনুবাদসহ দেখানো হলো। এই সহকারী এগুলোর ব্যাখ্যা করে না।`,
    `آيات عن ${label}. تُعرض كما وردت في القرآن مع ترجمة. هذا المساعد لا يفسّرها.`),
  searchIntro: t(
    'These ayahs contain words from your question. They are shown as they are in the Quran, with a translation. Please read them in context; this assistant does not interpret them.',
    'এই আয়াতগুলোতে আপনার প্রশ্নের শব্দ আছে। কুরআনে যেমন আছে তেমনই অনুবাদসহ দেখানো হলো। অনুগ্রহ করে প্রসঙ্গসহ পড়ুন; এই সহকারী এগুলোর ব্যাখ্যা করে না।',
    'تحتوي هذه الآيات على كلمات من سؤالك. تُعرض كما وردت في القرآن مع ترجمة. يرجى قراءتها في سياقها؛ هذا المساعد لا يفسّرها.'),
  surahIntro: (name: string, shown: number, total: number, no: number): T => t(
    shown < total ? `Surah ${no}, ${name}: the first ${shown} of ${total} ayahs.` : `Surah ${no}, ${name}: all ${total} ayahs.`,
    shown < total ? `সূরা ${bd(no)}, ${name}: ${bd(total)}টি আয়াতের প্রথম ${bd(shown)}টি।` : `সূরা ${bd(no)}, ${name}: সব ${bd(total)}টি আয়াত।`,
    shown < total ? `سورة ${no}, ${name}: أول ${shown} آيات من ${total}.` : `سورة ${no}, ${name}: كل الآيات (${total}).`),
  partIntro: (name: string, label: string): T => t(`Surah ${name}, ${label}.`, `সূরা ${name}, ${label}।`, `سورة ${name}، ${label}.`),
  passageIntro: (name: string, label: string): T => t(`${name}: ${label}.`, `${name}: ${label}।`, `${name}: ${label}.`),
  noHadith: t(
    'This is a question about hadith or the virtue of a surah. I have the Quran text, a translation and the translators\' notes, but no hadith collections, so I cannot answer it reliably. Please ask a qualified scholar.',
    'এটি হাদীস বা কোনো সূরার ফজিলত সংক্রান্ত প্রশ্ন। আমার কাছে কুরআনের পাঠ, অনুবাদ ও অনুবাদকের টীকা আছে, কিন্তু হাদীসের কোনো সংকলন নেই, তাই নির্ভরযোগ্য উত্তর দিতে পারব না। অনুগ্রহ করে একজন যোগ্য আলেমকে জিজ্ঞেস করুন।',
    'هذا سؤال عن الحديث أو فضل سورة. عندي نص القرآن وترجمته وملاحظات المترجم، بلا مجموعات حديث، فلا أستطيع الجواب بثقة. يرجى سؤال عالم مؤهل.'),
  noAsbab: t(
    'I cannot determine from the Quran text alone whether or why a surah or ayah was revealed on a particular historical occasion: reasons for revelation (Asbab al-Nuzul) come from hadith and tafsir collections, which I do not have, and I do not interpret ayahs to infer them. For the text itself you can ask for the surah or ayah directly (or use "explain ..." for the translator\'s notes); for reasons of revelation, please ask a qualified scholar.',
    'শুধু কুরআনের পাঠ থেকে কোনো সূরা বা আয়াত নাজিলের ঐতিহাসিক কারণ নির্ণয় করা আমার পক্ষে সম্ভব নয়: নাজিলের কারণ (শানে নুযূল / আসবাবুন নুযূল) হাদীস ও তাফসীর গ্রন্থ থেকে জানা যায়, যা আমার কাছে নেই, এবং আমি নিজে আয়াত ব্যাখ্যা করে তা অনুমান করি না। মূল পাঠ দেখতে সরাসরি সূরা বা আয়াতের নম্বর লিখুন (বা অনুবাদকের টীকার জন্য "... এর ব্যাখ্যা" লিখুন); নাজিলের কারণ জানতে একজন যোগ্য আলেমকে জিজ্ঞেস করুন।',
    'لا أستطيع تحديد سبب النزول التاريخي من نص القرآن وحده: أسباب النزول تُعرف من كتب الحديث والتفسير، وهي ليست عندي، ولا أفسّر الآيات لاستنتاجها. لعرض النص نفسه يمكنك طلب السورة أو الآية مباشرة (أو كتابة "شرح ..." لعرض ملاحظات المترجم)؛ ولمعرفة أسباب النزول يرجى سؤال عالم مؤهل.'),
  personalGuidance: t(
    'I cannot tell you what Allah wants you to do in your personal situation, make personal predictions, or issue religious guidance from Quran verses. I only show real ayahs as they are in the text without interpreting them. For guidance on your personal situation, please ask a qualified scholar.',
    'আপনার ব্যক্তিগত পরিস্থিতি নিয়ে আল্লাহর নির্দেশ কী বা আপনার ব্যক্তিগত সিদ্ধান্ত কী হওয়া উচিত—তা আমি কুরআনের আয়াত ব্যাখ্যা করে বলতে বা ভবিষ্যদ্বাণী করতে পারি না। আমি শুধু কুরআনের মূল পাঠ ও অনুবাদ দেখাই, কোনো ব্যাখ্যা দিই না। ব্যক্তিগত বিষয়ে দিকনির্দেশনার জন্য একজন যোগ্য আলেমকে জিজ্ঞেস করুন।',
    'لا أستطيع إخبارك بما يريده الله منك في وضعك الشخصي أو إصدار توجيهات أو تنبؤات شخصية من الآيات. أنا أعرض الآيات كما هي في النص دون تفسير. للاستشارة في وضعك الشخصي يرجى سؤال عالم مؤهل.'),
  oneAtATime: (name: string, total: number, firstRef: string): T => t(
    `Surah ${name} (1 of ${total} ayahs): ${firstRef}. Tap or say "next ayah" to continue one ayah at a time.`,
    `সূরা ${name} (${bd(total)}টি আয়াতের মধ্যে প্রথমটি): ${firstRef}। একে একে পরের আয়াত দেখতে "পরের আয়াত" লিখুন বা চাপুন।`,
    `سورة ${name} (الآية الأولى من ${total}): ${firstRef}. اكتب أو اضغط "الآية التالية" للمتابعة آية بآية.`),
  refsSuffix: (refs: string): T => t(` References: ${refs}.`, ` রেফারেন্স: ${refs}।`, ` المراجع: ${refs}.`),
  // The first sentence of every answer to "explain ...": the assistant explains nothing in its own words.
  ownWords: t(
    'I do not explain anything on my own: everything I show comes from the Quran, as it is, with its published translations.',
    'আমি নিজে থেকে কিছুই ব্যাখ্যা করি না: আমি যা দেখাই সবই কুরআন থেকে, যেমন আছে তেমন, প্রকাশিত অনুবাদসহ।',
    'لا أشرح شيئًا من عندي: كل ما أعرضه من القرآن كما هو، مع ترجماته المنشورة.'),
  explainIntro: (source: string): T => t(
    `Explanatory notes for these ayahs: they are the translator's own notes, copied word for word (${source}). This assistant adds nothing to them and does not judge them. For rulings please ask a qualified scholar.`,
    `এই আয়াতগুলোর ব্যাখ্যামূলক টীকা: এগুলো অনুবাদকের নিজের লেখা টীকা, হুবহু তুলে দেওয়া (${source})। এই সহকারী এতে কিছু যোগ করে না, বিচারও করে না। বিধান জানতে যোগ্য আলেমকে জিজ্ঞেস করুন।`,
    `ملاحظات توضيحية لهذه الآيات: هي ملاحظات المترجم نفسه منقولة بنصها (${source}). لا يضيف هذا المساعد إليها شيئًا ولا يحكم عليها. وللأحكام اسأل عالمًا مؤهلًا.`),
  noNote: t(
    'There is no explanatory note for these ayahs in this translation.',
    'এই অনুবাদে এই আয়াতগুলোর জন্য কোনো ব্যাখ্যামূলক টীকা নেই।',
    'لا توجد ملاحظة توضيحية لهذه الآيات في هذه الترجمة.'),
  noteOtherLang: (other: 'en' | 'bn'): T => t(
    `There is a note for them in the ${other === 'bn' ? 'Bengali' : 'English'} translation: add "in ${other === 'bn' ? 'Bengali' : 'English'}" to see it.`,
    `${other === 'bn' ? 'বাংলা' : 'ইংরেজি'} অনুবাদে এর টীকা আছে: দেখতে "${other === 'bn' ? 'বাংলায়' : 'ইংরেজিতে'}" যোগ করুন।`,
    `توجد ملاحظة في الترجمة ${other === 'bn' ? 'البنغالية' : 'الإنجليزية'}: أضف "${other === 'bn' ? 'بالبنغالية' : 'بالإنجليزية'}" لعرضها.`),
  explainWhich: t(
    'Which ayah do you want explained? Please name one, for example "explain 2:255", "tafsir of Ayat al-Kursi" or "explain surah Al-Ikhlas". I show the translator\'s own notes for it.',
    'কোন আয়াতের ব্যাখ্যা চান? একটা আয়াত বা সূরার নাম লিখুন, যেমন "2:255 এর ব্যাখ্যা", "আয়াতুল কুরসির তাফসীর" বা "সূরা ইখলাসের ব্যাখ্যা"। আমি তার জন্য অনুবাদকের নিজের টীকা দেখাই।',
    'أي آية تريد شرحها؟ اذكر آية، مثل "شرح 2:255" أو "تفسير آية الكرسي" أو "شرح سورة الإخلاص". أعرض ملاحظات المترجم لها.'),
  noTafsirWork: (name: string): T => t(
    `I do not have the tafsir of ${name}. What I can show is the translator's own notes for the ayah.`,
    `আমার কাছে ${name}-এর তাফসীর নেই। আমি আয়াতটির জন্য অনুবাদকের নিজের টীকা দেখাতে পারি।`,
    `ليس عندي تفسير ${name}. ما أستطيع عرضه هو ملاحظات المترجم على الآية.`),
  explainFirst: (n: number): T => t(
    `Showing the first ${n} ayahs only. Ask for one ayah at a time, for example "explain 2:255", to see its note.`,
    `শুধু প্রথম ${bd(n)}টি আয়াত দেখানো হলো। একটা করে আয়াত চাইলে (যেমন "2:255 এর ব্যাখ্যা") তার টীকা দেখতে পাবেন।`,
    `أعرض أول ${n} آيات فقط. اطلب آية واحدة في كل مرة، مثل "شرح 2:255"، لترى ملاحظتها.`),
  help: t(
    'I can show ayahs and numbers from the Quran. You can ask for example:\n• a surah or an ayah: "Surah Al-Ikhlas", "surah 36", "2:255", "last 2 ayat of surah baqarah"\n• a topic: "patience", "dua for parents", "what does the Quran say about jealousy?"\n• a story: "story of Yusuf", "Dhul-Qarnayn"\n• a part: "para 30", "Ayat al-Kursi", "teen qul", "sajdah ayats"\n• a number: "how many ayahs are in Al-Baqarah?", "how many pages?"\n• the place of an ayah: write some Arabic or English words of it and I will find it\nAdd "in Bengali", "in English" or "only Arabic" to choose the translation.\nFor an explanation say "explain 2:255" or "tafsir of Ayat al-Kursi": I show the translator\'s own notes, word for word.\nI do not interpret ayahs myself, and I give no rulings or hadith: please ask a scholar for those.',
    'আমি কুরআনের আয়াত ও সংখ্যা দেখাতে পারি। যেমন জিজ্ঞেস করতে পারেন:\n• সূরা বা আয়াত: "সূরা ইখলাস", "সূরা ৩৬", "2:255", "বাকারার শেষ ২ আয়াত"\n• বিষয়: "ধৈর্য", "পিতা-মাতার জন্য দোয়া", "হিংসা নিয়ে কুরআন কী বলে?"\n• কাহিনী: "ইউসুফ (আ.) এর কাহিনী", "যুলকারনাইন"\n• অংশ: "৩০ নং পারা", "আয়াতুল কুরসি", "তিন কুল", "সিজদার আয়াত"\n• সংখ্যা: "বাকারায় কয়টি আয়াত?", "কুরআনে কয় পৃষ্ঠা?"\n• কোনো আয়াত কোথায়: আয়াতের কিছু আরবি বা ইংরেজি শব্দ লিখুন, আমি খুঁজে দেব\nঅনুবাদ বেছে নিতে লিখুন "বাংলায়", "ইংরেজিতে" বা "শুধু আরবি"।\nব্যাখ্যা জানতে লিখুন "2:255 এর ব্যাখ্যা" বা "আয়াতুল কুরসির তাফসীর": আমি অনুবাদকের নিজের টীকা হুবহু দেখাই।\nআমি নিজে আয়াতের ব্যাখ্যা করি না, ফতোয়া বা হাদীসও দিই না: সেজন্য আলেমকে জিজ্ঞেস করুন।',
    'أستطيع عرض آيات وأرقام من القرآن. مثلًا اسأل عن:\n• سورة أو آية: "سورة الإخلاص"، "سورة 36"، "2:255"، "آخر آيتين من سورة البقرة"\n• موضوع: "الصبر"، "دعاء للوالدين"، "ماذا يقول القرآن عن الحسد؟"\n• قصة: "قصة يوسف"، "ذو القرنين"\n• جزء: "الجزء 30"، "آية الكرسي"، "المعوذات"، "آيات السجدة"\n• عدد: "كم آية في سورة البقرة؟"، "كم صفحة في القرآن؟"\n• موضع آية: اكتب بعض كلماتها بالعربية أو الإنجليزية وسأجدها\nأضف "بالعربية فقط" أو "بالإنجليزية" أو "بالبنغالية" لاختيار الترجمة.\nللشرح اكتب "شرح 2:255" أو "تفسير آية الكرسي": أعرض ملاحظات المترجم نفسه بنصها.\nلا أفسّر الآيات بنفسي ولا أفتي ولا أنقل حديثًا: اسأل عالمًا.'),
  cannotDo: t(
    'I cannot do that here: for example audio recitation, prayer times, the direction of the qibla, dates of Eid or Ramadan, or a zakat calculator. I only show ayahs from the Quran text, and numbers about it. Type "help" to see what I can do.',
    'এটা আমি এখানে করতে পারি না: যেমন তিলাওয়াতের অডিও, নামাজের সময়, কিবলার দিক, ঈদ বা রমজানের তারিখ, যাকাতের হিসাব। আমি শুধু কুরআনের পাঠ থেকে আয়াত আর তার সংখ্যা দেখাই। কী পারি দেখতে "সাহায্য" লিখুন।',
    'لا أستطيع ذلك هنا: مثل التلاوة الصوتية أو مواقيت الصلاة أو اتجاه القبلة أو تواريخ العيد ورمضان أو حاسبة الزكاة. أعرض فقط آيات من نص القرآن وأرقامًا عنه. اكتب "مساعدة" لترى ما أستطيعه.'),
  feedback: t(
    'I am sorry about that. Please write exactly what you asked and what was wrong, so that it can be fixed. For religious matters please ask a qualified scholar.',
    'এজন্য আমি দুঃখিত। অনুগ্রহ করে হুবহু কী জিজ্ঞেস করেছিলেন আর কোনটা ভুল ছিল লিখুন, যাতে ঠিক করা যায়। ধর্মীয় বিষয়ে যোগ্য আলেমকে জিজ্ঞেস করুন।',
    'آسف على ذلك. اكتب بالضبط ما سألت عنه وما الخطأ حتى يمكن إصلاحه. وفي الأمور الدينية اسأل عالمًا مؤهلًا.'),
  sensitive: t(
    'This topic needs context and knowledge of Islamic law. Ayahs about it must not be read alone or picked out one by one, so I will not select them. Please ask a qualified scholar.',
    'এই বিষয়ে প্রসঙ্গ ও ইসলামী আইনের জ্ঞান দরকার। এ নিয়ে আয়াত একা বা বেছে বেছে পড়া উচিত নয়, তাই আমি আয়াত বাছব না। অনুগ্রহ করে একজন যোগ্য আলেমকে জিজ্ঞেস করুন।',
    'هذا الموضوع يحتاج إلى سياق وعلم بالشريعة. لا ينبغي قراءة آياته منفردة أو انتقاؤها، لذلك لن أنتقيها. يرجى سؤال عالم مؤهل.'),
  noTranslit: t(
    'Transliteration (the Arabic written in Latin letters) is not available here, so I show the Arabic text with a translation.',
    'উচ্চারণ (আরবি পাঠ রোমান বা বাংলা হরফে) এখানে নেই, তাই আরবি পাঠ অনুবাদসহ দেখাচ্ছি।',
    'النطق بحروف لاتينية غير متوفر هنا، لذلك أعرض النص العربي مع ترجمة.'),
  phraseIntro: t(
    'These ayahs contain the words you wrote.',
    'আপনার লেখা শব্দগুলো এই আয়াতগুলোতে আছে।',
    'هذه الآيات تحتوي على الكلمات التي كتبتها.'),
  wordMeaning: (term: string, meaning: string, hasAyahs: boolean): T => t(
    `${term}: ${meaning}\nGeneral lexical meaning only — for detailed tafsir or religious rulings, please ask a qualified scholar.${hasAyahs ? '\n\nRelated ayahs from the Quran:' : ''}`,
    `${term}: ${meaning}\nএটি সাধারণ শাব্দিক অর্থ — বিস্তারিত তাফসীর বা শরয়ী বিধানের জন্য অনুগ্রহ করে একজন যোগ্য আলেমের কাছে জিজ্ঞাসা করুন।${hasAyahs ? '\n\nকুরআন থেকে সম্পর্কিত আয়াত:' : ''}`,
    `${term}: ${meaning}\nهذا معنى لغوي عام فقط — للتفسير المفصل أو الأحكام الشرعية يُرجى سؤال أهل العلم.${hasAyahs ? '\n\nآيات ذات صلة من القرآن:' : ''}`),
  wordMeaningContext: (word: string): T => t(
    `I do not have a standalone full-word dictionary entry for "${word}", so here are Quran ayahs that mention or relate to it with their published translations:`,
    `"${word}" শব্দটির জন্য আলাদা পূর্ণাঙ্গ অভিধানভিত্তিক অর্থ আমার কাছে নেই, তবে কুরআনে এই শব্দের সাথে সম্পর্কিত বা শব্দটি উল্লেখ থাকা কিছু আয়াত ও প্রকাশিত অনুবাদ নিচে দেওয়া হলো:`,
    `لا يتوفر لديّ معجم لغوي مستقل لكلمة «${word}»، لكن إليك آيات من القرآن الكريم تذكرها أو ترتبط بها مع ترجماتها المنشورة:`),
  wordMeaningNotFound: (word: string): T => t(
    `I do not have a dictionary meaning for "${word}", and I could not find it in my glossary of common Quranic terms or in the Quran text. Try asking about a common Quranic term (like sabr, taqwa, zakat, ihsan), a surah name, or an ayah reference.`,
    `"${word}" শব্দটির অভিধানভিত্তিক অর্থ আমার কাছে নেই এবং প্রচলিত কুরআনিক পরিভাষার তালিকা বা কুরআনের পাঠেও এটি খুঁজে পাইনি। প্রচলিত কোনো কুরআনিক শব্দ (যেমন সবর, তাকওয়া, যাকাত, ইহসান), সূরার নাম বা আয়াত নম্বর লিখে চেষ্টা করুন।`,
    `لا أملك معنى معجميًا لكلمة «${word}»، ولم أجدها في مسرد المصطلحات القرآنية الشائعة ولا في نص القرآن. جرّب السؤال عن مصطلح قرآني شائع (مثل الصبر أو التقوى أو الزكاة) أو اسم سورة أو رقم آية.`),
  storyIntro: (name: string, label: string): T => t(
    `${name}: the passage where the account begins (${label}). Read on in the Quran for the rest.`,
    `${name}: যেখান থেকে বর্ণনা শুরু (${label})। বাকিটা কুরআনে পড়ে নিন।`,
    `${name}: موضع بداية القصة (${label}). أكمل القراءة في المصحف.`),
  dayIntro: t('Ayah of the day.', 'আজকের আয়াত।', 'آية اليوم.'),
  /** A whole page of the Madani mushaf (it can hold the end of one surah and the start of the next). */
  pageWhole: (n: number, from: string, to: string, count: number): T => t(
    `Page ${n} of the Madani mushaf: ${enN(count, 'ayah', 'ayahs')}, from ${from} to ${to}.`,
    `মাদানী মুসহাফের ${bd(n)} নম্বর পৃষ্ঠা: ${from} থেকে ${to} পর্যন্ত ${bd(count)}টি আয়াত।`,
    `الصفحة ${n} من المصحف المدني: ${arAyahs(count)}، من ${from} إلى ${to}.`),
  wishes: t(
    'And to you too! May Allah accept our good deeds. Ask me anything about the Quran.',
    'আপনাকেও শুভেচ্ছা! আল্লাহ আমাদের সবার নেক আমল কবুল করুন। কুরআন সম্পর্কে কিছু জানতে চাইলে জিজ্ঞেস করুন।',
    'وأنتم بخير! تقبّل الله منا ومنكم. اسألني عن أي شيء في القرآن.'),
  refIntro: (ref: string): T => t(`Ayah ${ref}.`, `আয়াত ${ref}।`, `الآية ${ref}.`),
  noTopicIntro: t(
    'Here are a few well-known ayahs. Ask me about a topic (for example patience, mercy, parents) for more.',
    'কয়েকটি পরিচিত আয়াত দেওয়া হলো। আরও জানতে একটা বিষয় জিজ্ঞেস করুন (যেমন ধৈর্য, রহমত, পিতা-মাতা)।',
    'هذه بعض الآيات المعروفة. اسألني عن موضوع (مثل الصبر والرحمة والوالدين) للمزيد.'),
  juzIntro: (n: number, ref: string, shown: number): T => t(
    `Juz (para) ${n} begins at ${ref}. Here are its first ${shown} ayahs.`,
    `${bd(n)} নম্বর পারা (জুয) শুরু হয়েছে ${ref} থেকে। এর প্রথম ${bd(shown)}টি আয়াত দেখানো হলো।`,
    `الجزء ${n} يبدأ من ${ref}. هذه أول ${shown} آيات منه.`),
  followUpIntro: t('The same ayahs, with the Bengali translation.', 'একই আয়াতগুলো, বাংলা অনুবাদসহ।', 'الآيات نفسها مع الترجمة.'),
  // Follow-ups that move on from the ayahs already shown ("show more", "next ayah", "in english", "next surah").
  sameAyahs: (which: 'en' | 'bn' | 'none'): T => which === 'en'
    ? t('The same ayahs, with the English translation.', 'একই আয়াতগুলো, ইংরেজি অনুবাদসহ।', 'الآيات نفسها مع الترجمة الإنجليزية.')
    : which === 'bn'
      ? t('The same ayahs, with the Bengali translation.', 'একই আয়াতগুলো, বাংলা অনুবাদসহ।', 'الآيات نفسها مع الترجمة البنغالية.')
      : t('The same ayahs, in Arabic only.', 'একই আয়াতগুলো, শুধু আরবি।', 'الآيات نفسها بالعربية فقط.'),
  /** "Which surah talks about ...?": the surahs of the ayahs shown, with their references (lists made in engine.ts). */
  inSurahs: (en: string, bn: string, ar: string): T => t(` These ayahs are in: ${en}.`, ` এই আয়াতগুলো আছে: ${bn}।`, ` هذه الآيات في: ${ar}.`),
  moreIntro: (label: string): T => t(`More ayahs: ${label}.`, `আরও আয়াত: ${label}।`, `مزيد من الآيات: ${label}.`),
  moreSearch: t(
    'More ayahs that contain words from your earlier question. Please read them in context; this assistant does not interpret them.',
    'আপনার আগের প্রশ্নের শব্দ আছে এমন আরও আয়াত। অনুগ্রহ করে প্রসঙ্গসহ পড়ুন; এই সহকারী এগুলোর ব্যাখ্যা করে না।',
    'مزيد من الآيات التي فيها كلمات من سؤالك السابق. يرجى قراءتها في سياقها؛ هذا المساعد لا يفسّرها.'),
  noMore: t(
    'I have no more ayahs for that question. Ask about another topic, a surah or an ayah.',
    'এই প্রশ্নের জন্য আমার কাছে আর কোনো আয়াত নেই। অন্য কোনো বিষয়, সূরা বা আয়াত জিজ্ঞেস করুন।',
    'ليس عندي آيات أخرى لهذا السؤال. اسأل عن موضوع آخر أو سورة أو آية.'),
  endOfSurah: (name: string): T => t(
    `That was the end of Surah ${name}. Say "next surah" to go on.`,
    `সূরা ${name} এখানেই শেষ। এগিয়ে যেতে লিখুন "পরের সূরা"।`,
    `انتهت سورة ${name}. اكتب "السورة التالية" للمتابعة.`),
  edgeOfQuran: (which: 'first' | 'last'): T => which === 'last'
    ? t('That is the last ayah of the Quran.', 'এটিই কুরআনের শেষ আয়াত।', 'هذه آخر آية في القرآن.')
    : t('That is the first ayah of the Quran.', 'এটিই কুরআনের প্রথম আয়াত।', 'هذه أول آية في القرآن.'),
  followUpNone: t(
    'Which ayah or surah do you mean? Please name it first, for example "Surah An-Naas" or "2:255".',
    'কোন আয়াত বা সূরার কথা বলছেন? আগে সেটার নাম লিখুন, যেমন "সূরা নাস" বা "2:255"।',
    'أي آية أو سورة تقصد؟ اذكرها أولًا، مثل "سورة الناس" أو "2:255".'),
  notFound: t(
    'I could not find anything in the Quran about this. I can only answer from the Quran text: try a topic (patience, mercy, parents), a surah ("Surah Al-Ikhlas"), a reference ("2:255") or a number ("how many ayahs in Al-Baqarah?").',
    'কুরআনে এ বিষয়ে কিছু খুঁজে পাইনি। আমি শুধু কুরআনের পাঠ থেকে উত্তর দিতে পারি: একটা বিষয় (ধৈর্য, রহমত, পিতা-মাতা), একটা সূরা ("সূরা ইখলাস"), একটা নম্বর ("2:255") বা সংখ্যা ("আল-বাকারায় কয়টি আয়াত?") জিজ্ঞেস করে দেখুন।',
    'لم أجد شيئًا في القرآن عن هذا. أجيب من نص القرآن فقط: جرّب موضوعًا (الصبر، الرحمة، الوالدين) أو سورة ("سورة الإخلاص") أو رقم آية ("2:255") أو عددًا ("كم آية في البقرة؟").'),
  dataNotUnderstood: t(
    'I can count things in the Quran, for example "how many ayahs are in Surah Al-Baqarah?", "how many Meccan surahs are there?", "how many times does the word patience appear?" or "how many animals does the Quran name?". Which one do you want?',
    'আমি কুরআনের সংখ্যা বলতে পারি, যেমন "সূরা বাকারায় কয়টি আয়াত?", "মক্কী সূরা কয়টি?", "ধৈর্য শব্দটি কতবার এসেছে?" বা "কুরআনে কয়টি প্রাণীর নাম আছে?"। কোনটা জানতে চান?',
    'أستطيع العدّ في القرآن، مثل "كم آية في سورة البقرة؟" أو "كم عدد السور المكية؟" أو "كم مرة وردت كلمة الصبر؟" أو "كم حيوانًا يذكر القرآن؟". أيّها تريد؟'),
  animalsHint: t(
    'To see which animals the Quran names, and how many, ask: "which animals are mentioned in the Quran?"',
    'কুরআনে কোন কোন প্রাণীর নাম আছে আর মোট কয়টি, তা জানতে জিজ্ঞেস করুন: "কুরআনে কোন কোন প্রাণীর নাম আছে?"',
    'لمعرفة الحيوانات التي يذكرها القرآن بأسمائها وعددها اسأل: "ما الحيوانات المذكورة في القرآن؟"'),
  scholar: t(
    'This is a question about a religious ruling. I cannot give a ruling or a fatwa. Please ask a qualified scholar.',
    'এটি ধর্মীয় বিধান সংক্রান্ত প্রশ্ন। আমি কোনো ফতোয়া বা রায় দিতে পারি না। অনুগ্রহ করে একজন যোগ্য আলেমকে জিজ্ঞেস করুন।',
    'هذا سؤال عن حكم شرعي. لا أستطيع إصدار فتوى أو حكم. يرجى سؤال عالم مؤهل.'),
  refuseMadeUp: t(
    'I will not write, complete or invent an ayah. The Quran is only what is in the Quran. I can show you real ayahs on a topic instead.',
    'আমি কোনো আয়াত লিখব না, পূরণ করব না বা বানাব না। কুরআন শুধু তা-ই যা কুরআনে আছে। তার বদলে কোনো বিষয়ে আসল আয়াত দেখাতে পারি।',
    'لن أكتب آية ولن أُكملها ولن أختلقها. القرآن هو ما ورد في القرآن فقط. يمكنني أن أعرض عليك آيات حقيقية عن موضوع ما.'),
  crisis: t(
    'I am really sorry that you are going through this. You do not have to carry it alone. Please talk to someone you trust right now, or contact your local emergency number or a crisis line. If you might be in danger, please call emergency services at once.',
    'আপনি যে কষ্টের মধ্য দিয়ে যাচ্ছেন সেজন্য আমি সত্যিই দুঃখিত। এটা একা বহন করতে হবে না। এখনই কোনো বিশ্বস্ত মানুষের সাথে কথা বলুন, অথবা আপনার এলাকার জরুরি নম্বরে বা কোনো সহায়তা-হটলাইনে যোগাযোগ করুন। আপনি বিপদে থাকতে পারেন মনে হলে এখনই জরুরি সেবায় ফোন করুন।',
    'يؤسفني جدًا ما تمرّ به. لست مضطرًا لتحمّله وحدك. تحدّث الآن مع شخص تثق به، أو اتصل برقم الطوارئ المحلي أو بخط مساعدة. إن كنت في خطر فاتصل بالطوارئ فورًا.'),
  greeting: t(`Hello! ${GREETING_BODY.en}`, `আসসালামু আলাইকুম! ${GREETING_BODY.bn}`, `أهلًا! ${GREETING_BODY.ar}`),
  greetingBody: GREETING_BODY,
  // A little conversation, in a humble manner (src/conversation.ts). Honest that it is a program: "all is well here",
  // never "I feel fine". A greeting word in the message is answered first (OPENER), then the rest.
  opener: {
    salam: t('Wa alaikum assalam wa rahmatullah!', 'ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহ!', 'وعليكم السلام ورحمة الله!'),
    hello: t('Hello!', 'আসসালামু আলাইকুম!', 'أهلًا!'),
    morning: t('Good morning!', 'শুভ সকাল!', 'صباح الخير!'),
    afternoon: t('Good afternoon!', 'শুভ অপরাহ্ন!', 'مساء الخير!'),
    evening: t('Good evening!', 'শুভ সন্ধ্যা!', 'مساء الخير!'),
  },
  howAreYou: t(
    `Alhamdulillah, all is well here, and thank you for asking! I am only a small program for reading the Quran, but I am always here to help. ${HOW_ARE_YOU.en}`,
    `আলহামদুলিল্লাহ, এখানে সব ঠিক আছে, জিজ্ঞেস করার জন্য ধন্যবাদ! আমি কুরআন পড়ার একটি ছোট প্রোগ্রাম মাত্র, তবে সাহায্য করতে সবসময় আছি। ${HOW_ARE_YOU.bn}`,
    `الحمد لله، كل شيء بخير هنا، وشكرًا لسؤالك! أنا مجرد برنامج صغير لقراءة القرآن، لكنني هنا دائمًا لمساعدتك. ${HOW_ARE_YOU.ar}`),
  /** The question that ends MSG.howAreYou: after it, a short "good" or "ভালো" is the person's answer. */
  howAreYouAsked: HOW_ARE_YOU,
  userWell: t(
    `Alhamdulillah, I am glad to hear that! ${READ_TODAY.en}`,
    `আলহামদুলিল্লাহ, শুনে ভালো লাগলো! ${READ_TODAY.bn}`,
    `الحمد لله، يسعدني سماع ذلك! ${READ_TODAY.ar}`),
  userWellBack: t(
    `Alhamdulillah, I am glad to hear that! All is well here too, thank you for asking. ${READ_TODAY.en}`,
    `আলহামদুলিল্লাহ, শুনে ভালো লাগলো! এখানেও সব ঠিক আছে, জিজ্ঞেস করার জন্য ধন্যবাদ। ${READ_TODAY.bn}`,
    `الحمد لله، يسعدني سماع ذلك! وكل شيء بخير هنا أيضًا، شكرًا لسؤالك. ${READ_TODAY.ar}`),
  /** Before the ayahs about hardship and comfort, when the person says they are not well. */
  sorryToHear: t('I am sorry to hear that. May Allah make it easy for you.', 'শুনে খারাপ লাগলো। আল্লাহ আপনার জন্য সহজ করে দিন।', 'يؤسفني سماع ذلك. يسّر الله أمرك.'),
  bye: t(
    'Allah Hafiz, and thank you for visiting! Come back any time you want to read from the Quran.',
    'আল্লাহ হাফেজ, আসার জন্য ধন্যবাদ! কুরআন থেকে কিছু পড়তে চাইলে যেকোনো সময় আবার আসবেন।',
    'في أمان الله، وشكرًا لزيارتك! عُد متى شئت لتقرأ من القرآن.'),
  goodNight: t(
    'Good night! May Allah keep you safe. Come back any time you want to read from the Quran.',
    'শুভ রাত্রি! আল্লাহ আপনাকে ভালো রাখুন। কুরআন থেকে কিছু পড়তে চাইলে যেকোনো সময় আবার আসবেন।',
    'تصبح على خير! حفظك الله. عُد متى شئت لتقرأ من القرآن.'),
  sorry: t('No problem at all! Please ask whatever you like, in your own words.', 'কোনো সমস্যা নেই! নিজের মতো করে যা ইচ্ছা জিজ্ঞেস করুন।', 'لا بأس أبدًا! اسأل ما شئت بكلماتك.'),
  areYouThere: t('Yes, I am here! How can I help you?', 'জি, আমি এখানে আছি! কীভাবে সাহায্য করতে পারি?', 'نعم، أنا هنا! كيف أستطيع مساعدتك؟'),
  whatDoing: t(
    'I am here, ready to help you read the Quran. What would you like to read?',
    'আমি এখানে আছি, কুরআন পড়তে আপনাকে সাহায্য করার জন্য প্রস্তুত। কী পড়তে চান?',
    'أنا هنا، مستعد لمساعدتك في قراءة القرآن. ماذا تحب أن تقرأ؟'),
  niceToMeet: t(
    'Nice to meet you too! I am here whenever you want to read from the Quran.',
    'আপনার সাথে পরিচিত হয়ে আমারও ভালো লাগলো! কুরআন থেকে কিছু পড়তে চাইলে আমি সবসময় আছি।',
    'وأنا أيضًا سعيد بلقائك! أنا هنا متى أردت أن تقرأ من القرآن.'),
  ack: t('All right! I am here whenever you have a question about the Quran.', 'আচ্ছা! কুরআন নিয়ে কোনো প্রশ্ন থাকলে জিজ্ঞেস করবেন, আমি আছি।', 'حسنًا! أنا هنا متى كان لديك سؤال عن القرآن.'),
  jazakallah: t('Wa iyyakum! It was my pleasure. Ask me anything else about the Quran.', 'ওয়া ইয়্যাকুম! কুরআন সম্পর্কে আরও কিছু জানতে চাইলে জিজ্ঞেস করুন।', 'وإياكم! اسألني عن أي شيء آخر في القرآن.'),
  // Talking to the assistant itself: a short answer that leads back to the Quran (src/engine.ts, "talk to the assistant").
  myName: t(
    'My name is Quran Assistant, from Amal. I am a small program that searches the Quran text and shows real ayahs with a translation. Ask me about a topic (for example patience or mercy), a surah or an ayah, or a number.',
    'আমার নাম কুরআন সহকারী, Amal-এর পক্ষ থেকে। আমি একটি ছোট প্রোগ্রাম: কুরআনের পাঠে খুঁজে আসল আয়াত অনুবাদসহ দেখাই। কোনো বিষয় (যেমন ধৈর্য বা রহমত), কোনো সূরা বা আয়াত, কিংবা কোনো সংখ্যা জিজ্ঞেস করুন।',
    'اسمي مساعد القرآن، من Amal. أنا برنامج صغير يبحث في نص القرآن ويعرض آيات حقيقية مع ترجمة. اسألني عن موضوع (مثل الصبر أو الرحمة) أو سورة أو آية أو عدد.'),
  personal: t(
    'I am a computer program, not a person: I have no age, faith, feelings or favourite things of my own, and I do not pray. What I can do is show you what the Quran says, for example "ayahs about prayer" or "ayahs about patience".',
    'আমি একটি কম্পিউটার প্রোগ্রাম, মানুষ নই: আমার নিজের বয়স, ধর্মবিশ্বাস, অনুভূতি বা পছন্দের কিছু নেই, আর আমি নামাজ পড়ি না। আমি যা পারি তা হলো কুরআন কী বলে তা দেখানো, যেমন "নামাজ নিয়ে আয়াত" বা "ধৈর্য নিয়ে আয়াত"।',
    'أنا برنامج حاسوبي ولست إنسانًا: ليس لي عمر ولا دين ولا مشاعر ولا أشياء مفضلة، ولا أصلي. ما أستطيعه هو أن أعرض لك ما يقوله القرآن، مثل "آيات عن الصلاة" أو "آيات عن الصبر".'),
  compliment: t(
    'Thank you, that is kind of you! Ask me anything about the Quran.',
    'ধন্যবাদ, আপনার কথায় খুশি হলাম! কুরআন সম্পর্কে যা ইচ্ছা জিজ্ঞেস করুন।',
    'شكرًا، هذا لطف منك! اسألني ما شئت عن القرآن.'),
  chat: t(
    'Sorry, I am only a Quran assistant, so I cannot chat about that, tell jokes or give my own opinion. I can show you ayahs on a topic, a surah or an ayah, the story of a prophet, or numbers about the Quran. Type "help" to see examples.',
    'দুঃখিত, আমি শুধু একটি কুরআন সহকারী, তাই এ নিয়ে গল্প করতে, কৌতুক বলতে বা নিজের মত দিতে পারি না। আমি কোনো বিষয়ে আয়াত, কোনো সূরা বা আয়াত, নবীদের কাহিনী, কিংবা কুরআনের নানা সংখ্যা দেখাতে পারি। উদাহরণ দেখতে "সাহায্য" লিখুন।',
    'عذرًا، أنا مساعد للقرآن فقط، فلا أستطيع الدردشة في ذلك أو قول النكات أو إبداء رأيي. أستطيع أن أعرض آيات عن موضوع، أو سورة أو آية، أو قصة نبي، أو أرقامًا عن القرآن. اكتب "مساعدة" لترى أمثلة.'),
  thanks: t('You are welcome! Ask me anything else about the Quran.', 'আপনাকেও ধন্যবাদ! কুরআন সম্পর্কে আরও কিছু জানতে চাইলে জিজ্ঞেস করুন।', 'عفوًا! اسألني عن أي شيء آخر في القرآن.'),
  // "What is this chatbot about?": what it is, what to ask (every quoted example is answered: test/terms.test.ts),
  // what it does not do. A link to /terms comes with it.
  about: t(
    'I am Quran Assistant from Amal, a free study tool for the Quran. I search the Arabic text of the whole Quran (6236 ayahs) and show real ayahs with the English translation (Saheeh International) and the Bengali translation (Dr. Abu Bakr Muhammad Zakaria), and I count things in the text. No AI writes my answers: every ayah comes from the published text and every sentence was written by people.\nYou can ask me for example:\n• a surah or an ayah: "Surah Yasin", "2:255", then "show more" or "next ayah"\n• a topic: "patience", "ayahs about prayer", "dua for parents"\n• the story of a prophet: "story of Yusuf"\n• numbers: "how many ayahs are in Al-Baqarah?", "which prophets are mentioned in the Quran?", "how many times is Musa mentioned?"\n• an explanation: "explain 2:255" (the translators\' own notes, word for word)\nI understand English, Bengali (also Banglish) and Arabic, and you can also ask by voice (🎤).\nI am not a religious authority: I give no rulings, hadith or tafsir of my own; for those, please ask a qualified scholar. The Terms & privacy page has the details.',
    'আমি Amal-এর কুরআন সহকারী, কুরআন পড়া ও জানার একটি ফ্রি সহায়ক। আমি পুরো কুরআনের (৬২৩৬টি আয়াত) আরবি পাঠে খুঁজে আসল আয়াত দেখাই, সঙ্গে ইংরেজি (সহীহ ইন্টারন্যাশনাল) ও বাংলা (ড. আবু বকর মুহাম্মাদ যাকারিয়া) অনুবাদ, আর পাঠের নানা কিছু গুনে বলি। কোনো AI আমার উত্তর লেখে না: প্রতিটি আয়াত প্রকাশিত পাঠ থেকে আসে, প্রতিটি বাক্য মানুষের লেখা।\nযেমন জিজ্ঞেস করতে পারেন:\n• সূরা বা আয়াত: "সূরা ইয়াসিন", "2:255", তারপর "আরও দেখাও" বা "পরের আয়াত"\n• বিষয়: "ধৈর্য নিয়ে আয়াত", "নামাজ নিয়ে আয়াত"\n• নবীর কাহিনী: "ইউসুফ নবীর কাহিনী"\n• সংখ্যা: "সূরা বাকারায় কয়টি আয়াত?", "কুরআনে কতজন নবীর নাম আছে?", "কুরআনে মূসা নবীর নাম কতবার এসেছে?"\n• ব্যাখ্যা: "2:255 এর ব্যাখ্যা" (অনুবাদকের নিজের টীকা, হুবহু)\nআমি ইংরেজি, বাংলা (বাংলিশও) ও আরবি বুঝি, আর 🎤 দিয়ে বলেও জিজ্ঞেস করা যায়।\nআমি কোনো ধর্মীয় কর্তৃপক্ষ নই: নিজে থেকে ফতোয়া, হাদীস বা তাফসীর দিই না; সেজন্য একজন যোগ্য আলেমকে জিজ্ঞেস করুন। বিস্তারিত শর্তাবলী ও গোপনীয়তার পাতায়।',
    'أنا مساعد القرآن من Amal، أداة مجانية لدراسة القرآن. أبحث في النص العربي للقرآن كله (6236 آية) وأعرض آيات حقيقية مع الترجمة الإنجليزية (صحيح إنترناشيونال) والترجمة البنغالية (د. أبو بكر محمد زكريا)، وأعدّ أشياء في النص. لا يكتب أجوبتي أي ذكاء اصطناعي: كل آية من النص المنشور وكل جملة كتبها بشر.\nيمكنك أن تسأل مثلًا:\n• سورة أو آية: "سورة يس"، "2:255"، ثم "المزيد" أو "الآية التالية"\n• موضوع: "آيات عن الصبر"\n• قصة نبي: "قصة يوسف"\n• أرقام: "كم آية في سورة البقرة؟"، "ما الأنبياء المذكورون في القرآن؟"، "كم مرة ذكر اسم موسى في القرآن"\n• شرح: "شرح 2:255" (ملاحظات المترجم نفسه بنصها)\nأفهم الإنجليزية والبنغالية والعربية، ويمكنك السؤال بالصوت أيضًا (🎤).\nلست مرجعًا دينيًا: لا أفتي ولا أنقل حديثًا ولا أفسّر من عندي؛ لذلك اسأل عالمًا مؤهلًا. التفاصيل في صفحة الشروط والخصوصية.'),
  // "What are your terms?", "do you store my questions?": the short version; the link to /terms comes with it.
  termsShort: t(
    'In short: this assistant is a free study tool, not a religious authority. The text of your questions is not saved; there are no accounts, no saved chats and no ads. To understand a follow-up, your browser sends the last three questions and answers with a new question, and they are used for that answer only. The server log keeps only the kind of answer, the language, the number of ayahs, the time and the length of a question. Voice is turned into text by your browser (Chrome and Edge use Google\'s or Microsoft\'s speech service for that). The Terms & privacy page has the details.',
    'সংক্ষেপে: এই সহকারী একটি ফ্রি শেখার সহায়ক, কোনো ধর্মীয় কর্তৃপক্ষ নয়। আপনার প্রশ্নের লেখা সংরক্ষণ করা হয় না; কোনো অ্যাকাউন্ট নেই, চ্যাট জমা থাকে না, বিজ্ঞাপনও নেই। পরের প্রশ্ন বুঝতে আপনার ব্রাউজার নতুন প্রশ্নের সঙ্গে আগের তিনটি প্রশ্ন ও উত্তর পাঠায়; সেগুলো শুধু ওই উত্তরের জন্য ব্যবহার হয়। সার্ভারের লগে থাকে শুধু উত্তরের ধরন, ভাষা, আয়াতের সংখ্যা, সময় আর প্রশ্নের দৈর্ঘ্য। কণ্ঠস্বরকে লেখায় রূপ দেয় আপনার ব্রাউজার (Chrome ও Edge এর জন্য Google বা Microsoft-এর সেবা ব্যবহার করে)। বিস্তারিত শর্তাবলী ও গোপনীয়তার পাতায়।',
    'باختصار: هذا المساعد أداة مجانية للدراسة، وليس مرجعًا دينيًا. لا يُحفظ نص أسئلتك؛ لا حسابات ولا محادثات محفوظة ولا إعلانات. لفهم سؤال متابعة يرسل متصفحك آخر ثلاثة أسئلة وأجوبة مع السؤال الجديد، وتُستعمل لذلك الجواب فقط. لا يحفظ سجل الخادم إلا نوع الجواب واللغة وعدد الآيات والوقت وطول السؤال. يحوّل متصفحك الصوت إلى نص (يستعمل Chrome وEdge خدمة Google أو Microsoft لذلك). التفاصيل في صفحة الشروط والخصوصية.'),
  termsLink: t('Terms & privacy', 'শর্তাবলী ও গোপনীয়তা', 'الشروط والخصوصية'),
};

/**
 * The tappable suggestions under an answer (src/engine.ts, `suggest`). Each one is a question the assistant answers:
 * test/suggestions.test.ts asks every one of them after a sample question and checks that it works.
 */
export const SUGGEST = {
  starters: { en: ['Ayat al-Kursi', 'ayahs about patience', 'story of Yusuf'], bn: ['আয়াতুল কুরসি', 'ধৈর্য নিয়ে আয়াত', 'ইউসুফ নবীর কাহিনী'], ar: ['آية الكرسي', 'آيات عن الصبر', 'قصة يوسف'] } as Record<Lang, string[]>,
  facts: {
    en: ['how many animals are mentioned in the Quran?', 'which prophets are mentioned in the Quran?', 'what is the most used word in the Quran?', 'how many sajdah ayahs are in the Quran?'],
    bn: ['কুরআনে কয়টি প্রাণীর নাম আছে?', 'কুরআনে কতজন নবীর নাম আছে?', 'কুরআনে সবচেয়ে বেশি ব্যবহৃত শব্দ কোনটি?', 'কুরআনে কয়টি সিজদার আয়াত আছে?'],
    ar: ['كم حيوانا ذكر في القرآن؟', 'ما الأنبياء المذكورون في القرآن؟', 'ما أكثر كلمة تكررت في القرآن؟', 'كم عدد آيات السجدة في القرآن؟'],
  } as Record<Lang, string[]>,
  more: t('show more', 'আরও দেখাও', 'المزيد'),
  nextAyah: t('next ayah', 'পরের আয়াত', 'الآية التالية'),
  nextSurah: t('next surah', 'পরের সূরা', 'السورة التالية'),
  explain: (ref: string): T => t(`explain ${ref}`, `${ref} এর ব্যাখ্যা`, `شرح ${ref}`),
  inEnglish: t('in English', 'ইংরেজিতে', 'بالإنجليزية'),
  inBengali: t('in Bengali', 'বাংলায়', 'بالبنغالية'),
  arabicOnly: t('only Arabic', 'শুধু আরবি', 'بالعربية فقط'),
};

export const STAT_TEXT = {
  neighbor: (name: string, dir: 'after' | 'before', other: string, no: number): T => t(
    `${dir === 'after' ? 'After' : 'Before'} Surah ${name} comes Surah ${no}, ${other}.`,
    `সূরা ${name}-এর ${dir === 'after' ? 'পরের' : 'আগের'} সূরা ${bd(no)}, ${other}।`,
    `${dir === 'after' ? 'بعد' : 'قبل'} سورة ${name} تأتي سورة ${no}، ${other}.`),
  noNeighbor: (name: string, dir: 'after' | 'before'): T => t(
    `Surah ${name} is the ${dir === 'after' ? 'last' : 'first'} surah, so there is none ${dir} it.`,
    `সূরা ${name} ${dir === 'after' ? 'শেষ' : 'প্রথম'} সূরা, তাই এর ${dir === 'after' ? 'পরে' : 'আগে'} কোনো সূরা নেই।`,
    `سورة ${name} هي ${dir === 'after' ? 'الأخيرة' : 'الأولى'}، فلا سورة ${dir === 'after' ? 'بعدها' : 'قبلها'}.`),
  longestAyah: (ref: string, words: number): T => t(
    `The longest ayah is ${ref} (${words} words in the Arabic text used here).`,
    `সবচেয়ে দীর্ঘ আয়াত ${ref} (এখানকার আরবি পাঠে ${bd(words)}টি শব্দ)।`,
    `أطول آية هي ${ref} (${words} كلمة في النص العربي المستخدم هنا).`),
  shortestAyah: t(
    'By letter count in the Tanzil text, the shortest ayahs are two-letter opening ayahs (Huruf al-Muqatta\'at): 20:1 (طه), 36:1 (يسٓ), and حمٓ in 40:1–46:1. Among single-word ayahs that are not disconnected letters, Surah Ar-Rahmaan 55:64 (مُدْهَامَّتَانِ — "Dark green [in color]") is widely cited.',
    'তানযিলের আরবি পাঠে অক্ষর সংখ্যার দিক থেকে সবচেয়ে ছোট আয়াতগুলো হলো দুই অক্ষরের হুরুফে মুকাত্তাআত: 20:1 (طه), 36:1 (يسٓ) এবং 40:1–46:1 (حمٓ)। আর বিচ্ছিন্ন অক্ষর বাদে এক শব্দের আয়াত হিসেবে সূরা রহমানের 55:64 (مُدْهَامَّتَانِ — "ঘন সবুজ") প্রসিদ্ধ।',
    'من حيث عدد الحروف في نص تنزيل، أقصر الآيات هي الحروف المقطعة ذات الحرفين: 20:1 (طه) و36:1 (يسٓ) و(حمٓ) في 40:1–46:1. ومن غير الحروف المقطعة تُذكر آية الكلمة الواحدة في سورة الرحمن 55:64 (مُدْهَامَّتَانِ).'),
  noBismillah: t(
    'Surah 9, At-Tawba (التوبة), is the only surah in the Quran that does not begin with Bismillah.',
    'সূরা ৯, আত-তাওবা (التوبة) কুরআনের একমাত্র সূরা যার শুরুতে বিসমিল্লাহ নেই।',
    'سورة التوبة (رقم 9) هي السورة الوحيدة في القرآن التي لا تبدأ بالبسملة.'),
  twoBismillahs: t(
    'Surah 27, An-Naml (النمل), contains Bismillah twice: once at its opening, and once inside ayah 27:30 (in Sulaiman\'s letter, shown below).',
    'সূরা ২৭, আন-নামল (النمل)-এ দুইবার বিসমিল্লাহ আছে: একবার সূরার শুরুতে এবং আরেকবার 27:30 নম্বর আয়াতের ভেতরে (সুলাইমান আ.-এর চিঠিতে, নিচে দেখানো হলো)।',
    'سورة النمل (رقم 27) وردت فيها البسملة مرتين: مرة في بدايتها ومرة في الآية 27:30 (في كتاب سليمان، معروضة أدناه).'),
  firstLastSurah: (which: 'first' | 'last', no: number, name: string, ar: string, ayahs: number, type: string): T => which === 'first'
    ? t(`The first surah of the Quran is Surah ${no}, ${name} (${ar}) — ${ayahs} ayahs, ${type}.`, `কুরআনের প্রথম সূরা হলো সূরা ${bd(no)}, ${name} (${ar}) — ${bd(ayahs)}টি আয়াত, ${type}।`, `أول سورة في القرآن هي سورة ${ar} (رقم ${no}) — ${ayahs} آيات، ${type}.`)
    : t(`The last surah of the Quran is Surah ${no}, ${name} (${ar}) — ${ayahs} ayahs, ${type}.`, `কুরআনের শেষ সূরা হলো সূরা ${bd(no)}, ${name} (${ar}) — ${bd(ayahs)}টি আয়াত, ${type}।`, `آخر سورة في القرآن هي سورة ${ar} (رقم ${no}) — ${ayahs} آيات، ${type}.`),
  surahWordCount: (name: string, words: number, letters: number): T => t(
    `Surah ${name} has about ${words} words and ${letters} letters in the Arabic text used here (Tanzil simple-clean). Counts differ slightly across mushaf scripts and counting rules.`,
    `এখানে ব্যবহৃত আরবি পাঠে (তানযিল) সূরা ${name}-এ প্রায় ${bd(words)}টি শব্দ এবং ${bd(letters)}টি হরফ আছে। মুসহাফ ও গোনার পদ্ধতিভেদে সংখ্যা সামান্য ভিন্ন হতে পারে।`,
    `في سورة ${name} نحو ${words} كلمة و${letters} حرفًا في النص العربي المستخدم هنا (تنزيل). وقد تختلف الأعداد قليلًا باختلاف الرسم وطريقة العدّ.`),
  juzSurahs: (n: number, count: number, first: string, last: string): T => t(
    `Juz (para) ${n} contains parts or all of ${count} ${count === 1 ? 'surah' : 'surahs'} (from ${first} to ${last}).`,
    `${bd(n)} নম্বর পারায় (জুয) মোট ${bd(count)}টি সূরা রয়েছে (${first} থেকে ${last} পর্যন্ত)।`,
    `يحتوي الجزء ${n} على ${count} سورة (من ${first} إلى ${last}).`),
  surahNamedWoman: t(
    'Surah 19, Maryam (مريم — 98 ayahs, Meccan), is the only surah in the Quran named after a woman (Maryam, mother of Prophet Isa).',
    'সূরা ১৯, মারইয়াম (مريم — ৯৮টি আয়াত, মক্কী) কুরআনের একমাত্র সূরা যা একজন নারীর নামে নামকরণ করা হয়েছে (নবী ঈসা আ.-এর মাতা মারইয়াম)।',
    'سورة مريم (رقم 19، 98 آية، مكية) هي السورة الوحيدة في القرآن المسمّاة باسم امرأة (مريم أم عيسى عليهما السلام).'),
  surahsNamedProphets: t(
    'Six surahs in the Quran are named after prophets: 10 Yunus, 11 Hud, 12 Yusuf, 14 Ibrahim, 47 Muhammad, and 71 Nooh. (Surah 19 Maryam is named after Maryam, and Surah 31 Luqman after Luqman.)',
    'কুরআনের ৬টি সূরা নবীদের নামে নামকরণ করা হয়েছে: ১০ ইউনুস, ১১ হূদ, ১২ ইউসুফ, ১৪ ইবরাহীম, ৪৭ মুহাম্মাদ এবং ৭১ নূহ। (এছাড়া সূরা ১৯ মারইয়াম এবং সূরা ৩১ লুকমান নামে রয়েছে।)',
    'ست سور في القرآن مسمّاة بأسماء أنبياء: 10 يونس، 11 هود، 12 يوسف، 14 إبراهيم، 47 محمد، و71 نوح. (وتوجد أيضًا سورة مريم 19 وسورة لقمان 31).'),
  surahAllahEveryAyah: (count: number): T => t(
    `Surah 58, Al-Mujaadila (المجادلة — ${count} ayahs, Medinan), is the only surah in the Quran in which the name Allah (الله) appears in every single ayah.`,
    `সূরা ৫৮, আল-মুজাদালাহ (المجادلة — ${bd(count)}টি আয়াত, মাদানী) কুরআনের একমাত্র সূরা যার প্রতিটি আয়াতে "আল্লাহ" (الله) নামটি রয়েছে।`,
    `سورة المجادلة (رقم 58، ${count} آية، مدنية) هي السورة الوحيدة في القرآن التي ورد فيها لفظ الجلالة «الله» في كل آية منها.`),
  manzils: t(
    'The Quran is traditionally divided into 7 manzils (roughly equal portions for completing recitation in one week). Manzil markings are reading divisions in printed mushafs and are not stored in the ayah dataset used here.',
    'সাত দিনে পুরো কুরআন খতম করার সুবিধার্থে ঐতিহ্যগতভাবে কুরআনকে ৭টি মনযিলে ভাগ করা হয়েছে। মনযিল মূলত মুসহাফে পাঠের সুবিধার বিভাজন, যা এখানকার মূল আয়াত-ডেটায় আলাদাভাবে সংরক্ষিত নেই।',
    'يُقسَّم القرآن تقليديًا إلى 7 منازل لتسهيل ختمه في أسبوع. والمنازل تقسيم قرائي في المصاحف وليست مخزّنة كبيانات منفصلة هنا.'),
  rukus: t(
    'Many printed mushafs (especially South Asian / Indo-Pak editions) divide the Quran into 558 rukus (thematic sections), while some editions count 540. Ruku markings are editorial reading divisions and are not stored in the Tanzil dataset used here.',
    'দক্ষিণ এশিয়ার প্রচলিত মুসহাফগুলোতে কুরআনে সাধারণত ৫৫৮টি রুকু (বিষয়ভিত্তিক অনুচ্ছেদ) চিহ্নিত থাকে (কিছু মুসহাফে ৫৪০টি)। রুকু মূলত পাঠের সুবিধার বিভাজন, যা এখানকার তানযিল ডেটায় আলাদাভাবে সংরক্ষিত নেই।',
    'تُقسِّم كثير من المصاحف المطبوعة (خاصة في شبه القارة الهندية) القرآن إلى 558 ركوعًا (مقاطع موضوعية)، وتذكر بعض الطبعات 540. والركوع تقسيم قرائي غير مخزّن في بيانات تنزيل المستخدمة هنا.'),
  // The sajdah places: the NUMBER and the places come from Tanzil's data (15). Why other counts exist (15, 14, 11, and which
  // places they differ on) is from fiqh sources: fiqh.islamonline.net ("سجود التلاوة: الحكم والمواضع") and binbaz.org.sa
  // fatwa 12469. It names the places of disagreement and does NOT say which count is right (that would be a ruling).
  // HAVE THIS CHECKED by a person with religious knowledge. Tanzil also marks 4 places "obligatory": that follows one
  // school's ruling, so it is never shown.
  sajdaCount: (n: number): T => t(
    `The list of the Tanzil project marks ${n} places of prostration (sajdah) in the Quran. Scholars count them differently: 15, 14 or 11, mainly because of the second sajdah of Surah Al-Hajj (22:77), the sajdah of Surah Sad (38:24) and the three in the short surahs near the end (53:62, 84:21, 96:19). I do not decide which count is right: please ask a qualified scholar.`,
    `তানযিল প্রকল্পের তালিকায় কুরআনে ${bd(n)}টি সিজদার স্থান চিহ্নিত আছে। আলেমগণ ভিন্নভাবে গোনেন: ১৫, ১৪ বা ১১টি; মতভেদ মূলত সূরা হজ্জের দ্বিতীয় সিজদা (22:77), সূরা সোয়াদের সিজদা (38:24) এবং শেষের দিকের ছোট সূরাগুলোর তিনটি সিজদা (53:62, 84:21, 96:19) নিয়ে। কোন গণনা সঠিক তা আমি নির্ধারণ করি না: অনুগ্রহ করে একজন যোগ্য আলেমকে জিজ্ঞেস করুন।`,
    `تُحدِّد قائمة مشروع تنزيل ${n} موضعًا للسجود في القرآن. ويختلف العلماء في عددها: 15 أو 14 أو 11، وأكثر الخلاف في السجدة الثانية من سورة الحج (22:77) وسجدة سورة ص (38:24) والسجدات الثلاث في المفصّل (53:62، 84:21، 96:19). لا أحكم أيّ العدد أصحّ: يرجى سؤال عالم مؤهل.`),
  sajdaList: t(
    'The sajdah ayahs (list of the Tanzil project, 15 places). Scholars count them differently (15, 14 or 11): ask "how many sajdah ayahs?" to see where they differ.',
    'সিজদার আয়াতগুলো (তানযিল প্রকল্পের তালিকা, ১৫টি স্থান)। আলেমগণ ভিন্নভাবে গোনেন (১৫, ১৪ বা ১১টি): কোথায় মতভেদ জানতে জিজ্ঞেস করুন "কয়টি সিজদার আয়াত?"।',
    'آيات السجدة (قائمة مشروع تنزيل، 15 موضعًا). ويختلف العلماء في عددها (15 أو 14 أو 11): اسأل "كم آية سجدة؟" لترى مواضع الخلاف.'),
  pages: (n: number): T => t(`The Quran has ${n} pages in the Madani mushaf (data of the Tanzil project).`, `মাদানী মুসহাফে কুরআনের ${bd(n)}টি পৃষ্ঠা আছে (তানযিল প্রকল্পের তথ্য)।`, `في المصحف المدني ${n} صفحة (بيانات مشروع تنزيل).`),
  hizb: (h: number, q: number): T => t(`The Quran has ${h} hizb (${q} quarters of a hizb).`, `কুরআনে ${bd(h)}টি হিযব (${bd(q)}টি হিযবের চতুর্থাংশ) আছে।`, `في القرآن ${h} حزبًا (${q} ربعًا).`),
  juzAyahs: (n: number, count: number): T => t(`Juz ${n} has ${count} ayahs.`, `${bd(n)} নম্বর পারায় ${bd(count)}টি আয়াত আছে।`, `الجزء ${n} فيه ${count} آية.`),
  wordCount: (words: number, letters: number): T => t(
    `The Arabic text used here has about ${words} words and ${letters} letters. Counts differ between sources and ways of counting.`,
    `এখানে ব্যবহৃত আরবি পাঠে প্রায় ${bd(words)}টি শব্দ ও ${bd(letters)}টি হরফ আছে। উৎস ও গোনার পদ্ধতিভেদে সংখ্যা ভিন্ন হয়।`,
    `في النص العربي المستخدم هنا نحو ${words} كلمة و${letters} حرفًا. تختلف الأعداد بحسب المصدر وطريقة العدّ.`),
  surahList: (n: number, list: string): T => t(`The ${n} surahs: ${list}.`, `${bd(n)}টি সূরা: ${list}।`, `السور (${n}): ${list}.`),
  typeList: (type: 'meccan' | 'medinan', n: number, list: string): T => t(
    `The ${n} ${type === 'meccan' ? 'Meccan' : 'Medinan'} surahs: ${list}.`,
    `${bd(n)}টি ${type === 'meccan' ? 'মক্কী' : 'মাদানী'} সূরা: ${list}।`,
    `السور ${type === 'meccan' ? 'المكية' : 'المدنية'} (${n}): ${list}.`),
  juzCount: t('The Quran has 30 juz (para).', 'কুরআনে ৩০টি পারা (জুয) আছে।', 'في القرآن 30 جزءًا.'),
  surahFacts: (name: string, no: number, meaning: string, n: number, type: string, juz: number): T => t(
    `Surah ${name} (number ${no}, "${meaning}") has ${n} ayahs. It is ${type} and begins in juz ${juz}.`,
    `সূরা ${name} (ক্রমিক ${bd(no)}, অর্থ "${meaning}")-তে ${bd(n)}টি আয়াত আছে। এটি ${type} সূরা এবং ${bd(juz)} নম্বর পারায় শুরু হয়েছে।`,
    `سورة ${name} (رقمها ${no}، معناها "${meaning}") فيها ${n} آية. هي ${type} وتبدأ في الجزء ${juz}.`),
  surahCount: (name: string, n: number, type: string): T => t(
    `Surah ${name} has ${n} ayahs (${type}).`, `সূরা ${name}-তে ${bd(n)}টি আয়াত আছে (${type})।`, `سورة ${name} فيها ${n} آية (${type}).`),
  extreme: (which: 'most' | 'fewest', names: string, n: number): T => t(
    `The surah${names.includes(',') ? 's' : ''} with the ${which === 'most' ? 'most' : 'fewest'} ayahs: ${names} (${n} ayahs${names.includes(',') ? ' each' : ''}).`,
    `${which === 'most' ? 'সবচেয়ে বেশি' : 'সবচেয়ে কম'} আয়াত যে সূরায়: ${names} (${bd(n)}টি আয়াত)।`,
    `السورة ${which === 'most' ? 'الأطول' : 'الأقصر'}: ${names} (${n} آية).`),
  revelation: (m: number, d: number, ma: number, da: number): T => t(
    `There are ${m} Meccan surahs (${ma} ayahs) and ${d} Medinan surahs (${da} ayahs), according to the Tanzil chapter data.`,
    `তানযিলের তথ্য অনুযায়ী মক্কী সূরা ${bd(m)}টি (${bd(ma)}টি আয়াত) এবং মাদানী সূরা ${bd(d)}টি (${bd(da)}টি আয়াত)।`,
    `حسب بيانات تنزيل: ${m} سورة مكية (${ma} آية) و${d} سورة مدنية (${da} آية).`),
  totals: (s: number, a: number): T => t(`The Quran has ${s} surahs and ${a} ayahs.`, `কুরআনে ${bd(s)}টি সূরা এবং ${bd(a)}টি আয়াত আছে।`, `في القرآن ${s} سورة و${a} آية.`),
  word: (w: string, total: number, ayahs: number, src: string): T => t(
    `The word "${w}" appears ${total} times in ${ayahs} ayahs (${src}). Only this exact word form is counted, not other forms of the word.`,
    `"${w}" শব্দটি ${bd(ayahs)}টি আয়াতে মোট ${bd(total)} বার এসেছে (${src})। শুধু এই হুবহু রূপটি গোনা হয়েছে, শব্দের অন্য রূপ নয়।`,
    `وردت الكلمة "${w}" ${total} مرة في ${ayahs} آية (${src}). يُحتسب هذا الشكل بالضبط فقط.`),
  type: (type: 'meccan' | 'medinan'): T => type === 'meccan' ? t('Meccan', 'মক্কী', 'مكية') : t('Medinan', 'মাদানী', 'مدنية'),
  /** The animals named in the Quran (or in one surah), counted from the text by the rule in src/animals.ts. */
  /** `surah`: its name in Latin letters (English and Bengali sentences) and in Arabic (Arabic sentences), or null for the whole Quran. */
  animals: (n: number, names: string, surahName: { tr: string; ar: string } | null): T => {
    const surah = surahName?.tr ?? null, sAr = surahName?.ar ?? '';
    const how = t(
      'How this is counted: an animal counts when its name is in the Arabic of an ayah and also in its English translation (Saheeh International); each kind is counted once (a calf with the cow, a ewe with the sheep, a she-camel with the camel); general words such as birds, livestock and creatures are not counted. Other lists count in other ways, so they can give another number. The ayahs for each animal are listed below.',
      'গোনার নিয়ম: কোনো আয়াতের আরবি পাঠে এবং তার ইংরেজি অনুবাদেও (সহীহ ইন্টারন্যাশনাল) প্রাণীটির নাম থাকলে তা গোনা হয়েছে; প্রতিটি প্রাণী একবার গোনা হয়েছে (বাছুর গরুর সাথে, মাদি ভেড়া ভেড়ার সাথে, উটনী উটের সাথে); পাখি, গবাদি পশু, জীবজন্তুর মতো সাধারণ শব্দ গোনা হয়নি। অন্য তালিকা অন্যভাবে গোনে, তাই সংখ্যা ভিন্ন হতে পারে। প্রতিটি প্রাণীর আয়াত নিচে দেওয়া হলো।',
      'طريقة العدّ: يُعدّ الحيوان إذا ورد اسمه في النص العربي للآية وفي ترجمتها الإنجليزية أيضًا (صحيح إنترناشيونال)؛ ويُعدّ كل نوع مرة واحدة (العجل مع البقرة، والنعجة مع الضأن، والناقة مع الإبل)؛ ولا تُعدّ الكلمات العامة كالطير والأنعام والدواب. تعدّ قوائم أخرى بطرق أخرى فقد تختلف أرقامها. آيات كل حيوان مذكورة أدناه.');
    // نوع is masculine: نوعًا واحدًا, نوعين, 3-10 أنواع, 11 and more نوعًا
    const arKinds = n === 1 ? 'نوعًا واحدًا' : n === 2 ? 'نوعين' : n <= 10 ? `${n} أنواع` : `${n} نوعًا`;
    const head = surah === null
      ? t(`The Quran names ${n} kinds of animal: ${names}.`, `কুরআনে ${bd(n)} প্রকার প্রাণীর নাম আছে: ${names}।`, `يذكر القرآن ${arKinds} من الحيوانات بأسمائها: ${names}.`)
      : n === 0
        ? t(`I found no animal named in Surah ${surah}.`, `সূরা ${surah}-এ কোনো প্রাণীর নাম পাইনি।`, `لم أجد حيوانًا مذكورًا باسمه في سورة ${sAr}.`)
        : t(`Surah ${surah} names ${n} ${n === 1 ? 'kind' : 'kinds'} of animal: ${names}.`, `সূরা ${surah}-এ ${bd(n)} প্রকার প্রাণীর নাম আছে: ${names}।`, `تذكر سورة ${sAr} ${arKinds} من الحيوانات بأسمائها: ${names}.`);
    return t(`${head.en} ${how.en}`, `${head.bn} ${how.bn}`, `${head.ar} ${how.ar}`);
  },
  animalsMethod: 'Rule: the name is in the Arabic of the ayah AND in the Saheeh International translation of the same ayah. The list of kinds was made by hand and still has to be checked by a scholar.',
  /** "Which prophets are named in the Quran (in surah X)?": src/prophets.ts. The whole-Quran answer points to 40:78 (shown with it). */
  prophets: (n: number, names: string, surahName: { tr: string; ar: string } | null): T => {
    const surah = surahName?.tr ?? null, sAr = surahName?.ar ?? '';
    // نبي is masculine: نبيًا واحدًا, نبيين, 3-10 أنبياء, 11 and more نبيًا
    const arN = n === 1 ? 'نبيًا واحدًا' : n === 2 ? 'نبيين' : n <= 10 ? `${n} أنبياء` : `${n} نبيًا`;
    const head = surah === null
      ? t(`The Quran names ${n} prophets: ${names}.`, `কুরআনে ${bd(n)} জন নবীর নাম আছে: ${names}।`, `يذكر القرآن ${arN} بأسمائهم: ${names}.`)
      : n === 0
        ? t(`No prophet is named in Surah ${surah}.`, `সূরা ${surah}-এ কোনো নবীর নাম নেই।`, `لا يُذكر في سورة ${sAr} اسم نبي.`)
        : t(`Surah ${surah} names ${n} ${n === 1 ? 'prophet' : 'prophets'}: ${names}.`, `সূরা ${surah}-এ ${bd(n)} জন নবীর নাম আছে: ${names}।`, `تذكر سورة ${sAr} ${arN} بأسمائهم: ${names}.`);
    const notAll = surah === null
      ? t(' The Quran says that it has not told the stories of all the messengers (40:78, shown below).',
        ' কুরআনে বলা হয়েছে, সব রাসূলের কাহিনী এতে বলা হয়নি (40:78, নিচে দেওয়া হলো)।',
        ' ويذكر القرآن أنه لم يقصص أخبار الرسل كلهم (40:78، الآية أدناه).')
      : t('', '', '');
    const how = t(
      ' How this is counted: a name counts when it is in the Arabic of an ayah and also in its English translation (Saheeh International). The list of names was made by hand.',
      ' গোনার নিয়ম: কোনো আয়াতের আরবি পাঠে এবং তার ইংরেজি অনুবাদেও (সহীহ ইন্টারন্যাশনাল) নামটি থাকলে তা গোনা হয়েছে। নামের তালিকা হাতে তৈরি।',
      ' طريقة العدّ: يُعدّ الاسم إذا ورد في النص العربي للآية وفي ترجمتها الإنجليزية أيضًا (صحيح إنترناشيونال). قائمة الأسماء مُعدّة يدويًا.');
    return t(head.en + notAll.en + how.en, head.bn + notAll.bn + how.bn, head.ar + notAll.ar + how.ar);
  },
  /** "How many times is Musa mentioned (in surah X)?": src/prophets.ts. */
  prophetMentions: (items: Array<{ name: Record<Lang, string>; times: number; ayahs: number }>, surahName: { tr: string; ar: string } | null, shown: number, total: number): T => {
    const surah = surahName?.tr ?? null, sAr = surahName?.ar ?? '';
    const one = (x: (typeof items)[number]): T => x.ayahs === 0
      ? t(`The name ${x.name.en} is not in Surah ${surah}.`, `সূরা ${surah}-এ ${x.name.bn} নামটি নেই।`, `لم يرد اسم ${x.name.ar} في سورة ${sAr}.`)
      : t(
        `The name ${x.name.en} is in the Arabic text${surah ? ` of Surah ${surah}` : ''} ${enN(x.times, 'time', 'times')}, in ${enN(x.ayahs, 'ayah', 'ayahs')}.`,
        `${surah ? `সূরা ${surah}-এ` : 'কুরআনে'} ${x.name.bn} নামটি ${bd(x.ayahs)}টি আয়াতে মোট ${bd(x.times)} বার এসেছে।`,
        `ورد اسم ${x.name.ar} ${surah ? `في سورة ${sAr}` : 'في القرآن'} ${arTimes(x.times)} في ${arAyahs(x.ayahs)}.`);
    const how = t(
      'Counted in the Arabic text, with every spelling of the name (listed below), and only in ayahs whose English translation (Saheeh International) also has the name. A title such as "the Messiah" is not counted.',
      'আরবি পাঠে নামটির সব বানান (নিচে দেওয়া) গোনা হয়েছে, আর শুধু সেই আয়াতগুলো, যেগুলোর ইংরেজি অনুবাদেও (সহীহ ইন্টারন্যাশনাল) নামটি আছে। "মসীহ"-এর মতো উপাধি গোনা হয়নি।',
      'عُدّ في النص العربي بكل صور كتابة الاسم (مذكورة أدناه)، وفي الآيات التي يرد الاسم في ترجمتها الإنجليزية أيضًا (صحيح إنترناشيونال) فقط. لا تُعدّ الألقاب مثل "المسيح".');
    const first = shown > 0 && shown < total
      ? t(` Here are the first ${shown}.`, ` প্রথম ${bd(shown)}টি আয়াত দেখানো হলো।`, ` هذه أول ${shown} آيات.`)
      : t('', '', '');
    const join = (l: Lang) => `${items.map(one).map((h) => h[l]).join(' ')} ${how[l]}${first[l]}`;
    return t(join('en'), join('bn'), join('ar'));
  },
  /**
   * "What is the most used word in the Quran (in surah X)?": counted in the Arabic text by src/wordfreq.ts.
   * `most`: the most used form(s); `content`: the most used form(s) that are not small words; `allah`: the name with its
   * joined forms, when it is the most used content word; `next`: the content words after it.
   */
  wordFreq: (p: {
    surah: { tr: string; ar: string } | null; total: number;
    most: Array<{ word: string; n: number }>; content: Array<{ word: string; n: number }>;
    allah: { alone: number; all: number } | null; next: Array<{ word: string; n: number }>;
  }): T => {
    const arList = (l: Array<{ word: string }>) => l.map((w) => w.word).join('، ');
    const list = (l: Array<{ word: string }>) => l.map((w) => w.word).join(', ');
    const n1 = p.most[0]?.n ?? 0, n2 = p.content[0]?.n ?? 0;
    // the meaning of the most used word, for the common small words only (dictionary meanings: have them checked)
    const GLOSS: Record<string, { en: string; bn: string }> = {
      'من': { en: 'from, of', bn: 'থেকে' }, 'في': { en: 'in', bn: 'মধ্যে' }, 'ما': { en: 'what; not', bn: 'যা; না' },
      'لا': { en: 'no, not', bn: 'না' }, 'إن': { en: 'indeed', bn: 'নিশ্চয়' },
    };
    const g = p.most.length === 1 ? GLOSS[p.most[0].word] : undefined;
    const enHead = `In the Arabic text used here${p.surah ? `, in Surah ${p.surah.tr}` : ''} (${p.total} words), the most used ${p.most.length > 1 ? `words are ${list(p.most)}: ${n1} times each` : `word is ${list(p.most)}${g ? ` ("${g.en}")` : ''}: ${n1} times`}.`;
    const bnHead = `এখানে ব্যবহৃত আরবি পাঠে${p.surah ? ` সূরা ${p.surah.tr}-এ` : ''} (${bd(p.total)}টি শব্দ) সবচেয়ে বেশি ব্যবহৃত ${p.most.length > 1 ? `শব্দগুলো ${list(p.most)}: প্রতিটি ${bd(n1)} বার` : `শব্দ ${list(p.most)}${g ? ` ("${g.bn}")` : ''}: ${bd(n1)} বার`}।`;
    const arHead = `${p.most.length > 1 ? 'أكثر الكلمات استعمالًا' : 'أكثر كلمة استعمالًا'} في النص العربي المستخدم هنا${p.surah ? ` في سورة ${p.surah.ar}` : ''} (${arCount(p.total, 'كلمة', 'كلمتين', 'كلمات').replace(' واحدة', '')}) ${p.most.length > 1 ? `هي ${arList(p.most)}: ${arTimes(n1)} لكل منها` : `هي «${arList(p.most)}»: ${arTimes(n1)}`}.`;
    const sameAsMost = p.content.length === p.most.length && p.content.every((w, i) => w.word === p.most[i].word);
    const enContent = p.content.length === 0 || sameAsMost ? '' : ` Not counting small words (particles and pronouns such as من, في and ما), the most used ${p.content.length > 1 ? `words are ${list(p.content)}: ${n2} times each` : `word is ${list(p.content)}: ${n2} times`}.`;
    const bnContent = p.content.length === 0 || sameAsMost ? '' : ` ছোট শব্দগুলো (অব্যয় ও সর্বনাম, যেমন من, في, ما) বাদ দিলে সবচেয়ে বেশি ব্যবহৃত ${p.content.length > 1 ? `শব্দগুলো ${list(p.content)}: প্রতিটি ${bd(n2)} বার` : `শব্দ ${list(p.content)}: ${bd(n2)} বার`}।`;
    const arContent = p.content.length === 0 || sameAsMost ? '' : ` وبدون الكلمات الصغيرة (الحروف والضمائر مثل من وفي وما) ${p.content.length > 1 ? `فأكثرها ${arList(p.content)}: ${arTimes(n2)} لكل منها` : `فأكثرها «${arList(p.content)}»: ${arTimes(n2)}`}.`;
    const a = p.allah && p.allah.all > p.allah.alone ? p.allah : null;
    const enAllah = a ? ` With the forms that have a letter joined in front (والله, بالله, لله, تالله ...), the name Allah (الله) is there ${a.all} times.` : '';
    const bnAllah = a ? ` সামনে অক্ষর যুক্ত রূপগুলোসহ (والله, بالله, لله, تالله ...) আল্লাহ নামটি (الله) মোট ${bd(a.all)} বার এসেছে।` : '';
    const arAllah = a ? ` ومع الصيغ التي اتصل بها حرف (والله، بالله، لله، تالله...) ورد اسم الجلالة ${arTimes(a.all)}.` : '';
    const enNext = p.next.length ? ` Next come: ${p.next.map((w) => `${w.word} ${w.n}`).join(', ')}.` : '';
    const bnNext = p.next.length ? ` এরপর: ${p.next.map((w) => `${w.word} ${bd(w.n)}`).join(', ')}।` : '';
    const arNext = p.next.length ? ` ثم: ${p.next.map((w) => `${w.word} ${w.n}`).join('، ')}.` : '';
    const how = t(
      ' Each written form is counted on its own (الأرض and والأرض are counted apart), so other ways of counting give other numbers.',
      ' প্রতিটি লিখিত রূপ আলাদাভাবে গোনা হয়েছে (الأرض ও والأرض আলাদা), তাই অন্যভাবে গুনলে সংখ্যা ভিন্ন হয়।',
      ' تُعدّ كل صيغة مكتوبة وحدها (الأرض ووالأرض تُعدّان منفصلتين)، فتختلف الأرقام بطرق العدّ الأخرى.');
    return t(enHead + enContent + enAllah + enNext + how.en, bnHead + bnContent + bnAllah + bnNext + how.bn, arHead + arContent + arAllah + arNext + how.ar);
  },
  /** "How many times is Allah mentioned?": the name in the Arabic text, alone and with a letter joined in front (src/wordfreq.ts). */
  allahCount: (p: { surah: { tr: string; ar: string } | null; alone: number; all: number; forms: Array<{ word: string; n: number }>; allahumma: number }): T => {
    const joined = p.all - p.alone;
    const en = p.forms.map((w) => `${w.word} ${w.n}`).join(', ');
    const bn = p.forms.map((w) => `${w.word} ${bd(w.n)}`).join(', ');
    const ar = p.forms.map((w) => `${w.word} ${w.n}`).join('، ');
    return t(
      `The name Allah (الله) is in the Arabic text${p.surah ? ` of Surah ${p.surah.tr}` : ''} ${p.all} times: ${p.alone} times on its own${joined ? ` and ${joined} times with a letter joined in front (${en})` : ''}.${p.allahumma ? ` The word اللهم ("O Allah") is there ${p.allahumma} more times.` : ''} This is counted in the Arabic text used here. A count of the English word "Allah" in a translation is higher, for example because the translator also adds it in [brackets] to make the meaning clear.`,
      `আরবি পাঠে${p.surah ? ` সূরা ${p.surah.tr}-এ` : ''} আল্লাহ নামটি (الله) মোট ${bd(p.all)} বার এসেছে: এককভাবে ${bd(p.alone)} বার${joined ? `, আর সামনে কোনো অক্ষর যুক্ত হয়ে ${bd(joined)} বার (${bn})` : ''}।${p.allahumma ? ` এ ছাড়া اللهم ("হে আল্লাহ") এসেছে আরও ${bd(p.allahumma)} বার।` : ''} এটি এখানে ব্যবহৃত আরবি পাঠে গোনা হয়েছে। অনুবাদে ইংরেজি "Allah" শব্দটি গুনলে সংখ্যা বেশি হয়, যেমন অনুবাদক অর্থ স্পষ্ট করতে বন্ধনীতে [ ] তা যোগ করেন।`,
      `ورد اسم الجلالة «الله» في النص العربي${p.surah ? ` لسورة ${p.surah.ar}` : ''} ${arTimes(p.all)}: ${arTimes(p.alone)} وحده${joined ? `، و${arTimes(joined)} متصلًا بحرف قبله (${ar})` : ''}.${p.allahumma ? ` وورد «اللهم» ${arTimes(p.allahumma)} أخرى.` : ''} هذا العدّ في النص العربي المستخدم هنا. أما عدّ كلمة "Allah" في ترجمة إنجليزية فيعطي رقمًا أكبر، لأن المترجم يضيفها أحيانًا بين معقوفين [ ] لتوضيح المعنى.`);
  },
  /** "how many times is the cow mentioned?": one animal (or a few), counted from the text by the rule in src/animals.ts. */
  animalMentions: (items: Array<{ name: Record<Lang, string>; times: number; ayahs: number }>, surahName: { tr: string; ar: string } | null, shown: number, total: number): T => {
    const surah = surahName?.tr ?? null, sAr = surahName?.ar ?? '';
    const one = (x: (typeof items)[number]): T => x.ayahs === 0
      ? t(`The ${x.name.en} is not named in Surah ${surah}.`, `সূরা ${surah}-এ ${x.name.bn} উল্লেখ করা হয়নি।`, `لم يرد ذكر ${x.name.ar} في سورة ${sAr}.`)
      : t(
        `The ${x.name.en} is named ${enN(x.times, 'time', 'times')} in ${enN(x.ayahs, 'ayah', 'ayahs')} ${surah ? `of Surah ${surah}` : 'of the Quran'}.`,
        `${surah ? `সূরা ${surah}-এ` : 'কুরআনে'} ${x.name.bn} ${bd(x.ayahs)}টি আয়াতে মোট ${bd(x.times)} বার উল্লেখ করা হয়েছে।`,
        `ورد ذكر ${x.name.ar} ${surah ? `في سورة ${sAr}` : 'في القرآن'} ${arTimes(x.times)} في ${arAyahs(x.ayahs)}.`);
    const heads = items.map(one);
    const how = t(
      'Counted in the Arabic text, with all the Arabic words for it (listed below), and only in ayahs whose English translation (Saheeh International) also names it.',
      'আরবি পাঠে এর সব আরবি শব্দ (নিচে দেওয়া) গোনা হয়েছে, আর শুধু সেই আয়াতগুলো, যেগুলোর ইংরেজি অনুবাদেও (সহীহ ইন্টারন্যাশনাল) এর নাম আছে।',
      'عُدّ في النص العربي بكل ألفاظه (مذكورة أدناه)، وفي الآيات التي تذكره ترجمتها الإنجليزية أيضًا (صحيح إنترناشيونال) فقط.');
    const first = shown > 0 && shown < total
      ? t(` Here are the first ${shown}.`, ` প্রথম ${bd(shown)}টি আয়াত দেখানো হলো।`, ` هذه أول ${shown} آيات.`)
      : t('', '', '');
    const join = (l: Lang) => `${heads.map((h) => h[l]).join(' ')} ${how[l]}${first[l]}`;
    return t(join('en'), join('bn'), join('ar'));
  },
};
