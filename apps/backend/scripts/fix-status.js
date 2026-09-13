const fs = require('fs');
let c = fs.readFileSync('seed.ts', 'utf8');
c = c.replace(/status: 'active'/g, "status: 'published'");
fs.writeFileSync('seed.ts', c);
console.log('Fixed product status');