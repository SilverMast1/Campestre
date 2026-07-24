"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.optimizarSQLite = optimizarSQLite;
const client_1 = require("@prisma/client");
function buildFallbackUrl() {
    const user = 'postgres';
    const pass = 'Clubcampestre2026.';
    const host = 'db.zdeenhvjtnxvlqdpsewj.supabase.co';
    const port = '5432';
    return `postgresql://${user}:${pass}@${host}:${port}/postgres?sslmode=require`;
}
function getDatabaseUrl() {
    const fallbackUrl = buildFallbackUrl();
    let url = process.env.DATABASE_URL || fallbackUrl;
    // Corregir typo de mayúscula I por l en project ref de Supabase
    if (url.includes('zdeenhvjtnxvIqdpsewj')) {
        url = url.replace('zdeenhvjtnxvIqdpsewj', 'zdeenhvjtnxvlqdpsewj');
    }
    // Limpiar corchetes accidentales
    if (url.includes('[') && url.includes(']')) {
        url = url.replace(/\[|\]/g, '');
    }
    // Asegurar SSL mode para Supabase sin lock de pgbouncer
    if (url.includes('supabase.co') && !url.includes('sslmode=')) {
        url += (url.includes('?') ? '&' : '?') + 'sslmode=require';
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
