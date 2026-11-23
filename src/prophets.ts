// The prophets named in the Quran: "which prophets are mentioned?", "how many times is Musa mentioned?".
//
// The LIST of 25 is chosen by hand (the 25 prophets usually listed as named in the Quran). The AYAHS are found in the
// data with the same rule as the animals (src/animals.ts): the name must be in the Arabic text of the ayah AND in its
// English translation (Saheeh International). That keeps out other words that look the same in Arabic:
// صالح "righteous", هود "Jews", نوحي "We reveal", يحيي "gives life", كفل "took charge of".
// Only the NAME is counted: a title (المسيح "the Messiah", ذا النون "the man of the fish") is not.
// HAVE THIS LIST CHECKED by a person with religious knowledge (`npm run check-themes prophets` prints every ayah).
import type { Quran } from './data.js';
import type { Lang } from './types.js';
import { normAr } from './text.js';
import { stemRe, withoutSurahName } from './animals.js';
import { phoneticFirstClass, phoneticTermKey, phoneticTermKeyFlex } from './phoneticNorm.js';

export interface Prophet {
  id: string;
  name: Record<Lang, string>;
  /** Arabic stems as normAr writes them */
  ar: string[];
  /** the name in the English translation (letters only: marks and the kind of apostrophe are taken off first) */
  en: RegExp;
  /** words a person uses to ask about him: English and Banglish whole words, Bengali word starts, Arabic words (normAr) */
  ask: string[];
}

// In the order in which they are usually listed (Adam first, Muhammad last).
export const PROPHETS: Prophet[] = [
  { id: 'adam', name: { en: 'Adam', bn: 'আদম', ar: 'آدم' }, ar: ['ادم'], en: /\bAdam\b/, ask: ['adam', 'আদম', 'ادم'] },
  { id: 'idris', name: { en: 'Idris', bn: 'ইদরিস', ar: 'إدريس' }, ar: ['ادريس'], en: /\bIdrees\b|\bIdris\b/, ask: ['idris', 'idrees', 'enoch', 'ইদরিস', 'ইদ্রিস', 'ادريس'] },
  { id: 'nuh', name: { en: 'Nuh (Noah)', bn: 'নূহ', ar: 'نوح' }, ar: ['نوح'], en: /\bNoah\b/, ask: ['nuh', 'nooh', 'noah', 'নূহ', 'নুহ', 'نوح'] },
  { id: 'hud', name: { en: 'Hud', bn: 'হূদ', ar: 'هود' }, ar: ['هود'], en: /\bHud\b/, ask: ['hud', 'hood', 'হূদ', 'হুদ', 'هود'] },
  { id: 'salih', name: { en: 'Salih', bn: 'সালেহ', ar: 'صالح' }, ar: ['صالح'], en: /\bSalih\b|\bSaleh\b/, ask: ['salih', 'saleh', 'সালেহ', 'সালিহ', 'صالح'] },
  { id: 'ibrahim', name: { en: 'Ibrahim (Abraham)', bn: 'ইবরাহিম', ar: 'إبراهيم' }, ar: ['ابراهيم'], en: /\bAbraham\b/, ask: ['ibrahim', 'ibraheem', 'abraham', 'ইবরাহিম', 'ইবরাহীম', 'ইব্রাহিম', 'ابراهيم'] },
  { id: 'lut', name: { en: 'Lut (Lot)', bn: 'লূত', ar: 'لوط' }, ar: ['لوط'], en: /\bLot\b/, ask: ['lut', 'loot', 'লূত', 'লুত', 'لوط'] },
  { id: 'ismail', name: { en: 'Ismail (Ishmael)', bn: 'ইসমাঈল', ar: 'إسماعيل' }, ar: ['اسماعيل'], en: /\bIshmael\b/, ask: ['ismail', 'ismael', 'ishmael', 'ইসমাঈল', 'ইসমাইল', 'اسماعيل'] },
  { id: 'ishaq', name: { en: 'Ishaq (Isaac)', bn: 'ইসহাক', ar: 'إسحاق' }, ar: ['اسحاق'], en: /\bIsaac\b/, ask: ['ishaq', 'ishak', 'isaac', 'ইসহাক', 'اسحاق'] },
  { id: 'yaqub', name: { en: 'Yaqub (Jacob)', bn: 'ইয়াকুব', ar: 'يعقوب' }, ar: ['يعقوب'], en: /\bJacob\b/, ask: ['yaqub', 'yakub', 'yaqoob', 'jacob', 'ইয়াকুব', 'ইয়াকূব', 'يعقوب'] },
  { id: 'yusuf', name: { en: 'Yusuf (Joseph)', bn: 'ইউসুফ', ar: 'يوسف' }, ar: ['يوسف'], en: /\bJoseph\b/, ask: ['yusuf', 'yousuf', 'yousef', 'joseph', 'ইউসুফ', 'يوسف'] },
  { id: 'ayyub', name: { en: 'Ayyub (Job)', bn: 'আইয়ুব', ar: 'أيوب' }, ar: ['ايوب'], en: /\bJob\b/, ask: ['ayyub', 'ayub', 'ayoub', 'আইয়ুব', 'আইয়ূব', 'ايوب'] },
  { id: 'shuayb', name: { en: "Shu'ayb", bn: 'শুআইব', ar: 'شعيب' }, ar: ['شعيب'], en: /\bShu\W?ayb\b/, ask: ['shuayb', 'shuaib', 'shoaib', 'shoaib', 'শুআইব', 'শুয়াইব', 'শোয়াইব', 'شعيب'] },
  { id: 'musa', name: { en: 'Musa (Moses)', bn: 'মূসা', ar: 'موسى' }, ar: ['موسي'], en: /\bMoses\b/, ask: ['musa', 'moosa', 'moses', 'মূসা', 'মুসা', 'موسي'] },
  { id: 'harun', name: { en: 'Harun (Aaron)', bn: 'হারূন', ar: 'هارون' }, ar: ['هارون'], en: /\bAaron\b/, ask: ['harun', 'haroon', 'aaron', 'হারূন', 'হারুন', 'هارون'] },
  { id: 'dhulkifl', name: { en: 'Dhul-Kifl', bn: 'যুলকিফল', ar: 'ذو الكفل' }, ar: ['كفل'], en: /\bDhul-?Kifl\b/, ask: ['dhul-kifl', 'dhulkifl', 'zulkifl', 'যুলকিফল', 'জুলকিফল', 'كفل'] },
  { id: 'dawud', name: { en: 'Dawud (David)', bn: 'দাউদ', ar: 'داود' }, ar: ['داوود', 'داود'], en: /\bDavid\b/, ask: ['dawud', 'dawood', 'daud', 'david', 'দাউদ', 'داود', 'داوود'] },
  { id: 'sulayman', name: { en: 'Sulayman (Solomon)', bn: 'সুলাইমান', ar: 'سليمان' }, ar: ['سليمان'], en: /\bSolomon\b/, ask: ['sulaiman', 'sulayman', 'solomon', 'সুলাইমান', 'সোলায়মান', 'سليمان'] },
  { id: 'ilyas', name: { en: 'Ilyas (Elias)', bn: 'ইলইয়াস', ar: 'إلياس' }, ar: ['الياس', 'ياسين'], en: /\bElias\b/, ask: ['ilyas', 'elias', 'ইলইয়াস', 'ইলিয়াস', 'الياس'] },
  { id: 'alyasa', name: { en: 'Al-Yasa (Elisha)', bn: 'আল-ইয়াসা', ar: 'اليسع' }, ar: ['اليسع'], en: /\bElisha\b/, ask: ['alyasa', 'al-yasa', 'elisha', 'ইয়াসা', 'اليسع'] },
  { id: 'yunus', name: { en: 'Yunus (Jonah)', bn: 'ইউনুস', ar: 'يونس' }, ar: ['يونس'], en: /\bJonah\b/, ask: ['yunus', 'younus', 'jonah', 'ইউনুস', 'ইউনূস', 'يونس'] },
  { id: 'zakariyya', name: { en: 'Zakariyya (Zechariah)', bn: 'যাকারিয়া', ar: 'زكريا' }, ar: ['زكريا'], en: /\bZechariah\b/, ask: ['zakariya', 'zakariyya', 'zakaria', 'zechariah', 'যাকারিয়া', 'জাকারিয়া', 'زكريا'] },
  { id: 'yahya', name: { en: 'Yahya (John)', bn: 'ইয়াহইয়া', ar: 'يحيى' }, ar: ['يحيي'], en: /\bJohn\b/, ask: ['yahya', 'ইয়াহইয়া', 'ইয়াহিয়া', 'يحيي'] },
  { id: 'isa', name: { en: 'Isa (Jesus)', bn: 'ঈসা', ar: 'عيسى' }, ar: ['عيسي'], en: /\bJesus\b/, ask: ['isa', 'eesa', 'jesus', 'ঈসা', 'ইসা', 'عيسي'] },
  { id: 'muhammad', name: { en: 'Muhammad', bn: 'মুহাম্মাদ', ar: 'محمد' }, ar: ['محمد', 'احمد'], en: /\bMuhammad\b|\bAhmad\b/, ask: ['muhammad', 'mohammad', 'mohammed', 'muhammed', 'ahmad', 'মুহাম্মাদ', 'মুহাম্মদ', 'মোহাম্মদ', 'محمد', 'احمد'] },
];

export interface ProphetHit { prophet: Prophet; ayahs: Array<{ s: number; a: number; times: number }> }

const plainEn = (s: string) => s.normalize('NFD').replace(/\p{M}+/gu, '');
let cache: { q: Quran; hits: ProphetHit[] } | null = null;

/** Every prophet with the ayahs that name him (Arabic AND English), in the order of the list. Computed once. */
export function prophetHits(q: Quran): ProphetHit[] {
  if (cache?.q === q) return cache.hits;
  const arabic = q.ayahs.map((y) => normAr(y.arc));
  const english = q.ayahs.map((y) => plainEn(y.en));
  const hits = PROPHETS.map((prophet) => {
    const re = stemRe(prophet.ar);
    const every = stemRe(prophet.ar, 'g');
    const ayahs = q.ayahs.flatMap((y, i) => (re.test(arabic[i]) && prophet.en.test(english[i])
      ? [{ s: y.s, a: y.a, times: arabic[i].match(every)?.length ?? 1 }] : []));
    return { prophet, ayahs };
  });
  cache = { q, hits };
  return hits;
}

/** The prophets named in one surah, or in the whole Quran. */
export function prophetsIn(q: Quran, surah?: number): ProphetHit[] {
  const all = prophetHits(q);
  if (!surah) return all.filter((h) => h.ayahs.length > 0);
  return all.map((h) => ({ prophet: h.prophet, ayahs: h.ayahs.filter((x) => x.s === surah) })).filter((h) => h.ayahs.length > 0);
}

/** The prophets a question names ("how many times is MUSA mentioned?"), not counting the name of a surah ("surah yusuf"). */
export function prophetsNamedIn(question: string): Prophet[] {
  const text = normAr(withoutSurahName(question)).toLowerCase();
  const latinList = text.match(/[a-z]+(?:-[a-z]+)?/g) ?? [];
  const latin = new Set(latinList);
  const latinPhon = latinList
    .filter((w) => w.length >= 4 && /^[a-z]+$/.test(w))
    .map((w) => ({ w, k: phoneticTermKey(w), kf: phoneticTermKeyFlex(w), f: phoneticFirstClass(w) }));
  const arabic = (text.match(/[؀-ۿ]+/g) ?? []).flatMap((w) => {
    const out = [w];
    for (const re of [/^(?:و|ف)/, /^(?:ب|ل|ك)/, /^(?:ال|لل)/]) { const last = out[out.length - 1]; if (re.test(last) && last.length > 3) out.push(last.replace(re, '')); }
    return out;
  });
  return PROPHETS.filter((p) => p.ask.some((w) => {
    if (/^[a-z-]+$/.test(w)) {
      if (latin.has(w)) return true;
      if (w.length >= 4 && /^[a-z]+$/.test(w) && latinPhon.length > 0) {
        const k = phoneticTermKey(w), kf = phoneticTermKeyFlex(w), f = phoneticFirstClass(w);
        return latinPhon.some((q) => q.f === f && Math.abs(q.w.length - w.length) <= 2 && (q.k === k || (w.length >= 5 && q.kf === kf)));
      }
      return false;
    }
    if (/[ঀ-৿]/.test(w)) return new RegExp(`(?<![\\u0980-\\u09FF])${w.normalize('NFC')}`).test(text);
    return arabic.includes(normAr(w));
  }));
}
