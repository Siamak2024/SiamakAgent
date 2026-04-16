const fs = require('fs');
const path = require('path');

/**
 * Comprehensive cleanup fix
 * Fixes all remaining encoding issues and broken patterns
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
  // Fix quote regex (line 8003) - replace � with proper quote chars
  { 
    find: /\.replace\(\/\^\["'�"\]\+\|"'�"\]\+\$\/g, ''\)/g,
    replace: '.replace(/^["\'\u201C\u201D]+|["\'\u201C\u201D]+$/g, \'\')'
  },
  // Fix "från" (line 8113)
  {
    find: /\(\?:fr�n\|from\)/g,
    replace: '(?:från|from)'
  },
  // Fix broken action strings with "generate|generera..." inserted
  {
    find: /'generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|för_/g,
    replace: '\'gen_'
  },
  // Additional cleanups
  {
    find: /generate\|generera\|create\|skapa\|build\|bygg\)\\s\+\(enterprise\\s\+\)\?\(architecture\|arkitektur\)\\s\*\(for\|för /g,
    replace: ''
  }
];

console.log('🔧 Applying comprehensive fixes...');
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
console.log(`\n✅ Complete! Fixed ${fixed} issues.`);
