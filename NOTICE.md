# Credits and licences of the Quran text

The text in `data/quran.json` comes from the open dataset **risan/quran-json**
(https://github.com/risan/quran-json, CC BY-SA 4.0 for the dataset). Each source keeps its own terms:

| What | Source | Version / terms |
|---|---|---|
| Arabic text (Uthmani, and simple-clean for searching only) | Tanzil Project, https://tanzil.net | Creative Commons Attribution 3.0. Verbatim copies only: **changing the text is not allowed.** |
| English translation | Saheeh International, via QuranEnc.com (`english_saheeh`) | v1.1.2. QuranEnc re-publication conditions: credit the publisher and QuranEnc.com, state the version, no changes to the text, keep up to date. |
| Bengali translation | Dr. Abu Bakr Muhammad Zakaria, via QuranEnc.com (`bengali_zakaria`) | v1.1.1. Same QuranEnc conditions. |

What this project does with the text:
- It stores the text as published. Footnotes are **not** stored. **One more change:** the bismillah that Tanzil
  welds to ayah 1 of surahs 2 to 114 (except 9) is cut off the Arabic, because it is not part of that ayah
  (see `withoutBismillah` in `scripts/build-data.mjs`). Tanzil's terms say the text may be copied verbatim only,
  so the supervisor should confirm this is acceptable. If not, show the Arabic as published and the first ayah of each
  surah will start with the bismillah.
- The page shows the translation without the verse number "(1)" and the footnote marks "[2]" (display only,
  see `cleanTranslation` in `src/text.ts`). Whether this counts as a "change" under the QuranEnc terms is
  for the supervisor to decide. To show the text exactly as published, make `cleanTranslation` return its input.
- **The translators' notes (`data/notes.json`).** The footnotes of the two translations are stored word for word (only the
  `<b>` tags are removed) and are shown only when the person asks for an explanation, under the translator's name. They are
  the translators' own scholarship, **not checked by this project**. The Bengali notes (Dr. Zakaria, 58% of ayahs, about
  4 MB of text) include explanations taken from classical tafsir, **hadith, and legal discussion**; the English notes
  (Saheeh International, 26% of ayahs) are short. Everything else in this assistant refuses to give hadith or rulings, so
  the supervisor should decide whether showing these notes is acceptable, and whether to limit them to some ayahs.
  QuranEnc's conditions (credit, version, no changes) apply to the notes in the same way as to the translations.
- The credit line is on the page. The version numbers are in `data/quran.json` (`meta`).

**Before a public launch, have someone confirm these terms** and have a person who knows the Quran check
the checked-ayah lists (`THEMES`, `GENERAL_AYAHS` in `src/lexicon.ts`) and the Arabic and Bengali wording in
`src/templates.ts`.
