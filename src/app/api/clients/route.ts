import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const orgId = req.nextUrl.searchParams.get('org_id') || PLATFORM_ORG;

        const clients = await prisma.clients.findMany({
            where: { org_id: orgId },
            orderBy: { created_at: 'desc' },
        });

        const mappedClients = clients.map((c: any) => ({
            id: c.id,
            name: c.name,
            color: c.settings?.color || '#3b82f6',
            icon: c.settings?.icon || '👤',
            active: c.active,
            company: c.name,
            industry: c.industry || 'General',
        }));

        return NextResponse.json(mappedClients);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch clients', details: String(e) }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        const data: Record<string, unknown> = {};
        if (body.target_audience !== undefined) data.target_audience = body.target_audience;
        if (body.brand_voice !== undefined) data.brand_voice = body.brand_voice;
        if (body.bio !== undefined) data.bio = body.bio;
        data.updated_at = new Date();

        const client = await prisma.clients.update({ where: { id: body.id }, data });
        return NextResponse.json(client);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
