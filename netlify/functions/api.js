const serverless = require('serverless-http');

// Configurar variables de entorno globales ANTES de cargar el backend Express
process.env.NETLIFY = 'true';
process.env.DATABASE_URL = 'postgresql://postgres:Clubcampestre2026.@db.zdeenhvjtnxvlqdpsewj.supabase.co:5432/postgres?sslmode=require&connect_timeout=30';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'campestre_jwt_secret_token_key_2026_super_strong';
}

const { app } = require('../../backend/dist/index');

module.exports.handler = serverless(app);
