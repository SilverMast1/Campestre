"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
async function main() {
    console.log("=== BUSCANDO AGUA MINERAL GRANDE ===");
    const products = await db_1.default.producto.findMany({
        where: {
            nombre: { contains: 'Agua Mineral' }
        }
    });
    console.log("Productos encontrados:", products.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio_venta: Number(p.precio_venta),
        activo: p.activo
    })));
    for (const p of products) {
        const inv = await db_1.default.inventarioArea.findMany({
            where: { producto_id: p.id }
        });
        console.log(`Inventario de área para "${p.nombre}" (ID ${p.id}):`, inv.map(i => ({
            area_id: i.area_id,
            stock: Number(i.stock)
        })));
    }
}
main()
    .catch(console.error)
    .finally(() => db_1.default.$disconnect());
