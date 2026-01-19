export default {
    name: 'healthMetrics',
    title: 'Health Metrics',
    type: 'document',
    fields: [
        {
            name: 'date',
            title: 'Date',
            type: 'date',
            options: {
                dateFormat: 'YYYY-MM-DD',
                calendarTodayLabel: 'Today'
            }
        },
        {
            name: 'stepCount',
            title: 'Steps',
            type: 'number'
        },
        {
            name: 'walkingRunningDistance',
            title: 'Walking/Running Distance (km)',
            type: 'number'
        },
        {
            name: 'activeEnergyBurned',
            title: 'Active Energy (kcal)',
            type: 'number'
        },
        {
            name: 'flightsClimbed',
            title: 'Flights Climbed',
            type: 'number'
        },
        {
            name: 'heartRate',
            title: 'Avg Heart Rate',
            type: 'number'
        }
    ],
    preview: {
        select: {
            title: 'date',
            steps: 'stepCount'
        },
        prepare(selection) {
            const { title, steps } = selection
            return {
                title: title,
                subtitle: `${steps} steps`
            }
        }
    }
}
