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
const decimal_js_1 = require("decimal.js");
async function main() {
    const excelPath = 'C:\\Users\\SERGIO\\OneDrive\\Escritorio\\adeudos socios.xlsx';
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets['Socios'];
    const excelRows = XLSX.utils.sheet_to_json(sheet);
    // Map of excel Código to Saldo
    const excelMap = new Map();
    for (const row of excelRows) {
        const code = String(row['CÓDIGO']).trim();
        const saldo = Number(row.SALDO || 0);
        excelMap.set(code, saldo);
    }
    // Fetch all clients with pending cargos
    const dbClients = await db_1.prisma.cliente.findMany({
        include: {
            divisionesCuentas: {
                where: {
                    metodo_pago: 'CARGO_SOCIO',
                    estado_pago: 'PENDIENTE'
                }
            }
        }
    });
    console.log('--- Client Balances Analysis ---');
    let totalDb = 0;
    const extraDivisions = [];
    for (const client of dbClients) {
        const balance = client.divisionesCuentas.reduce((sum, div) => sum.plus(new decimal_js_1.Decimal(div.monto_proporcional)), new decimal_js_1.Decimal(0)).toNumber();
        if (balance === 0)
            continue;
        totalDb += balance;
        // Try to match the client to an Excel row
        // 1. By extraction of numeric code from socioCode (e.g. "SOCIO-3" -> "3", "SOCIO-ALE-328" -> "ALE-328")
        const codeNum = client.codigo_socio ? client.codigo_socio.replace('SOCIO-', '').replace('EMPLEADO-', '').trim() : '';
        let excelSaldo = excelMap.get(codeNum);
        if (excelSaldo === undefined) {
            // 2. Try match by name
            const nameNorm = client.nombre.trim().toUpperCase();
            const excelRowByName = excelRows.find(row => String(row.SOCIO || '').trim().toUpperCase() === nameNorm);
            if (excelRowByName) {
                excelSaldo = Number(excelRowByName.SALDO || 0);
            }
        }
        if (excelSaldo === undefined) {
            // Not found in Excel at all!
            console.log(`NOT IN EXCEL: ${client.nombre} (${client.codigo_socio}) | DB Balance: ${balance} | Marking all for deletion`);
            for (const div of client.divisionesCuentas) {
                extraDivisions.push({ id: div.id, name: client.nombre, socioCode: client.codigo_socio || '', amount: Number(div.monto_proporcional) });
            }
        }
        else if (balance > excelSaldo) {
            // DB has more balance than Excel
            const excess = balance - excelSaldo;
            console.log(`EXCESS BALANCE: ${client.nombre} (${client.codigo_socio}) | DB Balance: ${balance} | Excel Saldo: ${excelSaldo} | Excess: ${excess}`);
            // Let's identify which divisions to delete to match Excel
            // We can sort divisions descending or ascending and find a combination, or if Excel saldo is 0, delete all of them.
            if (excelSaldo === 0) {
                console.log(`  -> Excel is 0. Deleting all divisions: ${client.divisionesCuentas.map(d => d.id).join(', ')}`);
                for (const div of client.divisionesCuentas) {
                    extraDivisions.push({ id: div.id, name: client.nombre, socioCode: client.codigo_socio || '', amount: Number(div.monto_proporcional) });
                }
            }
            else {
                // If Excel saldo is not 0 but DB is larger, let's see which divisions match the excess
                console.log(`  -> Excel is ${excelSaldo}. Need to reduce by ${excess}.`);
                // Let's print the divisions of this client so we can decide
                for (const div of client.divisionesCuentas) {
                    console.log(`     - Division ID: ${div.id} | Amount: ${div.monto_proporcional}`);
                }
            }
        }
    }
    // Also check direct accounts (DEUDAS area)
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
    for (const c of dbDirectDebts) {
        const codeNum = c.cliente?.codigo_socio ? c.cliente.codigo_socio.replace('SOCIO-', '').replace('EMPLEADO-', '').trim() : '';
        let excelSaldo = excelMap.get(codeNum);
        const balance = Number(c.total);
        totalDb += balance;
        if (excelSaldo === undefined && c.cliente) {
            const nameNorm = c.cliente.nombre.trim().toUpperCase();
            const excelRowByName = excelRows.find(row => String(row.SOCIO || '').trim().toUpperCase() === nameNorm);
            if (excelRowByName) {
                excelSaldo = Number(excelRowByName.SALDO || 0);
            }
        }
        if (excelSaldo === undefined) {
            console.log(`DIRECT ACCT NOT IN EXCEL: Account ID ${c.id} | Socio: ${c.cliente?.codigo_socio} | Name: ${c.cliente?.nombre} | DB Balance: ${balance} | Marking for deletion`);
            // We will delete this direct account
        }
        else if (balance > excelSaldo) {
            const excess = balance - excelSaldo;
            console.log(`DIRECT ACCT EXCESS: Account ID ${c.id} | Socio: ${c.cliente?.codigo_socio} | Name: ${c.cliente?.nombre} | DB Balance: ${balance} | Excel Saldo: ${excelSaldo} | Excess: ${excess}`);
        }
    }
    console.log(`\nDB Total Debt: ${totalDb}`);
    const totalExtraAmount = extraDivisions.reduce((sum, d) => sum + d.amount, 0);
    console.log(`Total amount marked for deletion: ${totalExtraAmount}`);
    console.log('Extra Divisions:', extraDivisions);
}
main()
    .catch(e => console.error(e))
    .finally(() => db_1.prisma.$disconnect());
