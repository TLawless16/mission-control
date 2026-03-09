import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Usage: npx ts-node scripts/pinecone_ingest.ts <path_to_file> <namespace>

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
});

async function main() {
    const filePath = process.argv[2];
    const namespace = process.argv[3] || 'default';

    if (!filePath) {
        console.error('Please provide a path to the file you want to ingest.');
        process.exit(1);
    }

    const indexName = process.env.PINECONE_INDEX || 'gravityclaw';

    try {
        const index = pinecone.Index(indexName);

        console.log(`Reading file: ${filePath}`);
        const content = fs.readFileSync(path.resolve(filePath), 'utf-8');

        // Super simple chunking strategy for demonstration. 
        // In production, use Langchain's RecursiveCharacterTextSplitter
        const chunks = content.match(/.{1,1000}(?=\s|$)/g) || [];

        console.log(`Split into ${chunks.length} chunks. Generating embeddings...`);

        const vectors = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: chunk,
            });

            vectors.push({
                id: `${path.basename(filePath)}-chunk-${i}`,
                values: response.data[0].embedding,
                metadata: {
                    text: chunk,
                    source: filePath,
                    chunk_index: i
                }
            });
            console.log(`Processed chunk ${i + 1}/${chunks.length}`);
        }

        console.log(`Upserting ${vectors.length} vectors to Pinecone namespace '${namespace}'...`);
        await index.namespace(namespace).upsert(vectors as any);

        console.log('✅ Ingestion complete!');

    } catch (error) {
        console.error('Error during ingestion:', error);
    }
}

main();
