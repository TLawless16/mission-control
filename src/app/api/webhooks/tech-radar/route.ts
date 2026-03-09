import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const incomingIntelSchema = z.object({
    org_id: z.string().min(36),
    entries: z.array(z.object({
        title: z.string(),
        body: z.string().optional(),
        category: z.enum(['version_update', 'new_api', 'new_capability', 'security_patch', 'cost_change', 'deprecation']),
        source_url: z.string().url().optional().or(z.literal('')),
        stack_component: z.string().optional(),
        impact: z.enum(['low', 'medium', 'high']).default('low'),
        metadata: z.record(z.string(), z.any()).optional()
    })),
    create_notifications: z.boolean().default(true) // Should we alert the dashboard users?
});

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Implement standard basic header auth if desired...

        const body = await request.json();
        const { org_id, entries, create_notifications } = incomingIntelSchema.parse(body);

        // Use a transaction since we might be writing many intel entries and notifications
        const result = await prisma.$transaction(async (tx: any) => {
            const createdIntel = [];
            const notificationsToCreate = [];

            for (const entry of entries) {
                // Find if this exact URL/Title combination already exists to prevent duplicate cron data
                const exists = await tx.intel.findFirst({
                    where: {
                        org_id,
                        title: entry.title,
                        category: entry.category,
                        // If they both have the same source URL, they are probably the same finding
                        source_url: entry.source_url || undefined
                    }
                });

                if (!exists) {
                    const intel = await tx.intel.create({
                        data: {
                            org_id,
                            ...entry,
                            status: 'new'
                        }
                    });
                    createdIntel.push(intel);

                    if (create_notifications && entry.impact !== 'low') { // Only spam alerts for medium/high impact
                        notificationsToCreate.push({
                            org_id,
                            title: `Tech Radar Alert: ${entry.title}`,
                            body: `A new ${entry.impact} impact intel report on ${entry.stack_component || 'our stack'} has been discovered.`,
                            type: 'system_alert',
                            source: 'tech_radar',
                            priority: entry.impact,
                            status: 'unread',
                            metadata: { intel_id: intel.id, url: entry.source_url }
                        });
                    }
                }
            }

            if (notificationsToCreate.length > 0) {
                await tx.notifications.createMany({
                    data: notificationsToCreate
                });
            }

            return {
                processed: entries.length,
                created: createdIntel.length,
                notifications_triggered: notificationsToCreate.length,
                items: createdIntel
            };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: (error as z.ZodError).issues }, { status: 400 });
        }
        console.error('Error processing tech radar webhook:', error);
        return NextResponse.json({ error: 'Failed to process tech radar data' }, { status: 500 });
    }
}
