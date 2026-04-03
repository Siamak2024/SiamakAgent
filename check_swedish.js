const h = require('fs').readFileSync('NexGenEA/NexGen_EA_V4.html', 'utf8');
const checks = [
  ['Kontextinformation laddas', h.includes('Kontektsinformation laddas') || h.includes('Kontextinformation laddas')],
  ['Capabilities genererade', h.includes('Capabilities genererade')],
  ['gaps identifierade', h.includes('identifierade')],
  ['definierade (activities/initiatives)', h.includes('definierade')],
  ['Senaste konversation', h.includes('Senaste konversation')],
  ['Ainvandt fråga', h.includes('\u00e4ndarens fr\u00e5ga')],
  ['Action Mode aktiverat', h.includes('Action Mode aktiverat')],
  ['ndringen/genomford', h.includes('\u00c4ndringen \u00e4r genomf')],
  ['Välkommen startMsg', h.includes('V\u00e4lkommen till EA')],
  ['Steg 1 i18n', h.includes("'Steg 1'")],
  ['CxO Swedish lang', h.includes('Swedish if the data is in Swedish')],
  ['scenario Swedish lang', h.includes('scenario analysis in Swedish')],
  ['continueDiscovery Bra!', h.includes('Bra! L\u00e5t')],
  ['saveOrg toast', h.includes('vidare till Step 2')],
  ['promptTrace PÅ', h.includes('Prompt trace P\u00c5')],
  ['Svara steg för steg', h.includes('Svara p\u00e5 fr\u00e5gorna')],
  ['Discovery activated toast', h.includes('aktiverad - beskriv')],
  ['Beskriv din organisation', h.includes('Beskriv din organisation')],
];
let remaining = 0;
checks.forEach(([k,v]) => { if(v){console.log('STILL_SWEDISH  ' + k); remaining++;} });
if (remaining === 0) console.log('All clean — no Swedish found!');
else console.log('\n' + remaining + ' Swedish strings still present');
