"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
async function main() {
    console.log('Iniciando conversión de nombres de socios a MAYÚSCULAS...');
    const socios = await db_1.default.cliente.findMany();
    console.log(`Se encontraron ${socios.length} socios en total.`);
    let actualizados = 0;
    for (const socio of socios) {
        if (socio.nombre) {
            const nombreMayuscula = socio.nombre.trim().toUpperCase();
            if (nombreMayuscula !== socio.nombre) {
                await db_1.default.cliente.update({
                    where: { id: socio.id },
                    data: { nombre: nombreMayuscula },
                });
                actualizados++;
            }
        }
    }
    console.log(`Conversión completada. Se actualizaron ${actualizados} nombres de socios a MAYÚSCULAS.`);
}
main()
    .catch((e) => {
    console.error('Error durante la conversión:', e);
    process.exit(1);
})
    .finally(async () => {
    await db_1.default.$disconnect();
});
