const fs = require('fs');
const path = './public/data/nike_runs_final.json';

try {
    const rawData = fs.readFileSync(path, 'utf8');
    const runs = JSON.parse(rawData);

    // Sort by date descending
    runs.sort((a, b) => b.start_epoch_ms - a.start_epoch_ms);

    const recentRuns = runs.slice(0, 20); // Last 20 runs

    let totalDist = 0;
    let totalTime = 0;
    let totalHR = 0;
    let hrCount = 0;
    let totalSteps = 0;
    let stepsCount = 0;

    console.log(`Analyzing last ${recentRuns.length} runs...`);

    recentRuns.forEach((run, i) => {
        const distKm = run.summaries.find(s => s.metric === 'distance') ? run.summaries.find(s => s.metric === 'distance').value : 0;

        // Duration
        // Prefer duration from summaries or calculate
        // Raw data structure varies, let's try to find duration in summaries 'duration' or 'speed' derived
        // Actually usually top level 'active_duration_ms' or similar exists but checked file before, structure is complex.
        // Let's use the summary 'speed' (km/h) or 'pace' (min/km)?
        // simpler: logic used in cai_run.js:
        // moving_time derived from 'duration' metric?

        // Let's look for specific metrics
        const distSummary = run.summaries.find(s => s.metric === 'distance');
        const timeSummary = run.summaries.find(s => s.metric === 'duration');

        let durationMin = 0;
        if (timeSummary) durationMin = timeSummary.value / 60000; // ms to min? Wait value usually seconds?
        // Let's assume standard NRC usually has duration in ms or seconds.
        // Based on previous file reads, value is just a number. 
        // Let's perform a check. If value is ~1800 for 5k, it's seconds.

        // Alternative: active_duration_ms is often a top property in transformed data, but this is RAW.
        // Let's rely on finding 'heart_rate' and 'steps' mainly.

        const hrSummary = run.summaries.find(s => s.metric === 'heart_rate' && s.summary === 'mean');
        const stepsSummary = run.summaries.find(s => s.metric === 'steps');
        const paceSummary = run.summaries.find(s => s.metric === 'pace'); // min/km?

        console.log(`Run ${i + 1}: Date: ${new Date(run.start_epoch_ms).toISOString().split('T')[0]}`);

        if (distSummary) {
            console.log(` - Dist: ${distSummary.value.toFixed(2)} km`);
            totalDist += distSummary.value;
        }

        if (hrSummary) {
            console.log(` - HR: ${hrSummary.value}`);
            totalHR += hrSummary.value;
            hrCount++;
        }

        if (stepsSummary) {
            console.log(` - Steps: ${stepsSummary.value}`);
            totalSteps += stepsSummary.value;
            stepsCount++;
        }
    });

    console.log('--- Averages ---');
    console.log(`Avg Dist: ${(totalDist / recentRuns.length).toFixed(2)} km`);
    if (hrCount > 0) console.log(`Avg HR: ${(totalHR / hrCount).toFixed(0)} bpm`);
    if (stepsCount > 0) console.log(`Avg Steps per run: ${(totalSteps / stepsCount).toFixed(0)}`);

} catch (e) {
    console.error(e);
}
