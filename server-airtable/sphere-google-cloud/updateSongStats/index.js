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


const getRecord = async (recordId) => {
  
  const response = await axios.get(`${playlistTableApiEndpoint}/${recordId}`, {
    headers,
  })
  
  return response.data
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

const updateTimestamps = async (record, playlistName, skipped, timestamp) => {
  // https://airtable.com/developers/web/api/create-records
  if (typeof skipped === 'string' && skipped === 'false') skipped = null;
  
  const newRecord = {
    records: [
      {
        fields: {
          Name: record.fields['Name'],
          'Playlist name': playlistName,
          'Played at': timestamp,
          'Skipped': skipped ? 'True' : null
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
  const { origin } = req.headers;
  
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(400).send('only POST and OPTIONS http request methods are supported');
  
  
  try {
    setApiUrl(req.body);
  } catch (error) {
    return res.status(400).send(error.message);
  }
  
  const { recordId, skipped, playlistName, timestamp } = req.body
  if (!recordId) {
    return res.status(400).send('please, provide recordId with your request')
  }
  
  
  try {
    const record = await getRecord(recordId)
    
    if (!skipped) {
      await updateCounter(record, recordId)
    }
    
    await updateTimestamps(record, playlistName, skipped, timestamp)
    
    res.send(`data updated ${(skipped && skipped !== 'false') ? '(skipped: true)' : ''}` )
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      const { status, statusText } = error.response;
      return res.status(status).send(status + statusText);
    }
    
    res.send(error);
  }
});
