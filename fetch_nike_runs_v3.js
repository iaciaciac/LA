const https = require('https');
const fs = require('fs');

// =================配置区域=================
// 您之前提供的 Token
const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyNmRlNzc5LTQyY2MtNDU5ZS05OWY0LTczOGE2MDQyZmJlM3NpZyJ9.eyJpYXQiOjE3NjgzMDkyNTgsImV4cCI6MTc2ODMxMjg1OCwiaXNzIjoib2F1dGgyYWNjIiwianRpIjoiMjJmZDM4MGUtOWY3OS00NmU0LTgzNDctOTU5NWZjNGU3OTg0IiwiYXVkIjoiY29tLm5pa2UuZGlnaXRhbCIsInNidCI6Im5pa2U6YXBwIiwidHJ1c3QiOjEwMCwibGF0IjoxNzY3NzAwMzMwLCJzY3AiOlsibmlrZS5kaWdpdGFsIl0sInN1YiI6ImNvbS5uaWtlLmNvbW1lcmNlLm5pa2Vkb3Rjb20ud2ViIiwicHJuIjoiYTBlZTI3YjktZmE3ZC00NDZkLTkyM2YtMTdhYjBkY2RhMTIzIiwicHJ0IjoibmlrZTpwbHVzIiwibHJzY3AiOiJvcGVuaWQgbmlrZS5kaWdpdGFsIHByb2ZpbGUgZW1haWwgcGhvbmUgZmxvdyBjb3VudHJ5IiwibHJpc3MiOiJodHRwczovL2FjY291bnRzLm5pa2UuY29tIn0.fl36xDfdmkI56MkYEBM_i-GVkHzDCxA-oZfaZZyKjiqLEzqA8YXFyKgcIpwaz3jJpTujgdakRUGQv85q7vRfy2GSAugAUhpjFZVrvJ0uqujXNLJq2J_pLcY-Hs_JQp4YHYOMHyh8SphTc9ezgcfweHCaZ3hFs7as6WhHcGZ9bgnMeNNbeSRDAxxy7DkxbeNPo2b9BHXPywNChkAgSTGD8nyHoHfLAIggHdda32UsnNDr_sT8_d_zhJz6H1RdSGXxOBfyTBGrw9p2OTWhjnjRHF0qqMH3PctSe75QqmyYT7IUwVP-cY0u7rIrga-arSeSkBA_09S1QU1aOriEgQXCwQ';
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

    console.log(`🌐 请求数据列表... ${beforeId ? '(翻页: ' + beforeId + ')' : '(初始)'}`);

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
    console.log(`🔍 获取详情与地图数据: ${id}...`);

    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers }, (res) => {
            let data = '';
            if (res.statusCode !== 200) {
                // If detail fails, resolve null so we don't crash everything
                console.log(`⚠️ 详情获取失败 (${res.statusCode})，跳过地图。`);
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

    // 我们只获取前 100 页（通常是全部历史），重点是为新的跑步获取地图
    const MAX_PAGES = 100;

    console.log("🚀 开始抓取 (v4: 自动获取最新地图数据)...");

    try {
        while (hasMore && pageCount < MAX_PAGES) {
            const response = await fetchActivities(nextBeforeId);
            pageCount++;

            if (response.activities && response.activities.length > 0) {
                const runs = response.activities.filter(act => act.type === 'run');

                // Process runs
                const simplifiedRuns = [];

                // 为了节省时间和请求次数，我们只为第一页（最新的30条）获取详细地图数据
                // 这样能保证“今天跑的”肯定有地图
                const FETCH_DETAIL_LIMIT = (pageCount === 1) ? 30 : 0;

                for (let i = 0; i < runs.length; i++) {
                    const run = runs[i];

                    // Basic fields
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

                    // Fetch Detail for Map (only for newest runs)
                    if (i < FETCH_DETAIL_LIMIT) {
                        try {
                            const detail = await fetchRunDetail(run.id);
                            if (detail && detail.metrics) {
                                const latM = detail.metrics.find(m => m.type === 'latitude');
                                const lonM = detail.metrics.find(m => m.type === 'longitude');
                                if (latM && lonM && latM.values && lonM.values && latM.values.length === lonM.values.length) {
                                    // Combine to [[lat, lon], ...]
                                    const points = latM.values.map((v, idx) => [v.value, lonM.values[idx].value]);
                                    if (points.length > 0) {
                                        polyline = encodePolyline(points);
                                        console.log(`   🗺️ 地图编码成功 (长度: ${polyline.length})`);
                                    }
                                }
                            }
                            // Sleep small amount to be nice to API
                            await new Promise(r => setTimeout(r, 1500));
                        } catch (err) {
                            console.error(`   ❌ 地图获取出错: ${err.message}`);
                        }
                    }

                    const runObj = {
                        id: run.id,
                        date: new Date(run.start_epoch_ms).toISOString(), // Use full ISO string for precision
                        distance_km: distance.toFixed(2),
                        duration_str: durationStr,
                        pace: pace.toFixed(2),
                        calories: Math.round(calories),
                        title: title
                    };

                    if (polyline) {
                        runObj.map = { summary_polyline: polyline };
                    }

                    simplifiedRuns.push(runObj);
                }

                allRuns = allRuns.concat(simplifiedRuns);
                console.log(`✅ 第 ${pageCount} 页处理完毕. (本页 ${simplifiedRuns.length} 条)`);

                if (response.paging && response.paging.before_id) {
                    nextBeforeId = response.paging.before_id;
                } else {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
            // Sleep between pages
            await new Promise(r => setTimeout(r, 500));
        }

        allRuns.sort((a, b) => new Date(a.date) - new Date(b.date));

        const filename = 'public/data/nike_runs_final.json';
        fs.writeFileSync(filename, JSON.stringify(allRuns, null, 2));
        console.log(`\n🎉 全部完成！共 ${allRuns.length} 条数据 (含最新地图) 已保存到 ${filename}`);

    } catch (error) {
        console.error('\n❌ 发生严重错误:', error.message);
    }
}
main();
