import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function scrapeSkool() {
    console.log("🚀 Starting Skool Scraper...");

    // Launch headless browser
    const browser = await chromium.launch({ headless: false }); // Set to false so you can watch it!
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1. Login
        console.log("🔐 Logging in...");
        await page.goto('https://www.skool.com/login');
        await page.fill('input[type="email"]', 'tim@vestedcorps.com');
        await page.fill('input[type="password"]', 'NoL00ser$OKT!5179');
        await page.click('button[type="submit"]');

        // Wait for URL to change or network to settle
        await page.waitForTimeout(5000);
        console.log("✅ Logged in successfully.");

        // 2. Navigate Directly To '🤖 AI Automations' Course
        console.log("🏫 Navigating directly to '🤖 AI Automations' course inner page...");
        await page.goto('https://www.skool.com/aiautomationsbyjack/classroom/af686ad3');
        await page.waitForLoadState('networkidle');

        // Wait for the classroom content to load completely
        await page.waitForTimeout(5000);

        // 3. Dump the inside-course DOM for analysis
        console.log("🗺️ Mapping nested course DOM structure...");
        const html = await page.content();
        fs.writeFileSync(path.join(__dirname, 'skool_course_dom.html'), html);
        console.log("✅ Nested DOM mapped and saved to skool_course_dom.html");

        await browser.close();

    } catch (error) {
        console.error("❌ Scraping failed:", error);
        await page.screenshot({ path: path.join(__dirname, 'skool_error.png') });
        console.log("📸 Screenshot saved to skool_error.png");
        await browser.close();
    }
}

scrapeSkool();
