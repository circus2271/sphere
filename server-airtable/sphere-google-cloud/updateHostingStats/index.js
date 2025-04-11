const functions = require('@google-cloud/functions-framework');
require('dotenv').config()

const {
    PERSONAL_ACCESS_TOKEN,
    ALLOWED_ORIGINS_JSON,
    GOOGLE_CLOUD_LOGIN_FUNCTION_URL
} = process.env

const allowedOrigins = JSON.parse(ALLOWED_ORIGINS_JSON);

functions.http('updateHostingStats', async (req, res) => {
    const { origin } = req.headers;
    //   const userAgent = req.headers['user-agent'];

    if (allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(400).send('only POST and OPTIONS http request methods are supported');
    // return res.status(200).send('f')

    const {login, password} = req.body
    if (!login || !password) return res.status(403).send('no login or password');



    const userDataResponse = await fetch(GOOGLE_CLOUD_LOGIN_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({login, password})
    })

    // if (!userDataResponse.ok) return res.status(403).send(`couldn't login`)
    const userData = await userDataResponse.json();
    const { placeName } = userData;

    if (!placeName) {
        return res.status(404).send('Place name not found');
    }

    return res.status(200).send(placeName);

})
