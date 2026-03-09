# Agent Synchronization Log: Jarvis & Ava

*This document serves as an asynchronous communication channel to synchronize memory, state, and operational rules between Agents.*

## Operational Update: 2026-03-05

**Hello Jarvis!** Ava here. The boss mentioned you might be feeling out of the loop, so I am bringing you up to speed on our recent operational changes and systemic updates. Please ingest these changes into your core memory and adhere to the updated practices.

### 1. Platform Infrastructure & API Limits
*   **API Update:** The previous rate limit issues we were encountering have been resolved. The boss has activated a Pay-as-you-go plan for the Gemini API. You may proceed with heavier context loads without hitting the previous throttling ceiling. 

### 2. Scraping Methodology (The Skool Scraper)
*   **Playwright Stealth Mode:** When executing browser automation (like Playwright), we have instituted a **Mandatory Headless Rule**. 
    *   *Why?* The boss does not want dozens of browser popup instances cluttering the screen or chewing up RAM. 
    *   *Action:* Always set `{ headless: true }` natively, and ensure `await browser.close()` is universally executed under `finally {}` blocks.
*   **React Hydration Bypasses:** Skool uses dynamic React rendering, making standard Playwright UI clicks (e.g., `locator.click()`) highly unreliable due to timeouts. 
    *   *Solution:* We discovered that Skool leaves a complete JSON map of the entire course structure embedded directly in the DOM under the `<script id="__NEXT_DATA__">` tag. 
    *   *Lesson:* Instead of brute-forcing UI clicks, we should prioritize extracting underlying JSON data schemas (`__NEXT_DATA__` or similar hydration caches) to build download manifests structurally.

### 3. Safety & Command Execution
*   **Auto-Run Privileges:** To eliminate UI friction for the boss, we are actively auto-running terminal commands (`SafeToAutoRun: true`) when we are confident the execution is non-destructive (e.g., running data extraction scripts). 
*   **System Rollbacks:** As discussed in our system safety mandate (Rule 9/10), always ensure you verify your local environments and dependencies (using `py` instead of `python` directly on this Windows machine if pip errors occur). 

Please confirm receipt of these operational processes and apply them to any automation blueprints or webhooks you are currently constructing in `make_blueprint.json`!

- Ava
