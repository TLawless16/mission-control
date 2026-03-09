import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface ParsedBrief {
    org_id: string;
    markdown_body: string;
    tasks?: { title: string; description?: string; assigned_agent?: string; priority?: string }[];
    ideas?: { text: string; context?: string }[];
    cto_proposals?: { url: string; title: string }[];
}

// POST /api/webhooks/morning-brief
export async function POST(req: NextRequest) {
    try {
        const body: ParsedBrief = await req.json();

        if (!body.org_id || !body.markdown_body) {
            return NextResponse.json({ error: 'org_id and markdown_body are required' }, { status: 400 });
        }

        // Wrap the entire propagation in a transaction
        await prisma.$transaction(async (tx) => {
            // 1. Create the Notification
            await tx.notifications.create({
                data: {
                    org_id: body.org_id,
                    title: `🌅 Morning Brief - ${new Date().toLocaleDateString()}`,
                    body: body.markdown_body,
                    type: 'morning_brief',
                    source: 'system',
                    priority: 'high',
                    status: 'unread',
                    metadata: {
                        proposals: body.cto_proposals || [],
                    },
                },
            });

            // 2. Create Tasks if any
            if (body.tasks && body.tasks.length > 0) {
                await Promise.all(
                    body.tasks.map((t) =>
                        tx.tasks.create({
                            data: {
                                org_id: body.org_id,
                                title: t.title,
                                description: t.description || null,
                                assigned_agent: t.assigned_agent || null,
                                priority: t.priority || 'medium',
                                status: 'new',
                            },
                        })
                    )
                );
            }

            // 3. Create Ideas if any
            if (body.ideas && body.ideas.length > 0) {
                await Promise.all(
                    body.ideas.map((i) =>
                        tx.ideas.create({
                            data: {
                                org_id: body.org_id,
                                text: i.text,
                                context: i.context || 'morning_brief',
                                status: 'new',
                            },
                        })
                    )
                );
            }
        });

        return NextResponse.json({ ok: true, message: 'Morning brief propagated successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
