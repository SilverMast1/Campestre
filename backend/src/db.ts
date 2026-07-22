import { PrismaClient } from '@prisma/client';

// Limpieza automática de la URL de conexión de Supabase en caso de corchetes o puerto 5432
let rawDbUrl = process.env.DATABASE_URL || '';
if (rawDbUrl.includes('[') && rawDbUrl.includes(']')) {
  rawDbUrl = rawDbUrl.replace(/\[|\]/g, '');
}
if (rawDbUrl.includes(':5432/') && rawDbUrl.includes('supabase.co')) {
  rawDbUrl = rawDbUrl.replace(':5432/', ':6543/');
}

// Fallback por omisión si la variable en Netlify no se asignó correctamente
if (!rawDbUrl && process.env.NETLIFY) {
  rawDbUrl = 'postgresql://postgres:Clubcampestre2026.@db.zdeenhvjtnxvlqdpsewj.supabase.co:6543/postgres';
}

const prisma = new PrismaClient({
  datasources: rawDbUrl ? { db: { url: rawDbUrl } } : undefined,
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
