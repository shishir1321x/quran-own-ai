# Quran Assistant with no third-party AI

A small chat assistant for the Quran that **has no AI model behind it**. It searches the Quran text itself,
shows real ayahs (Arabic + a translation, taken from the data, never typed by a program), counts things
(ayahs per surah, Meccan and Medinan surahs, how often a word appears), and answers from written templates in
English, Bengali (also Banglish) and Arabic. It runs on Render's free plan: about 135 MB of memory, a few
milliseconds per question, no API key, no cost per question, no limit from an AI service.

It is **not a chatbot that talks**. It does not interpret ayahs itself, does not give rulings, and does not answer questions
outside the Quran. That is by design: everything it shows is real Quran text. For an explanation it shows **the translators'
own notes, word for word** (say "explain 2:255"): written by people, never by the assistant.

## How a question is answered (`src/engine.ts`)

The first step that applies answers:

1. **Safety**: a crisis message (care, no ayahs); a request to write or invent an ayah (refused); a question about a
   religious ruling (also when it is phrased as "is it compulsory", "must I", "do I have to"), about hadith,
   the virtue or benefit of reading a surah, or who is better than whom (all sent to a scholar). The same rules apply
   to a question that starts with "explain": "explain what is jihad" still goes to a scholar;
   and **sensitive topics** (jihad, war, slavery, apostasy, punishments for theft, ...): no ayahs are picked out for
   them, because they must not be read alone.
2. **Small talk and limits**: thanks, wishes (*Eid Mubarak*), greetings, "who are you / who made you / are you AI",
   **help** (what can I ask), "this answer is wrong" (feedback), and what it **cannot do** here: audio, prayer times,
   the qibla direction, dates of Eid, a zakat calculator (it says so instead of guessing).
3. **Numbers and facts** (`src/stats.ts`, computed from the data, with the line they came from): ayahs in a surah or
   a juz, longest/shortest surah, the longest ayah, Meccan/Medinan counts and **lists**, the list of surah names, the
   surah before or after another, how many juz, pages, hizb, sajdah ayahs, words, how often a word appears, and facts
   about one surah (Meccan or Medinan, which para it begins in, what its name means).
4. **The ayah of the day**, **references and famous passages**: `2:255`, *Ayat al-Kursi* (any spelling), *Amana
   ar-Rasul*, *Ayat-e-Karima*, *Bismillah*, *teen qul*, a **page** of the mushaf, a **juz (para)** (*para 3*, *Amma para*).
5. **A surah, by name or number, or a part of it**: *surah 36*, *last 2 ayat of surah baqarah*, *ayat 1 to 5 of surah alaq*.
6. **Follow-up**: "banglay ortho ki?" shows the ayahs of the chat so far with the Bengali translation.
   **Explain this ayah** (`explain 2:255`, `tafsir of Ayat al-Kursi`, `আয়াতুল কুরসির ব্যাখ্যা`): the translators' own
   explanatory notes for the ayah (or the first 4 ayahs of a surah), copied word for word from `data/notes.json`,
   shown in a collapsed block under the ayah. "What is the meaning of" an ayah is its translation, not the notes.
7. **Which ayah is this?** (`src/phrase.ts`): the words of an ayah in Arabic, English or Bengali are found, word for word.
8. **The story of a prophet or another person** (`STORIES` in `src/themes_more.ts`): the passage where the account begins.
9. **Checked themes** (`THEMES` in `src/lexicon.ts` and `src/themes_more.ts`): about 90 of them, from patience and mercy to
   jealousy, divorce, debt, friendship, the environment, animals, trials, destiny, angels, jinn, the grave, and
   **duas that are in the Quran** by what the person asks for (*dua for parents / forgiveness / knowledge / health /
   family*). A spelling mistake in an English word is corrected first, but only if it looks like a typing mistake.
10. **"Something from the Quran"** with no topic: three well-known ayahs.
11. **Search** (`src/search.ts`): BM25 over the English, Bengali and Arabic texts, with Banglish and prophet-name
    translation. An ayah is shown only if it covers enough of the question's words (rare words weigh more). If not: "not found".

After that, the answer can be changed by what the person asked: **"in Bengali", "in English", "only Arabic"** choose the
translation, and a request for a transliteration is answered with the ayahs and a note that it is not available.

There is no step that writes free text. Every sentence is in `src/templates.ts`.

**Checking the lists:** `npm run check-themes` prints the English text of every ayah in every theme, story and
"something from the Quran" list, so a reader can check each one against its theme.

## Run it on your computer

Node.js 20 or newer.

```
npm install
npm test            # 504 tests (including the page run in a fake browser)
npm run build
npm start           # http://localhost:8787
```
`data/quran.json` is in the repository. To rebuild it from the public files: `npm run build-data`.

Optional: `ACCESS_CODE=yourcode npm start` (the page then asks for the code in Settings) and
`RATE_LIMIT=30` (questions per IP per hour, the default).

## Put it on GitHub and deploy it on Render (free)

1. Create a new GitHub repository (separate from the Cloudflare one) and push this folder.
   Check first: `git status` must not list `node_modules` or `dist`.
2. On https://render.com: **New + > Web Service**, connect the repository.
   - Runtime: **Node**
   - Build command: `npm install --include=dev && npm run build`
   - Start command: `npm start`
   - Instance type: **Free**
   - Advanced: health check path `/health`; add `ACCESS_CODE` as an environment variable (recommended).
3. Deploy. You get a link like `https://quran-own-ai.onrender.com`.
(`render.yaml` has the same settings if you prefer a Blueprint.)

Limits of the free plan, **to be checked on Render's pricing page, they change**: the service goes to sleep after
about 15 minutes without visitors, and the first question after that waits a while (the page says so);
there is a monthly limit of free hours; the disk is not permanent (nothing here needs it).
The rate limiter lives in memory; with one instance that is reliable.

## Spelling

People write the same name in many ways. Names and common Banglish words are therefore also matched by their
**consonants** (`src/fuzzy.ts`): *dhairjo = dhoirjo = dhorjo*, *kursi = kurshi*, *আয়াতুল কুরসি = আয়াত আল কুরশি*.
The rule is strict on purpose (a looser one once took "the Quran" for "Ayat al-Kursi"): a skeleton that two different
names share is never guessed, a real English word is never "corrected", and a one-letter slip is tolerated only in a
single, longer word. If a spelling still fails, tell us the exact text and we add a test for it.

## The text: one thing to know

Tanzil's Arabic puts the bismillah in front of ayah 1 of every surah (2 to 114, except 9). It is not part of that ayah,
so `scripts/build-data.mjs` cuts it off (2:1 is only "الٓمٓ"); surah 1 keeps it because there it is ayah 1.
This is checked in `test/data.test.ts`. See `NOTICE.md` about the Tanzil "no changes" term.

## How well does it work? (`npm run eval`)

Nine sets (`testset/`), questions of many kinds. The answers were decided before running. All counts are real, from `npm run eval`.

| Set | First run, engine unchanged | After the fixes I made for it |
|---|---|---|
| `testset_30.csv` (the engine was built around this one) | 29/30 | 29/30 |
| `heldout_30.csv` | **24/30 (80%)** | 29/30 |
| `fresh_30.csv` | **19/30 (63%)** | 29/30 |
| `related_40.csv` (surah by number, parts, passages, para, surah facts, duas, typos) | **13/40 (33%)** | 40/40 |
| `related_fresh_42.csv` (the same kinds, new questions) | **37/42 (88%)** | 41/42 |
| `normal_users_75.csv` (what a normal user asks: find an ayah by its words, stories, ~40 more topics, the translation, lists, help, things it cannot do, rulings) | **18/75 (24%)** | 75/75 |
| `hidden_30.csv` (written together with the 75, **never run until the work was finished**) | **28/30 (93%)** | 30/30 |
| `explain_20.csv` (explain an ayah: the translators' notes) | **4/20 (20%)** | 20/20 |
| `explain_hidden_12.csv` (never run until the feature was finished; **close in style to the 20**, so it shows less than it seems) | **12/12** | 12/12 |

Only the **first-run numbers are honest estimates**: after a first run I fixed what I saw and ran again, so the last
column is optimistic. For `normal_users_75` the 24% is only the "before" picture (the features were built to pass it);
the fairest number for this kind of question is the 93% on `hidden_30`. Of its two misses, one was a mistake in my
scoring rule ("good evening" is a greeting) and one was a real engine fault (the spelling correction turned "recipe" into
"recite"), which led to the typing-mistake rule in `src/fuzzy.ts`. For open-ended topic questions the estimate is lower,
**roughly 60 to 80 percent**. Fake ayahs: 0 in every run (by construction: every ayah comes from the data).
The questions were written by the same people who wrote the engine, so real users will find more gaps.
One row of `related_fresh_42.csv` was changed on purpose: "What is the tafsir of Surah Fatiha?" was expected to go to a scholar, and now (by decision, with the explain feature) it shows the translators' notes.
**Next step: have someone else write 30 new questions and run them.**

Where it fails (known limits):
- It finds **words, not meanings**. A topic that is not in the theme list and is asked in other words may give
  a "not found", or an ayah that contains the word but is about something else.
- Banglish and Bengali vocabulary is small (`BANGLISH_TO_EN`, the theme words): "ekla" (lonely) is not known.
- A spelling mistake of more than one letter is not guessed (*forgivnes* is, *forgivness* is not corrected); a Banglish
  spelling is matched by consonants only for words we already know.
- Hadith, the virtue of a surah, and "who is better" questions are sent to a scholar: there are no hadith collections here.
- **Explanations are only the translators' notes**: 58% of ayahs have a Bengali note (Dr. Zakaria), 26% an English one
  (Saheeh International). There is no tafsir by Ibn Kathir or others (asking for one says so and shows the notes instead).
  The Bengali notes can contain hadith, and legal discussion written by the translator: they are shown word for word, only
  on request. Decide whether you want that (see NOTICE.md).
- Explanation works for one ayah, a short range, or the first 4 ayahs of a surah; "explain patience" asks which ayah.
- A question with one rare matching word and one common word can show a coincidental ayah ("world cup" -> "a full cup").
- General knowledge, jokes and chat are out of scope: it says "not found".
- Answers are in English, Bengali or Arabic only; other languages get English text.
- The Arabic and Bengali wording of the templates, **the 90 theme lists and the prophet stories (hand-chosen, about 450 ayahs)**,
  need to be checked by a person who knows the Quran. Some themes (hijab, divorce, adultery, killing) show ayahs without
  interpretation: decide whether you want them, or move them to the scholar list.

## Making it better

- Add themes and words: `THEMES` and `BANGLISH_TO_EN` in `src/lexicon.ts` (each needs a label in `src/templates.ts`).
  Add a test in `test/engine.test.ts` for each.
- Meaning-based search: compute an embedding of every ayah once with a small multilingual model, save the vectors
  next to `quran.json`, and add a nearest-neighbour step before BM25. Not done here: it needs a model download,
  more memory, and it must be measured with the test sets above before it replaces anything.
