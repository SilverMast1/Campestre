const fs = require('fs');
const path = require('path');

// Configuration
const DB_FILE = path.join(__dirname, '../backend/prisma/dev.db');
const BACKUPS_DIR = 'C:\\Users\\SERGIO\\Desktop\\copias de seguridad';

function getTimestamp() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

async function runBackup() {
  console.log('--- Iniciando Copia de Seguridad ---');
  console.log(`Fecha/Hora local: ${new Date().toLocaleString()}`);
  
  if (!fs.existsSync(DB_FILE)) {
    console.error(`Error: No se encontró el archivo de base de datos en: ${DB_FILE}`);
    process.exit(1);
  }

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUPS_DIR)) {
    console.log(`Creando directorio de copias de seguridad: ${BACKUPS_DIR}`);
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const timestamp = getTimestamp();
  const backupName = `backup_${timestamp}.db`;
  const destPath = path.join(BACKUPS_DIR, backupName);

  try {
    console.log(`Copiando base de datos a: ${destPath}`);
    fs.copyFileSync(DB_FILE, destPath);
    
    // Check files size
    const origSize = fs.statSync(DB_FILE).size;
    const destSize = fs.statSync(destPath).size;
    
    console.log(`¡Copia de seguridad creada con éxito!`);
    console.log(`Archivo: ${backupName}`);
    console.log(`Tamaño original: ${(origSize / 1024).toFixed(2)} KB`);
    console.log(`Tamaño copia: ${(destSize / 1024).toFixed(2)} KB`);
    
    // Also copy WAL file if it has content, for completeness
    const walFile = `${DB_FILE}-wal`;
    if (fs.existsSync(walFile) && fs.statSync(walFile).size > 0) {
      const destWalPath = `${destPath}-wal`;
      fs.copyFileSync(walFile, destWalPath);
      console.log(`Copiado archivo de transacciones WAL: ${backupName}-wal`);
    }
  } catch (error) {
    console.error('Error al realizar la copia de seguridad:', error);
    process.exit(1);
  }
}

runBackup();
