import type { Lang } from './types.js';

// One regex per script. The `g` flag lets String.match return every letter, so
// `.length` is the count. Arabic has several Unicode blocks (the presentation
// forms FB50-FDFF / FE70-FEFF appear when text is copied from some PDFs).
const SCRIPT_LETTERS: Record<Lang, RegExp> = {
  bn: /[ঀ-৿]/g,
  ar: /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g,
  en: /[A-Za-z]/g,
};

// Distinctly Banglish (Romanized Bengali) words that do not occur in normal English.
const STRONG_BANGLISH = new Set([
  // question words
  'ki', 'keno', 'kivabe', 'kibhabe', 'kothay', 'kokhon', 'koto', 'kon', 'konti', 'konta', 'kake', 'kemon', 'kiser',
  // how many / how often ("quran e sijda koyta")
  'koyta', 'koita', 'koyti', 'koiti', 'koyto', 'kotogulo', 'kotogula', 'kotota', 'kototi', 'koybar', 'koibar', 'kotobar', 'kothobar', 'duibar', 'sijdar', 'sejda', 'sejdar',
  'sobcheye', 'shobcheye', 'beshi', 'besi', 'esheche', 'eseche', 'asche', 'ase', 'nobir', 'nabir', 'nobider', 'nabider', 'sahabir', 'sahabider',
  'pipra', 'moumachi', 'makorsha', 'maser', 'masher', 'fereshtar', 'suragulo', 'surahgulo', 'shuru', 'suru', 'diye', 'diya',
  'sofolota', 'porishrom', 'protarona', 'vejal', 'bhejal', 'bornobad', 'boishommo', 'monkharap',
  // next / previous / more ("porer ayat", "ager ayat", "aro dekhao")
  'porer', 'poror', 'ager', 'aager', 'aro', 'aaro', 'dekhao',
  // pronouns
  'ami', 'amar', 'amader', 'amake', 'tumi', 'tomar', 'tomader', 'apni', 'apnar', 'apnake',
  'tader', 'kono', 'kichu', 'shob', 'sob', 'shobai', 'sobai',
  // verbs & auxiliaries
  'bole', 'bola', 'bolen', 'boleche', 'bolun', 'bolte', 'hoyeche', 'hoy', 'hobe', 'hote',
  'ache', 'achhe', 'achen', 'chilo', 'thake', 'thakbe', 'nai', 'nei',
  'korbo', 'kori', 'kore', 'koren', 'kora', 'korle', 'korar', 'korte', 'koreche',
  'parbo', 'pari', 'pare', 'paren', 'parina', 'janina', 'bujhina', 'jani', 'bujhi',
  'jabo', 'jai', 'jay', 'jabe', 'dite', 'deya', 'dewa', 'dey', 'pabo', 'pawa',
  'porbo', 'pori', 'pore', 'pora', 'porte', 'rakha', 'rakhte', 'rakhar',
  'chaile', 'chai', 'uchit', 'dorkar', 'proyojon', 'lagbe', 'lage',
  // postpositions & connectors
  'niye', 'somporke', 'shomporke', 'bapare', 'bepare', 'jonno', 'jonyo',
  'theke', 'sathe', 'shathe', 'moddhe', 'majhe', 'upore', 'vitore', 'bhitore',
  'kachhe', 'kache', 'pashe', 'ebong', 'kintu', 'tahole', 'jodi', 'jokhon', 'tokhon',
  // common religious / everyday Banglish nouns & adjectives
  'ortho', 'mane', 'upay', 'bidhan', 'niyom', 'shasti', 'sasti', 'shanti',
  'dhairjo', 'dhoirjo', 'sobor', 'shobor', 'koshto', 'kosto', 'koshte', 'koste',
  'bhalo', 'valo', 'kharap', 'gunah', 'khoma', 'maf', 'maaf', 'bebohar', 'byabohar',
  'baba', 'babar', 'mayer', 'pita', 'mata', 'shontan', 'sontan', 'stri', 'shami', 'swami',
  'biye', 'bibaho', 'talak', 'porda', 'protibeshi', 'gorib', 'dhoni', 'manush', 'manusher',
  'jibon', 'mrittu', 'morar', 'kobor', 'kiyamot', 'qiyamot', 'duniya', 'akhirat', 'akherat',
  'shud', 'ghush', 'gush', 'mittha', 'mithya', 'churi', 'julum', 'foroz',
  'namaz', 'namaj', 'namajer', 'namazer', 'roza', 'roja', 'jakat', 'oju', 'ozu', 'gosol', 'touba', 'tauba',
  'somoy', 'shomoy', 'somoi', 'shomoi', 'wakto', 'oakt', 'oakto', 'pach', 'ajker', 'ajke', 'koy',
  'jikir', 'zikir', 'jannat', 'behesht', 'jahannam', 'dozokh', 'dojokh', 'fereshta', 'firishta',
  'jiboner', 'uddesho', 'etim', 'attiyo', 'attiyoshojon', 'choritro', 'amol',
  'bondhu', 'bondhutto', 'bebsha', 'byabsha', 'poribesh', 'prokriti', 'binoy', 'ohongkar',
  'gyan', 'shikkha', 'porikkha', 'porikha', 'bhaggo', 'vaggo', 'opochoy', 'ghum', 'ghumer',
  'shoytan', 'soytan', 'munafik', 'bhorosha', 'vorosha', 'nyaybichar', 'kritoggota', 'shongshar', 'gibot',
  'suray', 'surar', 'surate', 'bangla', 'banglay', 'banglate', 'arbi', 'arbite',
  'shesh', 'sesh', 'prothom', 'pratham', 'naki', 'dekhao', 'dekhan', 'bolo', 'dao', 'den',
  'gula', 'gulo', 'duagulo', 'duagula', 'doagulo', 'doagula', 'duar', 'doar',
  // a little conversation ("kemon acho", "valo achi", "ki koro", "valo theko", "pore kotha hobe")
  'achi', 'acho', 'aso', 'asen', 'achis', 'achho', 'achhi', 'kmn', 'kmon', 'koro', 'korcho', 'korchen', 'korchis',
  'khobor', 'khbr', 'obostha', 'obosta', 'theko', 'thakben', 'thakun', 'thako', 'acha', 'accha', 'achha', 'thik',
  'kotha', 'laglo', 'dukkhito', 'khoda', 'bidai', 'vlo', 'bhlo', 'jacche', 'porichito',
]);

// Shorter Banglish particles/words that count when paired together.
const WEAK_BANGLISH = new Set([
  'er', 'te', 'ta', 'ti', 'ke', 'kar', 'se', 'tar', 'ei', 'oi', 'na', 'ba',
  'ma', 'mon', 'pap', 'paap', 'hok', 'sura', 'doa', 'hoj', 'sud', 'bou', 'para',
  'nam', 'naam', 'nobi', 'kom', 'loha', 'guha', 'alo', 'churi',
]);

// Banglish words that are ALSO ordinary English words ("sob", "mane", "chai", "pore",
// "ache" ...). One of them alone is not enough: "Why do people sob when they pray?"
// is English. They count only together with another Banglish signal.
const AMBIGUOUS_WITH_ENGLISH = new Set([
  'ayatul', 'sob', 'mane', 'chai', 'pore', 'pare', 'bole', 'kon', 'jay', 'dey', 'ache', 'mata', 'baba',
  'pita', 'pora', 'bola', 'hote', 'kore', 'nei', 'nai', 'lage', 'hoy', 'jai', 'pari', 'dite',
]);

// Islamic / South-Asian loanwords often used inside otherwise English sentences
// ("how many times the jannat word appeared", "what does the Quran say about namaz?").
// Alone or paired with Banglish grammar they indicate Banglish; inside a multi-word English sentence
// with no Bengali grammar words, the sentence stays English.
const SHARED_ISLAMIC_LOANWORDS = new Set([
  'jannat', 'jahannam', 'behesht', 'dozokh', 'dojokh', 'namaz', 'namaj', 'roza', 'roja',
  'jakat', 'duniya', 'akhirat', 'akherat', 'tauba', 'touba', 'gunah', 'julum', 'foroz',
  'fereshta', 'firishta', 'kiyamot', 'qiyamot', 'jikir', 'zikir', 'talak', 'porda',
  'oju', 'ozu', 'shoytan', 'soytan', 'munafik', 'sobor', 'shobor', 'dhairjo', 'dhoirjo',
]);

// Clearly English function/question words used to distinguish English sentences containing a shared loanword.
const ENGLISH_FUNC_WORDS = new Set([
  'the', 'is', 'are', 'was', 'were', 'what', 'where', 'when', 'why', 'who', 'which',
  'how', 'many', 'much', 'does', 'do', 'did', 'can', 'could', 'would', 'should', 'will',
  'about', 'say', 'says', 'mean', 'means', 'meaning', 'word', 'words', 'appear', 'appears', 'appeared',
  'mention', 'mentions', 'mentioned', 'occur', 'occurs', 'occurred', 'times', 'there', 'here',
  'this', 'that', 'these', 'those', 'from', 'with', 'into', 'have', 'has', 'please',
  'show', 'give', 'tell', 'explain', 'define', 'list', 'between', 'during', 'after', 'before', 'without',
]);

export function isBanglish(text: string): boolean {
  const words = text.toLowerCase().match(/[a-z]+/g);
  if (!words || words.length === 0) return false;
  let pureBanglish = 0; // distinctly Bengali words, never English
  let loanwords = 0;    // shared Islamic/South-Asian loanwords
  let soft = 0;         // weak particles and words that are also English
  let enFunc = 0;       // English grammar/function words
  for (const w of words) {
    if (ENGLISH_FUNC_WORDS.has(w)) enFunc++;
    if (AMBIGUOUS_WITH_ENGLISH.has(w)) soft++;
    else if (SHARED_ISLAMIC_LOANWORDS.has(w)) loanwords++;
    else if (STRONG_BANGLISH.has(w)) pureBanglish++;
    else if (WEAK_BANGLISH.has(w)) soft++;
  }
  if (pureBanglish >= 1) return true;
  if (loanwords >= 1) return !(enFunc >= 2 && soft === 0);
  if (words.includes('er') && enFunc === 0) return true;
  return soft >= 2;
}

/**
 * Guess the language of a user's question from its letters.
 * Rules: docs/SPEC.md, section 6, plus Banglish (Romanized Bengali) detection.
 *
 *  - Count letters in the Bengali block (U+0980 to U+09FF), the Arabic blocks
 *    (U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF) and Latin letters (A-Z, a-z).
 *  - The script with the most letters wins.
 *  - If Latin letters win but the words are Banglish (Bengali in Latin script), return 'bn'.
 *  - No letters from any of the three (digits, punctuation, empty text): 'en'.
 *
 * Note: the Arabic block also contains Arabic punctuation like '؟' and harakat
 * (vowel marks). They count as Arabic, which only makes Arabic text more Arabic.
 */
export function detectLanguage(text: string): Lang {
  let best: Lang = 'en';
  let bestCount = 0;
  // Order matters only for a tie: Bengali, then Arabic, then English. A tie
  // means the user wrote as much in a non-Latin script as in English, so we
  // assume English is the "borrowed" part. (The spec does not define ties.)
  for (const lang of ['bn', 'ar', 'en'] as const) {
    const count = (text.match(SCRIPT_LETTERS[lang]) ?? []).length;
    if (count > bestCount) {
      best = lang;
      bestCount = count;
    }
  }
  if (best === 'en' && bestCount > 0 && isBanglish(text)) {
    return 'bn';
  }
  return best; // stays 'en' when no letter was found
}

// Wording from docs/SPEC.md section 6. The Arabic still needs checking by
// someone who reads Arabic (see the comment on waitMessage).
const WAIT_MESSAGES: Record<Lang, string> = {
  bn: 'এই মুহূর্তে অনেক প্রশ্ন আসছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।',
  en: "We're receiving a lot of questions right now. Please wait a little and try again.",
  ar: 'نتلقى عددًا كبيرًا من الأسئلة حاليًا. يرجى الانتظار قليلًا ثم المحاولة مرة أخرى.',
};

/**
 * The message shown in the chat when every AI is used up or down.
 * Suggested wording: docs/SPEC.md, section 6. Rules for all three languages:
 *  - written in that language,
 *  - asks the user to wait and try again,
 *  - never shows a technical word (error, quota, token, a status code),
 *  - short enough for a chat bubble.
 * Have the Arabic checked by someone who reads Arabic.
 */
export function waitMessage(lang: Lang): string {
  return WAIT_MESSAGES[lang];
}
