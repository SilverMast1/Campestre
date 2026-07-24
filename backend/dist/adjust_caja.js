"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
async function adjust() {
    const activeShift = await db_1.default.turno.findFirst({
        where: { activo: true }
    });
    if (!activeShift) {
        console.log('No hay turno activo.');
        return;
    }
    const adjustment = await db_1.default.retiroCaja.create({
        data: {
            turno_id: activeShift.id,
            monto: 183,
            motivo: 'Ajuste de Caja (Cuadre Físico)',
            tipo: 'RETIRO'
        }
    });
    console.log(`Creado ajuste de retiro: ID ${adjustment.id}, monto $${adjustment.monto}, turno ID ${activeShift.id}`);
}
adjust().catch(console.error);
