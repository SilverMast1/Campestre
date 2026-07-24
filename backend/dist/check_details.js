"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
async function checkDetails() {
    const turnoId = 13;
    const accounts = await db_1.default.cuenta.findMany({
        where: { turno_id: turnoId },
        include: {
            divisionesCuentas: {
                include: { cliente: true }
            }
        }
    });
    console.log('=== DETALLE CUENTAS Y DIVISIONES ===');
    for (const c of accounts) {
        console.log(`Cuenta ID ${c.id} (total: ${c.total}, metodo: ${c.metodo_pago}, ef: ${c.monto_efectivo}, tj: ${c.monto_tarjeta})`);
        if (c.divisionesCuentas.length > 0) {
            for (const d of c.divisionesCuentas) {
                console.log(`  - Division ID ${d.id}: Socio ${d.cliente.nombre}, Monto Proporcional ${d.monto_proporcional}, Metodo ${d.metodo_pago}, Ef ${d.monto_efectivo}, Tj ${d.monto_tarjeta}, Turno Pago ${d.turno_pago_id}`);
            }
        }
    }
    // Also print retiros/ingresos
    const retiros = await db_1.default.retiroCaja.findMany({
        where: { turno_id: turnoId }
    });
    console.log('=== RETIROS / INGRESOS ===');
    for (const r of retiros) {
        console.log(`Retiro/Ingreso ID ${r.id}: Tipo ${r.tipo}, Monto ${r.monto}, Motivo ${r.motivo}`);
    }
}
checkDetails().catch(console.error);
