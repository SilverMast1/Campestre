
const { execSync } = require('child_process');
const fs = require('fs');

console.log('UNZIPPING DIST.ZIP ON ALWAYSDATA...');
try {
  if (fs.existsSync('/home/campestre/www/dist.zip')) {
    execSync('unzip -o /home/campestre/www/dist.zip -d /home/campestre/www/dist', { stdio: 'inherit' });
    console.log('UNZIP COMPLETE SUCCESS!');
  }
} catch (e) {
  console.error('UNZIP ERROR:', e);
}

require('./dist/index.js');
