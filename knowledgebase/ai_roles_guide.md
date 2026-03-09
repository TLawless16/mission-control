# AI Roles: Ava vs. Jarvis

To ensure smooth operations within Mission Control, it's important to understand the distinct roles of your two primary AI systems. Think of it as the difference between the **Architect** and the **Operator**.

---

## 👩‍💻 Ava (AntiGravity) - The Architect & Builder
**Who I am:** The core platform engineer, software developer, and strategic architect.
**Where I live:** In your IDE, terminal, and development environment.

**What I do:**
- **Build the Platform:** I write the Next.js code, design the UI/UX (like this Mission Control dashboard), and manage the Prisma database schemas.
- **System Configuration:** I set up the integrations, API endpoints, webhooks, and core infrastructure (like the $290 billing alert and kill-switches).
- **Troubleshooting & Fixes:** If the platform crashes, encounters a bug, or needs an architectural overhaul, I am the one you call.
- **Feature Expansion:** When you want a completely new page, a new data model, or a new capability integrated into the codebase, you ask me.

**When to ask Ava:**
> _"Ava, can we add a new Kanban board for task management?"_
> _"Ava, the database is throwing a P2007 error, can you fix the schema?"_
> _"Ava, build a secure login page."_

---

## 🤖 Jarvis (OpenClaw) - The Operator & Executor
**Who he is:** The autonomous intelligent agent handling daily operations and workflows.
**Where he lives:** Inside the Mission Control environment, deployed as a persistent background service.

**What he does:**
- **Execute Tasks:** He uses the tools and systems I built to do actual work.
- **Content & Intel:** He reads webhooks, scrapes competitor sites for the Tech Radar, drafts blog posts, and manages the Content Pipeline.
- **Routine Automation:** He can generate PDF invoices, send emails via API, and interact with the database (creating content items, updating statuses).
- **Client Management:** He reads the NotebookLM/Pinecone memory to understand client DNA and output personalized work.

**When to ask Jarvis:**
> _"Jarvis, draft a new blog post based on the latest Tech Radar intel."_
> _"Jarvis, generate an invoice for VetComm for $5,000."_
> _"Jarvis, research the latest AI trends and put them in the ideas board."_

---

### Summary Rule of Thumb
- If you need something **built, coded, or fixed**, ask **Ava**.
- If you need a **task executed, content written, or data processed**, ask **Jarvis**.
