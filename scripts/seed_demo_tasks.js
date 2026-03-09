require('dotenv').config({ path: '.env' });
const { Client } = require('pg'); async function seed() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/biab_platform?schema=public"
    });

    await client.connect();

    try {
        console.log("Connected to DB, seeding demo tasks...");

        // 1. Ensure org exists
        let res = await client.query(`SELECT id FROM organizations WHERE name = 'GravityClaw HQ'`);
        let orgId;
        if (res.rows.length === 0) {
            res = await client.query(`INSERT INTO organizations (name, slug, tier) VALUES ('GravityClaw HQ', 'gravityclaw-hq', 'premium') RETURNING id`);
        }
        orgId = res.rows[0].id;

        // 2. Ensure client exists
        res = await client.query(`SELECT id FROM clients WHERE name = 'VetComm (Kate Monroe)'`);
        let clientId;
        if (res.rows.length === 0) {
            res = await client.query(`INSERT INTO clients (org_id, name, industry, bio, brand_voice, tier) VALUES ($1, 'VetComm (Kate Monroe)', 'Veterans Services', 'Helping veterans get the maximum disability rating they deserve.', 'Patriotic, direct, helpful, and firm.', 'enterprise') RETURNING id`, [orgId]);
        }
        clientId = res.rows[0].id;

        // 3. Ensure project exists
        res = await client.query(`SELECT id FROM projects WHERE name = 'Deploy Blog Agent Pipeline'`);
        let projectId;
        if (res.rows.length === 0) {
            res = await client.query(`INSERT INTO projects (org_id, client_id, name, description, status, priority) VALUES ($1, $2, 'Deploy Blog Agent Pipeline', 'Fully automate the WordPress blog generation and scheduling pipeline.', 'active', 'high') RETURNING id`, [orgId, clientId]);
        }
        projectId = res.rows[0].id;

        // 4. Insert tasks
        const tasksCount = await client.query(`SELECT count(*) FROM tasks WHERE client_id = $1`, [clientId]);
        if (parseInt(tasksCount.rows[0].count) < 2) {
            await client.query(`
        INSERT INTO tasks (org_id, client_id, project_id, title, description, status, priority, assigned_agent)
        VALUES 
        ($1, $2, $3, 'Configure Make.com Webhook', 'Set up the inbound webhook to receive payloads from the Mission Control pipeline.', 'new', 'high', 'Jarvis'),
        ($1, $2, $3, 'Provision Staging WordPress Site', 'Spin up a fresh WordPress instance for end-to-end testing of the agentic posting.', 'in_progress', 'medium', 'Ava')
      `, [orgId, clientId, projectId]);

            await client.query(`
        INSERT INTO tasks (org_id, client_id, title, description, status, priority, assigned_agent, category)
        VALUES 
        ($1, $2, 'Daily Morning Brief Generation', 'Compile competitor research and tech trends into the daily client briefing.', 'active', 'high', 'Jarvis', 'general'),
        ($1, $2, 'Follow up on pending invoices', 'Run the PDF invoice generator skill and email outstanding balances.', 'new', 'low', null, 'finance')
      `, [orgId, clientId]);
        }

        console.log("Seeding complete.");
    } catch (err) {
        console.error("Error during seeding", err);
    } finally {
        await client.end();
    }
}

seed();
