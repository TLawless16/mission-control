import * as fs from 'fs';
import * as path from 'path';

const htmlPath = path.join(__dirname, 'skool_course_dom.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

if (match && match[1]) {
    const data = JSON.parse(match[1]);
    const outPath = path.join(__dirname, 'skool_data.json');
    fs.writeFileSync(outPath, JSON.stringify(data.props.pageProps, null, 2));
    console.log(`✅ Extracted data to skool_data.json`);
} else {
    console.log("❌ Could not find __NEXT_DATA__");
}
