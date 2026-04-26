const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
require('dotenv').config()

const { PERSONAL_ACCESS_TOKEN, ALLOWED_ORIGINS_JSON } = process.env

let playlistTableApiEndpoint, timestampsTableApiEndpoint;

const setApiUrl = ({ baseId, tableId }) => {
  if (!baseId || !tableId) {
    throw new Error('please, provide baseId and tableId with your request')
  }

  playlistTableApiEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`
  timestampsTableApiEndpoint = `https://api.airtable.com/v0/${baseId}/Timestamps`
}

const allowedOrigins = JSON.parse(ALLOWED_ORIGINS_JSON);
const headers = {
  'Authorization': `Bearer ${PERSONAL_ACCESS_TOKEN}`,
};


const getRecord = async (recordId, songName) => {
  if (recordId) {
    const response = await axios.get(`${playlistTableApiEndpoint}/${recordId}`, {
      headers,
    })
    return response.data
  }

  if (songName) {
    const formula = encodeURIComponent(`{Name} = "${songName}"`);
    const url = `${playlistTableApiEndpoint}?filterByFormula=${formula}`;

    const response = await axios.get(url, {
      headers,
    })

    // console.log(response.data.records.length)
    // console.log(response.data.records)
    return response.data.records[0]
  }
}

const updateCounter = async (record, recordId) => {

  const currentCounter = record.fields['Times repeated'] || 0;
  const newCount = currentCounter + 1

  const response = await axios.patch(`${playlistTableApiEndpoint}/${recordId}`, {
    fields: {
      'Times repeated': newCount
    }
  }, {
    headers
  })

  return response.data
}

const updateTimestamps = async (record, playlistName, skipped, timestamp, userAgent, downloadingSpeed, downloadingTime, newStatus, currentIndex, networkError, deviceUniqueId) => {
  // https://airtable.com/developers/web/api/create-records
  if (typeof skipped === 'string' && skipped === 'false') skipped = null;

  const newRecord = {
    records: [
      {
        fields: {
          Name: record.fields['Name'],
          'Playlist name': playlistName,
          'Played at': timestamp,
          'Skipped': skipped ? 'True' : null,
          'Agent': userAgent || '',
          'Downloading speed': downloadingSpeed || '',
          'Downloading time': downloadingTime || '',
          'Like/Dislike': newStatus || '', // it may be undefined initially
          'Index in a playlist': currentIndex, // track index
          // 'Network error': networkError === true ? 'yes' : ''
          'Network error': networkError ?? '',
          'Device unique id': deviceUniqueId || ''
        }
      }
    ]
  }

  const response = await axios.post(timestampsTableApiEndpoint, newRecord, {
    headers
  })

  return response.data
}

functions.http('updateSongStats', async (req, res) => {
  const origin = req.headers['origin'];
  const userAgent = req.headers['user-agent'];

  if (origin) {
    if (allowedOrigins.includes(origin) || origin.startsWith('http://192')) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
  }

  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(400).send('only POST and OPTIONS http request methods are supported');


  try {
    setApiUrl(req.body);
  } catch (error) {
    return res.status(400).send(error.message);
  }

  const { recordId, skipped, playlistName, timestamp, downloadingSpeed, downloadingTime, newStatus, currentIndex, networkError, deviceUniqueId, songName } = req.body
  if (!recordId && !songName) {
    return res.status(400).send('please, provide recordId or songName with your request')
  }


  try {
    const record = await getRecord(recordId, songName)
    // because networkError is used now also as logging for domain
    const actuallyHadAnError = networkError && !networkError.startsWith('domain')
    // not very good to test network error like that
    if (!skipped || !actuallyHadAnError) {
      const id = recordId ?? record.id
      await updateCounter(record, id)
    }

    await updateTimestamps(record, playlistName, skipped, timestamp, userAgent, downloadingSpeed, downloadingTime, newStatus, currentIndex, networkError, deviceUniqueId)

    res.send(`data updated ${(skipped && skipped !== 'false') ? '(skipped: true)' : ''}` )
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      const { status, statusText } = error.response;
      return res.status(status).send(status + statusText);
    }

    res.send(error);
  }
});
