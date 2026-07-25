
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const app = express();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:Clubcampestre2026.@db.zdeenhvjtnxvlqdpsewj.supabase.co:5432/postgres?sslmode=require'
    }
  }
});

app.get('/api/debug-db', async (req, res) => {
  try {
    const cuentasCount = await prisma.cuenta.count();
    const abiertasCount = await prisma.cuenta.count({ where: { estado: 'ABIERTA' } });
    const envDb = process.env.DATABASE_URL || 'FALLBACK_SUPABASE';
    const sampleCuentas = await prisma.cuenta.findMany({ where: { estado: 'ABIERTA' }, take: 5 });
    res.json({
      envDbHost: envDb.split('@')[1] || envDb,
      cuentasTotal: cuentasCount,
      abiertasTotal: abiertasCount,
      sample: sampleCuentas.map(c => ({ id: c.id, ref: c.nombre_referencia, area_id: c.area_id }))
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

require('./dist/index.js');
