const net = require('net');
const tls = require('tls');
const fs = require('fs');

const scriptContent = `
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const app = express();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:Clubcampestre2026.@db.zdeenhvjtnxvlqdpsewj.supabase.co:5432/postgres?sslmode=require'
    }
  }
});

app.get('/api/debug-db', async (req, res) => {
  try {
    const cuentasCount = await prisma.cuenta.count();
    const abiertasCount = await prisma.cuenta.count({ where: { estado: 'ABIERTA' } });
    const envDb = process.env.DATABASE_URL || 'FALLBACK_SUPABASE';
    const sampleCuentas = await prisma.cuenta.findMany({ where: { estado: 'ABIERTA' }, take: 5 });
    res.json({
      envDbHost: envDb.split('@')[1] || envDb,
      cuentasTotal: cuentasCount,
      abiertasTotal: abiertasCount,
      sample: sampleCuentas.map(c => ({ id: c.id, ref: c.nombre_referencia, area_id: c.area_id }))
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

require('./dist/index.js');
`;

fs.writeFileSync('c:\\Users\\SERGIO\\Desktop\\Campestreantigravity\\scratch_debug.js', scriptContent);

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
            const readStream = fs.createReadStream('c:\\Users\\SERGIO\\Desktop\\Campestreantigravity\\scratch_debug.js');
            readStream.pipe(tlsData);
            readStream.on('end', () => {
              tlsData.end();
            });
          });
        });
      }
    } else if (state === 'STOR' && msg.startsWith('226')) {
      console.log('Uploaded debug index.js launcher to Alwaysdata!');
      tlsControl.write('QUIT\r\n');
      process.exit(0);
    }
  });
}

setupControl(controlSocket);
