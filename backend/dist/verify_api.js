"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const decimal_js_1 = require("decimal.js");
async function verify() {
    const t = await db_1.default.turno.findUnique({
        where: { id: 13 },
        include: { retiros: true }
    });
    if (!t) {
        console.log('Turno 13 no encontrado');
        return;
    }
    const fondo = new decimal_js_1.Decimal(t.fondo_inicial);
    const cajaEfectivoTotal = new decimal_js_1.Decimal(t.caja_efectivo);
    const retirosOnly = t.retiros ? t.retiros.filter(r => r.tipo !== 'INGRESO') : [];
    const ingresosOnly = t.retiros ? t.retiros.filter(r => r.tipo === 'INGRESO') : [];
    const totalRetiros = retirosOnly.reduce((sum, r) => sum.plus(new decimal_js_1.Decimal(r.monto)), new decimal_js_1.Decimal(0));
    const totalIngresos = ingresosOnly.reduce((sum, r) => sum.plus(new decimal_js_1.Decimal(r.monto)), new decimal_js_1.Decimal(0));
    const efectivoVendido = decimal_js_1.Decimal.max(0, cajaEfectivoTotal.minus(fondo).minus(totalIngresos).plus(totalRetiros));
    const tarjeta = new decimal_js_1.Decimal(t.caja_tarjeta);
    const cargos = new decimal_js_1.Decimal(t.caja_cargos);
    const transferencia = new decimal_js_1.Decimal(t.caja_transferencia || 0);
    const ventasNetas = efectivoVendido.plus(tarjeta).plus(cargos).plus(transferencia);
    console.log('=== VERIFICACIÓN API CORTE TURNO 13 ===');
    console.log(`Fondo Inicial: $${fondo.toNumber()}`);
    console.log(`Caja Efectivo Total: $${cajaEfectivoTotal.toNumber()}`);
    console.log(`Total Ingresos Adicionales: $${totalIngresos.toNumber()}`);
    console.log(`Total Retiros Adicionales: $${totalRetiros.toNumber()}`);
    console.log(`Efectivo Ventas Calculado: $${efectivoVendido.toNumber()}`);
    console.log(`Tarjeta Ventas: $${tarjeta.toNumber()}`);
    console.log(`Cargos Socios: $${cargos.toNumber()}`);
    console.log(`Ventas Netas Totales del Turno: $${ventasNetas.toNumber()}`);
}
verify().catch(console.error);
