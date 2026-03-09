import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const intelSchema = z.object({
    org_id: z.string().min(36),
    title: z.string().min(1),
    body: z.string().optional(),
    category: z.enum(['version_update', 'new_api', 'new_capability', 'security_patch', 'cost_change', 'deprecation']),
    source_url: z.string().url().optional().or(z.literal('')),
    stack_component: z.string().optional(),
    impact: z.enum(['low', 'medium', 'high']).default('low'),
    status: z.enum(['new', 'reviewed', 'actioned', 'dismissed']).default('new'),
    metadata: z.record(z.string(), z.any()).optional()
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const org_id = searchParams.get('org_id');
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        if (!org_id) {
            return NextResponse.json({ error: 'Missing org_id' }, { status: 400 });
        }

        const where: any = { org_id };
        if (status) where.status = status;
        if (category) where.category = category;

        const items = await prisma.intel.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching intel:', error);
        return NextResponse.json({ error: 'Failed to fetch intel' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = intelSchema.parse(body);

        const intel = await prisma.intel.create({
            data: validatedData
        });

        return NextResponse.json(intel, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: (error as z.ZodError).issues }, { status: 400 });
        }
        console.error('Error creating intel:', error);
        return NextResponse.json({ error: 'Failed to create intel' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing intel id' }, { status: 400 });
        }

        // Only allow updating certain fields dynamically
        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.impact) updateData.impact = data.impact;
        if (data.metadata) updateData.metadata = data.metadata;

        const intel = await prisma.intel.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(intel);
    } catch (error) {
        console.error('Error updating intel:', error);
        return NextResponse.json({ error: 'Failed to update intel' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing intel id' }, { status: 400 });
        }

        await prisma.intel.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting intel:', error);
        return NextResponse.json({ error: 'Failed to delete intel' }, { status: 500 });
    }
}
