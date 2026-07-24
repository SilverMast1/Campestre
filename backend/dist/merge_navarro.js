"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Buscando clientes Navarro ---');
    const clientes = await prisma.cliente.findMany({
        where: {
            nombre: {
                contains: 'Navarro'
            }
        }
    });
    console.log('Clientes encontrados:', clientes.map((c) => ({ id: c.id, nombre: c.nombre, codigo: c.codigo_socio })));
    const gilberto = clientes.find((c) => c.nombre.toLowerCase().includes('gilberto'));
    const gil = clientes.find((c) => c.nombre.toLowerCase() === 'gil navarro' || c.nombre.toLowerCase() === 'gil');
    if (gilberto && gil) {
        console.log(`Fusionando "${gil.nombre}" (ID: ${gil.id}) en "${gilberto.nombre}" (ID: ${gilberto.id})...`);
        // Contar cuentas antes de la fusión
        const cuentasGil = await prisma.cuenta.count({ where: { cliente_id: gil.id } });
        const divisionesGil = await prisma.divisionCuenta.count({ where: { cliente_id: gil.id } });
        console.log(`Cuentas de Gil: ${cuentasGil}, Divisiones de Gil: ${divisionesGil}`);
        await prisma.$transaction(async (tx) => {
            // Reasignar cuentas
            await tx.cuenta.updateMany({
                where: { cliente_id: gil.id },
                data: { cliente_id: gilberto.id }
            });
            // Reasignar divisiones de cuentas
            await tx.divisionCuenta.updateMany({
                where: { cliente_id: gil.id },
                data: { cliente_id: gilberto.id }
            });
            // Reasignar asignaciones de cadi
            await tx.asignacionCadiCliente.updateMany({
                where: { cliente_id: gil.id },
                data: { cliente_id: gilberto.id }
            });
            // Eliminar el duplicado
            await tx.cliente.delete({
                where: { id: gil.id }
            });
        });
        console.log('Fusión completada con éxito.');
    }
    else {
        console.log('No se encontraron ambos registros para fusionar.');
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
