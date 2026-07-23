const serverless = require('serverless-http');

// Configurar variables de entorno explícitas para Netlify con SSL obligatorio y puerto 6543 (Pooler IPv4)
process.env.NETLIFY = 'true';
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes(':5432/')) {
  const u = 'postgres';
  const p = 'Clubcampestre2026.';
  const h = 'db.zdeenhvjtnxvlqdpsewj.supabase.co';
  const port = '6543';
  process.env.DATABASE_URL = `postgresql://${u}:${p}@${h}:${port}/postgres?sslmode=require&pgbouncer=true&connect_timeout=30`;
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'campestre_jwt_secret_token_key_2026_super_strong';
}

const { app } = require('../../backend/dist/index');

module.exports.handler = serverless(app);
