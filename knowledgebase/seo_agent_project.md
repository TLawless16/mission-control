# The Master SEO Aggregator & Builder Project

## 1. Executive Summary
This project defines the architecture and workflow for a fully autonomous SEO Agent. The agent's primary function is to reverse-engineer the top 20 Google search results for any given keyword, consolidate the most effective ranking signals and content structures, and programmatically construct a flawless WordPress site (utilizing Oxygen/Breakdance and Page Generator Pro) that outperforms the competition.

---

## 2. Core Agent Workflows

### Phase 1: Deep SERP Auditing & Scraping
1. **Keyword Intake:** The user provides a primary keyword and the client's brand constraints/persona.
2. **Top 20 Extraction:** The agent interfaces with a SERP API to extract the top 20 ranking organic URLs.
3. **Deep Crawl:** The agent scrapes the text, heading structures (H1-H6), internal linking profiles, and schemas of all 20 domains.
4. **Intent Clustering:** The agent categorizes crawled pages by intent (e.g., Home, About, General Service, Specific Sub-Service).

### Phase 2: Synthesis & Evaluation
1. **Content Consolidation:** The agent feeds all 20 consolidated "Homepage" transcripts into an LLM to generate a single "Master Homepage." This master page includes every critical ranking factor while adhering to the client's tone.
2. **Anomalous Page Scoring:** For pages that only 1 or 2 competitors have, the agent evaluates their SEO value (search volume potential, semantic relevance). It generates a "Pros/Cons" list. If the page provides ZERO value, it is discarded automatically. 
3. **Human Review:** The agent outputs the Master Sitemap and the consolidated content for human approval.

### Phase 3: The Build Phase (WordPress + Oxygen/Breakdance)
1. **Target Mimicry:** The user provides an "Example URL" to dictate the visual design. 
2. **Page Generation:** The agent logs into the provisioned WordPress site. Using `wp-cli`, REST APIs, or headless browser automation, it builds out the pages using the approved Master Content. It leverages Page Generator Pro for bulk creation if needed.
3. **Visual Builder Mapping:** The agent interacts with Oxygen or Breakdance JSON structures/shortcodes to map the content into the designed layout.

### Phase 4: Strict Technical Optimization
1. **JSON-LD Schema:** The agent injects strictly formatted schema markup (Organization, LocalBusiness, FAQ, Article) into the headers of the respective pages.
2. **Media Optimization:** All uploaded images are run through compression logic, and alt-tags are algorithmically generated based on the specific page's semantic keywords.
3. **ADA Compliance:** The agent audits the generated DOM for missing ARIA labels, contrast ratio failures, and keyboard navigability.
4. **Page Speed:** The agent executes a Lighthouse audit to ensure LCP, CLS, and INP metrics are green.

---

## 3. Required Resources & Integrations
To successfully build this, the agent will require:
1. **SERP API Access:** (e.g., DataForSEO, ValueSERP) to reliably pull the top 20 Google results without getting blocked.
2. **Web Scraper API:** (e.g., Firecrawl, Jina Reader) to extract clean Markdown from the competitor URLs.
3. **OpenAI `gpt-4o`:** Massive context windows are required to synthesize 20 websites' worth of text into one.
4. **WordPress Admin Credentials:** For the agent to manipulate the database and use `wp-cli` to build the site visually.
5. **Existing Skill Integration:** The agent will wrap the existing `skills/seo-audit/SKILL.md` logic to perform the final Phase 4 technical sweeps.
