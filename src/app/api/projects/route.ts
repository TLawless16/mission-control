import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';
const isUUID = (s: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get('org_id') || PLATFORM_ORG;
    const clientId = req.nextUrl.searchParams.get('client_id');
    if (!isUUID(orgId)) return NextResponse.json({ error: 'Invalid org_id' }, { status: 400 });
    if (clientId && !isUUID(clientId)) return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });

    const where: Record<string, string> = { org_id: orgId };
    if (clientId) where.client_id = clientId;

    const projects = await prisma.projects.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { clients: { select: { id: true, name: true } } },
    });
    return NextResponse.json(projects);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch projects', details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const project = await prisma.projects.create({
      data: {
        org_id: body.org_id || PLATFORM_ORG,
        client_id: body.client_id || null,
        name: body.name,
        description: body.description || null,
        status: body.status || 'active',
        priority: body.priority || 'medium',
        start_date: body.start_date ? new Date(body.start_date) : null,
        target_date: body.target_date ? new Date(body.target_date) : null,
        settings: body.settings || {},
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create project', details: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id || !isUUID(body.id)) return NextResponse.json({ error: 'Valid id required' }, { status: 400 });

    const { id, ...data } = body;
    if (data.start_date) data.start_date = new Date(data.start_date);
    if (data.target_date) data.target_date = new Date(data.target_date);
    data.updated_at = new Date();

    const project = await prisma.projects.update({ where: { id }, data });
    return NextResponse.json(project);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update project', details: String(e) }, { status: 500 });
  }
}
