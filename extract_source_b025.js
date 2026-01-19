
const fs = require('fs');
try {
    const map = JSON.parse(fs.readFileSync('archive_b025_map.json', 'utf8'));
    if (map.sourcesContent && map.sourcesContent.length > 0) {
        fs.writeFileSync('restored_cai_run_archive_b025.js', map.sourcesContent[0]);
        console.log('Successfully extracted source code');
    } else {
        console.log('No sourcesContent found in map');
    }
} catch (e) {
    console.error('Error:', e);
}
