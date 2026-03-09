import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const PLATFORM_ORG = '00000000-0000-0000-0000-000000000001';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const logs = await prisma.changelog.findMany({
            where: { org_id: PLATFORM_ORG },
            orderBy: { created_at: 'desc' },
            take: 50
        });
        return NextResponse.json(logs);
    } catch (e) { return NextResponse.json([], { status: 200 }); }
}
