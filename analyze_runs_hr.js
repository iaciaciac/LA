const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./public/data/nike_runs_final.json', 'utf8'));

let totalRuns = data.length;
let hasSummaryMean = 0;
let hasMetricHeartRate = 0;
let hasHeartRateInTags = 0;
let missingHeartRate = [];

data.forEach(run => {
    let found = false;

    // Check summaries
    if (run.summaries) {
        const hr = run.summaries.find(s => s.metric === 'heart_rate' && s.summary === 'mean');
        if (hr) {
            hasSummaryMean++;
            found = true;
        } else {
            // Check if present but not 'mean'
            const anyHr = run.summaries.find(s => s.metric === 'heart_rate');
            if (anyHr) {
                console.log(`Run ${run.id} has HR in summaries but NOT mean:`, anyHr);
            }
        }
    }

    // Check metrics
    if (!found && run.metrics) {
        const hrMetric = run.metrics.find(m => m.type === 'heart_rate');
        if (hrMetric) {
            hasMetricHeartRate++;
            // found = true; // Uncomment if we consider this "found"
            console.log(`Run ${run.id} has HR in metrics array`);
        }
    }

    if (!found) {
        missingHeartRate.push({
            id: run.id,
            date: run.start_date || run.date,
            metric_types: run.metric_types
        });
    }
});

console.log(`Total Runs: ${totalRuns}`);
console.log(`Runs with HR in summaries (mean): ${hasSummaryMean}`);
console.log(`First 5 Missing HR Runs:`);
console.log(JSON.stringify(missingHeartRate.slice(0, 5), null, 2));

// Check if there are other known fields?
console.log("Checking tags for 'heart'...");
data.slice(0, 100).forEach(run => {
    if (run.tags) {
        Object.keys(run.tags).forEach(key => {
            if (key.includes('heart')) {
                console.log(`Found tag key with heart: ${key} in run ${run.id}`);
            }
        });
    }
});
