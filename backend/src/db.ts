import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Solución global para serialización de BigInt en Express / JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  const num = Number(this);
  return Number.isSafeInteger(num) ? num : this.toString();
};

export default prisma;
export { prisma };
