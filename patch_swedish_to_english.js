// Fix remaining Swedish strings in NexGen_EA_V4.html
const fs = require('fs');
const filePath = 'NexGenEA/NexGen_EA_V4.html';
let content = fs.readFileSync(filePath, 'utf8');
let ok = 0, fail = 0;

function patch(label, oldStr, newStr) {
  if (content.includes(oldStr)) {
    content = content.split(oldStr).join(newStr);
    console.log('OK   ' + label); ok++;
  } else {
    console.error('MISS ' + label + '\n     [' + oldStr.slice(0,80) + ']'); fail++;
  }
}

// _buildStepContext — remaining Swedish strings
patch('stepContext case1 not completed',
  'Step 1 \u00e4r inte genomf\u00f6rt \u00e4n.',
  'Step 1 has not been completed yet.'
);
patch('stepContext ambition label',
  '\\n**Teman:**',
  '\\n**Themes:**'
);
patch('stepContext inga themes',
  "|| 'inga'}\\n**Success Metrics:**",
  "|| 'none'}\\n**Success Metrics:**"
);
patch('stepContext inga metrics end',
  "|| 'inga'}\`;\n    case 2:",
  "|| 'none'}\`;\n    case 2:"
);
patch('stepContext case2 not completed',
  'Step 2 \u00e4r inte genomf\u00f6rt \u00e4n.',
  'Step 2 has not been completed yet.'
);
patch('stepContext ej definierad VP',
  "|| 'ej definierad'}\\n**Customer Segments:**",
  "|| 'not defined'}\\n**Customer Segments:**"
);
patch('stepContext inga segments',
  "|| 'inga'}\`;\n    case 3:",
  "|| 'none'}\`;\n    case 3:"
);
patch('stepContext capabilities genererade',
  '**Capabilities genererade:**',
  '**Capabilities generated:**'
);
patch('stepContext System label',
  '\\n**System:**',
  '\\n**Systems:**'
);
patch('stepContext case4 not completed',
  'Step 4 \u00e4r inte genomf\u00f6rt \u00e4n.',
  'Step 4 has not been completed yet.'
);
patch('stepContext definierade activities',
  '} definierade`;\n    case 5:',
  '} defined`;\n    case 5:'
);
patch('stepContext gaps identifierade',
  'gaps identifierade`;\n    case 6:',
  'gaps identified`;\n    case 6:'
);
patch('stepContext pools identifierade',
  'pools identifierade`;\n    case 7:',
  'pools identified`;\n    case 7:'
);
patch('stepContext initiatives definierade',
  'definierade`;\n    default:',
  'defined`;\n    default:'
);
patch('stepContext loading',
  'Kontextinformation laddas...',
  'Loading context...'
);

// Discovery userPrompt Swedish labels (standard discovery mode)
patch('userPrompt Senaste konversation',
  '**Senaste konversation:**',
  '**Recent conversation:**'
);
patch('userPrompt Användarens fråga',
  '**Anv\u00e4ndarens fr\u00e5ga:**',
  '**User message:**'
);

// Action mode buttons
patch('action button Swedish',
  'Byt till Action Mode & Applicera',
  'Switch to Action Mode & Apply'
);
patch('continue discussion button Swedish',
  'Forts\u00e4tt diskutera',
  'Continue discussion'
);

// Error messages
patch('error msg Swedish discovery step1',
  '\u274c Ett fel uppstod: ${error.message}`, { mode: \'discovery\', error: true });',
  '\u274c An error occurred: ${error.message}`, { mode: \'discovery\', error: true });'
);

// Action mode activated messages
patch('action mode activated SE 1',
  '**Action Mode aktiverat \u26a1**\\n\\nJag f\u00f6rbereder att applicera: "${proposedChange}"\\n\\nBekr\u00e4fta eller justera \u00e4ndringen, s\u00e5 uppdaterar jag EA-modellen.',
  '**Action Mode activated \u26a1**\\n\\nPreparing to apply: "${proposedChange}"\\n\\nConfirm or adjust the change and I will update the EA model.'
);
patch('action mode activated SE 2',
  '**Action Mode aktiverat \u26a1**\\n\\nBeskriv vilken \u00e4ndring du vill g\u00f6ra i EA-modellen, s\u00e5 applicerar jag den direkt.',
  '**Action Mode activated \u26a1**\\n\\nDescribe the change you want to make to the EA model and I will apply it directly.'
);

// continueDiscovery
patch('continueDiscovery Swedish',
  'Bra! L\u00e5t oss forts\u00e4tta diskussionen. Vad vill du utforska mer?',
  "Sure! Let's continue the discussion. What would you like to explore further?"
);

// saveOrgDescription messages
patch('saveOrgDescription title',
  '**Organisationsbeskrivning sparad!**',
  '**Organisation description saved!**'
);
patch('saveOrgDescription body SE',
  'Beskrivningen \u00e4r nu sparad och vi kan g\u00e5 vidare.\n\n## N\u00e4sta steg: Clarify Strategic Intent\n\nJag kommer nu att analysera er organisation och extrahera den strategiska intentionen. Klicka p\u00e5 knappen "**Clarify Strategic Intent**" i v\u00e4nstra panelen f\u00f6r att forts\u00e4tta.',
  'The description is saved and we are ready to proceed.\n\n## Next step: Clarify Strategic Intent\n\nClick the **"Clarify Strategic Intent"** button in the left panel to continue.'
);
patch('saveOrgDescription toast',
  'Organisationsbeskrivning sparad! G\u00e5 vidare till Step 2',
  'Organisation description saved! Proceed to Step 2'
);

// returnToDiscovery Swedish
patch('returnToDiscovery Swedish',
  '\u2705 \u00c4ndringen \u00e4r genomf\u00f6rd. Vill du diskutera n\u00e5got mer eller g\u00f6ra fler \u00e4ndringar?',
  '\u2705 Change applied. Would you like to discuss anything further or make more changes?'
);

// Prompt trace button Swedish (may already be done)
patch('prompt trace btn Swedish',
  'Prompt trace P\u00c5 \u2013 klicka f\u00f6r att st\u00e4nga av',
  'Prompt trace ON \u2014 click to disable'
);
patch('prompt trace btn Swedish2',
  'Visa prompt trace',
  'Show prompt trace'
);

// i18n translation map - remove Swedish translations (keep English only)
patch('i18n Generera arkitektur',
  "'Generate Architecture': 'Generera arkitektur',",
  "'Generate Architecture': 'Generate Architecture',"
);
patch('i18n Generera transformationsplan',
  "'Generate Transformation Roadmap': 'Generera transformationsplan',",
  "'Generate Transformation Roadmap': 'Generate Transformation Roadmap',"
);
patch('i18n Oversikt sv',
  "'Overview': 'Oversikt',\n    'Step 1': 'Steg 1',\n    'Step 2': 'Steg 2',\n    'Step 3': 'Steg 3',\n    'Step 4': 'Steg 4',\n    'Step 5': 'Steg 5',",
  "'Overview': 'Overview',\n    'Step 1': 'Step 1',\n    'Step 2': 'Step 2',\n    'Step 3': 'Step 3',\n    'Step 4': 'Step 4',\n    'Step 5': 'Step 5',"
);

// CxO and scenario language instructions
patch('CxO Swedish language instruction',
  'Generate CxO Summary in Swedish if the data is in Swedish, otherwise in English.',
  'Generate CxO Summary in English. If all input data is clearly in another language, match that language.'
);
patch('scenario Swedish language instruction',
  'Generate scenario analysis in Swedish if context is Swedish, otherwise English.',
  'Generate scenario analysis in English unless all input data is clearly in another language.'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nResult: ${ok} OK, ${fail} MISS`);
