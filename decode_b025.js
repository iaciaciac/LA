
const fs = require('fs');
try {
    const base64Data = fs.readFileSync('archive_b025_base64.txt', 'utf8').trim();
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync('archive_b025_map.json', buffer);
    console.log('Successfully decoded JSON map');
} catch (e) {
    console.error('Error:', e);
}
