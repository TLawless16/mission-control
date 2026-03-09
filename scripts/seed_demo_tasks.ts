import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding demo data...');

    // 1. Create or Find an Organization
    let org = await prisma.organizations.findFirst();
    if (!org) {
        org = await prisma.organizations.create({
            data: {
                name: 'GravityClaw HQ',
                slug: 'gravityclaw-hq',
                tier: 'premium',
            }
        });
    }

    // 2. Create or Find a Client
    let client = await prisma.clients.findFirst({ where: { name: 'VetComm (Kate Monroe)' } });
    if (!client) {
        client = await prisma.clients.create({
            data: {
                org_id: org.id,
                name: 'VetComm (Kate Monroe)',
                industry: 'Veterans Services',
                bio: 'Helping veterans get the maximum disability rating they deserve.',
                brand_voice: 'Patriotic, direct, helpful, and firm.',
                tier: 'enterprise'
            }
        });
    }

    // 3. Create a Project
    const project = await prisma.projects.create({
        data: {
            org_id: org.id,
            client_id: client.id,
            name: 'Deploy Blog Agent Pipeline',
            description: 'Fully automate the WordPress blog generation and scheduling pipeline.',
            status: 'active',
            priority: 'high',
            target_date: new Date(new Date().setDate(new Date().getDate() + 14)) // 14 days from now
        }
    });

    // 4. Create Tasks under that Project
    await prisma.tasks.createMany({
        data: [
            {
                org_id: org.id,
                client_id: client.id,
                project_id: project.id,
                title: 'Configure Make.com Webhook',
                description: 'Set up the inbound webhook to receive payloads from the Mission Control pipeline.',
                status: 'new',
                priority: 'high',
                assigned_agent: 'Jarvis',
            },
            {
                org_id: org.id,
                client_id: client.id,
                project_id: project.id,
                title: 'Provision Staging WordPress Site',
                description: 'Spin up a fresh WordPress instance for end-to-end testing of the agentic posting.',
                status: 'working',
                priority: 'medium',
                assigned_agent: 'Ava',
            }
        ]
    });

    // 5. Create Standalone Tasks (Not tied to a project)
    await prisma.tasks.createMany({
        data: [
            {
                org_id: org.id,
                client_id: client.id,
                title: 'Daily Morning Brief Generation',
                description: 'Compile competitor research and tech trends into the daily client briefing.',
                status: 'working',
                priority: 'high',
                assigned_agent: 'Jarvis',
            },
            {
                org_id: org.id,
                client_id: client.id,
                title: 'Follow up on pending invoices',
                description: 'Run the PDF invoice generator skill and email outstanding balances.',
                status: 'new',
                priority: 'low',
                category: 'finance'
            }
        ]
    });

    console.log('Successfully seeded database with demo Projects and Tasks!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
