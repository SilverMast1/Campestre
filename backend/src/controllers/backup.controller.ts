import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Rutas de archivos
const DB_DIR = path.resolve(__dirname, '../../prisma');
const DB_FILE = path.join(DB_DIR, 'dev.db');
const BACKUPS_DIR = 'C:\\Users\\SERGIO\\Desktop\\copias de seguridad';

// Asegurar que exista la carpeta de respaldos
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

/**
 * Listar todos los respaldos disponibles
 */
export async function listarBackups(req: Request, res: Response) {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      return res.json([]);
    }

    const files = fs.readdirSync(BACKUPS_DIR);
    const backups = files
      .filter((file) => file.startsWith('backup_') && file.endsWith('.db'))
      .map((file) => {
        const filePath = path.join(BACKUPS_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          nombre: file,
          fecha: stats.mtime,
          tamano: stats.size, // bytes
        };
      })
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    return res.json(backups);
  } catch (error) {
    console.error('Error al listar respaldos:', error);
    return res.status(500).json({ error: 'Error al listar los respaldos de la base de datos' });
  }
}

/**
 * Crear un respaldo de la base de datos actual
 */
export async function crearBackup(req: Request, res: Response) {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return res.status(404).json({ error: 'Archivo de base de datos original no encontrado' });
    }

    // Formatear fecha actual
    const ahora = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}_${pad(ahora.getHours())}-${pad(ahora.getMinutes())}-${pad(ahora.getSeconds())}`;
    const backupName = `backup_${timestamp}.db`;
    const destPath = path.join(BACKUPS_DIR, backupName);

    // Copiar archivo de base de datos
    fs.copyFileSync(DB_FILE, destPath);

    return res.json({
      message: 'Respaldo creado con éxito',
      respaldo: {
        nombre: backupName,
        fecha: ahora,
        tamano: fs.statSync(destPath).size,
      },
    });
  } catch (error) {
    console.error('Error al crear respaldo:', error);
    return res.status(500).json({ error: 'Error al crear el respaldo de la base de datos' });
  }
}

/**
 * Restaurar un respaldo seleccionado
 */
export async function restaurarBackup(req: Request, res: Response) {
  const { nombreArchivo } = req.body;

  if (!nombreArchivo) {
    return res.status(400).json({ error: 'El nombre del archivo de respaldo es requerido' });
  }

  const backupPath = path.join(BACKUPS_DIR, nombreArchivo);

  try {
    // Validar existencia del respaldo y evitar path traversal
    if (!fs.existsSync(backupPath) || !nombreArchivo.startsWith('backup_') || !nombreArchivo.endsWith('.db')) {
      return res.status(404).json({ error: 'Archivo de respaldo no encontrado o inválido' });
    }

    console.log(`Iniciando restauración de respaldo: ${nombreArchivo}`);

    // Desconectar Prisma temporalmente para liberar bloqueos
    await prisma.$disconnect();

    // Eliminar archivos temporales de SQLite si existen (WAL/SHM) para evitar inconsistencias
    const walFile = `${DB_FILE}-wal`;
    const shmFile = `${DB_FILE}-shm`;

    if (fs.existsSync(walFile)) {
      try {
        fs.unlinkSync(walFile);
      } catch (e) {
        console.warn('No se pudo borrar el archivo wal:', e);
      }
    }

    if (fs.existsSync(shmFile)) {
      try {
        fs.unlinkSync(shmFile);
      } catch (e) {
        console.warn('No se pudo borrar el archivo shm:', e);
      }
    }

    // Copiar el archivo del respaldo sobre el archivo de base de datos activo
    fs.copyFileSync(backupPath, DB_FILE);

    // Volver a conectar Prisma
    await prisma.$connect();

    console.log(`Restauración exitosa de: ${nombreArchivo}`);
    return res.json({ message: 'Base de datos restaurada con éxito' });
  } catch (error) {
    console.error('Error al restaurar respaldo:', error);
    // Intentar reconectar por seguridad si falló algo
    try {
      await prisma.$connect();
    } catch (_) {}
    return res.status(500).json({ error: 'Error durante la restauración de la base de datos' });
  }
}
