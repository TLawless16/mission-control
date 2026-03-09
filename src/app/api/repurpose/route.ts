import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'MISSING_API_KEY'
});

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        const item = await prisma.content_items.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // Load the agentic skills to guide the LLM
        let skillContext = "Use your best judgement.";
        try {
            const skillsDir = path.join(os.homedir(), '.gemini', 'antigravity', 'skills');
            const cw = fs.readFileSync(path.join(skillsDir, 'copywriting', 'SKILL.md'), 'utf8');
            const seo = fs.readFileSync(path.join(skillsDir, 'seo-audit', 'SKILL.md'), 'utf8');
            const brain = fs.readFileSync(path.join(skillsDir, 'brainstorming', 'SKILL.md'), 'utf8');
            skillContext = `
--- COPYWRITING SKILL ---
${cw}

--- SEO AUDIT SKILL ---
${seo}

--- BRAINSTORMING SKILL ---
${brain}
`;
        } catch (e) {
            console.warn("Could not load skills directly, falling back to default rules.");
        }

        const prompt = `You are a world-class marketing engine. Your job is to take a raw inspiration idea and repurpose it into a highly engaging, SEO-optimized, brand-aligned post.
        
Please abide by the following official agentic skills downloaded from the Antigravity Awesome Skills repository: 
${skillContext}

Target Platform: ${item.platform || 'General Content'}
Original Inspiration Title: ${item.title}
Original Source Content/Context:
${item.body || 'No specific body text provided. Please brainstorm and generate a comprehensive piece.'}

Please output the repurposed content directly. Use Markdown formatting.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are the automated Mission Control Content Rewriter Agent.' },
                { role: 'user', content: prompt }
            ]
        });

        const newBody = response.choices[0].message?.content || 'LLM generation failed.';

        // Move item to the drafting phase
        const updated = await prisma.content_items.update({
            where: { id },
            data: {
                status: 'drafting',
                title: `[Repurposed] ${item.title}`,
                body: newBody + '\n\n✨ *Repurposed using Official Copywriting & SEO Skills*'
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error repurposing content:', error);
        return NextResponse.json({ error: 'Failed to repurpose content' }, { status: 500 });
    }
}
