// there should be one prisma client for entire app
import { PrismaClient } from '@prisma/client';

// global storage to keep client alive
const globalForPrisma = globalThis;

let prisma;

// if we already have a connection use it
if (globalForPrisma.prisma) {
    prisma = globalForPrisma.prisma;
    console.log('✅ Reusing existing database connection');
}
// if no connection exists, create one
else {
    prisma = new PrismaClient({
        log: ['warn', 'error']
    });
    console.log('✅ Created new database connection');
}

// save to global so hot-reload doesn't create duplicates
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    console.log('💾 Saved connection to global memory');
} 
// in production we still use the same single connection
else {
    console.log('🚀 Running in production - using single connection');
}


export default prisma;

// prisma handles connect and disconnects automatically