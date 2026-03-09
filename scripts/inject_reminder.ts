import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

async function main() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    await prisma.notifications.create({
        data: {
            org_id: '00000000-0000-0000-0000-000000000001',
            title: 'WARNING: $300 Credit Limit Approaching',
            body: 'CRITICAL REMINDER: You must activate the paid API account before we hit $290 in usage to prevent data loss. Automated warning threshold set.',
            type: 'system',
            priority: 'high',
            metadata: { link: '/credits' }
        }
    });

    console.log("Notification injected.");
    await prisma.$disconnect();
}

main().catch(console.error);
