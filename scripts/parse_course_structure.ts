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

function parseCourse() {
    const dataPath = path.join(__dirname, 'skool_data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const modules: SkoolModule[] = [];

    const rawModules = data.course?.children || [];

    for (const rawMod of rawModules) {
        const modTitle = rawMod.course?.metadata?.title || 'Unknown Module';
        const modId = rawMod.course?.id || 'unknown';
        const rawLessons = rawMod.children || [];

        const lessons: SkoolLesson[] = [];

        for (const rawLesson of rawLessons) {
            const lessonMeta = rawLesson.course?.metadata || {};
            const lessonId = rawLesson.course?.id || 'unknown';

            let resources = [];
            if (lessonMeta.resources) {
                try {
                    resources = JSON.parse(lessonMeta.resources);
                } catch (e) {
                    console.log(`Failed to parse resources for lesson ${lessonMeta.title}`);
                }
            }

            lessons.push({
                id: lessonId,
                title: lessonMeta.title || 'Unknown Lesson',
                videoLink: lessonMeta.videoLink,
                videoId: lessonMeta.videoId,
                resources: resources
            });
        }

        modules.push({
            id: modId,
            title: modTitle,
            lessons: lessons
        });
    }

    const outPath = path.join(__dirname, 'course_manifest.json');
    fs.writeFileSync(outPath, JSON.stringify(modules, null, 2));
    console.log(`✅ Parsed ${modules.length} modules into course_manifest.json`);
}

parseCourse();
