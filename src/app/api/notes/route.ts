import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const clientId = req.nextUrl.searchParams.get('client_id');
    try {
        const notes = await prisma.notes.findMany({
            where: {
                org_id: PLATFORM_ORG,
                client_id: clientId || null
            },
            orderBy: { created_at: 'desc' }
        });
        return NextResponse.json(notes);
    } catch (e) { return NextResponse.json([], { status: 200 }); }
}
