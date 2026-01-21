import { PrismaClient } from './generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma || new PrismaClient({
//     adapter,
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const prismaClientSingleton = () => {
    const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    });
    return new PrismaClient({ adapter });
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prismaClient = globalThis.prisma ?? prismaClientSingleton();

if(process.env.NODE_ENV !== "production")   globalThis.prisma = prismaClient;

export default prismaClient;
export * from "./generated/prisma/index.js";