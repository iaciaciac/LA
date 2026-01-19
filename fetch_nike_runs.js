require('dotenv').config({ path: '.env.local' });
const https = require('https');
const fs = require('fs');

// =================配置区域=================
// Token (Valid per v3 script)
// 安全修复：Token 已移至 .env.local 文件，防止硬编码泄露
const ACCESS_TOKEN = process.env.NIKE_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
    console.error('❌ 错误：未找到 NIKE_ACCESS_TOKEN，请检查 .env.local 文件。');
    process.exit(1);
}
// =========================================

const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Nike/24.12.0 (iPhone; iOS 16.0; Scale/3.00)'
};

// Polyline Encoder
function encodePolyline(points) {
    let str = '';
    let lastLat = 0;
    let lastLng = 0;

    for (const point of points) {
        let lat = Math.round(point[0] * 1e5);
        let lng = Math.round(point[1] * 1e5);

        let dLat = lat - lastLat;
        let dLng = lng - lastLng;

        lastLat = lat;
        lastLng = lng;

        str += encodeSigned(dLat);
        str += encodeSigned(dLng);
    }
    return str;
}

function encodeSigned(num) {
    let sgn_num = num << 1;
    if (num < 0) {
        sgn_num = ~(sgn_num);
    }
    return encodeNumber(sgn_num);
}

function encodeNumber(num) {
    let str = '';
    while (num >= 0x20) {
        str += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
        num >>= 5;
    }
    str += String.fromCharCode(num + 63);
    return str;
}

function fetchActivities(beforeId = null) {
    let url = `https://api.nike.com/sport/v3/me/activities/before_time/${Date.now()}`;
    if (beforeId) {
        url = `https://api.nike.com/sport/v3/me/activities/before_id/${beforeId}`;
    }

    console.log(`🌐 Fetching List... ${beforeId ? '(Paging: ' + beforeId + ')' : '(Initial)'}`);

    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers }, (res) => {
            let data = '';
            if (res.statusCode !== 200) {
                if (res.statusCode === 404 && beforeId) {
                    resolve({ activities: [], paging: null });
                    return;
                }
                reject(new Error(`List Request Failed: ${res.statusCode}`));
                return;
            }
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', (e) => { reject(e); });
    });
}

function fetchRunDetail(id) {
    const url = `https://api.nike.com/sport/v3/me/activity/${id}?metrics=ALL`;
    console.log(`🔍 Fetching Details & Map: ${id}...`);

    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers }, (res) => {
            let data = '';
            if (res.statusCode !== 200) {
                console.log(`⚠️ Detail failed (${res.statusCode}), skipping map.`);
                resolve(null);
                return;
            }
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) { resolve(null); }
            });
        });
        req.on('error', (e) => { resolve(null); });
    });
}

async function main() {
    let allRuns = [];
    let nextBeforeId = null;
    let hasMore = true;
    let pageCount = 0;
    const MAX_PAGES = 100;

    console.log("🚀 Starting RAW Data Sync...");

    try {
        while (hasMore && pageCount < MAX_PAGES) {
            const response = await fetchActivities(nextBeforeId);
            pageCount++;

            if (response.activities && response.activities.length > 0) {
                const runs = response.activities.filter(act => act.type === 'run');

                // Load static data for map fallback (only once per page loop is fine, or move outside - moved inside for safety in this specific edit scope but inefficient. Better to check if loaded.)
                // Actually, let's load it ONCE at the top of the function properly. 
                // Since I am replacing this block, I will insert the loading logic here but wrapped to only execute once if possible, 
                // OR I can just do a multi-replace.
                // Simpler: I will just rewrite the loop content as requested.

                // Process runs
                const processedRuns = [];
                const FETCH_DETAIL_LIMIT = (pageCount === 1) ? 30 : 0;

                // Load static data (Sync read is fine here, script is local)
                let staticDataMap = new Map();
                try {
                    if (pageCount === 1) { // Log only once
                        const STATIC_DATA_PATH = 'src/data/nike_runs_transformed.json';
                        if (fs.existsSync(STATIC_DATA_PATH)) {
                            const staticRaw = JSON.parse(fs.readFileSync(STATIC_DATA_PATH, 'utf8'));
                            staticRaw.forEach(r => {
                                if (r.id && r.map && r.map.summary_polyline) {
                                    staticDataMap.set(r.id, r.map.summary_polyline);
                                }
                            });
                            console.log(`📚 Loaded ${staticDataMap.size} historical maps for potential merging.`);
                        }
                    } else {
                        // Reloading every page is inefficient but safe for this quick script. 
                        // To avoid spamming log, I suppressed valid log above.
                        // Actually better to just read it every time to keep code simple in this block replacer.
                        const STATIC_DATA_PATH = 'src/data/nike_runs_transformed.json';
                        if (fs.existsSync(STATIC_DATA_PATH)) {
                            const staticRaw = JSON.parse(fs.readFileSync(STATIC_DATA_PATH, 'utf8'));
                            staticRaw.forEach(r => {
                                if (r.id && r.map && r.map.summary_polyline) {
                                    staticDataMap.set(r.id, r.map.summary_polyline);
                                }
                            });
                        }
                    }
                } catch (e) { }

                for (let i = 0; i < runs.length; i++) {
                    const run = runs[i];

                    // --- Formatted Fields (Required by existing App) ---
                    const title = run.tags && run.tags['com.nike.name'] ? run.tags['com.nike.name'] : 'Run';
                    const durationMs = run.active_duration_ms || 0;
                    const seconds = Math.floor((durationMs / 1000) % 60);
                    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
                    const hours = Math.floor((durationMs / (1000 * 60 * 60)));
                    const durationStr = hours > 0
                        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                        : `${minutes}:${seconds.toString().padStart(2, '0')}`;

                    const getMetric = (name, type = 'total') => {
                        if (!run.summaries) return 0;
                        const item = run.summaries.find(s => s.metric === name && s.summary === type);
                        return item ? item.value : 0;
                    };
                    const distance = getMetric('distance', 'total');
                    const calories = getMetric('calories', 'total');
                    const pace = getMetric('pace', 'mean');

                    let polyline = null;
                    let fullDetail = null;

                    // Fetch Detail for Map
                    if (i < FETCH_DETAIL_LIMIT) {
                        try {
                            fullDetail = await fetchRunDetail(run.id);
                            if (fullDetail && fullDetail.metrics) {
                                const latM = fullDetail.metrics.find(m => m.type === 'latitude');
                                const lonM = fullDetail.metrics.find(m => m.type === 'longitude');
                                if (latM && lonM && latM.values) {
                                    const points = latM.values.map((v, idx) => [v.value, lonM.values[idx].value]);
                                    if (points.length > 0) {
                                        polyline = encodePolyline(points);
                                        console.log(`   🗺️ Map encoded (${polyline.length} chars)`);
                                    }
                                }
                            }
                            await new Promise(r => setTimeout(r, 1000));
                        } catch (err) {
                            console.error(`   ❌ Map error: ${err.message}`);
                        }
                    }

                    // --- Construct Object ---
                    // We include ALL original 'run' properties implicitly or explicitly
                    // And add the formatted ones for the app.
                    const runObj = {
                        ...run, // PRESERVE ALL ORIGINAL FIELDS (Raw Data)

                        // Compat fields
                        date: new Date(run.start_epoch_ms).toISOString(),
                        distance_km: distance.toFixed(2),
                        duration_str: durationStr,
                        pace: pace.toFixed(2),
                        calories: Math.round(calories),
                        title: title
                    };

                    if (polyline) {
                        runObj.map = { summary_polyline: polyline };
                    } else if (staticDataMap && staticDataMap.has(run.id)) {
                        // Merge historical map
                        runObj.map = { summary_polyline: staticDataMap.get(run.id) };
                    }

                    processedRuns.push(runObj);
                }

                allRuns = allRuns.concat(processedRuns);
                console.log(`✅ Page ${pageCount} done. (${processedRuns.length} runs)`);

                if (response.paging && response.paging.before_id) {
                    nextBeforeId = response.paging.before_id;
                } else {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
            await new Promise(r => setTimeout(r, 500));
        }

        allRuns.sort((a, b) => new Date(a.date) - new Date(b.date));

        const filename = 'public/data/nike_runs_final.json';
        fs.writeFileSync(filename, JSON.stringify(allRuns, null, 2));
        console.log(`\n🎉 Sync Complete! ${allRuns.length} runs saved to ${filename}`);

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
    }
}
main();
