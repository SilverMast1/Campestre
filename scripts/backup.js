const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const prisma = new PrismaClient();
const BACKUPS_DIR = 'C:\\Users\\SERGIO\\Desktop\\copias de seguridad';
const KEEP_DAYS = 30;

function getLocalDateString() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function getTimestamp() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${getLocalDateString()}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

async function runBackup() {
  console.log('--- Iniciando Copia de Seguridad de Supabase ---');
  console.log(`Fecha/Hora local: ${new Date().toLocaleString()}`);

  if (!fs.existsSync(BACKUPS_DIR)) {
    console.log(`Creando directorio de copias de seguridad: ${BACKUPS_DIR}`);
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const force = process.argv.includes('--force') || process.argv.includes('-f');
  const todayStr = getLocalDateString();

  if (!force) {
    const existingFiles = fs.readdirSync(BACKUPS_DIR);
    const todayBackupExists = existingFiles.some(file => file.startsWith(`backup_${todayStr}_`));
    if (todayBackupExists) {
      console.log(`Ya existe una copia de seguridad para el día de hoy (${todayStr}).`);
      console.log('Use el parámetro --force o -f para forzar una nueva copia de seguridad.');
      console.log('--- Fin del proceso (Sin cambios) ---');
      await prisma.$disconnect();
      return;
    }
  }

  const timestamp = getTimestamp();
  const backupName = `backup_${timestamp}.json`;
  const destPath = path.join(BACKUPS_DIR, backupName);

  try {
    console.log('Extrayendo snapshot de datos desde Supabase...');
    const snapshot = {
      timestamp: new Date().toISOString(),
      roles: await prisma.role.findMany(),
      usuarios: await prisma.usuario.findMany(),
      usuarioRoles: await prisma.usuarioRole.findMany(),
      areas: await prisma.area.findMany(),
      cadis: await prisma.cadi.findMany(),
      clientes: await prisma.cliente.findMany(),
      insumos: await prisma.insumo.findMany(),
      productos: await prisma.producto.findMany(),
      recetas: await prisma.recetaIngrediente.findMany(),
      inventarioArea: await prisma.inventarioArea.findMany(),
      cuentas: await prisma.cuenta.findMany(),
      detalleCuentas: await prisma.detalleCuenta.findMany(),
      divisionesCuenta: await prisma.divisionCuenta.findMany(),
      turnos: await prisma.turno.findMany(),
      movimientosInventario: await prisma.movimientoInventario.findMany(),
      retirosCaja: await prisma.retiroCaja.findMany(),
    };

    console.log(`Escribiendo copia de seguridad en: ${destPath}`);
    const dataStr = JSON.stringify(snapshot, null, 2);
    fs.writeFileSync(destPath, dataStr, 'utf8');

    const destSize = fs.statSync(destPath).size;
    console.log(`¡Copia de seguridad creada con éxito!`);
    console.log(`Archivo: ${backupName}`);
    console.log(`Tamaño copia: ${(destSize / 1024).toFixed(2)} KB`);

    cleanOldBackups();
  } catch (error) {
    console.error('Error al realizar la copia de seguridad:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function cleanOldBackups() {
  console.log(`\n--- Limpieza de copias de seguridad antiguas (más de ${KEEP_DAYS} días) ---`);
  try {
    const files = fs.readdirSync(BACKUPS_DIR);
    const now = new Date();
    const cutoffTime = now.getTime() - (KEEP_DAYS * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    files.forEach(file => {
      if (file.startsWith('backup_')) {
        const filePath = path.join(BACKUPS_DIR, file);
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < cutoffTime) {
          console.log(`Eliminando copia antigua: ${file}`);
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    });

    if (deletedCount === 0) {
      console.log('No se encontraron copias de seguridad antiguas para eliminar.');
    } else {
      console.log(`Se eliminaron ${deletedCount} archivo(s) antiguo(s).`);
    }
  } catch (error) {
    console.error('Error durante la limpieza de copias antiguas:', error);
  }
}

runBackup();
