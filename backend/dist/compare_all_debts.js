"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const db_1 = require("./db");
async function main() {
    const excelPath = 'C:\\Users\\SERGIO\\OneDrive\\Escritorio\\adeudos socios.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets['Socios'];
    const excelRows = XLSX.utils.sheet_to_json(sheet);
    console.log(`Excel rows: ${excelRows.length}`);
    // Calculate Excel total sum of SALDO
    let excelTotal = 0;
    for (const row of excelRows) {
        excelTotal += Number(row.SALDO || 0);
    }
    console.log(`Excel total sum of SALDO: ${excelTotal}`);
    // Fetch all pending DivisionCuenta
    const dbDivs = await db_1.prisma.divisionCuenta.findMany({
        where: {
            estado_pago: 'PENDIENTE'
        },
        include: {
            cliente: true,
            cuenta: true
        }
    });
    // Also check if there are Cuentas in area 'DEUDAS' with no divisions
    const dbDirectDebts = await db_1.prisma.cuenta.findMany({
        where: {
            estado: 'ABIERTA',
            area: {
                nombre: 'DEUDAS'
            },
            divisionesCuentas: {
                none: {}
            }
        },
        include: {
            cliente: true
        }
    });
    console.log(`DB pending divisions: ${dbDivs.length}`);
    console.log(`DB direct debts (no divisions): ${dbDirectDebts.length}`);
    let dbTotal = 0;
    const dbClientDebts = {};
    for (const div of dbDivs) {
        const code = div.cliente?.codigo_socio ? String(div.cliente.codigo_socio).trim() : 'null';
        const name = div.cliente?.nombre || 'Desconocido';
        const amount = Number(div.monto_proporcional);
        dbTotal += amount;
        if (!dbClientDebts[code]) {
            dbClientDebts[code] = { name, amount: 0, ids: [], isDivision: true };
        }
        dbClientDebts[code].amount += amount;
        dbClientDebts[code].ids.push(div.id);
    }
    for (const c of dbDirectDebts) {
        const code = c.cliente?.codigo_socio ? String(c.cliente.codigo_socio).trim() : 'null';
        const name = c.cliente?.nombre || 'Desconocido';
        const amount = Number(c.total);
        dbTotal += amount;
        if (!dbClientDebts[code]) {
            dbClientDebts[code] = { name, amount: 0, ids: [], isDivision: false };
        }
        dbClientDebts[code].amount += amount;
        dbClientDebts[code].ids.push(c.id);
    }
    console.log(`DB total sum: ${dbTotal}`);
    // Compare each
    console.log('\n--- Mismatches (DB vs Excel) ---');
    for (const code of Object.keys(dbClientDebts)) {
        const dbDebt = dbClientDebts[code];
        const excelMatch = excelRows.find(row => {
            // Find matching row. In Excel, CÓDIGO can be a number (like 3) or string.
            // But in the DB, code_socio is e.g. "SOCIO-3" or "SOCIO-ALE-328". Let's extract the numeric part if possible, or match by name!
            const excelCode = String(row['CÓDIGO']).trim();
            const excelName = String(row['SOCIO']).trim().toUpperCase();
            const dbNameNormalized = dbDebt.name.trim().toUpperCase();
            // Check if code matches (e.g. if db code is "SOCIO-3" and excel code is "3", or "SOCIO-ALE-328" and excel is "ALE-328" or similar)
            const cleanDbCode = code.replace('SOCIO-', '').replace('EMPLEADO-', '').trim();
            if (cleanDbCode === excelCode)
                return true;
            // Fallback: match by name
            if (dbNameNormalized === excelName)
                return true;
            return false;
        });
        const excelSaldo = excelMatch ? Number(excelMatch.SALDO || 0) : 0;
        if (dbDebt.amount !== excelSaldo) {
            console.log(`Code: ${code} | Name: ${dbDebt.name} | DB: ${dbDebt.amount} | Excel: ${excelSaldo} | Diff: ${dbDebt.amount - excelSaldo} | DB IDs: ${dbDebt.ids.join(',')} (${dbDebt.isDivision ? 'Division' : 'Direct Cuenta'})`);
        }
    }
}
main()
    .catch(e => console.error(e))
    .finally(() => db_1.prisma.$disconnect());
