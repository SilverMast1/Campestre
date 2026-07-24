"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    const areas = await prisma.area.findMany();
    console.log(areas);
}
run().catch(console.error).finally(() => prisma.$disconnect());
