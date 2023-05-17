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
 * Get all (or filtered) records from a table
 * @param (string) filterString (e.g. 'Playing', 'Like', 'Disliked')
 */
const getRecords = async (filterString) => {
  const allRecords = [];
  let _offset;
  
  do {
    const response = await axios.get(`${AIRTABLE_API_ENDPOINT}`, {
      headers,
      params: {
        offset: _offset ? _offset : '',
        // how to filter data by key (in airtable)
        // https://help.landbot.io/article/75ax4g3ogr-11-different-ways-to-get-and-filter-data-from-airtable#2_one_fixed_filter
        filterByFormula: `SEARCH("${filterString || ''}",{Status})`
      }
    });
    
    const { records, offset } = response.data;
    // console.log('offset', offset)
    allRecords.push(...records);
    _offset = offset;
  } while (_offset);
  
  return allRecords;
}


functions.http('getRecords', async (req, res) => {
  if (req.method !== 'GET') {
    res.send('only GET method is supported');
    
    return;
  }
  
  const status = req.query.status;
  try {
    const records = await getRecords(status);
    res.send(records)
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      const {status, statusText } = error.response;
      res.status(status).send(statusText);
      
      return;
    }
  
    res.send(error);
  }
});
