// fix-encoding.js - Fix UTF-8 double-encoding issues
const fs = require('fs');
const path = require('path');

console.log('===================================================================');
console.log('  UTF-8 Encoding Fix - Swedish Characters');
console.log('===================================================================');

// Character replacements (double-encoded -> correct)
const replacements = [
  { from: /—/g, to: '—', desc: 'em dash' },
  { from: /'/g, to: "'", desc: 'right quote' },
  { from: /"/g, to: '"', desc: 'left quote' },
  { from: /"/g, to: '"', desc: 'right quote short' },
  { from: /÷/g, to: '÷', desc: 'division' },
  { from: /å/g, to: 'å', desc: 'Swedish å' },
  { from: /ä/g, to: 'ä', desc: 'Swedish ä' },
  { from: /ö/g, to: 'ö', desc: 'Swedish ö' },
  { from: /Å/g, to: 'Å', desc: 'Swedish Å' },
  { from: /Ä/g, to: 'Ä', desc: 'Swedish Ä' },
  { from: /Ö/g, to: 'Ö', desc: 'Swedish Ö' }
];

// File extensions to process
const extensions = ['.html', '.js', '.md', '.json', '.css'];

// Directories to skip
const skipDirs = ['node_modules', '.git', 'e2e-artifacts'];

let totalFiles = 0;
let totalFixed = 0;

function shouldSkip(filePath) {
  return skipDirs.some(dir => filePath.includes(path.sep + dir + path.sep));
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    replacements.forEach(({ from, to, desc }) => {
      if (from.test(newContent)) {
        newContent = newContent.replace(from, to);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      totalFixed++;
      console.log(`  ✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
    }

    totalFiles++;
  } catch (err) {
    console.error(`  ✗ Error: ${filePath} - ${err.message}`);
  }
}

function walkDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (shouldSkip(fullPath)) continue;

      if (entry.isDirectory()) {
        walkDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          processFile(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
  }
}

console.log('\nScanning project for encoding issues...\n');
walkDirectory(process.cwd());

console.log('\n===================================================================');
console.log(`  Encoding Fix Complete!`);
console.log(`  Files processed: ${totalFiles}`);
console.log(`  Files fixed: ${totalFixed}`);
console.log('===================================================================');
