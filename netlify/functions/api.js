const serverless = require('serverless-http');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:Clubcampestre2026.@db.zdeenhvjtnxvlqdpsewj.supabase.co:6543/postgres';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'campestre_jwt_secret_token_key_2026_super_strong';
}
process.env.NETLIFY = 'true';

const { app } = require('../../backend/dist/index');

module.exports.handler = serverless(app);
