/**
 * Sentence-level non-Quran practical domain classifier (zero third-party AI).
 * Prevents everyday practical sentences (orders, cooking, DIY, workouts, IT, finance, travel, trivia)
 * from falling into raw BM25 word matching and returning unrelated Quran verses.
 *
 * Caller in engine.ts already checks:
 *  - !aboutQuran (no Quran/Allah/prophet/surah/ayah/dua terms)
 *  - !phrases.find(rawText) (not a verbatim Quranic quote)
 *  - !REF && !SURAH_WORD_RE && !meaning/definition query
 *  - after personal crisis & emotional/spiritual classifySituation()
 */

export type DomainId =
  | 'ecommerce_support'
  | 'cooking_food'
  | 'home_diy'
  | 'health_fitness'
  | 'tech_coding'
  | 'business_finance'
  | 'travel_places'
  | 'general_knowledge';

const ECOMMERCE_RE =
  /\b(?:where\s+is\s+my\s+order|track\s+my\s+(?:package|order)|return\s+policy|shipping\s+(?:address|label|take|cost|carrier)|promo\s+code|discount\s+code|cancel\s+(?:my\s+)?(?:subscription|order|membership)|refund|(?:my\s+)?card\s+declined|billing\s+(?:info|department)|download\s+my\s+invoice|gift\s+card|loyalty\s+(?:program|points)|store\s+credit|warranty\s+claim|guest\s+checkout|support\s+(?:ticket|hours)|human\s+agent|charged\s+twice|out\s+of\s+stock)\b/i;

const COOKING_RE =
  /\b(?:recipe|recipes|how\s+(?:long\s+)?to\s+(?:cook|bake|boil|roast|grill|poach|fry|sear|blanch|thaw|reheat|caramelize|season\s+a\s+(?:wok|pan|skillet))|baking\s+(?:soda|powder)|buttermilk|sourdough|scrambled\s+eggs|pasta\s+sauce|guacamole|vinaigrette|smoothie|french\s+toast|pancakes|matcha\s+latte|overnight\s+oats|air\s+fryer|cast[- ]iron\s+(?:skillet|pan)|medium[- ]rare\s+steak|pair\s+with\s+steak|meal\s+prep|lactose\s+intolerant|keto\s+diet|gluten[- ]free\s+flour)\b/i;

const HOME_DIY_RE =
  /\b(?:remove\s+(?:[a-z]+\s+){0,2}(?:stains?|residue|wax)|unclog\s+a\s+(?:drain|sink|toilet)|running\s+toilet|squeaky\s+door|fold\s+a\s+fitted\s+sheet|houseplants?|indoor\s+plants?|fruit\s+flies|get\s+rid\s+of\s+(?:ants|mice|pests|mold|musty)|clean\s+(?:a\s+|my\s+)?(?:washing\s+machine|mattress|hardwood|stainless\s+steel|windows|coffee\s+maker|silver\s+jewelry)|jump[- ]start\s+a\s+car|flat\s+tire|car\s+(?:battery|emergency\s+kit|breaks?\s+down)|potty\s+train\w*|train\s+a\s+puppy|rescue\s+dog|capsule\s+wardrobe|what\s+(?:should\s+i|to)\s+wear\s+(?:to|for|at)|outfit\s+(?:for|ideas?)|gift\s+(?:for\s+my|ideas?)|buy\s+a\s+gift|what\s+(?:should\s+i|to)\s+cook\s+for|dinner\s+ideas|miss(?:ed)?\s+my\s+(?:bus|train|flight)|tie\s+a\s+necktie|iron\s+a\s+dress\s+shirt)\b/i;

const HEALTH_FITNESS_RE =
  /\b(?:home\s+workout|bodyweight\s+exercises?|cardio\s+vs|strength\s+training|build\s+muscle|calorie\s+(?:deficit|needs)|how\s+many\s+calories|stretches?\s+for\s+(?:lower\s+back|neck|tight\s+hips|runners)|bad\s+posture|sugar\s+cravings|yoga\s+poses|pilates|hiit\s+workout|pre[- ]workout|post[- ]workout|whey\s+(?:and|vs)|creatine|magnesium\s+supplements?|progressive\s+overload|foam\s+rolling|5k\s+run|zone\s+2\s+cardio|basal\s+metabolic|rem\s+sleep|circadian\s+rhythm|migraine|headaches?|toothache|sore\s+throat|sunburn|acne|dandruff|hiccups|snoring|muscle\s+cramps?)\b/i;

const TECH_CODING_RE =
  /\b(?:nullpointerexception|modulenotfounderror|segmentation\s+fault|javascript|typescript|python|java\b|c\+\+|golang|rust\b|html|css|flexbox|sql\s+query|nosql|git\s+(?:commit|branch|rebas\w*|merg\w*)|docker|kubernetes|rest\s+api|graphql|webassembly|vlookup|pivot\s+table|chrome\s+(?:cache|devtools)|wi[- ]fi\s+error|bluetooth\s+headphones|set\s+up\s+a\s+vpn|wireless\s+printer|bootable\s+usb|ssh\s+into|cors\s+error|big\s+o\s+notation|binary\s+search\s+tree|laptop\s+running\s+slowly|phone\s+battery\s+draining|proofread\s+this|apa\s+format|mla\s+format|oxford\s+comma|passive\s+voice)\b/i;

const BUSINESS_FINANCE_RE =
  /\b(?:behavioral\s+interview|profit\s+margin|roth\s+ira|traditional\s+ira|401\(k\)|compound\s+interest|50\/30\/20\s+rule|register\s+an\s+llc|s[- ]corp|swot\s+analysis|credit\s+score|negotiate\s+a\s+(?:higher\s+)?salary|etf\s+vs|mutual\s+fund|index\s+fund|venture\s+capital|linkedin\s+(?:bio|headline|profile|message)|cover\s+letter|resignation\s+letter|two\s+weeks'?\s+notice|pitch\s+deck|ebitda|cash\s+flow\s+statement|balance\s+sheet|capital\s+gains\s+tax|dollar[- ]cost\s+averaging|mortgage\s+amortization|dropshipping|affiliate\s+marketing)\b/i;

const TRAVEL_RE =
  /\b(?:carry[- ]on\s+(?:for|luggage)|jet\s+lag|travel\s+(?:adapter|insurance|first[- ]aid)|cheap\s+flight\s+deals|international\s+flight|renew\s+a\s+passport|tsa\s+precheck|global\s+entry|schengen\s+area|esim\s+while\s+traveling|digital\s+nomad\s+visa|airline\s+miles|airport\s+layover|backpacking\s+trip|itinerary\s+for|best\s+time\s+(?:of\s+year\s+)?to\s+visit)\b/i;

const GENERAL_KNOWLEDGE_RE =
  /\b(?:why\s+is\s+the\s+(?:sky\s+blue|ocean\s+salty)|speed\s+of\s+(?:light|sound)|solar\s+system|pluto\s+(?:not|no\s+longer)\s+a\s+planet|how\s+many\s+(?:hearts\s+does\s+an\s+octopus|bones\s+in\s+the\s+human|continents\s+are\s+there|time\s+zones|planets\s+in|countries\s+in\s+the\s+eu|strings\s+on\s+a\s+standard\s+guitar)|mona\s+lisa|pride\s+and\s+prejudice|romeo\s+and\s+juliet|chemical\s+symbol\s+for|boiling\s+point\s+of\s+water|freezing\s+point\s+of|ph\s+of\s+pure\s+water|offside\s+rules|world\s+cup|fibonacci\s+sequence|quantum\s+entanglement|crispr|nuclear\s+(?:fission|reactor)|theory\s+of\s+relativity|trolley\s+problem|ship\s+of\s+theseus|fermi\s+paradox)\b/i;

export function classifyDomain(text: string): DomainId | null {
  const q = text.trim();
  if (!q) return null;
  const words = q.split(/\s+/).filter(Boolean).length;
  if (words <= 2 && !ECOMMERCE_RE.test(q) && !TECH_CODING_RE.test(q)) return null;

  if (ECOMMERCE_RE.test(q)) return 'ecommerce_support';
  if (TECH_CODING_RE.test(q)) return 'tech_coding';
  if (COOKING_RE.test(q)) return 'cooking_food';
  if (HOME_DIY_RE.test(q)) return 'home_diy';
  if (HEALTH_FITNESS_RE.test(q)) return 'health_fitness';
  if (BUSINESS_FINANCE_RE.test(q)) return 'business_finance';
  if (TRAVEL_RE.test(q)) return 'travel_places';
  if (GENERAL_KNOWLEDGE_RE.test(q)) return 'general_knowledge';
  return null;
}

