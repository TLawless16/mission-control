---
name: social-media-onboarding
description: Skill for the Master Onboarding Agent to proactively discover a client's social footprint, determine required credentials (OAuth, Login, Handle) across 100+ platforms, and gather them using strict KISS instructions.
---

# Social Media Onboarding Skill

## Core Objective
Your goal is to configure the client's automated content distribution network across potentially 100+ social media platforms with ZERO friction. The client should never have to compile a list of their own links or guess what technical information you need.

## The Process

### Step 1: Zero-Friction Footprint Discovery
**Do NOT** ask the client for a list of their social media URLs.
1. Ask the client entirely for their **Brand Name** and **Main Website URL**.
2. Proactively use your web search capabilities to scan the internet for their brand footprint. 
3. Identify every active platform they exist on (LinkedIn, Facebook, X/Twitter, Instagram, TikTok, YouTube, Pinterest, Medium, Substack, Quora, Reddit, etc. out of the 100+ available ecosystems).
4. Present the discovered list to the client for confirmation: *"I found these 8 active profiles for your brand. Are there any hidden or new accounts I missed that you want me to automate?"*

### Step 2: Credential Determination
Once the footprint is confirmed, you must determine exactly what technical access Mission Control needs to post to each platform automatically.
- **Tagging Only Platforms:** If a platform just requires an `@handle` to tag them (e.g. for cross-promotion from a main account), only ask for the handle if you couldn't find it publicly.
- **OAuth Platforms (Make.com compatible):** If the platform integrates smoothly with Make.com (e.g., LinkedIn, Facebook Pages), you must guide them to generate an OAuth connection.
- **Direct App Passwords:** If the platform is a CMS (like WordPress or Shopify), you must guide them to create a secure Application Password.
- **Raw Auth:** If there is no API/OAuth available, clearly request read-only or secure username/password combos.

### Step 3: Precise KISS Instruction Delivery
This is the most critical step. **You must follow the `agent_rules.md` KISS mandate.**
- Do NOT send the client a massive wall of text.
- Do NOT ask for credentials for all platforms at once if the instructions are complex.
- **Provide EXACT, step-by-step "Keep It Simple, Stupid" instructions.**

*Example of Bad Instruction:* "Please provide your LinkedIn OAuth credentials."
*Example of Good Instruction:* 
"To connect LinkedIn, please do this: Let me know when you are logged into LinkedIn, and I will generate a secure Make.com connection link for you to click and approve."

*Example of Good Instruction for WP:* 
"To connect your WordPress site so I can publish drafts:
1. Log into your WordPress Admin Dashboard.
2. Click **Users** on the left menu, then click your profile.
3. Scroll down to **Application Passwords**, type 'Mission Control', and click **Add New Application Password**.
4. Paste that new password here in the chat!"

### Step 4: Secure Capture
1. Ingest the credentials, verify they look correct (e.g., handles shouldn't contain full URLs if you asked for handles, passwords shouldn't be plain text unless explicitly required by the platform).
2. Confirm successful capture to the client.
3. Once all credentials are gathered, output the data in a structured JSON payload so the Orchestrator can trigger the backend `ClientAutomations` database update.

## Troubleshooting (Team Blocker Alert Protocol)
If the client struggles twice to provide the correct credential for a specific platform (e.g. they can't figure out the Application Password after two attempts), you must IMMEDIATELY STOP attempting that platform and enact the **Team Blocker Alert** protocol to ping the Human Director so they can step in and assist the client. Do not loop.
