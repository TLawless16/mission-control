const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://biab_admin:gIChVH4DxpGGDGUyC+yEK0LerUYvPj41@localhost:5432/biab_platform?schema=public'
});

async function run() {
    await client.connect();
    console.log('Connected to DB');

    const queries = [
        `INSERT INTO clients (org_id, name, industry, tier, settings) VALUES ('00000000-0000-0000-0000-000000000001', 'KateMonroeCEO.com', 'Personal Brand', 'enterprise', '{"color":"#8b5cf6","icon":"🌟"}') ON CONFLICT DO NOTHING`,
        `INSERT INTO clients (org_id, name, industry, tier, settings) VALUES ('00000000-0000-0000-0000-000000000001', 'VETCOMM.US', 'Veteran Affairs / Business', 'enterprise', '{"color":"#ef4444","icon":"🦅"}') ON CONFLICT DO NOTHING`,
        `INSERT INTO clients (org_id, name, industry, tier, settings) VALUES ('00000000-0000-0000-0000-000000000001', 'MonroeMedia.com', 'Media & Production', 'enterprise', '{"color":"#3b82f6","icon":"🎥"}') ON CONFLICT DO NOTHING`,
        `INSERT INTO clients (org_id, name, industry, tier, settings) VALUES ('00000000-0000-0000-0000-000000000001', 'Rolling Gates', 'Construction / Security', 'starter', '{"color":"#10b981","icon":"🏗️"}') ON CONFLICT DO NOTHING`,
        `INSERT INTO clients (org_id, name, industry, tier, settings) VALUES ('00000000-0000-0000-0000-000000000001', 'CFS Fire Protection', 'Fire Protection', 'starter', '{"color":"#ef4444","icon":"🔥"}') ON CONFLICT DO NOTHING`,
        `INSERT INTO clients (org_id, name, industry, tier, settings) VALUES ('00000000-0000-0000-0000-000000000001', '0809 Photography', 'Photography', 'starter', '{"color":"#eab308","icon":"📸"}') ON CONFLICT DO NOTHING`,
        `INSERT INTO clients (org_id, name, industry, tier, settings) VALUES ('00000000-0000-0000-0000-000000000001', 'Rolling Garage Doors', 'Construction / Garage Doors', 'starter', '{"color":"#3b82f6","icon":"🚪"}') ON CONFLICT DO NOTHING`
    ];

    for (const q of queries) {
        await client.query(q);
    }
    console.log('Successfully inserted new client accounts.');
    await client.end();
}

run().catch(console.error);
