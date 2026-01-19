
const fs = require('fs');
try {
    // Read the hot-update file
    const content = fs.readFileSync('archive_75e4_blob.txt', 'utf8');

    // Extract base64 source map (usually at the end after sourceMappingURL=...)
    // webpack hot updates normally wrap the code in a function call "self.webpackHotUpdate_N_E(..."
    // We want to find the source map.

    // Simpler approach: hot updates often have the source map embedded as data:application/json;charset=utf-8;base64,
    const match = content.match(/sourceMappingURL=data:application\/json;charset=utf-8;base64,([a-zA-Z0-9+/=]+)/);

    if (match && match[1]) {
        fs.writeFileSync('archive_75e4_base64.txt', match[1]);
        console.log('Found base64 map');

        const buffer = Buffer.from(match[1], 'base64');
        fs.writeFileSync('archive_75e4_map.json', buffer);
        console.log('Decoded JSON map');

        const map = JSON.parse(buffer.toString('utf8'));
        if (map.sourcesContent && map.sourcesContent.length > 0) {
            fs.writeFileSync('restored_cai_run_archive_75e4.js', map.sourcesContent[0]);
            console.log('Extracted source code');
        }
    } else {
        console.log('No source map found in file');
    }
} catch (e) {
    console.error(e);
}
