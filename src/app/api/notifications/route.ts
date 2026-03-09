import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/notifications — list notifications
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const orgId = searchParams.get('org_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (orgId) where.org_id = orgId;
    if (type) where.type = type;
    if (status) where.status = status;

    try {
        const notifications = await prisma.notifications.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: limit,
        });
        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// POST /api/notifications — create a notification
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.org_id || !body.title) {
            return NextResponse.json({ error: 'org_id and title are required' }, { status: 400 });
        }

        const notification = await prisma.notifications.create({
            data: {
                org_id: body.org_id,
                title: body.title,
                body: body.body || null,
                type: body.type || 'info',
                source: body.source || 'system',
                priority: body.priority || 'medium',
                status: body.status || 'unread',
                metadata: body.metadata || {},
            },
        });
        return NextResponse.json(notification, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// PATCH /api/notifications — update a notification
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        const data: Record<string, unknown> = {};
        if (body.title !== undefined) data.title = body.title;
        if (body.body !== undefined) data.body = body.body;
        if (body.type !== undefined) data.type = body.type;
        if (body.source !== undefined) data.source = body.source;
        if (body.priority !== undefined) data.priority = body.priority;
        if (body.status !== undefined) data.status = body.status;

        if (body.metadata !== undefined) {
            const existing = await prisma.notifications.findUnique({ where: { id: body.id }, select: { metadata: true } });
            const existingMeta = (existing?.metadata as Record<string, unknown>) || {};
            data.metadata = { ...existingMeta, ...body.metadata };
        }

        data.updated_at = new Date();

        const notification = await prisma.notifications.update({ where: { id: body.id }, data });
        return NextResponse.json(notification);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// DELETE /api/notifications — delete a notification
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    try {
        await prisma.notifications.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
