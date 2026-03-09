import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const incomingRadarSchema = z.object({
    org_id: z.string().min(36),
    items: z.array(z.object({
        title: z.string().min(1),
        body: z.string().optional(),
        content_type: z.enum(['idea', 'post', 'blog', 'video']).default('idea'),
        platform: z.string().optional(),
        source_url: z.string().url().optional().or(z.literal('')),
        author: z.string().optional(),
        performance_metrics: z.record(z.string(), z.any()).optional()
    }))
});

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Implement standard basic header auth if desired...

        const body = await request.json();
        const { org_id, items } = incomingRadarSchema.parse(body);

        const result = await prisma.$transaction(async (tx: any) => {
            const createdItems = [];

            for (const item of items) {
                // Prevent exact duplicates
                const exists = await tx.content_items.findFirst({
                    where: {
                        org_id,
                        title: item.title,
                        status: 'inspiration'
                    }
                });

                if (!exists) {
                    const content = await tx.content_items.create({
                        data: {
                            org_id,
                            title: item.title,
                            body: item.body || '',
                            content_type: item.content_type,
                            status: 'inspiration',
                            platform: item.platform || 'all',
                            metadata: {
                                source_url: item.source_url || '',
                                author: item.author || '',
                                is_competitor_intel: true
                            },
                            performance_metrics: item.performance_metrics || {}
                        }
                    });
                    createdItems.push(content);
                }
            }

            return {
                processed: items.length,
                created: createdItems.length,
                items: createdItems
            };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Error processing content radar webhook:', error);
        return NextResponse.json({ error: 'Failed to process content radar data' }, { status: 500 });
    }
}
