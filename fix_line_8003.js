const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'NexGenEA/NexGen_EA_V4.html');

console.log('📝 Reading file...');
let content = fs.readFileSync(filePath, 'utf8');

// Find and display the line 8003 to see what we're dealing with
const lines = content.split('\n');
console.log(`\nLine 8003 (actual): "${lines[8002]}"`);
console.log(`Char codes:`, [...lines[8002]].slice(40, 90).map((c, i) => `${i+40}:${c}(${c.charCodeAt(0)})`).join(' '));

// Replace line 8003 with correct pattern
lines[8002] = '  return String(text || \'\').trim().replace(/^["\'\\u201C\\u201D]+|["\'\\u201C\\u201D]+$/g, \'\').replace(/[.,;:!?]+$/, \'\').trim();';

content = lines.join('\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ Fixed line 8003');
