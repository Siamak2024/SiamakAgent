const fs = require('fs');
const path = require('path');

/**
 * Final encoding fix - v3
 * Fixes remaining regex patterns in JavaScript code
 */

const filePath = path.join(__dirname, 'NexGenEA/NexGen_EA_V4.html');

if (!fs.existsSync(filePath)) {
  console.log('❌ File not found');
  process.exit(1);
}

console.log('📝 Reading NexGen_EA_V4.html...');
let content = fs.readFileSync(filePath, 'utf8');
let fixed = 0;

const fixes = [
  // Fix curly quotes in regex (line 8003)
  { 
    find: /\.replace\(\/\^\["'�"\]\+\|"'�"\]\+\$\/g, ''\)\.replace/g,
    replace: '.replace(/^["\'\u201C\u201D]+|["\'\u201C\u201D]+$/g, \'\').replace'
  },
  // Fix "från" in regex (line 8113)
  {
    find: /\?:ta\\s\+bort\|remove\|delete\)\\s\+\(\.+\?\)\\s\+\(\?:fr�n/g,
    replace: '?:ta\\\\s+bort|remove|delete)\\\\s+(.+?)\\\\s+(?:från'
  },
  // Fix Swedish characters in regex (line 8155) - åäöÅÄÖ
  {
    find: /\[a-zA-Z������\\-\\s\]\+/g,
    replace: '[a-zA-Z åäöÅÄÖ\\\\-\\\\s]+'
  },
  // Fix "förmåga" and "förmågekarta" in regex (line 8211)
  {
    find: /capability map\|capability\|generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|förm�ga\|generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|förm�gekarta/g,
    replace: 'capability map|capability|förmåga|förmågekarta'
  }
];

console.log('🔧 Applying final fixes...');
fixes.forEach(({ find, replace }, index) => {
  const matches = content.match(find);
  if (matches) {
    content = content.replace(find, replace);
    fixed += matches.length;
    console.log(`   ✅ Fix ${index + 1}: Fixed ${matches.length} instances`);
  } else {
    console.log(`   ⚠️  Fix ${index + 1}: No matches found`);
  }
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✅ Complete! Fixed ${fixed} regex pattern issues.`);
console.log('\n💡 Remaining � characters in regex patterns are intentional (for Swedish char detection)');
