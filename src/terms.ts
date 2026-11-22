// The Terms & privacy page, served at "/terms". Plain language, written for what THIS assistant really does
// (test/terms.test.ts checks the main promises against the code: no question text in the logs, the sources, ...).
// When the assistant changes, change this page too, and the date at the top.
// NOTE: one TypeScript template string: no backticks and no "${" inside.
export const TERMS_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Terms &amp; privacy · Quran Assistant from Amal</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 1rem 1.1rem calc(2rem + env(safe-area-inset-bottom)); line-height: 1.65; color: #222; }
  a { color: #2a6b4f; }
  .back { display: inline-block; margin: .3rem 0 .6rem; text-decoration: none; font-size: .95rem; }
  h1 { font-size: 1.6rem; margin: .4rem 0 .2rem; }
  .updated { color: #777; font-size: .85rem; margin: 0 0 1rem; }
  .glance { border: 1px solid #b7d6c4; background: #f3faf6; border-radius: 14px; padding: .9rem 1.2rem; margin: 1.2rem 0; }
  .glance h2 { margin: 0 0 .3rem; font-size: 1.08rem; }
  .glance ul { margin: .2rem 0; padding-left: 1.2rem; }
  .glance li { margin: .3rem 0; }
  .glance li::marker { color: #2a6b4f; }
  .small { color: #666; font-size: .88rem; }
  h2 { font-size: 1.12rem; margin: 1.8rem 0 .4rem; }
  h2 .n { color: #2a6b4f; margin-right: .55rem; font-variant-numeric: tabular-nums; }
  .note { border-left: 3px solid #2a6b4f; background: #f6f6f6; padding: .7rem 1rem; border-radius: 0 10px 10px 0; margin: .8rem 0; }
  ul { padding-left: 1.2rem; }
  li { margin: .25rem 0; }
  footer { margin-top: 2.2rem; color: #888; font-size: .82rem; }
</style>
</head>
<body>
<a class="back" href="/">← Back to the chat</a>
<h1>Terms &amp; privacy</h1>
<p class="updated">Last updated: 22 November 2026</p>
<p>This page explains, in plain words, what this Quran assistant is, what happens with your questions, and what you can
expect from it. By using the assistant you agree to it.</p>

<section class="glance">
  <h2>At a glance</h2>
  <ul>
    <li>A free study tool from Amal: it finds real ayahs and counts things in the Quran text. No AI writes its answers.</li>
    <li>It is not a religious authority. It gives no fatwas, rulings or tafsir of its own: ask a qualified scholar.</li>
    <li>The text of your questions is not saved. There are no accounts, no saved chats and no ads.</li>
    <li>Voice is optional: your browser turns speech into text (Chrome and Edge send the sound to Google or Microsoft for that).</li>
    <li>You need an access code from the people who gave you the link. Please do not pass it on.</li>
    <li>It is provided as it is: it can be asleep, slow or unavailable, and it can choose or count something wrongly.</li>
  </ul>
</section>

<h2><span class="n">1</span>What this assistant is</h2>
<p>Quran Assistant from Amal: a small program that searches the Arabic text of the whole Quran (6236 ayahs) and shows real ayahs
with an English translation (Saheeh International) and a Bengali translation (Dr. Abu Bakr Muhammad Zakaria). It also counts
things in the text, for example the ayahs of a surah, the animals and prophets named in it, or how often a word is used.
It understands English, Bengali (also Banglish) and Arabic.</p>
<p>It has no third-party AI: no language model writes its answers. Every ayah comes from the published text, and every
sentence around it was written by people. It never writes, completes or invents an ayah.</p>

<h2><span class="n">2</span>About religious content</h2>
<div class="note">This assistant is not a religious authority. It does not interpret ayahs, and it gives no rulings, hadith or
tafsir of its own. For any question about what you should do, please ask a qualified scholar you trust.</div>
<ul>
  <li>When you ask for an explanation ("explain 2:255"), it shows the translators' own notes, word for word and under their
  names. They are the translators' work; this project has not checked them.</li>
  <li>The ayahs shown for a topic, and the lists of animals and prophets, were chosen by hand and have not yet been checked by
  a scholar. A count depends on how it is counted; the answer always says how.</li>
  <li>Some topics need their context and knowledge of Islamic law. For those, the assistant does not pick out ayahs.</li>
  <li>Read the ayahs in their context, in a complete mushaf and translation.</li>
</ul>

<h2><span class="n">3</span>Who can use it</h2>
<p>Anyone who has been given the link and the access code. The code is for the people it was given
to: please do not post it or pass it on. If it spreads too widely it will be changed, and the old code stops working.</p>

<h2><span class="n">4</span>What happens with your questions</h2>
<ul>
  <li>Your question goes to the server, which answers it and then forgets it. <b>The text of your questions is not saved.</b></li>
  <li>To understand a follow-up ("show more", "how many?"), your browser sends the last three questions and answers of the
  chat along with a new question. They are used for that answer only. "New chat" or closing the page clears them.</li>
  <li>For each question the server writes one line to its log: the kind of answer, the language, how many ayahs it showed,
  how long it took, and how many letters the question had. Not the question itself.</li>
  <li>To prevent overuse, the server counts questions per internet address (120 an hour unless it was set otherwise). That count
  is kept in memory only, and is gone after an hour or a restart.</li>
  <li>The only thing your browser remembers for this site is the voice language you picked.</li>
  <li>There are no accounts, no tracking cookies and no ads.</li>
  <li>The assistant runs on the servers of Render (a hosting company). Like any web host, Render may keep standard technical
  records of requests, such as the internet address they came from; Render's own privacy policy applies to those.</li>
</ul>

<h2><span class="n">5</span>Voice</h2>
<p>The 🎤 button is optional. It uses your browser's own speech recognition to turn what you say into text. Chrome and Edge
send the sound to Google's or Microsoft's speech service to do that; Safari uses Apple's. The assistant itself only receives
the text, exactly as if you had typed it. If you do not want your voice to be sent anywhere, please type instead. Browsers
without speech recognition show no 🎤 button.</p>

<h2><span class="n">6</span>Using it fairly</h2>
<p>Please do not:</p>
<ul>
  <li>try to overload it, break it, or get around the access code;</li>
  <li>send it questions by an automatic program;</li>
  <li>present what it shows as more than it is: a translation or a translator's note as the words of the Quran itself, or a
  count or a list as a religious ruling.</li>
</ul>

<h2><span class="n">7</span>Sources and credits</h2>
<ul>
  <li>Arabic text: Tanzil Project (tanzil.net), Creative Commons Attribution, CC BY 3.0.</li>
  <li>English: Saheeh International (version 1.1.2), and Bengali: Dr. Abu Bakr Muhammad Zakaria (version 1.1.1), both via
  QuranEnc.com and under its conditions.</li>
  <li>The files come from the open dataset risan/quran-json.</li>
</ul>
<p class="small">The text is shown as published, with two display choices: the bismillah is not shown as part of ayah 1 of
surahs 2 to 114 (surah 9 has none), and the translations are shown without their verse numbers and footnote marks.</p>

<h2><span class="n">8</span>No guarantees</h2>
<p>The assistant is free and is provided as it is. It may be asleep (the first visit after a quiet time can take about a
minute), slow, or unavailable, and its free hosting has limited hours. It can show an ayah that does not fit your question,
miss one that does, or count something wrongly. Please use your own judgement: the people who run it cannot be responsible
for decisions made from its answers.</p>

<h2><span class="n">9</span>Changes to these terms</h2>
<p>This page may change when the assistant changes. The date at the top shows the last change. Using the assistant after a
change means you accept the new version.</p>

<h2><span class="n">10</span>Questions</h2>
<p>Ask the people who gave you the link and the access code. To report a wrong answer, tell them exactly what you asked and
what was wrong, so that it can be fixed.</p>

<footer><a href="/">← Back to the chat</a> · Quran Assistant from Amal</footer>
</body>
</html>`;
