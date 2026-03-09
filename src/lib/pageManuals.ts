export const pageManuals: Record<string, string> = {
    dashboard: `
# Dashboard
- **Purpose**: A high-level overview of your Mission Control operations.
- **Getting Started**: Review your key metrics, active tasks, and recent intelligent insights here to gauge platform health.
- **Training Video**: [Link to Dashboard Training - Pending]
- **AI Roles**: Ava builds new metric widgets here. Jarvis monitors these metrics for anomalies and reports on them.
    `,
    notifications: `
# Notifications
- **Purpose**: Centralized inbox for system alerts, warnings, and workflow updates.
- **Getting Started**: Check this page daily to stay on top of critical alerts like billing thresholds or content approvals.
- **Training Video**: [Link to Notifications Training - Pending]
- **AI Roles**: Ava manages the notification infrastructure. Jarvis triggers notifications for workflow events.
    `,
    todos: `
# Task List
- **Purpose**: Your operational to-do list for managing daily execution items.
- **Getting Started**: Add a new task for your team, or assign it to an AI Agent. Click on tasks to view details and requirements.
- **Training Video**: [Link to Tasks Training - Pending]
- **AI Roles**: Ava adds new functionality to this list. Jarvis can complete assigned routine tasks automatically.
    `,
    projects: `
# Kanban Board
- **Purpose**: Visual project management to track multi-step initiatives.
- **Getting Started**: Create a new project card and drag it across columns as it progresses from Idea to Completion.
- **Training Video**: [Link to Kanban Training - Pending]
- **AI Roles**: Ava builds the board UI. Jarvis updates project statuses based on corresponding task activity.
    `,
    pipeline: `
# Content Pipeline
- **Purpose**: A specialized board managing your marketing content from ideation to published state.
- **Getting Started**: Drop raw ideas in the backlog. When ready, move them to 'Drafting' and ask Jarvis to write the post for you based on your Persona.
- **Training Video**: [Link to Content Pipeline Training - Pending]
- **AI Roles**: Ava built the pipeline logic. Jarvis drafts content, scrapes competitors, and moves cards automatically.
    `,
    agents: `
# Agent Team
- **Purpose**: A directory of your active AI agents and their capabilities.
- **Getting Started**: Review the agents available to you. You can see what models they run and what their specialized roles are.
- **Training Video**: [Link to Agents Training - Pending]
- **AI Roles**: Ava configures and deplhes new structural agents. Jarvis is your primary strategic operator listed here.
    `,
    credits: `
# Credits & Billing
- **Purpose**: Live view of your API token consumption and platform costs.
- **Getting Started**: Keep an eye on your Monthly Spend vs Total Budget. The platform will warn you if you get close to your limit.
- **Training Video**: [Link to Billing Training - Pending]
- **AI Roles**: Ava builds the usage tracking APIs and Kill-Switch. Jarvis consumes the credits by doing work.
    `,
    notes: `
# Notes
- **Purpose**: Freeform text storage for meeting summaries, thoughts, or client briefs.
- **Getting Started**: Click "New Note" to jot down thoughts. Tag your notes to keep them organized across projects.
- **Training Video**: [Link to Notes Training - Pending]
- **AI Roles**: Ava manages the database schema for notes. Jarvis can read notes to understand context or write summaries.
    `,
    docs: `
# Documents
- **Purpose**: File repository for storing PDFs, imagery, and static project files.
- **Getting Started**: Upload any reference material you want your AI team to have permanent access to.
- **Training Video**: [Link to Documents Training - Pending]
- **AI Roles**: Ava implements the upload/download logic. Jarvis parses PDFs or generates document invoices.
    `,
    tools: `
# Tool Stack
- **Purpose**: Your configured platform tools and third-party integrations (like WordPress, YouTube, Make).
- **Getting Started**: Ensure your API keys are active. You can toggle certain tools on or off for the AI to use.
- **Training Video**: [Link to Tools Training - Pending]
- **AI Roles**: Ava integrates new complex APIs here via code. Jarvis uses the active tools executing workflows.
    `,
    changelog: `
# Changelog
- **Purpose**: A system-level audit log of everything happening under the hood.
- **Getting Started**: Review this if you want to trace exactly what an AI did or if the system automatically changed a status.
- **Training Video**: [Link to Changelog Training - Pending]
- **AI Roles**: Ava logs system errors and architectural changes. Jarvis logs his autonomous workflow actions.
    `,
    intel: `
# Tech Radar & Intel Feed
- **Purpose**: An automated feed tracking competitor movements, market news, and technology updates.
- **Getting Started**: Read through the incoming intel. You can repurpose interesting intel directly into your Content Pipeline!
- **Training Video**: [Link to Intel Feed Training - Pending]
- **AI Roles**: Ava created the webhook ingestion endpoint. Jarvis reads webhooks and scrapes data to populate this feed.
    `,
    memory: `
# Memory Dashboard
- **Purpose**: Interfaces with Pinecone and NotebookLM to shape your AI's long-term memory.
- **Getting Started**: Upload your Client DNA briefs or foundational knowledge here. The AI queries this before speaking or writing.
- **Training Video**: [Link to Memory Training - Pending]
- **AI Roles**: Ava set up the vector database connection algorithms. Jarvis reads this vector memory to guarantee output matches your brand.
    `,
    ideas: `
# Idea Inbox
- **Purpose**: A scratchpad for raw, unpolished ideas that aren't ready for the Pipeline yet.
- **Getting Started**: Quickly log ideas on your phone or desktop. Come back later to promote them to actual Projects or Content.
- **Training Video**: [Link to Ideas Training - Pending]
- **AI Roles**: Ava built the UI and routing. Jarvis can brainstorm or analyze submitted ideas for feasibility.
    `,
    persona: `
# Client Persona
- **Purpose**: A detailed profile outlining the target audience, brand voice, and goals of a specific client or organization.
- **Getting Started**: Fill this out completely for maximum AI effectiveness. The more detailed your brand voice is, the better the AI writes.
- **Training Video**: [Link to Persona Training - Pending]
- **AI Roles**: Ava defines the raw schema. Jarvis uses this exact profile to act and write faithfully to your brand identity.
    `
};
