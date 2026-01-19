
const fs = require('fs');
try {
    const content = fs.readFileSync('archive_867b_blob.txt', 'utf8');
    const match = content.match(/sourceMappingURL=data:application\/json;charset=utf-8;base64,([a-zA-Z0-9+/=]+)/);

    if (match && match[1]) {
        const buffer = Buffer.from(match[1], 'base64');
        const map = JSON.parse(buffer.toString('utf8'));
        if (map.sourcesContent && map.sourcesContent.length > 0) {
            fs.writeFileSync('restored_cai_run_archive_867b.js', map.sourcesContent[0]);
            console.log('Extracted source code from 867b');
        }
    } else {
        console.log('No source map found in 867b');
    }
} catch (e) {
    console.error(e);
}
