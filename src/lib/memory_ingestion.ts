import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Initialize external APIs
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || 'MISSING_API_KEY'
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'MISSING_API_KEY'
});

const INDEX_NAME = 'gravityclaw-memory';

/**
 * 3-Tier Memory Connection: Living Memory Ingestion
 * Takes a raw document or transcript string, generates OpenAI embeddings,
 * and upserts the vectors into Pinecone for permanent retrieval.
 */
export async function ingestToPinecone(clientId: string, rawText: string, sourceName: string) {
    try {
        const index = pinecone.Index(INDEX_NAME);

        // Simplistic chunking for demonstration (sentences/paragraphs)
        const chunks = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];

        // Generate embeddings
        const embeddings = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: chunks,
        });

        // Prepare vectors for Pinecone
        const vectors = embeddings.data.map((emb, i) => ({
            id: `${clientId}-${Date.now()}-chunk-${i}`,
            values: emb.embedding,
            metadata: {
                clientId,
                source: sourceName,
                text: chunks[i].trim()
            }
        }));

        // Upsert to Pinecone
        await index.upsert(vectors as any);

        return { success: true, chunksStored: vectors.length };
    } catch (error: any) {
        console.error("Pinecone Ingestion Failed:", error.message);
        throw new Error(error.message);
    }
}
