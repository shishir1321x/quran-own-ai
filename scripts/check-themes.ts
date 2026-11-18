// Prints the English text of every ayah in every theme, story and "something from the Quran" list,
// so a person can read each one against its theme: `npm run check-themes`.
import { loadQuran } from '../src/data.js';
import { GENERAL_AYAHS, THEMES } from '../src/lexicon.js';
import { STORIES } from '../src/themes_more.js';
import { cleanTranslation } from '../src/text.js';
import { animalHits } from '../src/animals.js';
import { prophetHits } from '../src/prophets.js';

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
// the animals named in the Quran: the kinds are chosen by hand, the ayahs are found in the text (src/animals.ts)
if (!only || 'animals'.includes(only.toLowerCase())) {
  const hits = animalHits(q);
  console.log(`\n# animals named in the Quran: ${hits.length} kinds (each ayah has the name in the Arabic AND in the English)`);
  for (const h of hits) {
    console.log(`\n## ${h.kind.name.en} / ${h.kind.name.bn} / ${h.kind.name.ar}  (Arabic: ${h.kind.ar.join(', ')})`);
    for (const { s, a } of h.ayahs) console.log(line(s, a));
  }
}
// the prophets named in the Quran: the 25 names are chosen by hand, the ayahs are found in the text (src/prophets.ts)
if (!only || 'prophets'.includes(only.toLowerCase())) {
  console.log('\n# prophets named in the Quran (each ayah has the name in the Arabic AND in the English)');
  for (const h of prophetHits(q)) {
    console.log(`\n## ${h.prophet.name.en} / ${h.prophet.name.bn} / ${h.prophet.name.ar}  (Arabic: ${h.prophet.ar.join(', ')})`);
    for (const { s, a } of h.ayahs) console.log(line(s, a));
  }
}
