const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
require('dotenv').config()

const {
  API_KEY,
  BASE_META__PERSONAL_TOKEN,
  ALLOWED_ORIGINS_JSON } = process.env

let airtableApiEndpoint;
let baseTablesApiEndpoint;

const setApiUrl = ({baseId, tableId}) => {
  if (!baseId || !tableId) {
    throw new Error('please, provide baseId and tableId with your request');
  }
  
  airtableApiEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`
  baseTablesApiEndpoint = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`
}

const allowedOrigins = JSON.parse(ALLOWED_ORIGINS_JSON);
const regularHeaders = {
  'Authorization': `Bearer ${API_KEY}`,
};
const baseMetaHeaders = {
  'Authorization': `Bearer ${BASE_META__PERSONAL_TOKEN}`,
}

/**
 * Get all records with "Playing" and without "Dislike" status
 * ("Playing" && !"Dislike")
 */
const getRecords = async () => {
  const allRecords = [];
  let _offset;
  
  do {
    const response = await axios.get(`${airtableApiEndpoint}`, {
      headers: regularHeaders,
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


// playlist from info table (playlists that are assumed to send to a client)
const getDesiredPlaylists = async () => {
  const response = await axios.get(airtableApiEndpoint, {
    headers: regularHeaders,
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

// https://airtable.com/developers/web/api/get-base-schema
const getAllTableNames = async () => {
  const response = await axios.get(baseTablesApiEndpoint, { headers: baseMetaHeaders })
  const data = response.data
  const tables = data.tables
  const existingTableNames = tables.map(table => table.name)
  
  // console.log('tables', existingTableNames)
  return existingTableNames
}

functions.http('getRecords', async (req, res) => {
  const { origin } = req.headers;
  
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'GET') return res.status(400).send('only GET and OPTIONS http request methods are supported');
  
  try {
    setApiUrl(req.query);
  } catch (error) {
     return res.status(400).send(error.message);
  }
  
  try {
    if (req.query.tableId === 'Info') {
      const [desiredPlaylists, existingTableNames] = await Promise.all([
        getDesiredPlaylists(),
        getAllTableNames()
      ])
      
      // if playlist is in info table && if playlist has its own table
      const existingPlaylists = desiredPlaylists.filter(playlist => {
        const playlistName = playlist.fields['Name'];
        
        return existingTableNames.includes(playlistName)
      })
      
      // console.log('ip',playlists)
      // console.log('etn',existingTableNames)
      // console.log('epl',existingPlaylists)
      
      return res.send(existingPlaylists)
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

