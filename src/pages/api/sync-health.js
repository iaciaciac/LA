import { createClient } from 'next-sanity'

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
})

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const { secret, metrics } = req.body

        // 安全检查：验证同步密钥
        if (secret !== process.env.HEALTH_SYNC_SECRET) {
            return res.status(401).json({ message: 'Invalid secret' })
        }

        if (!metrics) {
            return res.status(400).json({ message: 'No metrics data provided' })
        }

        // Format: metrics should be an object with keys matching schema
        // { date: '2023-10-27', stepCount: 5000, ... }

        const doc = {
            _type: 'healthMetrics',
            ...metrics,
            // Create a unique ID based on date to prevent duplicates/allow updates
            _id: `health-${metrics.date}`,
        }

        await client.createOrReplace(doc)

        return res.status(200).json({ message: 'Health data synced successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Internal server error', error: err.message })
    }
}
