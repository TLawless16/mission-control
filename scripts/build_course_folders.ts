import * as fs from 'fs';
import * as path from 'path';

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

async function createCourseStructure() {
    const manifestPath = path.join(__dirname, 'course_manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error("❌ course_manifest.json not found!");
        return;
    }

    const modules: SkoolModule[] = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const baseDir = path.join(__dirname, '..', 'course_downloads');

    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }

    for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const dirName = `${(i + 1).toString().padStart(2, '0')} - ${sanitizeDirName(mod.title)}`;
        const modPath = path.join(baseDir, dirName);

        if (!fs.existsSync(modPath)) {
            fs.mkdirSync(modPath);
        }

        for (let j = 0; j < mod.lessons.length; j++) {
            const lesson = mod.lessons[j];
            const lessonTitle = `${(j + 1).toString().padStart(2, '0')} - ${sanitizeDirName(lesson.title)}`;
            const lessonPath = path.join(modPath, lessonTitle);

            if (!fs.existsSync(lessonPath)) {
                fs.mkdirSync(lessonPath);
            }

            // Write lesson metadata to a file
            const metaPath = path.join(lessonPath, 'lesson_data.json');
            fs.writeFileSync(metaPath, JSON.stringify(lesson, null, 2));

            let markdown = `# ${lesson.title}\n\n`;
            if (lesson.videoLink) markdown += `**Video URL**: ${lesson.videoLink}\n`;
            if (lesson.videoId) markdown += `**Video ID**: ${lesson.videoId}\n`;

            markdown += `\n## Resources\n`;
            if (lesson.resources && lesson.resources.length > 0) {
                for (const res of lesson.resources) {
                    markdown += `- [${res.title}](${res.link || res.file_name || res.file_id})\n`;
                }
            } else {
                markdown += `No resources attached.\n`;
            }

            const mdPath = path.join(lessonPath, `${sanitizeDirName(lesson.title)}.md`);
            fs.writeFileSync(mdPath, markdown);
        }
    }

    console.log(`✅ Successfully generated local folder hierarchy for all ${modules.length} modules!`);
    console.log(`📁 Download maps located in: ${baseDir}`);
}

createCourseStructure();
