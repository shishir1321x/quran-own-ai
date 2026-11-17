// Prints the English text of every ayah in every theme, story and "something from the Quran" list,
// so a person can read each one against its theme: `npm run check-themes`.
import { loadQuran } from '../src/data.js';
import { GENERAL_AYAHS, THEMES } from '../src/lexicon.js';
import { STORIES } from '../src/themes_more.js';
import { cleanTranslation } from '../src/text.js';

const q = loadQuran();
const line = (s: number, a: number) => {
  const y = q.get(s, a);
  return y ? `  ${s}:${a}  ${cleanTranslation(y.en).slice(0, 120)}` : `  ${s}:${a}  *** DOES NOT EXIST ***`;
};
const only = process.argv[2];
for (const t of THEMES) {
  if (only && !t.id.toLowerCase().includes(only.toLowerCase())) continue;
  console.log(`\n# ${t.id}`);
  for (const [s, a] of t.ayahs) console.log(line(s, a));
}
if (!only || 'stories'.includes(only)) {
  for (const st of STORIES) {
    console.log(`\n# story: ${st.id}`);
    for (const [s, a] of st.ayahs.slice(0, 3)) console.log(line(s, a));
    if (st.ayahs.length > 3) console.log(`  ... ${st.ayahs.length} ayahs, ${st.ayahs[0].join(':')} to ${st.ayahs[st.ayahs.length - 1].join(':')}`);
  }
  console.log('\n# something from the Quran');
  for (const [s, a] of GENERAL_AYAHS) console.log(line(s, a));
}
