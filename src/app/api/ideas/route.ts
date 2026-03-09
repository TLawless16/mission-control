import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';
const isUUID = (s: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('org_id') || PLATFORM_ORG;
    const clientId = req.nextUrl.searchParams.get('client_id');
    const status = req.nextUrl.searchParams.get('status');
    if (!isUUID(orgId)) return NextResponse.json({ error: 'Invalid org_id' }, { status: 400 });

    const where: Record<string, unknown> = { org_id: orgId };
    if (clientId) { if (!isUUID(clientId)) return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 }); where.client_id = clientId; }
    if (status) where.status = status;

    const ideas = await prisma.ideas.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(ideas);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch ideas', details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.text) return NextResponse.json({ error: 'text is required' }, { status: 400 });

    const idea = await prisma.ideas.create({
      data: {
        org_id: body.org_id || PLATFORM_ORG,
        client_id: body.client_id || null,
        text: body.text,
        context: body.context || null,
        status: body.status || 'new',
        agent_note: body.agent_note || null,
        submitted_by: body.submitted_by || null,
      },
    });
    return NextResponse.json(idea, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create idea', details: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id || !isUUID(body.id)) return NextResponse.json({ error: 'Valid id required' }, { status: 400 });
    const { id, ...data } = body;
    data.updated_at = new Date();
    const idea = await prisma.ideas.update({ where: { id }, data });
    return NextResponse.json(idea);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update idea', details: String(e) }, { status: 500 });
  }
}
