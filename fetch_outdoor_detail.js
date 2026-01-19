const https = require('https');
const fs = require('fs');

const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyNmRlNzc5LTQyY2MtNDU5ZS05OWY0LTczOGE2MDQyZmJlM3NpZyJ9.eyJpYXQiOjE3Njc3MTU0NDgsImV4cCI6MTc2NzcxOTA0OCwiaXNzIjoib2F1dGgyYWNjIiwianRpIjoiNThmN2EyNWYtNTVmYS00ZWNkLWE2MTktMDVjMTU0YjZmMzlkIiwiYXVkIjoiY29tLm5pa2UuZGlnaXRhbCIsInNidCI6Im5pa2U6YXBwIiwidHJ1c3QiOjEwMCwibGF0IjoxNzY3NzAwMzMwLCJzY3AiOlsibmlrZS5kaWdpdGFsIl0sInN1YiI6ImNvbS5uaWtlLmNvbW1lcmNlLm5pa2Vkb3Rjb20ud2ViIiwicHJuIjoiYTBlZTI3YjktZmE3ZC00NDZkLTkyM2YtMTdhYjBkY2RhMTIzIiwicHJ0IjoibmlrZTpwbHVzIiwibHJzY3AiOiJvcGVuaWQgbmlrZS5kaWdpdGFsIHByb2ZpbGUgZW1haWwgcGhvbmUgZmxvdyBjb3VudHJ5IiwibHJpc3MiOiJodHRwczovL2FjY291bnRzLm5pa2UuY29tIn0.OQUJjs9_TIwzhAZfWjmn2PBTw5-Kvuy402SjStVMf2dDA8UkuFZACGGZkKi22yrI6XIXm6A9CSOG2DVP7Vg7YF5HsIkDtPyYPbOwydMftXYMloBsouJ94ofjk190yKBrpma-4_FSw7WxSng1TxpixxmfBbHjRoUYzdnHbiGmfhgcoz8Ag_XtcyAaegkfuzgWRjN1Z_sJWVU3MlkU-KJXet5T8_aHGx55erzF2ae8H5Pm5EL3Cv5Exj1e92w4R893CRUfP_skKSqdxrbdFDdZXiDbFeZ6zGH8JSiMrxyPN8uLtXHY9_q7CE8GIbBDpDTE3VaQvPdtG7eh1bWh8wuGnA';

// This is the OUTDOOR run from 2026-01-02
const runId = '9f0e255d-10b4-4505-8f5f-e75c35978b76';

const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Nike/24.12.0 (iPhone; iOS 16.0; Scale/3.00)'
};

function fetchRunDetail(id) {
    const url = `https://api.nike.com/sport/v3/me/activity/${id}?metrics=ALL`;
    console.log(`🌐 Fetching details for ID: ${id}...`);

    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers }, (res) => {
            let data = '';
            if (res.statusCode !== 200) {
                reject(new Error(`Status: ${res.statusCode}`));
                return;
            }
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) { reject(e); }
            });
        });
        req.on('error', (e) => { reject(e); });
    });
}

async function main() {
    try {
        const detail = await fetchRunDetail(runId);
        fs.writeFileSync('nike_outdoor_detail.json', JSON.stringify(detail, null, 2));
        console.log('✅ Saved detail to nike_outdoor_detail.json');

        // Analyze metrics for lat/lon
        const lat = detail.metrics.find(m => m.type === 'latitude');
        const lon = detail.metrics.find(m => m.type === 'longitude');
        if (lat && lon) {
            console.log(`📍 Found GPS data! Points: ${lat.values.length}`);
        } else {
            console.log('❌ No latitude/longitude metrics found.');
            console.log('Available metric types:', detail.metrics.map(m => m.type));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}
main();
