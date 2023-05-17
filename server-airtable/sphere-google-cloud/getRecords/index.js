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
 * Get all records with "Playing" and without "Disliked" status
 * ("Playing" && !"Disliked")
 */
const getRecords = async () => {
  const allRecords = [];
  let _offset;
  
  do {
    const response = await axios.get(`${AIRTABLE_API_ENDPOINT}`, {
      headers,
      params: {
        offset: _offset ? _offset : '',
        // how to filter data by multiple keys (in airtable)
        // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#3_more_than_one_filter
        filterByFormula: `AND({Status}='Playing', NOT({Status}='Disliked'))`
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
  
  try {
    const records = await getRecords();
    res.send(records)
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      const { status, statusText } = error.response;
      res.status(status).send(statusText);
      
      return;
    }
    
    res.send(error);
  }
});
