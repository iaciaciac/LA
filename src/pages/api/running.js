import { getActivities, getAccessToken } from '../../lib/strava';

export default async function handler(req, res) {
    try {
        const activities = await getActivities();

        // Check if we got an error from Strava (e.g. invalid token)
        if (activities.errors) {
            return res.status(500).json({ error: activities });
        }

        res.status(200).json(activities);
    } catch (error) {
        console.error("API Route Error:", error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
