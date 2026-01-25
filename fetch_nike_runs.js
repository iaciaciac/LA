const fs = require('fs');
const https = require('https');
const path = require('path');

// ============================================
// PASTE YOUR NIKE ACCESS TOKEN BELOW
// ============================================
const ACCESS_TOKEN = '';
// Example: 'Bearer eyJhbGciOiJIUzI1NiIs...'

const DATA_FILE = path.join(__dirname, 'public/data/nike_runs_final.json');

if (!ACCESS_TOKEN) {
    console.error("Error: Please open this script and paste your Nike Access Token into the 'ACCESS_TOKEN' variable.");
    process.exit(1);
}

// 1. Read existing existing data to find where we left off
let existingRuns = [];
try {
    if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        existingRuns = JSON.parse(fileContent);
        console.log(`Loaded ${existingRuns.length} existing runs.`);
    } else {
        console.log("No existing data file found. Starting fresh.");
    }
} catch (err) {
    console.error("Error reading existing data:", err);
    process.exit(1);
}

// Helper to check if a run exists
const existingIds = new Set(existingRuns.map(r => r.id));

async function fetchActivities(afterId = null) {
    // Note: The Nike API often uses 'before_id' to go backwards in time (pagination).
    // To get NEW runs, we typically fetch the latest page (no param) and see what's new.
    // If we need to go back further, we use 'before_id' from the paging.next.
    // However, since we want *updates*, we can just fetch the landing page. 
    // If there are MANY new runs, we might need to follow pagination until we hit a known ID.

    let newRuns = [];
    let url = 'https://api.nike.com/sport/v3/me/activities/before_id?limit=100';
    if (afterId) {
        url = `https://api.nike.com/sport/v3/me/activities/before_id/${afterId}?limit=100`;
    }

    // Since we want the LATEST, we start without a 'before_id' (or with a very future timestamp if that was supported, but 'before_id' is usually an ID or timestamp from the pagination cursor).
    // Actually, 'before_id' implies "older than". 
    // The default endpoint 'https://api.nike.com/sport/v3/me/activities/before_id?limit=100' usually gives the MOST RECENT activities.

    // We will loop until we find a run that we already have.
    let currentUrl = 'https://api.nike.com/sport/v3/me/activities/before_id?limit=100'; // Start with latest
    let keepFetching = true;

    while (keepFetching) {
        console.log(`Fetching: ${currentUrl}`);
        const data = await makeRequest(currentUrl);

        if (!data || !data.activities) {
            console.error("Error: Invalid response from Nike API.");
            break;
        }

        const activities = data.activities;
        if (activities.length === 0) {
            console.log("No more activities found.");
            break;
        }

        // Filter for valid runs and check if they are new
        const validActivities = activities.filter(a => a.type === 'run');

        let foundExisting = false;

        for (const activity of validActivities) {
            if (existingIds.has(activity.id)) {
                foundExisting = true;
                // If we found an existing run, we might have bridged the gap if we are just updating.
                // However, be careful if runs were deleted/re-synced. 
                // For a simple updater, stopping on the first known ID is usually safe enough 
                // assuming reliable ordering.
                console.log(`Found known run ID ${activity.id}. Stopping fetch loop.`);
                keepFetching = false;
                break;
            } else {
                newRuns.push(activity);
                existingIds.add(activity.id); // Valid during this run
            }
        }

        if (keepFetching) {
            if (data.paging && data.paging.before_id) {
                currentUrl = `https://api.nike.com/sport/v3/me/activities/before_id/${data.paging.before_id}?limit=100`;
            } else {
                console.log("No pagination 'before_id' found. Stopping.");
                break;
            }
        }
    }

    return newRuns;
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': ACCESS_TOKEN,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        };

        https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Status Code: ${res.statusCode}`);
                res.resume(); // consume response to free up memory
                if (res.statusCode === 401) {
                    console.error("Authentication failed. Please check your ACCESS_TOKEN.");
                }
                resolve(null);
                return;
            }

            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                    resolve(null);
                }
            });
        }).on('error', (err) => {
            console.error("Network error:", err);
            reject(err);
        });
    });
}

// Main Execution
(async () => {
    console.log("Starting Nike data fetch...");
    const newItems = await fetchActivities();

    if (newItems.length > 0) {
        console.log(`Found ${newItems.length} new runs.`);

        // Merge new runs at the BEGINNING of the array (assuming we want desc order)
        // Check sort order of existing file. Usually it's by date.

        // Let's sort everything by start_epoch_ms to be safe
        const allRuns = [...newItems, ...existingRuns];

        // Remove duplicates just in case (by ID)
        const uniqueRunsMap = new Map();
        allRuns.forEach(r => uniqueRunsMap.set(r.id, r));
        const uniqueRuns = Array.from(uniqueRunsMap.values());

        // Sort: Newest first?
        // Let's check existing file order.
        // Usually newest is at top or bottom? 
        // Based on the 'before_id' logic, newer things come first from API. 
        // Let's standardise on descending date (newest first).
        uniqueRuns.sort((a, b) => b.start_epoch_ms - a.start_epoch_ms);

        fs.writeFileSync(DATA_FILE, JSON.stringify(uniqueRuns, null, 2));
        console.log(`Successfully updated ${DATA_FILE}. Total runs: ${uniqueRuns.length}`);
    } else {
        console.log("No new runs found.");
    }
})();
