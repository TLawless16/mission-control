import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

interface SkoolLesson {
    id: string;
    title: string;
    videoLink?: string;
    videoId?: string;
    resources: any[];
}

interface SkoolModule {
    id: string;
    title: string;
    lessons: SkoolLesson[];
}

function sanitizeDirName(name: string): string {
    return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
}

async function downloadCourse() {
    const manifestPath = path.join(__dirname, 'course_manifest.json');
    const modules: SkoolModule[] = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const baseDir = path.join(__dirname, '..', 'course_downloads');
    const errorLogPath = path.join(baseDir, '_missing_transcripts.md');

    fs.writeFileSync(errorLogPath, '# Missing / Broken Transcripts Report\n\n');

    console.log("🚀 Starting Bulk Course Download (HEADLESS)...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    try {
        console.log("🔐 Logging in to Skool...");
        await page.goto('https://www.skool.com/login');
        await page.fill('input[type="email"]', 'tim@vestedcorps.com');
        await page.fill('input[type="password"]', 'NoL00ser$OKT!5179');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);

        for (let i = 0; i < modules.length; i++) {
            const mod = modules[i];
            const modDirName = `${(i + 1).toString().padStart(2, '0')} - ${sanitizeDirName(mod.title)}`;

            for (let j = 0; j < mod.lessons.length; j++) {
                const lesson = mod.lessons[j];
                const lessonDirName = `${(j + 1).toString().padStart(2, '0')} - ${sanitizeDirName(lesson.title)}`;
                const lessonPath = path.join(baseDir, modDirName, lessonDirName);

                // Check if this lesson has a transcript resource
                const hasTranscript = lesson.resources?.some(r => r.title?.toLowerCase().includes('transcript'));
                if (!hasTranscript) continue;

                const lessonUrl = `https://www.skool.com/aiautomationsbyjack/classroom/af686ad3?md=${mod.id}`;
                console.log(`\n🏫 Navigating to Module: ${mod.title} -> Lesson: ${lesson.title}`);
                await page.goto(lessonUrl, { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(3000);

                // Click the specific lesson in the sidebar if needed (assuming Skool auto-loads the first one, or we just target the resource)
                // Actually, the URL ?md=${mod.id} loads the module. We need the lesson.
                // It's safer to locate the lesson title in the sidebar and click it.
                try {
                    console.log(`  -> Finding Lesson Link...`);
                    const lessonLink = page.locator(`text="${lesson.title}"`).first();
                    if (await lessonLink.count() > 0) {
                        await lessonLink.click();
                        await page.waitForTimeout(2000); // let UI update
                    }
                } catch (e) {
                    console.log(`  ⚠️ Could not click lesson sidebar link, trying to proceed anyway.`);
                }

                console.log(`  📥 Attempting Transcript Download...`);

                // Clear overlays
                await page.evaluate(() => {
                    const overlays = Array.from(document.querySelectorAll('div')).filter(d =>
                        d.style.position === 'fixed' || d.style.position === 'sticky' || d.style.zIndex > "10"
                    );
                    overlays.forEach(o => o.remove());
                });

                // Set up the download listener with a short 8-second fuse
                const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);

                // Click it
                await page.evaluate(() => {
                    const spans = Array.from(document.querySelectorAll('span.styled__ResourceLabel-sc-1wq200d-3'));
                    const transcriptSpan = spans.find(s => s.textContent?.toLowerCase().includes('transcript'));
                    if (transcriptSpan) {
                        (transcriptSpan as HTMLElement).click();
                    }
                });

                const download = await downloadPromise;
                if (download) {
                    const outPath = path.join(lessonPath, download.suggestedFilename());
                    await download.saveAs(outPath);
                    console.log(`  ✅ Downloaded: ${download.suggestedFilename()}`);
                } else {
                    console.log(`  ❌ DEAD LINK DETECTED. Logging to report...`);
                    fs.appendFileSync(errorLogPath, `- **Module:** ${mod.title} -> **Lesson:** ${lesson.title} (Link unresponsive)\n`);
                }
            }
        }
        console.log(`\n🎉 Course Download Complete! Missing items logged to ${errorLogPath}`);
    } catch (e) {
        console.error("❌ Fatal Error in downloader:", e);
    } finally {
        await browser.close();
    }
}

downloadCourse();
