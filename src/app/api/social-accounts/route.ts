import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { clientId, platform, handle, profileUrl, email, password } = await req.json();

        if (!clientId || !platform || !handle) {
            return NextResponse.json(
                { error: "Client ID, platform, and handle are required." },
                { status: 400 }
            );
        }

        const newAccount = await prisma.social_accounts.create({
            data: {
                client_id: clientId,
                platform,
                handle,
                profile_url: profileUrl || null,
                // Since schema doesn't have email/password fields in social_accounts,
                // we store them safely in the JSON settings payload as per standard practice.
                settings: {
                    email,
                    password
                }
            },
        });

        return NextResponse.json(newAccount, { status: 201 });
    } catch (error) {
        console.error("Error saving social account:", error);
        return NextResponse.json(
            { error: "Failed to save social account." },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const clientId = url.searchParams.get("clientId");

        if (!clientId) {
            return NextResponse.json(
                { error: "Client ID is required." },
                { status: 400 }
            );
        }

        const accounts = await prisma.social_accounts.findMany({
            where: {
                client_id: clientId,
            },
            orderBy: {
                platform: 'asc'
            }
        });

        return NextResponse.json(accounts, { status: 200 });
    } catch (error) {
        console.error("Error fetching social accounts:", error);
        return NextResponse.json(
            { error: "Failed to fetch social accounts." },
            { status: 500 }
        );
    }
}
