const fs = require('fs');
let c = fs.readFileSync('NexGenEA/NexGen_EA_V4.html', 'utf8');

const old = 'Beskrivningen \u00e4r nu sparad och vi kan g\u00e5 vidare.\n\n## N\u00e4sta steg: Clarify Strategic Intent\n\nJag kommer nu att analysera er organisation och extrahera den strategiska intentionen. Klicka p\u00e5 knappen "**Clarify Strategic Intent**" i v\u00e4nstra panelen f\u00f6r att forts\u00e4tta.';
const ny = 'The description has been saved and we can proceed.\n\n## Next step: Clarify Strategic Intent\n\nI will now analyse your organisation and extract the strategic intent. Click the "**Clarify Strategic Intent**" button in the left panel to continue.';

// Find the start of the Swedish block
const startIdx = c.indexOf('Beskrivningen ');
if (startIdx === -1) {
  console.log('Start not found - maybe already fixed?');
} else {
  console.log('Found at index', startIdx);
  // Find the end: look for the closing backtick after the Swedish text
  // The block ends with: fortsätta.`  or  fortsatta.\`
  // Search for the `, \n or `,\r\n pattern after the Swedish block
  const blockEnd = c.indexOf('`,', startIdx);
  if (blockEnd === -1) {
    console.log('Block end not found');
  } else {
    console.log('Block range:', startIdx, '-', blockEnd);
    console.log('Block:', JSON.stringify(c.slice(startIdx, blockEnd + 2)));
    const before = c.slice(0, startIdx);
    const after = c.slice(blockEnd);
    c = before + ny + after;
    fs.writeFileSync('NexGenEA/NexGen_EA_V4.html', c, 'utf8');
    console.log('Fixed!');
  }
}
