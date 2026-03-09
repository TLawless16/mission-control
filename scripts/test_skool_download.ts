import { chromium } from 'playwright';
import * as path from 'path';

async function testDownload() {
    console.log("🚀 Starting Download Test (HEADLESS MODE)...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    try {
        console.log("🔐 Logging in...");
        await page.goto('https://www.skool.com/login');
        await page.fill('input[type="email"]', 'tim@vestedcorps.com');
        await page.fill('input[type="password"]', 'NoL00ser$OKT!5179');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);

        const lessonUrl = 'https://www.skool.com/aiautomationsbyjack/classroom/af686ad3?md=931a121b01ac4b5a9e3144c2781632d0';
        console.log(`🏫 Navigating to lesson: ${lessonUrl}`);
        await page.goto(lessonUrl);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000); // Give it time to render the react tree

        console.log(`📥 Attempting UI download trigger...`);

        // Destroy cookie banners and sticky overlays so they don't intercept clicks
        await page.evaluate(() => {
            const overlays = Array.from(document.querySelectorAll('div')).filter(d =>
                d.style.position === 'fixed' || d.style.position === 'sticky' || d.style.zIndex > "10"
            );
            overlays.forEach(o => o.remove());
        });

        // Hook requests to see where the click routes
        page.on('request', req => {
            if (req.url().includes('file') || req.url().includes('download') || req.url().includes('api')) {
                console.log(`>> REQUEST: ${req.method()} ${req.url()}`);
            }
        });

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

        const newTargetPromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);

        console.log("Found ResourceWrapper, clicking via native JS...");
        await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span.styled__ResourceLabel-sc-1wq200d-3'));
            const transcriptSpan = spans.find(s => s.textContent?.toLowerCase().includes('transcript'));
            if (transcriptSpan) {
                console.log("Found span, clicking it inherently...");
                (transcriptSpan as HTMLElement).click();
            } else {
                console.log("Could not find transcript span!");
            }
        });

        console.log("Waiting 3 seconds to let React render any Modals...");
        await page.waitForTimeout(3000);

        const outSnap = path.join(__dirname, '..', 'course_downloads', 'skool_post_click.png');
        await page.screenshot({ path: outSnap, fullPage: true });
        console.log(`📸 Captured post-click state to ${outSnap}`);

        // Wait a few seconds to capture network traffic
        await page.waitForTimeout(5000);

    } catch (e) {
        console.error("❌ Error downloading:", e);
        await page.screenshot({ path: path.join(__dirname, 'test_download_err.png') });
    } finally {
        await browser.close();
    }
}

testDownload();
