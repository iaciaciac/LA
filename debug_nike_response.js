const https = require('https');
const fs = require('fs');

// TOKEN (Matches the user's latest token)
const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyNmRlNzc5LTQyY2MtNDU5ZS05OWY0LTczOGE2MDQyZmJlM3NpZyJ9.eyJpYXQiOjE3NjgzMDkyNTgsImV4cCI6MTc2ODMxMjg1OCwiaXNzIjoib2F1dGgyYWNjIiwianRpIjoiMjJmZDM4MGUtOWY3OS00NmU0LTgzNDctOTU5NWZjNGU3OTg0IiwiYXVkIjoiY29tLm5pa2UuZGlnaXRhbCIsInNidCI6Im5pa2U6YXBwIiwidHJ1c3QiOjEwMCwibGF0IjoxNzY3NzAwMzMwLCJzY3AiOlsibmlrZS5kaWdpdGFsIl0sInN1YiI6ImNvbS5uaWtlLmNvbW1lcmNlLm5pa2Vkb3Rjb20ud2ViIiwicHJuIjoiYTBlZTI3YjktZmE3ZC00NDZkLTkyM2YtMTdhYjBkY2RhMTIzIiwicHJ0IjoibmlrZTpwbHVzIiwibHJzY3AiOiJvcGVuaWQgbmlrZS5kaWdpdGFsIHByb2ZpbGUgZW1haWwgcGhvbmUgZmxvdyBjb3VudHJ5IiwibHJpc3MiOiJodHRwczovL2FjY291bnRzLm5pa2UuY29tIn0.fl36xDfdmkI56MkYEBM_i-GVkHzDCxA-oZfaZZyKjiqLEzqA8YXFyKgcIpwaz3jJpTujgdakRUGQv85q7vRfy2GSAugAUhpjFZVrvJ0uqujXNLJq2J_pLcY-Hs_JQp4YHYOMHyh8SphTc9ezgcfweHCaZ3hFs7as6WhHcGZ9bgnMeNNbeSRDAxxy7DkxbeNPo2b9BHXPywNChkAgSTGD8nyHoHfLAIggHdda32UsnNDr_sT8_d_zhJz6H1RdSGXxOBfyTBGrw9p2OTWhjnjRHF0qqMH3PctSe75QqmyYT7IUwVP-cY0u7rIrga-arSeSkBA_09S1QU1aOriEgQXCwQ';

const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Nike/24.12.0 (iPhone; iOS 16.0; Scale/3.00)'
};

function fetchActivities() {
    let url = `https://api.nike.com/sport/v3/me/activities/before_time/${Date.now()}`;
    console.log(`🌐 Requesting debug data...`);

    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers }, (res) => {
            let data = '';
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
        const response = await fetchActivities();
        if (response.activities && response.activities.length > 0) {
            // Save the first activity completely to see if map exists
            fs.writeFileSync('nike_raw_debug.json', JSON.stringify(response.activities[0], null, 2));
            console.log("✅ Saved first raw activity to nike_raw_debug.json");
        } else {
            console.log("⚠️ No activities found.");
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}
main();
