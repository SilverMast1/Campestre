"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    const prods = await prisma.inventarioArea.findMany({
        where: {
            area_id: 1,
            producto: {
                nombre: { contains: 'taco' }
            }
        },
        include: { producto: true }
    });
    for (const p of prods) {
        console.log(p.producto.nombre, p.stock.toString());
    }
}
run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
