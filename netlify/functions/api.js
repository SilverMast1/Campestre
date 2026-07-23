const serverless = require('serverless-http');

// Configurar variables de entorno explícitas para Netlify con SSL obligatorio y puerto 6543 (Pooler IPv4)
process.env.NETLIFY = 'true';
const poolerUrl = 'postgresql://postgres:Clubcampestre2026.@db.zdeenhvjtnxvlqdpsewj.supabase.co:6543/postgres?sslmode=require&pgbouncer=true&connect_timeout=30';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes(':5432/')) {
  process.env.DATABASE_URL = poolerUrl;
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'campestre_jwt_secret_token_key_2026_super_strong';
}

const { app } = require('../../backend/dist/index');

module.exports.handler = serverless(app);
