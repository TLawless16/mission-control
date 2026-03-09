import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Clients initialized lazily inside routes to prevent build errors

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || 'dummy' });
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });
        const { searchParams } = new URL(request.url);
        const namespace = searchParams.get('namespace') || 'default';
        const query = searchParams.get('query');
        const limit = parseInt(searchParams.get('limit') || '10');

        const indexName = process.env.PINECONE_INDEX || 'gravityclaw';
        const index = pinecone.Index(indexName);

        if (query) {
            // 1. Convert search query to vector
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: query,
            });
            const queryEmbedding = response.data[0].embedding;

            // 2. Query Pinecone
            const queryResponse = await index.namespace(namespace).query({
                vector: queryEmbedding,
                topK: limit,
                includeMetadata: true
            });

            return NextResponse.json(queryResponse.matches);
        } else {
            // Without a specific query, we could fetch random vectors or list stats,
            // but Pinecone 'list' or just getting stats is more appropriate
            const stats = await index.describeIndexStats();
            return NextResponse.json({ stats, message: 'Provide a ?query= param to search memory.' });
        }

    } catch (error: any) {
        console.error('Error fetching memory from Pinecone:', error);
        return NextResponse.json({ error: 'Failed to access semantic memory', details: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || 'dummy' });
        const { searchParams } = new URL(request.url);
        const namespace = searchParams.get('namespace');
        const id = searchParams.get('id');

        if (!namespace || !id) {
            return NextResponse.json({ error: 'Namespace and id required' }, { status: 400 });
        }

        const indexName = process.env.PINECONE_INDEX || 'gravityclaw';
        const index = pinecone.Index(indexName);

        await index.namespace(namespace).deleteOne(id as any);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting memory from Pinecone:', error);
        return NextResponse.json({ error: 'Failed to delete semantic memory', details: error.message }, { status: 500 });
    }
}
