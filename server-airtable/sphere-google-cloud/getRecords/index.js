const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
require('dotenv').config()

const { API_KEY, ALLOWED_ORIGIN } = process.env

let airtableApiEndpoint;

const setApiUrl = ({baseId, tableId}) => {
  if (!baseId || !tableId) {
    throw new Error('please, provide baseId and tableId with your request');
  }
  
  airtableApiEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`
}

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
};

/**
 * Get all records with "Playing" and without "Dislike" status
 * ("Playing" && !"Dislike")
 */
const getRecords = async () => {
  const allRecords = [];
  let _offset;
  
  do {
    const response = await axios.get(`${airtableApiEndpoint}`, {
      headers,
      params: {
        offset: _offset ? _offset : '',
        // how to filter data by multiple keys (in airtable)
        // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#3_more_than_one_filter
        
        // how to check if value contains in a field
        // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#4_search_filter_contains_value_in_cell_column
        filterByFormula: `AND({Status}='Playing', FIND('Dislike',{Like/Dislike})=0)`
      }
    });
  
    const { records, offset } = response.data;
    allRecords.push(...records);
    _offset = offset;
  } while (_offset);
  
  return allRecords;
}


const getAvailablePlaylists = async () => {
  const response = await axios.get(airtableApiEndpoint, {
    headers,
    params: {
      // how to filter data by multiple keys (in airtable)
      // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#3_more_than_one_filter
  
      // how to check if value contains in a field
      // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#4_search_filter_contains_value_in_cell_column
      
      // Status === 'Active' && !Status['Archived']
      filterByFormula: `AND({Status}='Active', FIND('Archived', Status)=0)`
    }
  });
  
  const { records } = response.data;
  return records;
}

functions.http('getRecords', async (req, res) => {
  // https://cloud.google.com/functions/docs/samples/functions-http-cors
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'GET') return res.status(400).send('only GET and OPTIONS HTTP request methods are supported');
  
  try {
    setApiUrl(req.query);
  } catch (error) {
     return res.status(400).send(error.message);
  }
  
  try {
    if (req.query.tableId === 'Info') {
      const playlists = await getAvailablePlaylists()
      return res.send(playlists)
    }
    
    const records = await getRecords();
    res.send(records)
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      const { status, statusText } = error.response;
      return res.status(status).send(statusText);
    }
    
    res.send(error);
  }
});

