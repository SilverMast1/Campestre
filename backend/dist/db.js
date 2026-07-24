"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.optimizarSQLite = optimizarSQLite;
const client_1 = require("@prisma/client");
function buildFallbackUrl() {
    const user = 'postgres';
    const pass = 'Clubcampestre2026.';
    const host = 'db.zdeenhvjtnxvlqdpsewj.supabase.co';
    const port = '6543';
    return `postgresql://${user}:${pass}@${host}:${port}/postgres?sslmode=require&pgbouncer=true&connection_limit=30&pool_timeout=60&connect_timeout=60`;
}
function getDatabaseUrl() {
    const fallbackUrl = buildFallbackUrl();
    let url = process.env.DATABASE_URL || fallbackUrl;
    // Corregir typo de mayúscula I por l en project ref de Supabase
    if (url.includes('zdeenhvjtnxvIqdpsewj')) {
        url = url.replace('zdeenhvjtnxvIqdpsewj', 'zdeenhvjtnxvlqdpsewj');
    }
    // Limpiar corchetes accidentales si se pegaron en la variable de entorno
    if (url.includes('[') && url.includes(']')) {
        url = url.replace(/\[|\]/g, '');
    }
    // Si es Netlify, Railway u otra nube + URL de Supabase, asegurar puerto 6543 y parámetros de pooler
    const isCloud = process.env.NETLIFY === 'true' || process.env.RAILWAY_ENVIRONMENT !== undefined || process.env.NODE_ENV === 'production';
    if (isCloud || url.includes('supabase.co')) {
        if (url.includes(':5432/')) {
            url = url.replace(':5432/', ':6543/');
        }
        if (!url.includes('pgbouncer=')) {
            url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
        }
        if (!url.includes('sslmode=')) {
            url += (url.includes('?') ? '&' : '?') + 'sslmode=require';
        }
        if (!url.includes('connection_limit=')) {
            url += '&connection_limit=30';
        }
        if (!url.includes('pool_timeout=')) {
            url += '&pool_timeout=60';
        }
        if (!url.includes('connect_timeout=')) {
            url += '&connect_timeout=60';
        }
    }
    else if (!url.startsWith('file:')) {
        url = fallbackUrl;
    }
    return url;
}
const dbUrl = getDatabaseUrl();
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
    // Registrar queries lentas (>1s) en desarrollo para identificar cuellos de botella
    log: process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }]
        : [],
});
exports.prisma = prisma;
// En desarrollo: loguear queries que tardan más de 1 segundo
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        if (e.duration > 1000) {
            console.warn(`[Prisma SLOW QUERY ${e.duration}ms] ${e.query?.substring(0, 120)}`);
        }
    });
}
// Solución global para serialización de BigInt en Express / JSON.stringify
BigInt.prototype.toJSON = function () {
    const num = Number(this);
    return Number.isSafeInteger(num) ? num : this.toString();
};
async function optimizarSQLite() {
    try {
        const isSqlite = dbUrl.startsWith('file:');
        if (isSqlite) {
            console.log('Optimizando base de datos SQLite...');
            await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
            await prisma.$queryRawUnsafe('PRAGMA synchronous=NORMAL;');
            await prisma.$queryRawUnsafe('PRAGMA busy_timeout=15000;');
            console.log('SQLite optimizado con éxito (WAL, Synchronous NORMAL, Busy Timeout 15s).');
        }
        else {
            console.log('Conectado a PostgreSQL (Supabase) ✓');
        }
    }
    catch (error) {
        console.error('Error al verificar base de datos:', error);
    }
}
exports.default = prisma;
