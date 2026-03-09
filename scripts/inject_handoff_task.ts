import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

async function main() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const description = `
**Outstanding Ava Development Tasks (Phase 4 & 5):**
1. Connect Content Pipeline to the Make.com Webhook.
2. Write automated WordPress provisioning scripts.
3. Build the backend automated alert logic for the $290 spend threshold.
4. Build the system API Kill-Switch if remaining credits hit $0.50.
5. Package the PDF Resume parser into a permanent reusable OpenClaw Skill for the future Job Board.

**Handoff Message for Jarvis:**
Jarvis, please review the new \`consultant_candidate_evaluation.md\` artifact in the brain directory. I have processed 4 PDF resumes and ranked our top candidate (Zakary Heppler). Please store or forward this report to the HR context as requested by Tim.
Also, acknowledge the new strict operating rule: if API credits hit $0.50 remaining, all tasks drop immediately to prevent lockouts.
`;

    await prisma.tasks.create({
        data: {
            org_id: '00000000-0000-0000-0000-000000000001',
            title: 'Handoff: Outstanding Tasks & Jarvis Action Items',
            description: description.trim(),
            status: 'new',
            priority: 'high'
        }
    });

    console.log("Handoff Task injected.");
    await prisma.$disconnect();
}

main().catch(console.error);
