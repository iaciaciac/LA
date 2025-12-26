
const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

const TOKEN_ENDPOINT = 'https://www.strava.com/oauth/token';
const ATHLETES_ENDPOINT = 'https://www.strava.com/api/v3/athlete/activities';

export const getAccessToken = async () => {
    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: 'refresh_token',
        }),
    });

    return response.json();
};

export const getActivities = async () => {
    const tokenData = await getAccessToken();

    if (!tokenData.access_token) {
        console.error("Failed to get access token", tokenData);
        return { error: 'No access token' };
    }

    const response = await fetch(`${ATHLETES_ENDPOINT}?per_page=1`, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    });

    return response.json();
};
