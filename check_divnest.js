const fs = require('fs');
const lines = fs.readFileSync('NexGenEA/NexGen_EA_V4.html', 'utf8').split('\n');
let depth = 0, tabHomeStart = -1, tabHomeEnd = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('id="tab-home"')) {
    tabHomeStart = i + 1;
    depth = 0;
    console.log('tab-home opens at line', i + 1);
  }
  if (tabHomeStart > 0 && tabHomeEnd < 0) {
    const opens = (line.match(/<div[\s>]/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
    if (depth <= 0 && i >= tabHomeStart) {
      tabHomeEnd = i + 1;
      console.log('tab-home closes at line', i + 1);
      break;
    }
  }
}

console.log('\nLines after tab-home:');
for (let i = tabHomeEnd - 1; i < Math.min(tabHomeEnd + 8, lines.length); i++) {
  console.log((i + 1) + ':', lines[i]);
}
