const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
require('dotenv').config()

const { PERSONAL_ACCESS_TOKEN, ALLOWED_ORIGINS_JSON } = process.env

let airtableApiEndpoint;

const setApiUrl = ({ baseId, tableId }) => {
  if (!baseId || !tableId) {
    throw new Error('please, provide baseId and tableId with your request')
  }

  airtableApiEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`
}

const allowedOrigins = JSON.parse(ALLOWED_ORIGINS_JSON);
const headers = {
  'Authorization': `Bearer ${PERSONAL_ACCESS_TOKEN}`,
};

/**
 *
 * @param (string) recordId
 * @param (string) newStatusSingleValueString (for example, 'Like', 'Dislike')
 */
const updateRecordStatus = async (recordId, newStatusSingleValueString, songName) => {
  const record = await getRecord(recordId, songName);
  console.log(record)
  const currentStatusArray = record.fields['Like/Dislike'] || []; // because empty 'Like/Dislike' field is undefined by default

  if (currentStatusArray.includes(newStatusSingleValueString)) {
    return record;
  }

  const updatedStatusArray = [...currentStatusArray, newStatusSingleValueString];
  // otherwise there may be an error if to look recordId directly.
  // cause a track could be retrieved by its name and this value just missing with an original request
  const id = record.id
  const response = await patchRecord(id, updatedStatusArray);

  return response;
}

const getRecord = async (recordId, songName) => {
  if (recordId) {
    const response = await axios.get(`${airtableApiEndpoint}/${recordId}`, {
      headers,
    })
    return response.data
  }

  if (songName) {
    const formula = encodeURIComponent(`{Name} = "${songName}"`);
    const url = `${airtableApiEndpoint}/?filterByFormula=${formula}`;

    const response = await axios.get(url, {
      headers,
    })

    // console.log(response.data.records.length)
    // console.log(response.data.records)
    return response.data.records[0]
  }
}

const patchRecord = async (recordId, updatedStatusArray) => {
  const response = await axios.patch(`${airtableApiEndpoint}/${recordId}`, {
    fields: {
      'Like/Dislike': updatedStatusArray
    }
  }, {
    headers
  })

  return response.data
}


functions.http('updateRecordStatus', async (req, res) => {
  const { origin } = req.headers;

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

  const { recordId, newStatus, songName } = req.body
  if (!recordId && !songName) {
    return res.status(400).send('please, provide recordId or songName with your request')
  }

  if (!newStatus) {
    return res.status(400).send('please, provide newStatus with your request')
  }

  try {
    const updatedRecord = await updateRecordStatus(recordId, newStatus, songName)
    res.send(updatedRecord)
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      const { status, statusText } = error.response;
      return res.status(status).send(statusText);
    }

    res.send(error);
  }
});
