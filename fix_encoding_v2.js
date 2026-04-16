const fs = require('fs');
const path = require('path');

/**
 * Targeted encoding fix - v2
 * Only fixes display text, preserves JavaScript code patterns
 */

const filePath = path.join(__dirname, 'NexGenEA/NexGen_EA_V4.html');

if (!fs.existsSync(filePath)) {
  console.log('❌ File not found');
  process.exit(1);
}

console.log('📝 Reading NexGen_EA_V4.html...');
let content = fs.readFileSync(filePath, 'utf8');
let fixed = 0;

// Fix broken replacements first - restore original patterns
const restorePatterns = [
  { 
    find: /generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|förs/g, 
    replace: '–' 
  },
  {
    find: /generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|för /g,
    replace: '– '
  },
  {
    find: /generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|föresl• /g,
    replace: 'ställ frågor, föreslå förbättringar'
  },
  {
    find: /generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|förb�ttringar/g,
    replace: 'förbättringar'
  },
  {
    find: /generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|förb�ttringsinitiativ/g,
    replace: 'förbättringsinitiativ'
  },
  {
    find: /generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|förb�ttra/g,
    replace: 'förbättra'
  },
  // Fix bullet that was incorrectly converted
  { find: /�Roadmap• •/g, replace: '"Roadmap" –' },
  // Fix placeholder values in JS code that should remain as em dash
  { find: /: '�'/g, replace: ": '—'" },
  { find: /\|\| '�'/g, replace: "|| '—'" },
  // Fix regex pattern for Swedish characters (should be intentional �)
  { find: /\/\^\[-\*�\] \(\.\+\)\$\//g, replace: "/^[-*•] (.+)$/" },
  // Fix regex for Swedish character detection (intentional)
  { find: /if \(\/\[������\]\/\.test\(content\)\) \{/g, replace: 'if (/[äöåÄÖÅ]/.test(content)) {' },
  // Fix regex for quote trimming (intentional)
  { find: /\.replace\(\/\^\["'�"\]\+\|"'�"\]\+\$\/g, ''\)/g, replace: '.replace(/^["\'""]+|["\'""]+$/g, \'\')' },
  // Fix specific display issues
  { find: /st�ll frågor,/g, replace: 'ställ frågor,' },
  { find: /�r detta en problemsituation/g, replace: 'Är detta en problemsituation' },
  { find: /l�gg\\s\+till/g, replace: 'lägg\\s+till' }
];

console.log('🔧 Applying fixes...');
restorePatterns.forEach(({ find, replace }) => {
  const matches = content.match(find);
  if (matches) {
    content = content.replace(find, replace);
    fixed += matches.length;
    console.log(`   ✅ Fixed ${matches.length} instances`);
  }
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✅ Complete! Fixed ${fixed} issues.`);
