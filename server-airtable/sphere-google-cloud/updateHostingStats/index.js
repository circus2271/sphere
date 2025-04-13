const functions = require('@google-cloud/functions-framework');
require('dotenv').config()

const {
    PERSONAL_ACCESS_TOKEN,
    ALLOWED_ORIGINS_JSON,
    GOOGLE_CLOUD_LOGIN_FUNCTION_URL
} = process.env

const allowedOrigins = JSON.parse(ALLOWED_ORIGINS_JSON);

const baseId = 'appR03xsMl1iZeKaV'
const firstTableId = 'tblFf3EVWfo8BsHFX'
const airtableApiEndpoint = `https://api.airtable.com/v0/${baseId}/${firstTableId}`


functions.http('updateHostingStats', async (req, res) => {
    const { origin } = req.headers;

    if (allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(400).send('only POST and OPTIONS http request methods are supported');

    const {login, password, playlistName} = req.body
    if (!login || !password) return res.status(403).send('no login or password');
    if (!playlistName) return res.status(400).send('a request should have a playlistName property')

    const loginResponse = await logIn(login, password)

    const loggedIn = loginResponse.ok
    if (!loggedIn) return res.status(loginResponse.status).send(loginResponse.statusText)

    const { placeName } = await loginResponse.json();

    if (!placeName) {
        return res.status(404).send('Place name not found');
    }

    const newRecord = {
        records: [
            {
                fields: {
                    placeName,
                    'playlist name': playlistName,
                    'changed at': new Date().toLocaleString('ru-RU'),
                }
            }
        ]
    }

    try {
        const response = await sendDataToAT(newRecord)

        if (response.ok) {
            return res.status(200).send('data updated')
        }

        return res.status(response.status).send(response.statusText)
    } catch (error) {
        console.log('error when sending data to AT:', error.message)
        return res.status(500).send('something went wrong when sending data to AT')
    }
})



async function logIn(login , password) {
    return await fetch(GOOGLE_CLOUD_LOGIN_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({login, password})
    })
}

async function sendDataToAT(data) {
    return await fetch(airtableApiEndpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PERSONAL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
}