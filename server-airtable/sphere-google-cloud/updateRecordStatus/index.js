const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
require('dotenv').config()

const { API_KEY } = process.env

let airtableApiEndpoint;

const setApiUrl = ({ baseId, tableId }) => {
  if (!baseId || !tableId) {
    throw new Error('please, provide baseId and tableId with your request')
  }
  
  airtableApiEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`
}

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
};

/**
 *
 * @param (string) recordId
 * @param (string) newStatusSingleValueString (for example, 'Like', 'Dislike')
 */
const updateRecordStatus = async (recordId, newStatusSingleValueString) => {
  const record = await getRecord(recordId);
  const currentStatusArray = record.fields['Like/Dislike'] || []; // because empty 'Like/Dislike' field is undefined by default
  
  if (currentStatusArray.includes(newStatusSingleValueString)) {
    return record;
  }
  
  const updatedStatusArray = [...currentStatusArray, newStatusSingleValueString];
  const response = await patchRecord(recordId, updatedStatusArray);
  
  return response;
}

const getRecord = async (recordId) => {
  const response = await axios.get(`${airtableApiEndpoint}/${recordId}`, {
    headers,
  })
  
  return response.data
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
  if (req.method !== 'POST') return res.status(400).send('only POST method is supported');
  
  try {
    setApiUrl(req.body);
  } catch (error) {
    return res.status(400).send(error.message);
  }
  
  const { recordId, newStatus } = req.body
  if (!recordId || !newStatus) {
    return res.status(400).send('please, provide recordId and a new status (newStatus) with your request')
  }
  
  try {
    const updatedRecord = await updateRecordStatus(recordId, newStatus)
    res.send(updatedRecord)
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      const { status, statusText } = error.response;
      return res.status(status).send(statusText);
    }
    
    res.send(error);
  }
});
