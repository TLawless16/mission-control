import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

interface SkoolLesson {
    id: string;
    title: string;
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

async function retryTranscripts() {
    const manifestPath = path.join(__dirname, 'course_manifest.json');
    const modules: SkoolModule[] = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const baseDir = path.join(__dirname, '..', 'course_downloads');
    const missingLogPath = path.join(baseDir, '_missing_transcripts.md');

    if (!fs.existsSync(missingLogPath)) return;
    const missingLog = fs.readFileSync(missingLogPath, 'utf8');
    const missingLines = missingLog.split('\n').filter(l => l.includes('- **Module:**'));

    if (missingLines.length === 0) {
        console.log("No missing transcripts to retry.");
        return;
    }

    console.log(`🚀 Retrying ${missingLines.length} missing transcripts...`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    try {
        await page.goto('https://www.skool.com/login');
        await page.fill('input[type="email"]', 'tim@vestedcorps.com');
        await page.fill('input[type="password"]', 'NoL00ser$OKT!5179');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);

        let stillMissing: string[] = [];

        for (const line of missingLines) {
            const modMatch = line.match(/\*\*Module:\*\* (.*?) ->/);
            const lessMatch = line.match(/\*\*Lesson:\*\* (.*?) \(/);
            if (!modMatch || !lessMatch) {
                stillMissing.push(line);
                continue;
            }
            const modTitle = modMatch[1].trim();
            const lessTitle = lessMatch[1].trim();

            const modIndex = modules.findIndex(m => m.title === modTitle);
            if (modIndex === -1) continue;
            const mod = modules[modIndex];

            const lessIndex = mod.lessons.findIndex(l => l.title === lessTitle);
            if (lessIndex === -1) continue;
            const lesson = mod.lessons[lessIndex];

            const modDirName = `${(modIndex + 1).toString().padStart(2, '0')} - ${sanitizeDirName(mod.title)}`;
            const lessonDirName = `${(lessIndex + 1).toString().padStart(2, '0')} - ${sanitizeDirName(lesson.title)}`;
            const lessonPath = path.join(baseDir, modDirName, lessonDirName);

            const lessonUrl = `https://www.skool.com/aiautomationsbyjack/classroom/af686ad3?md=${mod.id}`;
            console.log(`\n🏫 Retrying: ${mod.title} -> ${lesson.title}`);
            await page.goto(lessonUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(3000);

            try {
                const lessonLink = page.locator(`text="${lesson.title}"`).first();
                if (await lessonLink.count() > 0) {
                    await lessonLink.click();
                    await page.waitForTimeout(2000);
                }
            } catch (e) { }

            await page.evaluate(() => {
                const overlays = Array.from(document.querySelectorAll('div')).filter(d =>
                    d.style.position === 'fixed' || d.style.position === 'sticky' || d.style.zIndex > "10"
                );
                overlays.forEach(o => o.remove());
            });

            const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
            const newDocPromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null);

            let capturedText = null;
            const responseHandler = async (response: any) => {
                const url = response.url();
                if (url.includes('.txt') || url.includes('transcript')) {
                    try {
                        const text = await response.text();
                        if (text && text.length > 50) {
                            capturedText = text;
                        }
                    } catch (e) { }
                }
            };
            page.on('response', responseHandler);

            await page.evaluate(() => {
                const spans = Array.from(document.querySelectorAll('span.styled__ResourceLabel-sc-1wq200d-3'));
                const transcriptSpan = spans.find(s => s.textContent?.toLowerCase().includes('transcript'));
                if (transcriptSpan) {
                    (transcriptSpan as HTMLElement).click();
                }
            });

            const download = await downloadPromise;
            const newPage = await newDocPromise;
            await page.waitForTimeout(2000); // give response handler a moment
            page.off('response', responseHandler);

            if (download) {
                const outPath = path.join(lessonPath, download.suggestedFilename());
                await download.saveAs(outPath);
                console.log(`  ✅ Downloaded via file stream!`);
            } else if (capturedText) {
                fs.writeFileSync(path.join(lessonPath, 'transcript.txt'), capturedText);
                console.log(`  ✅ Intercepted via network response!`);
            } else if (newPage) {
                const text = await newPage.evaluate(() => document.body.innerText);
                fs.writeFileSync(path.join(lessonPath, 'transcript.txt'), text);
                console.log(`  ✅ Extracted from new tab!`);
                await newPage.close();
            } else {
                console.log(`  ❌ Still broken.`);
                stillMissing.push(line);
            }
        }

        const newLogContent = '# Missing / Broken Transcripts Report\n\n' + stillMissing.join('\n') + '\n';
        fs.writeFileSync(missingLogPath, newLogContent);
        console.log(`\n🎉 Retry complete. Remaining missing count: ${stillMissing.length}`);

    } catch (e) {
        console.error("❌ Error in retry script:", e);
    } finally {
        await browser.close();
    }
}

retryTranscripts();
