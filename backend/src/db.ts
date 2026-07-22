import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string {
  const fallbackUrl = 'postgresql://postgres:Clubcampestre2026.@db.zdeenhvjtnxvlqdpsewj.supabase.co:5432/postgres?sslmode=require&connect_timeout=30';
  let url = process.env.DATABASE_URL || fallbackUrl;
  
  // Limpiar corchetes accidentales si se pegaron en la variable de entorno
  if (url.includes('[') && url.includes(']')) {
    url = url.replace(/\[|\]/g, '');
  }

  // Si es URL de Supabase, asegurar puerto 5432 y sslmode=require
  if (url.includes('supabase.co')) {
    if (url.includes(':6543/')) {
      url = url.replace(':6543/', ':5432/');
    }
    if (!url.includes('sslmode=')) {
      url += (url.includes('?') ? '&' : '?') + 'sslmode=require&connect_timeout=30';
    }
  } else if (!url.startsWith('file:')) {
    url = fallbackUrl;
  }

  return url;
}

const dbUrl = getDatabaseUrl();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

// Solución global para serialización de BigInt en Express / JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  const num = Number(this);
  return Number.isSafeInteger(num) ? num : this.toString();
};

export async function optimizarSQLite() {
  try {
    const isSqlite = dbUrl.startsWith('file:');
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
