// Every sentence the assistant says. Written by people, in three languages: no AI makes up an answer.
// HAVE THE ARABIC AND BENGALI WORDING CHECKED by native readers (and the care messages by a counsellor).
import type { Lang } from './types.js';

type T = Record<Lang, string>;
/** Digits for a Bengali sentence: 114 -> ১১৪. */
const bd = (n: number | string): string => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const t = (en: string, bn: string, ar: string): T => ({ en, bn, ar });

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
  followUpNone: t(
    'Which ayah or surah do you mean? Please name it first, for example "Surah An-Naas" or "2:255".',
    'কোন আয়াত বা সূরার কথা বলছেন? আগে সেটার নাম লিখুন, যেমন "সূরা নাস" বা "2:255"।',
    'أي آية أو سورة تقصد؟ اذكرها أولًا، مثل "سورة الناس" أو "2:255".'),
  notFound: t(
    'I could not find anything in the Quran about this. I can only answer from the Quran text: try a topic (patience, mercy, parents), a surah ("Surah Al-Ikhlas"), a reference ("2:255") or a number ("how many ayahs in Al-Baqarah?").',
    'কুরআনে এ বিষয়ে কিছু খুঁজে পাইনি। আমি শুধু কুরআনের পাঠ থেকে উত্তর দিতে পারি: একটা বিষয় (ধৈর্য, রহমত, পিতা-মাতা), একটা সূরা ("সূরা ইখলাস"), একটা নম্বর ("2:255") বা সংখ্যা ("আল-বাকারায় কয়টি আয়াত?") জিজ্ঞেস করে দেখুন।',
    'لم أجد شيئًا في القرآن عن هذا. أجيب من نص القرآن فقط: جرّب موضوعًا (الصبر، الرحمة، الوالدين) أو سورة ("سورة الإخلاص") أو رقم آية ("2:255") أو عددًا ("كم آية في البقرة؟").'),
  dataNotUnderstood: t(
    'I can count things in the Quran, for example "how many ayahs are in Surah Al-Baqarah?", "how many Meccan surahs are there?" or "how many times does the word patience appear?". Which one do you want?',
    'আমি কুরআনের সংখ্যা বলতে পারি, যেমন "সূরা বাকারায় কয়টি আয়াত?", "মক্কী সূরা কয়টি?" বা "ধৈর্য শব্দটি কতবার এসেছে?"। কোনটা জানতে চান?',
    'أستطيع العدّ في القرآن، مثل "كم آية في سورة البقرة؟" أو "كم عدد السور المكية؟" أو "كم مرة وردت كلمة الصبر؟". أيّها تريد؟'),
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
  thanks: t('You are welcome! Ask me anything else about the Quran.', 'আপনাকেও ধন্যবাদ! কুরআন সম্পর্কে আরও কিছু জানতে চাইলে জিজ্ঞেস করুন।', 'عفوًا! اسألني عن أي شيء آخر في القرآن.'),
  about: t(
    'I am a small Quran assistant. I have no third-party AI: I search the Quran text myself and show real ayahs with a translation, and I count things (ayahs per surah, Meccan and Medinan surahs, how often a word appears). I do not explain ayahs myself, give rulings, or answer questions outside the Quran; but for an ayah I can show the translator\'s own notes (say "explain 2:255").',
    'আমি একটি ছোট কুরআন সহকারী। আমার পেছনে কোনো থার্ড-পার্টি AI নেই: আমি নিজে কুরআনের পাঠে খুঁজে আসল আয়াত অনুবাদসহ দেখাই এবং সংখ্যা গুনি (সূরাভিত্তিক আয়াত, মক্কী-মাদানী সূরা, শব্দ কতবার এসেছে)। আমি নিজে আয়াতের ব্যাখ্যা করি না, ফতোয়া দিই না, আর কুরআনের বাইরের প্রশ্নের উত্তর দিই না; তবে কোনো আয়াতের জন্য অনুবাদকের নিজের টীকা দেখাতে পারি (লিখুন "2:255 এর ব্যাখ্যা")।',
    'أنا مساعد صغير للقرآن. ليس خلفي أي ذكاء اصطناعي خارجي: أبحث بنفسي في نص القرآن وأعرض آيات حقيقية مع ترجمة، وأعدّ الأشياء (الآيات في كل سورة، السور المكية والمدنية، تكرار كلمة). لا أفسّر الآيات بنفسي ولا أفتي ولا أجيب عن أسئلة خارج القرآن؛ لكن أستطيع عرض ملاحظات المترجم على آية (اكتب "شرح 2:255").'),
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
  sajdaCount: (n: number): T => t(
    `There are ${n} sajdah ayahs in the list of the Tanzil project (scholars count them in more than one way).`,
    `তানযিল প্রকল্পের তালিকায় ${bd(n)}টি সিজদার আয়াত আছে (আলেমগণ একাধিক পদ্ধতিতে গোনেন)।`,
    `في قائمة مشروع تنزيل ${n} آية سجدة (ويعدّها العلماء بأكثر من طريقة).`),
  sajdaList: t('The sajdah ayahs (list of the Tanzil project).', 'সিজদার আয়াতগুলো (তানযিল প্রকল্পের তালিকা)।', 'آيات السجدة (قائمة مشروع تنزيل).'),
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
};
