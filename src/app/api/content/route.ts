import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const contentSchema = z.object({
    org_id: z.string().min(36),
    title: z.string().min(1),
    body: z.string().optional(),
    content_type: z.enum(['post', 'blog', 'video', 'newsletter', 'idea']),
    status: z.enum(['inspiration', 'drafting', 'review', 'scheduled', 'published']).default('inspiration'),
    platform: z.enum(['linkedin', 'twitter', 'facebook', 'wordpress', 'all']).optional(),
    scheduled_for: z.string().optional().nullable(),
    metadata: z.record(z.string(), z.any()).optional(),
    hashtags: z.array(z.string()).optional()
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const org_id = searchParams.get('org_id');
        const status = searchParams.get('status');

        if (!org_id) {
            return NextResponse.json({ error: 'Missing org_id' }, { status: 400 });
        }

        const where: any = { org_id };
        if (status) where.status = status;

        const items = await prisma.content_items.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching content items:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = contentSchema.parse(body);

        const safeScheduledFor = validatedData.scheduled_for ? new Date(validatedData.scheduled_for) : null;

        const item = await prisma.content_items.create({
            data: {
                ...validatedData,
                scheduled_for: safeScheduledFor
            }
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Error creating content item:', error);
        return NextResponse.json({ error: 'Failed to create content item' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing content item id' }, { status: 400 });
        }

        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.title) updateData.title = data.title;
        if (data.body !== undefined) updateData.body = data.body;
        if (data.content_type) updateData.content_type = data.content_type;
        if (data.platform) updateData.platform = data.platform;
        if (data.scheduled_for !== undefined) updateData.scheduled_for = data.scheduled_for ? new Date(data.scheduled_for) : null;
        if (data.metadata) updateData.metadata = data.metadata;
        if (data.hashtags) updateData.hashtags = data.hashtags;

        const item = await prisma.content_items.update({
            where: { id },
            data: updateData
        });

        // Fire webhook if status changed to scheduled or published
        if (data.status && (data.status === 'scheduled' || data.status === 'published')) {
            const webhookUrl = process.env.MAKE_CONTENT_WEBHOOK_URL;
            if (webhookUrl) {
                // Fire and forget, don't await the result
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: `content_status_updated`,
                        new_status: data.status,
                        content_item: item
                    })
                }).catch(err => console.error('Webhook notification error:', err));
            }
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error updating content item:', error);
        return NextResponse.json({ error: 'Failed to update content item' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
        }

        await prisma.content_items.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting content item:', error);
        return NextResponse.json({ error: 'Failed to delete content item' }, { status: 500 });
    }
}
