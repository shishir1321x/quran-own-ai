// The chat page, served at "/". Plain HTML + JS, no build step. Everything from the server is put on
// the page with textContent (never innerHTML), so text from the data can't inject HTML or scripts.
// NOTE: this whole page is one TypeScript template string, so the script below must not use
// backticks, "${" or backslash escapes.
export const PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quran Assistant</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 760px; margin: 0 auto; padding: 1rem 1rem 0; line-height: 1.5; color: #222; }
  h1 { font-size: 1.4rem; margin: .5rem 0 .25rem; }
  .notice { font-size: .85rem; color: #555; background: #f4f4f4; padding: .6rem .8rem; border-radius: 6px; }
  details { font-size: .9rem; margin: .5rem 0; }
  input[type=password] { font: inherit; padding: .3rem .5rem; }
  #chat { display: flex; flex-direction: column; gap: .8rem; padding: 1rem 0; }
  .empty { color: #888; text-align: center; font-size: .95rem; padding: 2rem 0; }
  .msg { padding: .7rem 1rem; border-radius: 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .user { align-self: flex-end; max-width: 80%; background: #2a6b4f; color: #fff; border-bottom-right-radius: 4px; }
  .bot { align-self: flex-start; max-width: 95%; background: #fff; border: 1px solid #ddd; border-bottom-left-radius: 4px; }
  .thinking { color: #777; font-style: italic; }
  .wait { background: #fff8e5; border-color: #f0d48a; }
  .ayah { margin-top: 1rem; padding-top: .8rem; border-top: 1px solid #eee; }
  .ref { font-weight: 600; font-size: .9rem; color: #2a6b4f; }
  .arabic { font-size: 1.6rem; line-height: 2.4; text-align: right; font-family: "Amiri", "Scheherazade New", "Traditional Arabic", serif; }
  .meta { font-size: .8rem; color: #777; margin-top: .8rem; }
  .badge { display: inline-block; font-size: .75rem; padding: .1rem .5rem; border-radius: 999px; margin-bottom: .5rem; border: 1px solid #ddd; color: #555; background: #f7f7f7; }
  .badge.data { color: #1d4f8f; border-color: #b9d1ee; background: #eef5fd; }
  details.note { margin-top: .7rem; font-size: .9rem; }
  details.note summary { cursor: pointer; color: #2a6b4f; }
  .notetext { white-space: pre-wrap; overflow-wrap: anywhere; margin-top: .5rem; padding: .6rem .8rem; background: #f8faf8; border-left: 3px solid #2a6b4f; border-radius: 4px; max-height: 28rem; overflow-y: auto; }
  .datalines { font-size: .8rem; color: #555; white-space: pre-wrap; margin-top: .6rem; }
  form { position: sticky; bottom: 0; background: #fff; padding: .6rem 0 1rem; border-top: 1px solid #eee; }
  .row { display: flex; gap: .5rem; align-items: flex-end; }
  textarea { flex: 1; font: inherit; padding: .6rem; min-height: 2.8rem; max-height: 10rem; resize: vertical; box-sizing: border-box; border-radius: 8px; border: 1px solid #bbb; }
  button { font: inherit; padding: .55rem 1.1rem; cursor: pointer; border-radius: 8px; border: 1px solid #2a6b4f; background: #2a6b4f; color: #fff; }
  button.secondary { background: #fff; color: #2a6b4f; }
  button:disabled { opacity: .5; cursor: default; }
  .hint { font-size: .75rem; color: #888; margin-top: .3rem; }
  .chips { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .9rem; }
  button.chip { font-size: .85rem; padding: .3rem .8rem; border-radius: 999px; background: #eef6f1; color: #2a6b4f; border: 1px solid #b7d6c4; }
  button.chip:hover { background: #dcefe4; }
  button#mic { padding: .55rem .8rem; background: #fff; color: #2a6b4f; font-size: 1.1rem; line-height: 1; }
  button#mic.listening { background: #c0392b; border-color: #c0392b; color: #fff; animation: pulse 1.2s infinite; }
  @keyframes pulse { 50% { opacity: .6; } }
  select#voiceLang { font: inherit; font-size: .85rem; padding: .5rem .3rem; border-radius: 8px; border: 1px solid #bbb; background: #fff; }
  #voiceStatus { color: #2a6b4f; min-height: 1em; }
  footer { font-size: .72rem; color: #888; padding: .5rem 0 1.5rem; }
</style>
</head>
<body>
<h1>Quran Assistant</h1>
<p class="notice">Ask in English, বাংলা (or Banglish) or العربية. This assistant has no AI behind it: it searches the Quran text and shows
real ayahs with a translation, and it counts things (for example ayahs per surah). It does not interpret ayahs and gives no religious rulings:
for those, please ask a qualified scholar. To read an explanation, say <b>explain 2:255</b> (the translator's own notes, word for word). Type <b>help</b> to see what you can ask.</p>

<details>
  <summary>Settings</summary>
  <p><label>Access code (if required): <input type="password" id="access" autocomplete="off"></label></p>
  <p class="hint">Voice: the 🎤 button uses your browser's own speech recognition to turn what you say into text. In Chrome and Edge
  the sound is sent to Google's or Microsoft's speech service for that; this assistant only receives the text. If you do not want
  that, type your question instead. (Not every browser has speech recognition; then there is no 🎤 button.)</p>
</details>

<div id="chat"><div class="empty" id="empty">Start the conversation, e.g. "patience", "story of Yusuf", "last 2 ayat of surah baqarah", or type "help"</div></div>

<form id="f">
  <div class="row">
    <textarea id="q" maxlength="500" rows="1" placeholder="Type your message…" required></textarea>
    <select id="voiceLang" hidden title="The language you will speak" aria-label="The language you will speak">
      <option value="en-US">English</option>
      <option value="bn-BD">বাংলা</option>
      <option value="ar-SA">العربية</option>
    </select>
    <button type="button" id="mic" hidden title="Speak your question" aria-label="Speak your question" aria-pressed="false">🎤</button>
    <button type="submit" id="btn">Send</button>
    <button type="button" id="newChat" class="secondary" title="Forget this conversation">New chat</button>
  </div>
  <div class="hint">Enter to send, Shift+Enter for a new line.</div>
  <div class="hint" id="voiceStatus" aria-live="polite"></div>
</form>

<footer id="credits">Arabic text: Tanzil Project (CC BY 3.0). English: Saheeh International. Bengali: Dr. Abu Bakr Muhammad Zakaria. Translations via QuranEnc.com.</footer>

<script>
const $ = (id) => document.getElementById(id);
function el(tag, cls, text, attrs) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  for (const k in (attrs || {})) e.setAttribute(k, attrs[k]);
  return e;
}

// The conversation so far: only answers that worked. Kept in this tab only. The server uses at most the last 3.
const history = [];

function show(node) {
  const empty = $('empty');
  if (empty) empty.remove();
  $('chat').append(node);
  node.scrollIntoView({ block: 'end', behavior: 'smooth' });
}

$('q').addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) {
    ev.preventDefault();
    $('f').requestSubmit();
  }
});

$('newChat').addEventListener('click', () => {
  history.length = 0;
  $('chat').replaceChildren(el('div', 'empty', 'New chat started. Ask anything about the Quran.', { id: 'empty' }));
  $('q').focus();
});

// Voice: the browser's own speech recognition turns speech into text (Chrome and Edge use their makers' online speech
// service for it). This server only ever receives the text, exactly as if it had been typed. No key, no AI on the server.
const Recognizer = window.SpeechRecognition || window.webkitSpeechRecognition;
let listening = null;
if (Recognizer) {
  $('mic').hidden = false;
  $('voiceLang').hidden = false;
  let saved = null;
  try { saved = localStorage.getItem('voiceLang'); } catch (e) { /* storage blocked: fine */ }
  const nav = (navigator.language || '').toLowerCase();
  $('voiceLang').value = saved || (nav.startsWith('bn') ? 'bn-BD' : nav.startsWith('ar') ? 'ar-SA' : 'en-US');
  $('voiceLang').addEventListener('change', () => { try { localStorage.setItem('voiceLang', $('voiceLang').value); } catch (e) { /* fine */ } });
  $('mic').addEventListener('click', () => {
    if (listening) { listening.stop(); return; }          // a second tap stops listening
    const rec = new Recognizer();
    rec.lang = $('voiceLang').value;
    rec.interimResults = true;                             // the words appear in the box while you speak
    rec.continuous = false;                                // one question, then it stops by itself
    rec.maxAlternatives = 1;
    let heard = '', done = false, failed = false;
    rec.onresult = (ev) => {
      heard = '';
      for (let i = 0; i < ev.results.length; i++) {
        heard += ev.results[i][0].transcript;
        if (ev.results[i].isFinal) done = true;
      }
      $('q').value = heard;
    };
    rec.onerror = (ev) => {
      failed = true;
      $('voiceStatus').textContent = ev.error === 'not-allowed' || ev.error === 'service-not-allowed'
        ? 'The microphone is not allowed. Allow it for this page in the browser, or type your question.'
        : ev.error === 'no-speech' ? 'I did not hear anything. Tap 🎤 and speak again.'
        : 'Voice did not work this time. Please try again, or type your question.';
    };
    rec.onend = () => {
      listening = null;
      $('mic').classList.remove('listening');
      $('mic').setAttribute('aria-pressed', 'false');
      if (failed) return;
      $('voiceStatus').textContent = '';
      if (done && heard.trim()) $('f').requestSubmit();   // send what was said, like Enter
    };
    listening = rec;
    $('mic').classList.add('listening');
    $('mic').setAttribute('aria-pressed', 'true');
    $('voiceStatus').textContent = 'Listening… speak now. Tap 🎤 again to stop.';
    try { rec.start(); } catch (e) { listening = null; $('mic').classList.remove('listening'); $('voiceStatus').textContent = 'Voice could not start. Please type your question.'; }
  });
}

$('f').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const question = $('q').value.trim();
  if (!question || $('btn').disabled) return;
  $('q').value = '';
  show(el('div', 'msg user', question, { dir: 'auto' }));
  const pending = el('div', 'msg bot thinking', 'Searching the Quran…');
  show(pending);
  $('btn').disabled = true;
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question, history: history.slice(-3), accessCode: $('access').value }),
    });
    const r = await res.json();
    const reply = render(r);
    pending.replaceWith(reply);
    reply.scrollIntoView({ block: 'start', behavior: 'smooth' });
    if (r.status === 'ok') {
      history.push({ question, answer: r.answer,
                     citations: (r.ayahs || []).map((a) => ({ surah: a.surah, ayah: a.ayah })) });
    }
  } catch (e) {
    pending.replaceWith(el('div', 'msg bot wait', 'Could not reach the server. If it was asleep, please wait a few seconds and try again.'));
  } finally {
    $('btn').disabled = false;
    $('q').focus();
  }
});

function render(r) {
  const dir = r.lang === 'ar' ? 'rtl' : 'ltr';
  if (r.status !== 'ok') {
    return el('div', 'msg bot wait', r.message || 'Something went wrong.', { dir: 'auto', lang: r.lang || 'en' });
  }
  const box = el('div', 'msg bot');
  if (r.mode === 'data') box.append(el('div', 'badge data', 'Numbers computed from the Quran text'));
  box.append(el('div', null, r.answer, { dir: 'auto', lang: r.lang }));
  if (r.data && r.data.length) box.append(el('div', 'datalines', 'Data used: ' + r.data.join(' | ')));
  for (const a of r.ayahs || []) {
    const d = el('div', 'ayah');
    d.append(el('div', 'ref', a.surahNameEn + ' ' + a.surah + ':' + a.ayah));
    if (a.arabic) d.append(el('div', 'arabic', a.arabic, { dir: 'rtl', lang: 'ar' }));
    if (a.translation) d.append(el('div', null, a.translation, { lang: a.translationEdition.startsWith('bn') ? 'bn' : 'en' }));
    if (a.note) {
      // the translator's own note, word for word; open on tap. Text only, never HTML.
      const det = el('details', 'note');
      det.append(el('summary', null, 'Translator\u2019s notes: ' + a.note.source));
      det.append(el('div', 'notetext', a.note.text, { dir: 'auto', lang: a.translationEdition.startsWith('bn') ? 'bn' : 'en' }));
      d.append(det);
    }
    box.append(d);
  }
  // what to ask next: a tap puts the question in the box and sends it (text only, never HTML)
  if (r.suggestions && r.suggestions.length) {
    const chips = el('div', 'chips');
    for (const s of r.suggestions) {
      const b = el('button', 'chip', s, { type: 'button', dir: 'auto' });
      b.addEventListener('click', () => {
        if ($('btn').disabled) return;
        $('q').value = s;
        $('f').requestSubmit();
      });
      chips.append(b);
    }
    box.append(chips);
  }
  return box;
}
</script>
</body>
</html>`;
