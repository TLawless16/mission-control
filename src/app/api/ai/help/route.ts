import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { pageManuals } from '@/lib/pageManuals';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, activeView } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Get the Base Roles Guide
        let rolesGuide = '';
        try {
            const guidePath = path.join(process.cwd(), 'knowledgebase', 'ai_roles_guide.md');
            rolesGuide = fs.readFileSync(guidePath, 'utf-8');
        } catch (e) {
            rolesGuide = "Ava is the Architect/Builder (writes code, fixes bugs, builds systems). Jarvis is the Executor/Operator (runs tasks, reads intel, drafts content, manages pipelines).";
        }

        // 2. Get the specific page context
        const pageContext = pageManuals[activeView] || "The user is on a general page in Mission Control.";

        // 3. Construct the System Prompt
        const systemPrompt = `You are the Mission Control Support Assistant.
Your primary role is to help clients understand how to use the platform, provide onboarding advice, and clarify who to ask for tasks (Ava vs. Jarvis).

# Contextual Information
The user is currently viewing the following page: ${activeView}

# Page Manual & Guide
${pageContext}

# Rules
1. Be explicitly welcoming, friendly, and concise. Act as an onboarding guide for new clients trying to figure out the system.
2. If the user asks how to use the page or what to do next, reference the "Getting Started" and "Purpose" sections from the Page Manual above.
3. If they ask about training or videos, reference the "Training Video" link from the Page Manual above.
4. Use the provided AI Roles Guide to determine who the user should ask for platform tasks.
5. If they ask to build something, write code, or add new UI, tell them to "Ask Ava".
6. If they ask to do a daily task, process content, or read intel, tell them to "Ask Jarvis".

# AI Roles Guide
${rolesGuide}`;

        // 4. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            temperature: 0.2,
            max_tokens: 200,
        });

        const reply = completion.choices[0]?.message?.content || "I couldn't process that request.";

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('Error in contextual help:', error);
        return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
    }
}
