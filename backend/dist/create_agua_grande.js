"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const decimal_js_1 = require("decimal.js");
async function main() {
    console.log("=== CREANDO AGUA MINERAL GRANDE ===");
    // Buscar si ya existe
    const existente = await db_1.default.producto.findFirst({
        where: { nombre: { equals: 'Agua Mineral Grande' } }
    });
    if (existente) {
        console.log("El producto 'Agua Mineral Grande' ya existe:", existente);
        return;
    }
    // Crear el producto
    const nuevo = await db_1.default.producto.create({
        data: {
            nombre: 'Agua Mineral Grande',
            precio_venta: new decimal_js_1.Decimal(0),
            categoria: 'Bebidas',
            descripcion: 'Agua mineral grande para preparado (no para venta directa)',
            activo: true
        }
    });
    console.log("Producto creado:", nuevo);
    // Crear registros de inventario en las 3 áreas
    const areas = [1, 2, 3];
    for (const areaId of areas) {
        const inv = await db_1.default.inventarioArea.create({
            data: {
                area_id: areaId,
                producto_id: nuevo.id,
                stock: new decimal_js_1.Decimal(0),
                stock_minimo: new decimal_js_1.Decimal(5),
                stock_maximo: new decimal_js_1.Decimal(999)
            }
        });
        console.log(`Registrado en área ${areaId} con stock 0:`, inv);
    }
    console.log("=== PROCESO COMPLETADO EXCELENTEMENTE ===");
}
main()
    .catch(console.error)
    .finally(() => db_1.default.$disconnect());
