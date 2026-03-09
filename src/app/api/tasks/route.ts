import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/tasks — list tasks (with optional filters)
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const assignedAgent = searchParams.get('agent');
  const clientId = searchParams.get('client_id');
  const projectId = searchParams.get('project_id');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (assignedAgent) where.assigned_agent = assignedAgent;
  if (clientId) where.client_id = clientId;
  if (projectId) where.project_id = projectId;

  const tasks = await prisma.tasks.findMany({
    where,
    orderBy: [{ priority: 'asc' }, { created_at: 'desc' }],
    include: {
      task_comments: { orderBy: { created_at: 'desc' }, take: 5 },
    },
  });

  return NextResponse.json(tasks);
}

// POST /api/tasks — create a task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If client_id provided, look up the client's org_id
    let orgId = body.org_id || '00000000-0000-0000-0000-000000000001';
    if (body.client_id) {
      const client = await prisma.clients.findUnique({ where: { id: body.client_id } });
      if (client) orgId = client.org_id;
    }

    const task = await prisma.tasks.create({
      data: {
        org_id: orgId,
        project_id: body.project_id || null,
        client_id: body.client_id || null,
        title: body.title,
        description: body.description || null,
        status: body.status || 'new',
        priority: body.priority || 'medium',
        category: body.category || 'general',
        assigned_to: body.assigned_to || null,
        assigned_agent: body.assigned_agent || null,
        due_date: body.due_date ? new Date(body.due_date) : null,
        tags: body.tags || [],
        metadata: body.metadata || {},
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PATCH /api/tasks — update a task
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.status !== undefined) data.status = body.status;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.category !== undefined) data.category = body.category;
    if (body.assigned_to !== undefined) data.assigned_to = body.assigned_to;
    if (body.assigned_agent !== undefined) data.assigned_agent = body.assigned_agent;
    if (body.due_date !== undefined) data.due_date = body.due_date ? new Date(body.due_date) : null;
    if (body.client_id !== undefined) data.client_id = body.client_id || null;
    if (body.project_id !== undefined) data.project_id = body.project_id || null;
    if (body.metadata !== undefined) {
      // Merge with existing metadata to preserve other fields
      const existing = await prisma.tasks.findUnique({ where: { id: body.id }, select: { metadata: true } });
      const existingMeta = (existing?.metadata as Record<string, unknown>) || {};
      data.metadata = { ...existingMeta, ...body.metadata };
    }
    if (body.completion_summary !== undefined) data.completion_summary = body.completion_summary;
    if (body.requirements_checklist !== undefined) data.requirements_checklist = body.requirements_checklist;
    if (body.status === 'completed') data.completed_at = new Date();
    data.updated_at = new Date();

    const task = await prisma.tasks.update({ where: { id: body.id }, data });
    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/tasks — delete a task
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.tasks.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
