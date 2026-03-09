import { chromium } from 'playwright';

async function queryAPI() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log("🔐 Logging in...");
    await page.goto('https://www.skool.com/login');
    await page.fill('input[type="email"]', 'tim@vestedcorps.com');
    await page.fill('input[type="password"]', 'NoL00ser$OKT!5179');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    const fileId = 'f532b3d8b39448dab6be676bc6c91bbd';
    console.log(`📡 Querying API for file_id: ${fileId}...`);

    const result = await page.evaluate(async (id) => {
        try {
            const resp = await fetch(`https://www.skool.com/api/files/download?local_id=${id}`);
            const text = await resp.text();
            return { status: resp.status, text };
        } catch (e: any) {
            return { error: e.toString() };
        }
    }, fileId);

    console.log("API RESULT:", result);
    await browser.close();
}
queryAPI();
