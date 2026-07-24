"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
async function main() {
    console.log('Iniciando vaciado completo de transacciones, socios, cadis y turnos...');
    await db_1.default.$transaction(async (tx) => {
        await tx.divisionCuenta.deleteMany({});
        await tx.detalleCuenta.deleteMany({});
        await tx.cuenta.deleteMany({});
        await tx.movimientoInventario.deleteMany({});
        await tx.asignacionCadiCliente.deleteMany({});
        await tx.cliente.deleteMany({});
        await tx.cadi.deleteMany({});
        await tx.retiroCaja.deleteMany({});
        await tx.turno.deleteMany({});
    });
    console.log('¡Base de datos reiniciada con éxito! Socios, Cadis, Cuentas y Turnos vaciados.');
}
main()
    .catch((e) => {
    console.error('Error al reiniciar base de datos:', e);
    process.exit(1);
})
    .finally(async () => {
    await db_1.default.$disconnect();
});
