const jwt = require('jsonwebtoken');
const { execSync } = require('child_process');

const token = jwt.sign({ id: 1, username: 'admin', type: 'INTERNAL', roles: ['ADMIN'] }, 'campestre_jwt_secret_token_key_2026_super_strong', { expiresIn: '1d' });

console.log('--- TEST 1: NO QUERY PARAMS ---');
const cmd1 = `curl.exe -s -H "Authorization: Bearer ${token}" "https://campestre.alwaysdata.net/api/admin/cuentas"`;
const res1 = JSON.parse(execSync(cmd1).toString());
console.log('Count (no params):', res1.length);
console.log('Abiertas count (no params):', res1.filter(c => c.estado === 'ABIERTA').length);

console.log('--- TEST 2: solo_turno_activo=true ---');
const cmd2 = `curl.exe -s -H "Authorization: Bearer ${token}" "https://campestre.alwaysdata.net/api/admin/cuentas?solo_turno_activo=true"`;
const res2 = JSON.parse(execSync(cmd2).toString());
console.log('Count (solo_turno_activo=true):', res2.length);

