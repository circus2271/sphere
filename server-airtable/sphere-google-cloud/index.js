'use strict';

// [START functions_helloworld_get]
const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
require('dotenv').config()

const {
  API_KEY,
  BASE_ID,
  TABLE_ID,
} = process.env

const AIRTABLE_TABLE_API_ENDPOINT = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
};

/**
 *
 * @param (string) filterString (e.g. 'Playing', 'Like', 'Disliked')
 */
const getFilteredRecords = async (filterString) => {
  const allRecords = [];
  let _offset;
  
  do {
    const response = await axios.get(`${AIRTABLE_TABLE_API_ENDPOINT}`, {
      headers,
      params: {
        offset: _offset ? _offset : '',
        // how to filter data by key (in airtable)
        // https://help.landbot.io/article/75ax4g3ogr-11-different-ways-to-get-and-filter-data-from-airtable#2_one_fixed_filter
        filterByFormula: `SEARCH("${filterString}",{Status})`
      }
    });
    
    const { records, offset } = response.data;
    // console.log('offset', offset)
    allRecords.push(...records);
    _offset = offset;
  } while (_offset);
  return allRecords;
}

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
  const response = await axios.get(`${AIRTABLE_TABLE_API_ENDPOINT}/${recordId}`, {
    headers,
  })
  
  return response.data
}

const patchRecord = async (recordId, updatedStatusArray) => {
  const response = await axios.patch(`${AIRTABLE_TABLE_API_ENDPOINT}/${recordId}`, {
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
const autorun = async () => {
  // return;
  const RECORD_ID = 'rec7th1mbahsx1BdT'
  
  console.log('autorun function start')
  try {
    await updateRecordStatus(RECORD_ID, 'Playing')
    // try {
    //   const response = await getRecord(RECORD_ID);
    //   console.log('getRecord() response data:', response)
    // try {
    //   const response = await patchRecord(RECORD_ID, ['Disliked', 'Playing']);
    //   console.log('patchRecord() response data:', response)
    // try {
    // const records = await getFilteredRecords('L');
    // console.log(records);
    // console.log(records.length);
  } catch (error) {
    // console.error(error);
    const errorStatus = error.response?.status;
    const errorStatusText = error.response?.statusText;
    
    if (errorStatus && errorStatusText) {
      console.error(`${errorStatus}: ${errorStatusText}`);
    }
  }
};

//
// module.exports = {
//   getFilteredRecords,
//   updateRecordStatus,
//   autorun,
// }


// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
functions.http('helloGET', (req, res) => {
  
  // res.send('Hello World from sphere 12!');
  console.log('method:', req.method)
  console.log('query:', req.query)
  console.log('aa', JSON.stringify(req.params.q))
  res.send(JSON.stringify(req.params.q));
});
// [END functions_helloworld_get]
// functions.http('sphere-airtable-gatewahy', (req, res) => {
//
//   // res.send('Hello World from sphere 12!');
//   res.send(JSON.stringify(req.params.q));
// });
functions.http('getFilteredRecords', async (req, res) => {
  const status = req.query.status;
  
  console.log("status query:", status, typeof status)

  if (!status) {
    // console.warn('early return')
    // console.warn('provide status query to get filtered records')
    // console.warn('e.g. /?status=Playing')
    return res.send('early return');
  }
  
  const filteredRecords = await getFilteredRecords(status)
  console.log('filteredRecords length:', filteredRecords.length)
  res.send(filteredRecords)
});
