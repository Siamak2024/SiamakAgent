const fs = require('fs');
let c = fs.readFileSync('NexGenEA/NexGen_EA_V4.html', 'utf8');

// These strings use literal \uXXXX escapes in the JS template literal within the HTML file
// Use regex to match regardless of encoding
const fixes = [
  // Action Mode aktiverat -> activated
  [/Action Mode aktiverat \\u26a1/g, 'Action Mode activated \\u26a1'],
  [/Jag f\\u00f6rbereder att applicera: "\$\{proposedChange\}"\\\\n\\\\nBekr\\u00e4fta eller justera \\u00e4ndringen, s\\u00e5 uppdaterar jag EA-modellen\./,
   'Preparing to apply: "${proposedChange}"\\\\n\\\\nConfirm or adjust the change and I will update the EA model.'],
  [/Beskriv vilken \\u00e4ndring du vill g\\u00f6ra i EA-modellen, s\\u00e5 applicerar jag den direkt\./,
   'Describe the change you want to make to the EA model and I will apply it directly.'],
  // Welcome bullets (Vad kan jag hjälpa dig med?)
  [/Vad kan jag hj\\u00e4lpa dig med\?/g, 'How can I help you?'],
  [/Diskutera och f\\u00f6rfina resultatet/g, 'Discuss and refine the results'],
  [/F\\u00f6rklara varf\\u00f6r n\\u00e5got genererats/g, 'Explain why something was generated'],
  [/F\\u00f6resl\\u00e5 f\\u00f6rb\\u00e4ttringar/g, 'Suggest improvements'],
  [/Identifiera luckor eller felaktigheter/g, 'Identify gaps or inaccuracies'],
  [/N\\u00e4r du vill g\\u00f6ra \\u00e4ndringar s\\u00e4ger du till, s\\u00e5 byter jag till Action Mode/g,
   'When you want to make changes, let me know and I will switch to Action Mode'],
  // Tips
  [/Klicka p\\u00e5 \*\*"Clarify Strategic Intent"\*\* i v\\u00e4nsterpanelen n\\u00e4r du \\u00e4r redo att generera strukturerad analys\. Var koncis och specifik\./,
   'Click **"Clarify Strategic Intent"** in the left panel when you are ready to generate structured analysis. Be concise and specific.'],
  [/Diskutera, st\\u00e4ll fr\\u00e5gor, eller be om korrigeringar\. F\\u00f6r att direkt uppdatera modellen \\u2014 v\\u00e4lj Action Mode\. Du styr takten \\u2014 AI:n \\u00e4r din autopilot\./,
   'Discuss, ask questions, or request corrections. To update the model directly \u2014 select Action Mode. You set the pace \u2014 the AI is your autopilot.'],
];

let count = 0;
for (const [pattern, replacement] of fixes) {
  const before = c;
  c = c.replace(pattern, replacement);
  if (c !== before) { count++; console.log('Fixed:', pattern.toString().slice(0, 60)); }
  else { console.log('MISS:', pattern.toString().slice(0, 60)); }
}

fs.writeFileSync('NexGenEA/NexGen_EA_V4.html', c, 'utf8');
console.log(`\nDone. ${count} replacements applied.`);

// Verify
const c2 = fs.readFileSync('NexGenEA/NexGen_EA_V4.html', 'utf8');
console.log('ActionEn:', c2.includes('Action Mode activated'));
console.log('ActionSv:', c2.includes('Action Mode aktiverat'));
console.log('HowHelp:', c2.includes('How can I help you'));
console.log('VadKan:', c2.includes('Vad kan jag'));
