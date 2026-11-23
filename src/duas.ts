// Curated catalog of authentic Quranic duas organized by Surah, "Rabbana" collection, and Prophet/speaker.
// Every ayah reference is verified against data/quran.json; nothing is interpreted or fabricated (no hadith/fatwa).
// HAVE THE ARABIC AND BENGALI LABELS CHECKED by native readers and someone with religious knowledge.
import { normAr } from './text.js';
import type { Lang } from './types.js';

export interface SurahDuaEntry {
  ayahs: Array<[number, number]>;
  summary: Record<Lang, string>;
}

export interface ProphetDuaEntry {
  id: string;
  name: Record<Lang, string>;
  names: string[];
  ayahs: Array<[number, number]>;
  summary: Record<Lang, string>;
}

export const DUA_ASK_RE =
  /\b(?:duas?|duaa?s?|doas?|dowas?|duagulo|duagula|doagulo|doagula|duar|doar|supplications?|rabbana\s+duas?|rabbi\s+duas?)\b|দোয়া(?:গুলো|গুলা|টি|টা|র|সমূহ)?|দুআ(?:গুলো|গুলা|টি|টা|র|সমূহ)?|দোআ(?:গুলো|গুলা|টি|টা|র)?|দুয়া(?:গুলো|গুলা|টি|টা|র)?|প্রার্থনা(?:গুলো|সমূহ)?|دعاء|أدعية|ادعية/i;

export const RABBANA_DUA_RE =
  /(?:40|forty|all|সব|সকল|৪০|চল্লিশ|أربعين).{0,20}(?:rabbana|robbana|রাব্বানা|রব্বানা|ربنا)|(?:rabbana|robbana|রাব্বানা|রব্বানা|ربنا).{0,15}(?:duas?|doas?|duagulo|duagula|doagulo|doagula|collection|list|দোয়া|দুআ|দোআ|أدعية)/i;

export const SURAH_DUA_LIST_RE =
  /\b(?:which|what)\s+surahs?\s+(?:have|contain|include|mention)\s+(?:duas?|supplications?)\b|\bduas?\s+(?:from|in)\s+(?:the\s+)?surahs?\b|\bkon\s+(?:kon\s+)?suray\s+(?:dua|doa)\b|কোন\s*(?:কোন\s*)?সূরায়\s*(?:দোয়া|দুআ)|সূরাগুলোর\s*(?:দোয়া|দুআ)|কোন\s*সূরার\s*(?:দোয়া|দুআ)/i;

export const RABBANA_DUAS: Array<[number, number]> = [
  [2, 127], [2, 128], [2, 129], [2, 201], [2, 250], [2, 286],
  [3, 8], [3, 9], [3, 16], [3, 53], [3, 147], [3, 191], [3, 192], [3, 193], [3, 194],
  [5, 83], [5, 114],
  [7, 23], [7, 47], [7, 89], [7, 126],
  [10, 85], [10, 86],
  [14, 37], [14, 38], [14, 40], [14, 41],
  [18, 10], [20, 45], [23, 109],
  [25, 65], [25, 74],
  [40, 7], [40, 8], [40, 9],
  [59, 10], [60, 4], [60, 5], [66, 8],
];

const sd = (ayahs: Array<[number, number]>, en: string, bn: string, ar: string): SurahDuaEntry => ({
  ayahs,
  summary: { en, bn, ar },
});

export const SURAH_DUAS: Record<number, SurahDuaEntry> = {
  1: sd([[1, 6], [1, 7]],
    'asking Allah for guidance to the straight path (Ihdinas-Siratal-Mustaqim)',
    'সরল-সঠিক পথের হেদায়াত চেয়ে দোয়া (ইহদিনাস সিরাতাল মুস্তাকীম)',
    'الدعاء بالهداية إلى الصراط المستقيم'),
  2: sd([[2, 126], [2, 127], [2, 128], [2, 129], [2, 201], [2, 250], [2, 286]],
    'prayers of Ibrahim and Ismail for acceptance and righteous descendants, Rabbana atina fid-dunya hasanah, patience against hardship, and asking Allah for pardon and ease',
    'ইবরাহীম ও ইসমাঈল (আ.)-এর দোয়া, রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ, ধৈর্যের দোয়া এবং ভুল-ত্রুটি ক্ষমা ও সামর্থ্যের ভেতর দায়িত্ব পালনের দোয়া',
    'أدعية إبراهيم وإسماعيل، وربنا آتنا في الدنيا حسنة، ودعاء الصبر والعفو والمغفرة'),
  3: sd([[3, 8], [3, 9], [3, 16], [3, 26], [3, 35], [3, 38], [3, 53], [3, 147], [3, 191], [3, 192], [3, 193], [3, 194]],
    'prayers for steadfast hearts (3:8), forgiveness and protection from Hellfire, Zakariyya\'s prayer for righteous offspring (3:38), and the prayers of believers reflecting on creation (3:191-194)',
    'অন্তর বক্র না হওয়ার দোয়া (৩:৮), গুনাহ ক্ষমা ও জাহান্নাম থেকে মুক্তির দোয়া, যাকারিয়্যা (আ.)-এর নেক সন্তানের দোয়া (৩:৩৮) এবং মুমিনদের দোয়া',
    'دعاء ثبات القلوب (3:8)، والمغفرة، ودعاء زكريا بالذرية الصالحة (3:38)، وأدعية أولي الألباب'),
  4: sd([[4, 75]],
    'the prayer of the oppressed asking Allah for a protector and a helper',
    'অসহায় ও নিপীড়িতদের পক্ষ থেকে আল্লাহর কাছে অভিভাবক ও সাহায্যকারী চেয়ে দোয়া',
    'دعاء المستضعفين بطلب الولي والنصير من الله'),
  5: sd([[5, 25], [5, 83], [5, 114]],
    'Musa\'s prayer (5:25), believers asking to be recorded among the witnesses (5:83), and Isa\'s prayer for sustenance from heaven (5:114)',
    'মূসা (আ.)-এর দোয়া (৫:২৫), সত্যের সাক্ষ্যদাতাদের অন্তর্ভুক্ত হওয়ার দোয়া (৫:৮৩) এবং ঈসা (আ.)-এর আসমান থেকে খাদ্য চেয়ে দোয়া (৫:১১৪)',
    'دعاء موسى (5:25)، ودعاء المؤمنين (5:83)، ودعاء عيسى بالمائدة والرزق (5:114)'),
  7: sd([[7, 23], [7, 47], [7, 89], [7, 126], [7, 149], [7, 151], [7, 155]],
    'the prayer of Adam and Hawwa for forgiveness (7:23), asking not to be placed with wrongdoers (7:47), Shu\'ayb\'s prayer (7:89), patience and dying as Muslims (7:126), and Musa\'s prayers for forgiveness and mercy',
    'আদম ও হাওয়া (আ.)-এর ক্ষমাপ্রার্থনার দোয়া (৭:২৩), জালিমদের সাথী না হওয়ার দোয়া (৭:৪৭), শুয়াইব (আ.)-এর দোয়া (৭:৮৯) এবং মূসা (আ.) ও তাঁর কওমের ধৈর্য ও ক্ষমার দোয়া',
    'دعاء آدم وحواء (7:23)، ودعاء شعيب (7:89)، ودعاء الصبر والوفاة على الإسلام (7:126)، وأدعية موسى'),
  9: sd([[9, 129]],
    'declaring sufficiency and complete trust in Allah, Lord of the Great Throne (Hasbiyallahu La Ilaha illa Huwa)',
    'আল্লাহই যথেষ্ট এবং মহা আরশের রবের ওপর তাওয়াক্কুলের দোয়া (হাসবিয়াল্লাহু লা ইলাহা ইল্লা হুওয়া)',
    'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم'),
  10: sd([[10, 85], [10, 86], [10, 88]],
    'praying against becoming a trial for oppressors and seeking deliverance by Allah\'s mercy (10:85-86), and Musa\'s supplication (10:88)',
    'জালিমদের ফিতনার পাত্র না হওয়ার ও মুক্তির দোয়া (১০:৮৫-৮৬) এবং মূসা (আ.)-এর দোয়া (১০:৮৮)',
    'دعاء النجاة من القوم الظالمين والكافرين (10:85-86)، ودعاء موسى (10:88)'),
  11: sd([[11, 47]],
    'Nuh\'s prayer seeking refuge from asking for things without knowledge and asking for forgiveness and mercy',
    'অজ্ঞতাপ্রসূত আবেদন থেকে আল্লাহর আশ্রয় ও ক্ষমা প্রার্থনায় নূহ (আ.)-এর দোয়া',
    'دعاء نوح عليه السلام بالاستعاذة من سؤال ما ليس له به علم وطلب المغفرة والرحمة'),
  12: sd([[12, 33], [12, 101]],
    'Yusuf\'s prayers asking Allah to avert temptation (12:33) and to cause him to die as a Muslim and join the righteous (12:101)',
    'ফিতনা থেকে বাঁচার দোয়া (১২:৩৩) এবং মুসলিম হিসেবে মৃত্যু ও সৎকর্মশীলদের সাথে মিলিত হওয়ার জন্য ইউসুফ (আ.)-এর দোয়া (১২:১০১)',
    'دعاء يوسف عليه السلام بصرف الكيد (12:33)، والدعاء بالوفاة على الإسلام ومرافقة الصالحين (12:101)'),
  14: sd([[14, 35], [14, 36], [14, 37], [14, 38], [14, 40], [14, 41]],
    'Ibrahim\'s prayers for a secure land, protection from idolatry, steadfastness in salah for himself and his descendants, and forgiveness for himself, his parents, and all believers',
    'নগরীর নিরাপত্তা, শিরক থেকে রক্ষা, নামাজ কায়েম রাখা এবং নিজের, পিতা-মাতার ও সব মুমিনের ক্ষমার জন্য ইবরাহীম (আ.)-এর দোয়াসমূহ',
    'أدعية إبراهيم عليه السلام للأمن والبعد عن الأصنام وإقامة الصلاة والمغفرة له ولوالديه وللمؤمنين'),
  17: sd([[17, 24], [17, 80]],
    'praying for mercy upon one\'s parents (Rabbir-hamhuma, 17:24) and asking Allah for a sound entrance, a sound exit, and supporting authority (17:80)',
    'পিতা-মাতার প্রতি দয়ার দোয়া (রাব্বির হামহুমা, ১৭:২৪) এবং সত্যের সাথে প্রবেশ, প্রস্থান ও সাহায্যকারী শক্তির দোয়া (১৭:৮০)',
    'الدعاء للوالدين بالرحمة (17:24)، والدعاء بمدخل صدق ومخرج صدق وسلطان نصير (17:80)'),
  18: sd([[18, 10], [18, 24]],
    'the prayer of the companions of the cave for mercy and right guidance (18:10), and seeking Allah\'s guidance to nearer right conduct (18:24)',
    'গুহাবাসীদের রহমত ও সঠিক পথনির্দেশনার দোয়া (১৮:১০) এবং সঠিক পথের দিশা পাওয়ার দোয়া (১৮:২৪)',
    'دعاء أصحاب الكهف بالرحمة والرشد (18:10)، وطلب الهداية لما هو أقرب رشدا (18:24)'),
  19: sd([[19, 4], [19, 5], [19, 6]],
    'Zakariyya\'s humble prayer in old age asking Allah for a righteous heir pleasing to Him',
    'বার্ধক্যে আল্লাহর কাছে এক নেক উত্তরাধিকারী চেয়ে যাকারিয়্যা (আ.)-এর বিনম্র দোয়া',
    'دعاء زكريا عليه السلام في الكبر بالذرية والوارث الصالح'),
  20: sd([[20, 25], [20, 26], [20, 27], [20, 28], [20, 45], [20, 114]],
    'Musa\'s prayer for assurance, ease in his task, and clear speech (20:25-28), asking for strength before Pharaoh (20:45), and the prayer for knowledge (Rabbi Zidni \'Ilma, 20:114)',
    'মূসা (আ.)-এর বক্ষ প্রশস্ত, কাজ সহজ ও ভাষা স্পষ্ট করার দোয়া (২০:২৫-২৮) এবং জ্ঞান বৃদ্ধির দোয়া (রাব্বি যিদনী ইলমা, ২০:১১৪)',
    'دعاء موسى بالانشراح والتيسير وفصاحة اللسان (20:25-28)، ودعاء زيادة العلم (20:114)'),
  21: sd([[21, 83], [21, 87], [21, 89], [21, 112]],
    'Ayyub\'s prayer in illness (21:83), Yunus\'s prayer in distress (La ilaha illa Anta Subhanaka, 21:87), Zakariyya\'s prayer for an heir (21:89), and the Prophet\'s prayer for just judgment and help (21:112)',
    'আইয়ূব (আ.)-এর আরোগ্যের দোয়া (২১:৮৩), ইউনুস (আ.)-এর বিপদমুক্তির দোয়া (২১:৮৭), যাকারিয়্যা (আ.)-এর দোয়া (২১:৮৯) ও নবী (সা.)-এর দোয়া (২১:১১২)',
    'دعاء أيوب (21:83)، ودعاء يونس في الكرب (21:87)، ودعاء زكريا (21:89)، وطلب الحكم بالحق (21:112)'),
  23: sd([[23, 26], [23, 29], [23, 93], [23, 94], [23, 97], [23, 98], [23, 109], [23, 118]],
    'prayers for help and a blessed landing (23:26, 23:29), protection from the wrongdoers and whispers of devils (23:94, 23:97-98), and asking Allah for forgiveness and mercy (23:109, 23:118)',
    'সাহায্য ও বরকতময় অবতরণের দোয়া (২৩:২৬, ২৯), শয়তানের প্ররোচনা থেকে আশ্রয় (২৩:৯৭-৯৮) এবং ক্ষমা ও দয়ার দোয়া (২৩:১০৯, ১১৮)',
    'أدعية النصر والمنزل المبارك (23:26-29)، والاستعاذة من همزات الشياطين (23:97-98)، والمغفرة والرحمة (23:118)'),
  25: sd([[25, 65], [25, 74]],
    'praying for refuge from the punishment of Hell (25:65) and asking for righteous spouses and children who bring comfort to the eyes (25:74)',
    'জাহান্নামের আজাব থেকে বাঁচার দোয়া (২৫:৬৫) এবং চোখজুড়ানো নেক স্ত্রী ও সন্তান চেয়ে দোয়া (২৫:৭৪)',
    'الدعاء بصرف عذاب جهنم (25:65)، وطلب الأزواج والذرية الصالحة قرة أعين (25:74)'),
  26: sd([[26, 83], [26, 84], [26, 85], [26, 117], [26, 118], [26, 169]],
    'Ibrahim\'s prayers for wisdom, righteous company, an honorable mention, and Paradise (26:83-85), Nuh\'s prayer for deliverance (26:117-118), and Lut\'s prayer to save his family (26:169)',
    'ইবরাহীম (আ.)-এর প্রজ্ঞা ও জান্নাতের দোয়া (২৬:৮৩-৮৫), নূহ (আ.)-এর মুক্তির দোয়া (২৬:১১৭-১১৮) এবং লূত (আ.)-এর পরিবারের নিরাপত্তার দোয়া (২৬:১৬৯)',
    'أدعية إبراهيم بالحكم والجنة (26:83-85)، ودعاء نوح بالفتح والنجاة (26:117-118)، ودعاء لوط (26:169)'),
  27: sd([[27, 19]],
    'Sulaiman\'s prayer to remain grateful for Allah\'s blessings upon himself and his parents and to do righteous deeds',
    'নিজের ও পিতা-মাতার ওপর প্রদত্ত নিয়ামতের কৃতজ্ঞতা আদায় এবং সৎকর্ম করার তাওফীক চেয়ে সুলাইমান (আ.)-এর দোয়া',
    'دعاء سليمان عليه السلام بشكر النعمة والعمل الصالح'),
  28: sd([[28, 16], [28, 17], [28, 21], [28, 24]],
    'Musa\'s prayers seeking forgiveness (28:16), gratitude for blessings (28:17), protection from wrongdoers (28:21), and expressing need for whatever good Allah sends down (28:24)',
    'মূসা (আ.)-এর ক্ষমা প্রার্থনা (২৮:১৬), নিয়ামতের শুকরিয়া (২৮:১৭), জালিমদের থেকে রক্ষা (২৮:২১) এবং কল্যাণ ও রিযিকের দোয়া (২৮:২৪)',
    'أدعية موسى عليه السلام بالمغفرة والنجاة والافتقار إلى ما أنزل الله من خير (28:24)'),
  29: sd([[29, 30]],
    'Lut\'s prayer asking Allah for help against the corrupting people',
    'ফাসাদ সৃষ্টিকারী সম্প্রদায়ের বিরুদ্ধে আল্লাহর সাহায্য চেয়ে লূত (আ.)-এর দোয়া',
    'دعاء لوط عليه السلام بالنصرة على القوم المفسدين'),
  37: sd([[37, 100]],
    'Ibrahim\'s prayer asking Allah for a righteous child',
    'একজন সৎকর্মশীল সন্তান দান করার জন্য ইবরাহীম (আ.)-এর দোয়া',
    'دعاء إبراهيم عليه السلام بالذرية الصالحة'),
  38: sd([[38, 35]],
    'Sulaiman\'s prayer asking Allah for forgiveness and a unique kingdom',
    'ক্ষমা ও অনন্য রাজত্ব চেয়ে সুলাইমান (আ.)-এর দোয়া',
    'دعاء سليمان عليه السلام بالمغفرة والملك'),
  39: sd([[39, 46]],
    'calling upon Allah, Creator of the heavens and the earth and Knower of the unseen and witnessed, to judge between servants',
    'আসমান ও যমীনের স্রষ্টা, গায়েব ও প্রকাশ্যের জ্ঞানী আল্লাহর কাছে ফয়সালা চেয়ে দোয়া',
    'دعاء فاطر السماوات والأرض عالم الغيب والشهادة'),
  40: sd([[40, 7], [40, 8], [40, 9]],
    'the angels who bear the Throne praying for forgiveness, mercy, protection from evil, and Paradise for believers and their righteous families',
    'আরশ বহনকারী ফেরেশতাদের মুমিনদের ক্ষমা, কল্যাণ, মন্দ থেকে রক্ষা ও পরিবারসহ জান্নাতের জন্য দোয়া',
    'دعاء حملة العرش للمؤمنين بالمغفرة والوقاية من السيئات ودخول جنات عدن'),
  43: sd([[43, 13], [43, 14]],
    'words of gratitude and remembrance of returning to our Lord when mounting transport / traveling',
    'বাহনে আরোহণ বা সফরের সময় আল্লাহর পবিত্রতা, নিয়ামতের কৃতজ্ঞতা ও তাঁর কাছে প্রত্যাবর্তনের দোয়া',
    'دعاء الركوب والسفر وحمد الله على تسخيره'),
  46: sd([[46, 15]],
    'the prayer of a person at maturity asking to be grateful, to do righteous deeds, and to make their offspring righteous',
    'পিতা-মাতার প্রতি কৃতজ্ঞতা, নেক আমল ও সন্তানের কল্যাণের জন্য প্রাপ্তবয়স্ক মুমিনের দোয়া',
    'دعاء شكر النعمة وصلاح الذرية والتوبة'),
  54: sd([[54, 10]],
    'Nuh\'s short cry to Allah for victory when overcome by rejection',
    'অত্যাচারিত ও অসহায় অবস্থায় নূহ (আ.)-এর সংক্ষিপ্ত দোয়া: "আমি পরাজিত, অতএব সাহায্য করুন"',
    'دعاء نوح عليه السلام: أني مغلوب فانتصر'),
  59: sd([[59, 10]],
    'believers praying for forgiveness for themselves and earlier believers and asking for hearts free of resentment',
    'নিজেদের ও পূর্ববর্তী মুমিন ভাইদের ক্ষমা এবং অন্তরে হিংসা-বিদ্বেষ না রাখার দোয়া',
    'دعاء المغفرة للمؤمنين وسلامة الصدر من الغل'),
  60: sd([[60, 4], [60, 5]],
    'the prayer of Ibrahim and those with him expressing reliance on Allah, asking not to be made a trial for disbelievers, and seeking forgiveness',
    'আল্লাহর ওপর পূর্ণ নির্ভরতা, অবিশ্বাসীদের পরীক্ষার লক্ষ্যবস্তু না হওয়া ও ক্ষমা প্রার্থনায় ইবরাহীম (আ.) ও তাঁর সাথীদের দোয়া',
    'دعاء التوكل على الله وطلب المغفرة وعدم جعلهم فتنة للذين كفروا'),
  66: sd([[66, 8], [66, 11]],
    'believers praying to perfect their light and forgive them (66:8), and the prayer of Pharaoh\'s wife Asiya for a house near Allah in Paradise (66:11)',
    'নূর পরিপূর্ণ ও গুনাহ ক্ষমার দোয়া (৬৬:৮) এবং জান্নাতে আল্লাহর সান্নিধ্যে ঘরের জন্য আসিয়ার দোয়া (৬৬:১১)',
    'دعاء إتمام النور والمغفرة (66:8)، ودعاء امرأة فرعون ببناء بيت في الجنة (66:11)'),
  71: sd([[71, 28]],
    'Nuh\'s prayer asking forgiveness for himself, his parents, everyone entering his house in faith, and all believing men and women',
    'নিজের, পিতা-মাতার, ঘরে প্রবেশকারী ঈমানদারদের এবং সব মুমিন নর-নারীর ক্ষমার জন্য নূহ (আ.)-এর দোয়া',
    'دعاء نوح عليه السلام بالمغفرة له ولوالديه وللمؤمنين والمؤمنات'),
  113: sd([[113, 1], [113, 2], [113, 3], [113, 4], [113, 5]],
    'Surah Al-Falaq — a complete supplication taught by Allah seeking refuge in Him from all harm, darkness, envy, and evil',
    'সূরা ফালাক — সব অনিষ্ট, রাতের আঁধার ও হিংসুকের ক্ষতি থেকে আল্লাহর আশ্রয় প্রার্থনার পূর্ণাঙ্গ দোয়া',
    'سورة الفلق — الاستعاذة برب الفلق من كل شر وحاسد'),
  114: sd([[114, 1], [114, 2], [114, 3], [114, 4], [114, 5], [114, 6]],
    'Surah An-Nas — seeking refuge in Allah, the Lord and King of mankind, from hidden whisperings and evil',
    'সূরা নাস — মানুষের অন্তরে প্ররোচনাকারী শয়তানের অনিষ্ট থেকে আল্লাহর আশ্রয় প্রার্থনার দোয়া',
    'سورة الناس — الاستعاذة برب الناس من شر الوسواس الخناس'),
};

export const PROPHET_DUAS: ProphetDuaEntry[] = [
  {
    id: 'adam',
    name: { en: 'Prophet Adam', bn: 'নবী আদম (আ.)', ar: 'النبي آدم عليه السلام' },
    names: ['adam', 'আদম', 'আদমের', 'آدم'],
    ayahs: [[7, 23]],
    summary: {
      en: 'seeking forgiveness and mercy after wronging oneself (Surah Al-A\'raf 7:23)',
      bn: 'নিজেদের প্রতি জুলুমের পর ক্ষমা ও দয়া প্রার্থনার দোয়া (সূরা আরাফ ৭:২৩)',
      ar: 'دعاء الاعتراف بالذنب وطلب المغفرة والرحمة (الأعراف 7:23)',
    },
  },
  {
    id: 'nuh',
    name: { en: 'Prophet Nuh (Noah)', bn: 'নবী নূহ (আ.)', ar: 'النبي نوح عليه السلام' },
    names: ['nuh', 'nooh', 'noah', 'নূহ', 'নুহ', 'নূহের', 'نوح'],
    ayahs: [[11, 47], [23, 26], [23, 29], [26, 117], [26, 118], [54, 10], [71, 28]],
    summary: {
      en: 'seeking refuge from asking without knowledge, asking for help and a blessed landing, and praying for forgiveness for himself, his parents, and all believers',
      bn: 'অজ্ঞতা থেকে আশ্রয়, বিপদে সাহায্য ও বরকতময় আশ্রয় এবং নিজের, পিতা-মাতার ও সব মুমিনের ক্ষমার দোয়া',
      ar: 'أدعية الاستعاذة والمنزل المبارك والنصرة والاستغفار له ولوالديه وللمؤمنين',
    },
  },
  {
    id: 'ibrahim',
    name: { en: 'Prophet Ibrahim (Abraham)', bn: 'নবী ইবরাহীম (আ.)', ar: 'النبي إبراهيم عليه السلام' },
    names: ['ibrahim', 'ibraheem', 'abraham', 'ইবরাহীম', 'ইব্রাহীম', 'ইবরাহিম', 'ইব্রাহিম', 'ইবরাহীমের', 'ইব্রাহীমের', 'إبراهيم', 'ابراهيم'],
    ayahs: [[2, 126], [2, 127], [2, 128], [2, 129], [14, 35], [14, 37], [14, 38], [14, 40], [14, 41], [26, 83], [26, 84], [26, 85], [37, 100], [60, 4], [60, 5]],
    summary: {
      en: 'prayers for acceptance of deeds, righteous offspring, steadfastness in prayer, forgiveness for parents and believers, wisdom, and reliance on Allah',
      bn: 'কাজ কবুল হওয়া, নেক সন্তান, নামাজ কায়েম, পিতা-মাতা ও মুমিনদের ক্ষমা, প্রজ্ঞা এবং তাওয়াক্কুলের দোয়াসমূহ',
      ar: 'أدعية القبول والذرية الصالحة وإقامة الصلاة والمغفرة والحكم والتوكل على الله',
    },
  },
  {
    id: 'lut',
    name: { en: 'Prophet Lut (Lot)', bn: 'নবী লূত (আ.)', ar: 'النبي لوط عليه السلام' },
    names: ['lut', 'loot', 'লূত', 'লুত', 'লূতের', 'لوط'],
    ayahs: [[26, 169], [29, 30]],
    summary: {
      en: 'asking Allah to save his family and grant victory over the corrupting people',
      bn: 'পরিবারকে রক্ষা এবং ফাসাদ সৃষ্টিকারীদের বিরুদ্ধে সাহায্য চেয়ে দোয়া',
      ar: 'دعاء النجاة لأهله والنصرة على القوم المفسدين',
    },
  },
  {
    id: 'yusuf',
    name: { en: 'Prophet Yusuf (Joseph)', bn: 'নবী ইউসুফ (আ.)', ar: 'النبي يوسف عليه السلام' },
    names: ['yusuf', 'yousef', 'joseph', 'ইউসুফ', 'ইউসুফের', 'يوسف'],
    ayahs: [[12, 33], [12, 101]],
    summary: {
      en: 'seeking protection from temptation and asking to die as a Muslim joined with the righteous',
      bn: 'ফিতনা থেকে রক্ষা এবং মুসলিম হিসেবে মৃত্যু ও সৎকর্মশীলদের সাথী হওয়ার দোয়া',
      ar: 'دعاء صرف الكيد والوفاة على الإسلام ومرافقة الصالحين',
    },
  },
  {
    id: 'shuayb',
    name: { en: 'Prophet Shu\'ayb', bn: 'নবী শুয়াইব (আ.)', ar: 'النبي شعيب عليه السلام' },
    names: ['shuayb', 'shuaib', 'শুয়াইব', 'শোয়াইব', 'শুয়াইবের', 'شعيب'],
    ayahs: [[7, 89]],
    summary: {
      en: 'asking Allah to judge between him and his people in truth',
      bn: 'নিজের ও জাতির মধ্যে সত্যের সাথে ফয়সালা চেয়ে দোয়া (৭:৮৯)',
      ar: 'دعاء الفتح بالحق بينه وبين قومه (الأعراف 7:89)',
    },
  },
  {
    id: 'musa',
    name: { en: 'Prophet Musa (Moses)', bn: 'নবী মূসা (আ.)', ar: 'النبي موسى عليه السلام' },
    names: ['musa', 'moosa', 'moses', 'মূসা', 'মুসা', 'মূসার', 'মুসার', 'موسى'],
    ayahs: [[7, 151], [7, 155], [20, 25], [20, 26], [20, 27], [20, 28], [28, 16], [28, 17], [28, 21], [28, 24]],
    summary: {
      en: 'for assurance, ease, and eloquence (20:25-28), asking for whatever good Allah sends down (28:24), forgiveness (28:16, 7:151), and deliverance from wrongdoers',
      bn: 'বক্ষ প্রশস্ত, কাজ সহজ ও ভাষা স্পষ্ট করার দোয়া (২০:২৫-২৮), কল্যাণ ও রিযিক প্রার্থনা (২৮:২৪) এবং ক্ষমা ও নিরাপত্তার দোয়া',
      ar: 'دعاء شرح الصدر وتيسير الأمر (20:25-28)، والافتقار لخير الله (28:24)، والمغفرة والنجاة',
    },
  },
  {
    id: 'ayyub',
    name: { en: 'Prophet Ayyub (Job)', bn: 'নবী আইয়ূব (আ.)', ar: 'النبي أيوب عليه السلام' },
    names: ['ayyub', 'ayub', 'ayoub', 'আইয়ূব', 'আইয়ুব', 'আইউব', 'আইয়ূবের', 'আইয়ুবের', 'أيوب', 'ايوب'],
    ayahs: [[21, 83]],
    summary: {
      en: 'calling upon Allah during severe hardship and illness as the Most Merciful of the merciful (21:83)',
      bn: 'অসুস্থতা ও কষ্টে পরম দয়ালু আল্লাহর কাছে আকুতি ও আরোগ্যের দোয়া (২১:৮৩)',
      ar: 'دعاء الشكوى إلى أرحم الراحمين عند البلاء والمرض (الأنبياء 21:83)',
    },
  },
  {
    id: 'yunus',
    name: { en: 'Prophet Yunus (Jonah)', bn: 'নবী ইউনুস (আ.)', ar: 'النبي يونس عليه السلام' },
    names: ['yunus', 'younus', 'jonah', 'ইউনুস', 'ইউনূস', 'ইউনুসের', 'يونس'],
    ayahs: [[21, 87]],
    summary: {
      en: 'La ilaha illa Anta Subhanaka Inni Kuntu minaz-Zalimin — spoken from deep distress in the darknesses (21:87)',
      bn: 'লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নী কুনতু মিনায যালিমীন — বিপদ ও সংকট থেকে মুক্তির দোয়া (২১:৮৭)',
      ar: 'لا إله إلا أنت سبحانك إني كنت من الظالمين — دعاء الكرب في الظلمات (الأنبياء 21:87)',
    },
  },
  {
    id: 'sulaiman',
    name: { en: 'Prophet Sulaiman (Solomon)', bn: 'নবী সুলাইমান (আ.)', ar: 'النبي سليمان عليه السلام' },
    names: ['sulaiman', 'sulayman', 'suleiman', 'solomon', 'সুলাইমান', 'সোলায়মান', 'সুলাইমানের', 'سليمان'],
    ayahs: [[27, 19], [38, 35]],
    summary: {
      en: 'asking Allah for gratitude and righteous deeds (27:19) and for forgiveness and a unique kingdom (38:35)',
      bn: 'নিয়ামতের শুকরিয়া ও সৎকর্মের তাওফীক (২৭:১৯) এবং ক্ষমা ও অনন্য রাজত্বের দোয়া (৩৮:৩৫)',
      ar: 'دعاء شكر النعمة والعمل الصالح (27:19)، والمغفرة والملك (38:35)',
    },
  },
  {
    id: 'zakariyya',
    name: { en: 'Prophet Zakariyya (Zechariah)', bn: 'নবী যাকারিয়্যা (আ.)', ar: 'النبي زكريا عليه السلام' },
    names: ['zakariyya', 'zakariya', 'zakaria', 'zechariah', 'যাকারিয়্যা', 'যাকারিয়া', 'জাকারিয়া', 'যাকারিয়্যার', 'زكريا'],
    ayahs: [[3, 38], [19, 4], [19, 5], [19, 6], [21, 89]],
    summary: {
      en: 'prayers in old age asking Allah for good, righteous offspring and not being left without an heir',
      bn: 'বার্ধক্যে নিঃসন্তান অবস্থায় নেক ও পবিত্র সন্তান চেয়ে যাকারিয়্যা (আ.)-এর দোয়াসমূহ',
      ar: 'أدعية زكريا عليه السلام في الكبر بالذرية الطيبة والوارث الصالح',
    },
  },
  {
    id: 'isa',
    name: { en: 'Prophet Isa (Jesus)', bn: 'নবী ঈসা (আ.)', ar: 'النبي عيسى عليه السلام' },
    names: ['isa', 'eesa', 'jesus', 'ঈসা', 'ইসা', 'ঈসার', 'عيسى'],
    ayahs: [[5, 114]],
    summary: {
      en: 'praying for a table of provision from heaven as a blessing and sign from the Best of Providers (5:114)',
      bn: 'আসমান থেকে রিজিক ও নিদর্শনস্বরূপ খাদ্য চেয়ে ঈসা (আ.)-এর দোয়া (৫:১১৪)',
      ar: 'دعاء عيسى عليه السلام بالمائدة والرزق من خير الرازقين (المائدة 5:114)',
    },
  },
  {
    id: 'muhammad',
    name: { en: 'Prophet Muhammad (peace be upon him)', bn: 'নবী মুহাম্মদ (সা.)', ar: 'النبي محمد ﷺ' },
    names: ['muhammad', 'mohammad', 'mohammed', 'মুহাম্মদ', 'মুহাম্মাদ', 'মহানবী', 'রাসূলুল্লাহ', 'محمد'],
    ayahs: [[17, 80], [20, 114], [21, 112], [23, 93], [23, 94], [23, 97], [23, 98], [23, 118]],
    summary: {
      en: 'Quranic prayers taught to the Prophet: for knowledge (20:114), a sound entrance and exit (17:80), refuge from devils (23:97-98), and forgiveness and mercy (23:118)',
      bn: 'নবী (সা.)-কে শেখানো কুরআনের দোয়া: জ্ঞান বৃদ্ধি (২০:১১৪), সত্যের সাথে প্রবেশ ও প্রস্থান (১৭:৮০), শয়তানের প্ররোচনা থেকে আশ্রয় (২৩:৯৭-৯৮) এবং ক্ষমা ও দয়া (২৩:১১৮)',
      ar: 'الأدعية القرآنية المأمور بها النبي ﷺ: زيادة العلم، والمدخل الصادق، والاستعاذة من الشياطين، والمغفرة والرحمة',
    },
  },
  {
    id: 'asiya',
    name: { en: 'Asiya (the wife of Pharaoh)', bn: 'আসিয়া (ফিরআউনের স্ত্রী)', ar: 'آسية امرأة فرعون' },
    names: ['asiya', 'asiyah', 'আসিয়া', 'আসিয়ার', 'آسية'],
    ayahs: [[66, 11]],
    summary: {
      en: 'praying for a house near Allah in Paradise and deliverance from Pharaoh and his deeds (66:11)',
      bn: 'জান্নাতে আল্লাহর সান্নিধ্যে ঘর এবং ফেরাউন ও তার জুলুম থেকে মুক্তি চেয়ে আসিয়ার দোয়া (৬৬:১১)',
      ar: 'دعاؤها ببناء بيت عند الله في الجنة والنجاة من فرعون والقوم الظالمين (التحريم 66:11)',
    },
  },
  {
    id: 'ashab-al-kahf',
    name: { en: 'Companions of the Cave', bn: 'আসহাবে কাহফ (গুহাবাসী)', ar: 'أصحاب الكهف' },
    names: ['ashab al kahf', 'ashabul kahf', 'people of the cave', 'গুহাবাসী', 'আসহাবে কাহফ', 'أصحاب الكهف'],
    ayahs: [[18, 10]],
    summary: {
      en: 'asking Allah for mercy from Himself and right guidance in their affair (18:10)',
      bn: 'আল্লাহর নিকট থেকে রহমত ও নিজেদের কাজে সঠিক দিশা চেয়ে গুহাবাসীদের দোয়া (১৮:১০)',
      ar: 'دعاؤهم بالرحمة من لدن الله والرشد في الأمر (الكهف 18:10)',
    },
  },
];

export function matchProphetDua(text: string): ProphetDuaEntry | null {
  const lower = text.toLowerCase();
  const ar = normAr(text);
  for (const entry of PROPHET_DUAS) {
    for (const rawName of entry.names) {
      const n = rawName.toLowerCase();
      if (/^[a-z\s'-]+$/.test(n)) {
        const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`(?<![a-z])${esc}(?:'s|s')?(?![a-z])`, 'i').test(lower)) return entry;
      } else if (/[\u0980-\u09FF]/.test(n)) {
        const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`(?<![\\u0980-\\u09FF])${esc}(?![\\u0980-\\u09FF])`).test(text)) return entry;
      } else if (ar.includes(normAr(rawName))) {
        return entry;
      }
    }
  }
  return null;
}

