"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    const prods = await prisma.producto.findMany({
        include: { inventarios: true }
    });
    const p = prods.filter((x) => x.nombre.toLowerCase().includes('taco') && x.inventarios.some((i) => i.area_id === 1));
    console.log(JSON.stringify(p, null, 2));
}
run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
