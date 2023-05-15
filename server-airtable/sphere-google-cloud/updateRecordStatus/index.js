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

// test function to run on each code change
// if server is ready
// const autorun = async () => {
//   // return;
//   const RECORD_ID = 'rec7th1mbahsx1BdT'
//
//   console.log('autorun function start')
//   try {
//     await updateRecordStatus(RECORD_ID, 'Playing')
//     // try {
//     //   const response = await getRecord(RECORD_ID);
//     //   console.log('getRecord() response data:', response)
//     // try {
//     //   const response = await patchRecord(RECORD_ID, ['Disliked', 'Playing']);
//     //   console.log('patchRecord() response data:', response)
//     // try {
//     // const records = await getFilteredRecords('L');
//     // console.log(records);
//     // console.log(records.length);
//   } catch (error) {
//     // console.error(error);
//     const errorStatus = error.response?.status;
//     const errorStatusText = error.response?.statusText;
//
//     if (errorStatus && errorStatusText) {
//       console.error(`${errorStatus}: ${errorStatusText}`);
//     }
//   }
// };


// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
// functions.http('helloGET', (req, res) => {
//   res.send('Hello World! 11');
// });


functions.http('getRecords', async (req, res) => {
  const status = req.query.status;
  const records = await getRecords(status);
  
  res.send(records)
});
