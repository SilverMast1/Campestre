import { PrismaClient } from '@prisma/client';

// Limpieza automática de la URL de conexión de Supabase (usar puerto 5432 + sslmode=require obligatorio para Netlify/AWS)
let rawDbUrl = process.env.DATABASE_URL || '';
if (rawDbUrl.includes('[') && rawDbUrl.includes(']')) {
  rawDbUrl = rawDbUrl.replace(/\[|\]/g, '');
}
if (rawDbUrl.includes('supabase.co')) {
  if (rawDbUrl.includes(':6543/')) {
    rawDbUrl = rawDbUrl.replace(':6543/', ':5432/');
  }
  if (!rawDbUrl.includes('sslmode=')) {
    rawDbUrl += (rawDbUrl.includes('?') ? '&' : '?') + 'sslmode=require&connect_timeout=30';
  }
}

// Fallback por omisión si la variable en Netlify no se asignó o es inválida
if (!rawDbUrl || process.env.NETLIFY) {
  rawDbUrl = 'postgresql://postgres:Clubcampestre2026.@db.zdeenhvjtnxvlqdpsewj.supabase.co:5432/postgres?sslmode=require&connect_timeout=30';
}

const prisma = new PrismaClient({
  datasources: { db: { url: rawDbUrl } },
});

// Solución global para serialización de BigInt en Express / JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  const num = Number(this);
  return Number.isSafeInteger(num) ? num : this.toString();
};

export async function optimizarSQLite() {
  try {
    const isSqlite = (process.env.DATABASE_URL || rawDbUrl).startsWith('file:');
    if (isSqlite) {
      console.log('Optimizando base de datos SQLite...');
      await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
      await prisma.$queryRawUnsafe('PRAGMA synchronous=NORMAL;');
      await prisma.$queryRawUnsafe('PRAGMA busy_timeout=15000;');
      console.log('SQLite optimizado con éxito (WAL, Synchronous NORMAL, Busy Timeout 15s).');
    } else {
      console.log('Conectado a PostgreSQL (Supabase) ✓');
    }
  } catch (error) {
    console.error('Error al verificar base de datos:', error);
  }
}

export default prisma;
export { prisma };
