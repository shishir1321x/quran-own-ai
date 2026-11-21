// Every sentence the assistant says. Written by people, in three languages: no AI makes up an answer.
// HAVE THE ARABIC AND BENGALI WORDING CHECKED by native readers (and the care messages by a counsellor).
import type { Lang } from './types.js';

type T = Record<Lang, string>;
/** Digits for a Bengali sentence: 114 -> ১১৪. */
const bd = (n: number | string): string => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const t = (en: string, bn: string, ar: string): T => ({ en, bn, ar });
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
  storyIntro: (name: string, label: string): T => t(
    `${name}: the passage where the account begins (${label}). Read on in the Quran for the rest.`,
    `${name}: যেখান থেকে বর্ণনা শুরু (${label})। বাকিটা কুরআনে পড়ে নিন।`,
    `${name}: موضع بداية القصة (${label}). أكمل القراءة في المصحف.`),
  dayIntro: t('Ayah of the day.', 'আজকের আয়াত।', 'آية اليوم.'),
  pageIntro: (n: number, ref: string, shown: number): T => t(
    `Page ${n} of the Madani mushaf begins at ${ref}. Here are its first ${shown} ayahs.`,
    `মাদানী মুসহাফের ${bd(n)} নম্বর পৃষ্ঠা শুরু হয়েছে ${ref} থেকে। এর প্রথম ${bd(shown)}টি আয়াত দেখানো হলো।`,
    `الصفحة ${n} من المصحف المدني تبدأ من ${ref}. هذه أول ${shown} آيات منها.`),
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
  greeting: t(
    'Hello! I am the Quran assistant. Ask me about a topic in the Quran, a surah or an ayah, or a number (for example "how many ayahs are in Al-Baqarah?").',
    'আসসালামু আলাইকুম! আমি কুরআন সহকারী। কুরআনের কোনো বিষয়, সূরা, আয়াত বা সংখ্যা সম্পর্কে জিজ্ঞেস করুন (যেমন "আল-বাকারায় কয়টি আয়াত?")।',
    'السلام عليكم! أنا مساعد القرآن. اسألني عن موضوع في القرآن أو سورة أو آية أو عدد (مثل "كم آية في سورة البقرة؟").'),
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
    'I am only a Quran assistant, so I cannot chat about that, tell jokes or give my own opinion. I can show you ayahs on a topic, a surah or an ayah, the story of a prophet, or numbers about the Quran. Type "help" to see examples.',
    'আমি শুধু একটি কুরআন সহকারী, তাই এ নিয়ে গল্প করতে, কৌতুক বলতে বা নিজের মত দিতে পারি না। আমি কোনো বিষয়ে আয়াত, কোনো সূরা বা আয়াত, নবীদের কাহিনী, কিংবা কুরআনের নানা সংখ্যা দেখাতে পারি। উদাহরণ দেখতে "সাহায্য" লিখুন।',
    'أنا مساعد للقرآن فقط، فلا أستطيع الدردشة في ذلك أو قول النكات أو إبداء رأيي. أستطيع أن أعرض آيات عن موضوع، أو سورة أو آية، أو قصة نبي، أو أرقامًا عن القرآن. اكتب "مساعدة" لترى أمثلة.'),
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
