const fs = require('fs');
const path = require('path');

const nikeFile = 'nike_runs_final.json';
const outputFile = 'src/data/nike_runs_transformed.json';

try {
    const rawData = fs.readFileSync(nikeFile, 'utf8');
    const nikeRuns = JSON.parse(rawData);

    const transformed = nikeRuns.map(run => {
        // Parse Duration (e.g., "35:06" or "1:05:30")
        const parts = run.duration_str.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 3) {
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            seconds = parts[0] * 60 + parts[1];
        }

        return {
            id: run.id,
            name: run.title || "Run",
            distance: Math.round(parseFloat(run.distance_km) * 1000), // Convert km to meters
            moving_time: seconds,
            start_date: new Date(run.date).toISOString(), // YYYY-MM-DD to ISO
            average_speed: (parseFloat(run.pace) > 0) ? (1000 / (parseFloat(run.pace) * 60)) : 0, // approx conversion if needed
            type: "Run",
            // Keep original fields just in case
            original_date: run.date,
            pace_str: run.pace
        };
    });

    // Sort by date descending
    transformed.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2));
    console.log(`✅ Successfully transformed ${nikeRuns.length} runs to ${outputFile}`);

} catch (e) {
    console.error("❌ Error converting file:", e);
}
