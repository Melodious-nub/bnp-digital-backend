const fs = require('fs');
fs.writeFileSync('TEST.txt', 'HELLO AT ' + new Date().toISOString());
console.log('Wrote to TEST.txt');
