const net = require('net');
const tls = require('tls');
const fs = require('fs');

const localScriptPath = 'c:\\Users\\SERGIO\\Desktop\\Campestreantigravity\\scratch_unzip.js';

fs.writeFileSync(localScriptPath, `
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
`);

let controlSocket = net.createConnection({ host: 'ftp-campestre.alwaysdata.net', port: 21, family: 4 });
let state = 'INIT';
let tlsControl = null;

controlSocket.on('data', () => {
  if (state === 'INIT') {
    state = 'AUTH_TLS';
    controlSocket.write('AUTH TLS\r\n');
  }
});

function setupControl(socket) {
  socket.on('data', (data) => {
    const msg = data.toString();

    if (state === 'AUTH_TLS' && msg.startsWith('234')) {
      tlsControl = tls.connect({ socket: controlSocket, rejectUnauthorized: false, minVersion: 'TLSv1.2', maxVersion: 'TLSv1.2' }, () => {
        state = 'USER';
        tlsControl.write('USER campestre\r\n');
      });
      setupControl(tlsControl);
    } else if (state === 'USER') {
      state = 'PASS';
      tlsControl.write('PASS Clubcampestre2026.\r\n');
    } else if (state === 'PASS' && msg.startsWith('230')) {
      state = 'PBSZ';
      tlsControl.write('PBSZ 0\r\n');
    } else if (state === 'PBSZ') {
      state = 'PROT';
      tlsControl.write('PROT P\r\n');
    } else if (state === 'PROT' && msg.startsWith('200')) {
      state = 'CWD';
      tlsControl.write('CWD www\r\n');
    } else if (state === 'CWD' && msg.startsWith('250')) {
      state = 'PASV';
      tlsControl.write('PASV\r\n');
    } else if (state === 'PASV') {
      const match = msg.match(/\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
      if (match) {
        const ip = `${match[1]}.${match[2]}.${match[3]}.${match[4]}`;
        const port = parseInt(match[5]) * 256 + parseInt(match[6]);

        state = 'STOR';
        tlsControl.write('STOR index.js\r\n');

        const rawData = net.createConnection({ host: ip, port: port, family: 4 }, () => {
          let sessionBuf = null;
          try { sessionBuf = tlsControl.getSession(); } catch(e) {}
          
          const tlsData = tls.connect({ socket: rawData, rejectUnauthorized: false, session: sessionBuf }, () => {
            const readStream = fs.createReadStream(localScriptPath);
            readStream.pipe(tlsData);
            readStream.on('end', () => {
              tlsData.end();
            });
          });
        });
      }
    } else if (state === 'STOR' && msg.startsWith('226')) {
      console.log('SUCCESS! index.js launcher uploaded to Alwaysdata!');
      tlsControl.write('QUIT\r\n');
      process.exit(0);
    }
  });
}

setupControl(controlSocket);
