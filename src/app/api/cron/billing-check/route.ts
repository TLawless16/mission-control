import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        // Optional security: checking for an api key, but omit for now to test easily. Let's add basic key check if we want
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new Response('Unauthorized', { status: 401 });
        // }

        // We want to calculate spend for all specific orgs
        const orgs = await prisma.organizations.findMany({
            where: {
                active: true // only check active ones to save resources
            }
        });

        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const results = [];

        for (const org of orgs) {
            // Find usage for this org this month
            const usageLogs = await prisma.credit_usage.findMany({
                where: {
                    org_id: org.id,
                    created_at: { gte: currentMonth }
                }
            });

            // Calculate total spend
            const totalSpendUsd = usageLogs.reduce((acc, log) => {
                return acc + Number(log.cost_usd);
            }, 0);

            // Fetch or create the budget for this org this month
            let budget = await prisma.credit_budgets.findFirst({
                where: {
                    org_id: org.id,
                    month: { gte: currentMonth }
                }
            });

            if (!budget) {
                budget = await prisma.credit_budgets.create({
                    data: {
                        org_id: org.id,
                        month: currentMonth,
                        budget_usd: 300, 
                        spent_usd: totalSpendUsd
                    }
                });
            } else {
                // Update the spent amount if it has changed
                if (Number(budget.spent_usd) !== totalSpendUsd) {
                    budget = await prisma.credit_budgets.update({
                        where: { id: budget.id },
                        data: { spent_usd: totalSpendUsd }
                    });
                }
            }

            const budgetUsd = Number(budget.budget_usd);
            
            // Kill-switch logic check: $0.50 cutoff limit (e.g. spent >= budget - 0.50)
            if (totalSpendUsd >= (budgetUsd - 0.50)) {
                // Disable org
                await prisma.organizations.update({
                    where: { id: org.id },
                    data: { active: false }
                });

                // Check if we already sent a critical notification
                const existingNotif = await prisma.notifications.findFirst({
                    where: {
                        org_id: org.id,
                        type: 'billing_critical',
                        created_at: { gte: currentMonth }
                    }
                });

                if (!existingNotif) {
                    await prisma.notifications.create({
                        data: {
                            org_id: org.id,
                            title: 'KILL-SWITCH ACTIVATED: API Limits Reached',
                            body: `Your organization has exhausted its active API limits ($${totalSpendUsd.toFixed(2)} / $${budgetUsd.toFixed(2)} used). All AI operations have been halted.`,
                            type: 'billing_critical',
                            priority: 'high',
                            status: 'unread'
                        }
                    });
                }

                results.push({ org: org.name, status: 'disabled', spend: totalSpendUsd, budget: budgetUsd });
                continue; // move to next org
            }

            // Warning alert logic check: $290 warning threshold (e.g. spent >= budget - 10.00)
            if (totalSpendUsd >= (budgetUsd - 10.00)) {
                
                // Check if we already sent a warning this month
                const existingWarning = await prisma.notifications.findFirst({
                    where: {
                        org_id: org.id,
                        type: 'billing_warning',
                        created_at: { gte: currentMonth }
                    }
                });

                if (!existingWarning) {
                    await prisma.notifications.create({
                        data: {
                            org_id: org.id,
                            title: 'Action Required: High API Spend Warning',
                            body: `Your organization has reached $${totalSpendUsd.toFixed(2)} of its $${budgetUsd.toFixed(2)} limit. AI operations will halt soon.`,
                            type: 'billing_warning',
                            priority: 'medium',
                            status: 'unread'
                        }
                    });
                }
                results.push({ org: org.name, status: 'warning', spend: totalSpendUsd, budget: budgetUsd });
                continue;
            }

            results.push({ org: org.name, status: 'ok', spend: totalSpendUsd, budget: budgetUsd });
        }


        return NextResponse.json({
            success: true,
            processed: orgs.length,
            results
        });

    } catch (error) {
        console.error('Error running billing check cron:', error);
        return NextResponse.json({ error: 'Failed to run billing check' }, { status: 500 });
    }
}
