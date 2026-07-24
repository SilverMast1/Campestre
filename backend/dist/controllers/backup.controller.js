"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarBackups = listarBackups;
exports.crearBackup = crearBackup;
exports.restaurarBackup = restaurarBackup;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Detectar si estamos usando SQLite (local) o PostgreSQL (producción)
const isPostgres = !process.env.DATABASE_URL?.startsWith('file:');
// Rutas de archivos (solo relevante en modo SQLite local)
const DB_DIR = path_1.default.resolve(__dirname, '../../prisma');
const DB_FILE = path_1.default.join(DB_DIR, 'dev.db');
const BACKUPS_DIR = 'C:\\Users\\SERGIO\\Desktop\\copias de seguridad';
// Asegurar que exista la carpeta de respaldos (solo en local)
if (!isPostgres) {
    try {
        if (!fs_1.default.existsSync(BACKUPS_DIR)) {
            fs_1.default.mkdirSync(BACKUPS_DIR, { recursive: true });
        }
    }
    catch (e) {
        console.warn('[Backup] No se pudo crear carpeta de respaldos:', e);
    }
}
// ==========================================
// RESPALDO AUTOMÁTICO CADA 8 HORAS (solo SQLite local)
// ==========================================
function realizarBackupAutomatico() {
    if (isPostgres)
        return; // En PostgreSQL, Supabase maneja los backups
    try {
        if (!fs_1.default.existsSync(DB_FILE))
            return;
        const ahora = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const timestamp = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}_${pad(ahora.getHours())}-${pad(ahora.getMinutes())}-${pad(ahora.getSeconds())}`;
        const backupName = `backup_${timestamp}.db`;
        const destPath = path_1.default.join(BACKUPS_DIR, backupName);
        // Hacer checkpoint WAL antes de copiar
        try {
            const Database = require('better-sqlite3');
            const db = new Database(DB_FILE, { readonly: true });
            db.pragma('wal_checkpoint(TRUNCATE)');
            db.close();
        }
        catch (e) {
            console.warn('[AutoBackup] No se pudo hacer checkpoint WAL:', e);
        }
        fs_1.default.copyFileSync(DB_FILE, destPath);
        fs_1.default.utimesSync(destPath, ahora, ahora);
        console.log(`[AutoBackup] Respaldo automático creado: ${backupName}`);
    }
    catch (error) {
        console.error('[AutoBackup] Error al crear respaldo automático:', error);
    }
}
// Iniciar ciclo automático cada 8 horas (solo en local/SQLite)
if (!isPostgres) {
    const OCHO_HORAS_MS = 8 * 60 * 60 * 1000;
    setInterval(realizarBackupAutomatico, OCHO_HORAS_MS);
    console.log('[AutoBackup] Respaldo automático cada 8 horas activado ✓');
}
else {
    console.log('[Backup] Modo PostgreSQL — backups gestionados por Supabase ✓');
}
/**
 * Listar todos los respaldos disponibles
 */
async function listarBackups(req, res) {
    try {
        if (isPostgres) {
            return res.json({ message: 'Los respaldos en PostgreSQL son gestionados por Supabase', backups: [] });
        }
        if (!fs_1.default.existsSync(BACKUPS_DIR)) {
            return res.json([]);
        }
        const files = fs_1.default.readdirSync(BACKUPS_DIR);
        const backups = files
            .filter((file) => file.startsWith('backup_') && file.endsWith('.db'))
            .map((file) => {
            const filePath = path_1.default.join(BACKUPS_DIR, file);
            const stats = fs_1.default.statSync(filePath);
            return {
                nombre: file,
                fecha: stats.mtime,
                tamano: stats.size,
            };
        })
            .sort((a, b) => b.nombre.localeCompare(a.nombre));
        return res.json(backups);
    }
    catch (error) {
        console.error('Error al listar respaldos:', error);
        return res.status(500).json({ error: 'Error al listar los respaldos de la base de datos' });
    }
}
/**
 * Crear un respaldo de la base de datos actual
 */
async function crearBackup(req, res) {
    try {
        if (isPostgres) {
            return res.json({ message: 'Los respaldos en PostgreSQL son gestionados automáticamente por Supabase' });
        }
        if (!fs_1.default.existsSync(DB_FILE)) {
            return res.status(404).json({ error: 'Archivo de base de datos original no encontrado' });
        }
        const ahora = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const timestamp = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}_${pad(ahora.getHours())}-${pad(ahora.getMinutes())}-${pad(ahora.getSeconds())}`;
        const backupName = `backup_${timestamp}.db`;
        const destPath = path_1.default.join(BACKUPS_DIR, backupName);
        // Checkpoint WAL antes de copiar para garantizar datos completos
        try {
            const Database = require('better-sqlite3');
            const db = new Database(DB_FILE, { readonly: true });
            db.pragma('wal_checkpoint(TRUNCATE)');
            db.close();
        }
        catch (e) {
            console.warn('No se pudo hacer checkpoint WAL antes de backup:', e);
        }
        fs_1.default.copyFileSync(DB_FILE, destPath);
        try {
            fs_1.default.utimesSync(destPath, ahora, ahora);
        }
        catch (e) {
            console.warn('No se pudo actualizar la fecha del archivo de respaldo:', e);
        }
        return res.json({
            message: 'Respaldo creado con éxito',
            respaldo: {
                nombre: backupName,
                fecha: ahora,
                tamano: fs_1.default.statSync(destPath).size,
            },
        });
    }
    catch (error) {
        console.error('Error al crear respaldo:', error);
        return res.status(500).json({ error: 'Error al crear el respaldo de la base de datos' });
    }
}
/**
 * Restaurar un respaldo seleccionado.
 * En modo SQLite usa better-sqlite3 para checkpoint WAL y liberar bloqueos.
 */
async function restaurarBackup(req, res) {
    const { nombreArchivo } = req.body;
    if (isPostgres) {
        return res.status(400).json({ error: 'La restauración manual no está disponible en modo PostgreSQL. Usa las herramientas de Supabase.' });
    }
    if (!nombreArchivo) {
        return res.status(400).json({ error: 'El nombre del archivo de respaldo es requerido' });
    }
    const backupPath = path_1.default.join(BACKUPS_DIR, nombreArchivo);
    try {
        if (!fs_1.default.existsSync(backupPath) || !nombreArchivo.startsWith('backup_') || !nombreArchivo.endsWith('.db')) {
            return res.status(404).json({ error: 'Archivo de respaldo no encontrado o inválido' });
        }
        console.log(`Iniciando restauración de respaldo: ${nombreArchivo}`);
        // Desconectar Prisma para liberar sus conexiones internas
        await prisma.$disconnect();
        // Checkpoint WAL con better-sqlite3: vacía el WAL al archivo principal y cierra limpiamente
        try {
            const Database = require('better-sqlite3');
            const db = new Database(DB_FILE);
            db.pragma('wal_checkpoint(TRUNCATE)');
            db.close();
            console.log('Checkpoint WAL completado — archivos WAL/SHM liberados.');
        }
        catch (e) {
            console.warn('No se pudo hacer checkpoint WAL, intentando continuar:', e);
        }
        // Breve pausa para garantizar que los file handles del SO se liberen
        await new Promise(resolve => setTimeout(resolve, 500));
        // Eliminar archivos WAL/SHM residuales si aún existen
        const walFile = `${DB_FILE}-wal`;
        const shmFile = `${DB_FILE}-shm`;
        for (const f of [walFile, shmFile]) {
            if (fs_1.default.existsSync(f)) {
                try {
                    fs_1.default.unlinkSync(f);
                }
                catch (e) {
                    console.warn(`No se pudo borrar ${path_1.default.basename(f)}:`, e);
                }
            }
        }
        // Copiar el respaldo sobre la base de datos activa
        fs_1.default.copyFileSync(backupPath, DB_FILE);
        // Reconectar Prisma
        await prisma.$connect();
        console.log(`Restauración exitosa de: ${nombreArchivo}`);
        return res.json({ message: 'Base de datos restaurada con éxito' });
    }
    catch (error) {
        console.error('Error al restaurar respaldo:', error);
        try {
            await prisma.$connect();
        }
        catch (_) { }
        return res.status(500).json({ error: 'Error durante la restauración de la base de datos' });
    }
}
