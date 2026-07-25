
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  const zipPath = path.resolve(__dirname, '../dist.zip');
  if (fs.existsSync(zipPath)) {
    console.log('Unzipping dist.zip over dist...');
    execSync('unzip -o "' + zipPath + '" -d "' + __dirname + '"', { stdio: 'inherit' });
    try { fs.unlinkSync(zipPath); } catch (e) {}
    console.log('Unzipped dist.zip successfully!');
  }
} catch (e) {
  console.error('Unzip error:', e);
}

// Re-require index.js in dist
delete require.cache[require.resolve('./index.js')];
