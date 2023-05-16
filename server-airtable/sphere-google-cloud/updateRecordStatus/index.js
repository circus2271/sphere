const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
require('dotenv').config()

const {
  API_KEY,
  BASE_ID,
  TABLE_ID,
} = process.env

const AIRTABLE_API_ENDPOINT = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
};

/**
 *
 * @param (string) recordId
 * @param (string) newStatusSingleValueString (e.g. 'Playing', 'Like', 'Dislike')
 */
const updateRecordStatus = async (recordId, newStatusSingleValueString) => {
  const record = await getRecord(recordId);
  const currentStatusArray = record.fields.Status || []; // because empty Status is undefined by default
  
  if (currentStatusArray.includes(newStatusSingleValueString)) {
    return;
  }
  
  const updatedStatusArray = [...currentStatusArray, newStatusSingleValueString];
  const response = await patchRecord(recordId, updatedStatusArray);
  
  return response;
}

const getRecord = async (recordId) => {
  const response = await axios.get(`${AIRTABLE_API_ENDPOINT}/${recordId}`, {
    headers,
  })
  
  return response.data
}

const patchRecord = async (recordId, updatedStatusArray) => {
  const response = await axios.patch(`${AIRTABLE_API_ENDPOINT}/${recordId}`, {
    fields: {
      Status: updatedStatusArray
    }
  }, {
    headers
  })
  
  return response.data
}


functions.http('updateRecordStatus', async (req, res) => {
  const { recordId, newStatus } = req.body
  const updatedRecord = await updateRecordStatus(recordId, newStatus)
  
  res.send(updatedRecord)
});
