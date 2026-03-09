import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const org_id = searchParams.get('org_id');

        if (!org_id) {
            return NextResponse.json({ error: 'Missing org_id' }, { status: 400 });
        }

        // Fetch the current month's budget
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        let budget = await prisma.credit_budgets.findFirst({
            where: {
                org_id,
                month: { gte: currentMonth }
            }
        });

        // Initialize a default budget if none exists for this month
        if (!budget) {
            budget = await prisma.credit_budgets.create({
                data: {
                    org_id,
                    month: currentMonth,
                    budget_usd: 300, // Default to $300 based on new credits
                    spent_usd: 0
                }
            });
        }

        // Fetch recent usage logs
        const usageLogs = await prisma.credit_usage.findMany({
            where: { org_id },
            orderBy: { created_at: 'desc' },
            take: 100,
            include: {
                agents: true
            }
        });

        return NextResponse.json({
            budget,
            usageLogs
        });
    } catch (error) {
        console.error('Error fetching credit data:', error);
        return NextResponse.json({ error: 'Failed to fetch credit data' }, { status: 500 });
    }
}
