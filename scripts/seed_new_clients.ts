import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();
const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';

async function main() {
    const newClients = [
        {
            name: 'KateMonroeCEO.com',
            industry: 'Personal Brand',
            tier: 'enterprise',
            settings: { color: '#8b5cf6', icon: '🌟' } // Purple/Gold theme logic placeholder
        },
        {
            name: 'VETCOMM.US',
            industry: 'Veteran Affairs / Business',
            tier: 'enterprise',
            settings: { color: '#ef4444', icon: '🦅' }
        },
        {
            name: 'MonroeMedia.com',
            industry: 'Media & Production',
            tier: 'enterprise',
            settings: { color: '#3b82f6', icon: '🎥' }
        },
        {
            name: 'Rolling Gates',
            industry: 'Construction / Security',
            tier: 'starter',
            settings: { color: '#10b981', icon: '🏗️' }
        }
    ];

    console.log('Seeding new clients into PostgreSQL...');

    for (const client of newClients) {
        const existing = await prisma.clients.findFirst({
            where: { name: client.name, org_id: PLATFORM_ORG }
        });

        if (!existing) {
            await prisma.clients.create({
                data: {
                    org_id: PLATFORM_ORG,
                    name: client.name,
                    industry: client.industry,
                    tier: client.tier,
                    active: true,
                    settings: client.settings
                }
            });
            console.log(`✅ Inserted: ${client.name}`);
        } else {
            console.log(`⚠️ Skipped: ${client.name} (Already exists)`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
