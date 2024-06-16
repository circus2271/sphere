const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
require('dotenv').config()

const storage = new Storage();

const {
  PERSONAL_ACCESS_TOKEN,
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
const headers = {
  'Authorization': `Bearer ${PERSONAL_ACCESS_TOKEN}`,
};

/**
 * Get signed URL function ny chatGPT
 * This function generates a signed URL for a specified file in your Google Cloud Storage.
 * options: Configurations for creating the signed URL.
 version: Specifies which version of the signed URL system to use. 'v4' is the latest version as of last update.
 action: The type of action you want to allow on the object. 'read' means users can read/download the object.
 expires: The time after which the signed URL will be invalid. Here, it's set to 15 minutes after the URL is generated.
 */
// const getSignedUrl = async (filePath) => {
//   const options = {
//     version: 'v4',
//     action: 'read',
//     expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days (7 * 24 hours)
//   };
//   const fullFilePath = `musiclibrary/${filePath}`;
//   const [url] = await storage.bucket('sphere-bucket').file(fullFilePath).getSignedUrl(options);
//
//   return url;
// };

/**
 * Get all records with "Playing" and without "Dislike" status
 * ("Playing" && !"Dislike")
 */
const getRecords = async () => {
  const allRecords = [];
  let _offset;

  // airtable has limit 5 requests per second
  // so if we need to make 5'th
  // let counter = 1
  let counter = 0
  let summary = 0
  do {
    counter++
    summary++

    if (counter === 5) {
      // wait a sec and reset a counter
      console.log('waiting for timer to reset..')
      await new Promise(resolve => {
        setTimeout(() => resolve(), 1000)
      })

      counter = 1
    }

    console.log('counter', counter)

    const response = await axios.get(`${airtableApiEndpoint}`, {
      headers,
      params: {
        offset: _offset ? _offset : '',
        // how to filter data by multiple keys (in airtable)
        // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#3_more_than_one_filter
        
        // how to check if value contains in a field
        // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#4_search_filter_contains_value_in_cell_column
        filterByFormula: `AND({Status}='Playing', FIND('Dislike',{Like/Dislike})=0)`,
        sort: [{field: 'Times repeated', direction: 'asc'}]
      }
    });

    const { records, offset } = response.data;
    allRecords.push(...records);
    _offset = offset;
  } while (_offset);
  console.log('requests total:', summary)
  return allRecords;
}

/**
 * Get records with signed URLs by chatGPT
 *  * Retrieve records from the data source and generate a signed URL for each record based on the 'Name' column.
 * This signed URL will point to a file in Google Cloud Storage and will be valid for 15 minutes.
 * @returns {Promise<Array>} - A promise that resolves to an array of records, each enhanced with a 'signedUrl' field
 */
// const getRecordsWithSignedUrls = async () => {
//   const records = await getRecords();
//   const recordsWithUrls = records.map(async record => {
//     const name = record.fields.Name; // assuming "fields" contains your columns and "Name" is one of them
//     try {
//       const url = await getSignedUrl(name);
//       return {
//         ...record,
//         signedUrl: url,
//       };
//     }
//     catch (error) {
//       console.error("Error generating signed URL: ", error);
//       throw new Error(`Failed to generate signed URL for ${name}: ${error.message}`);
//     }
//   });
//   return Promise.all(recordsWithUrls);
// };

// playlist from info table (playlists that are assumed to send to a client)
const getDesiredPlaylists = async () => {
  const params = {
    // how to filter data by multiple keys (in airtable)
    // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#3_more_than_one_filter
  
    // how to check if value contains in a field
    // https://help.landbot.io/article/ngr9wef0b4-how-to-make-the-most-of-advanced-filters-filter-by-formula-airtable-block#4_search_filter_contains_value_in_cell_column
      
    // Status === 'Active' && !Status['Archived']
    filterByFormula: `AND({Status}='Active', FIND('Archived', Status)=0)`,
    view: 'Grid view'
  }

  const get = async (params) => {
    return await axios.get(airtableApiEndpoint, {
      headers,
      params
    });
  }

  let response = await get(params)
    .catch(async () => {
      // retry request without 'view' sorting paramenter (the name of a view, from where to get sorting order)
      // it can happen if response status starts not from 2xx (for example, there will be an error if status is 400 or 422)
      delete params.view
      return await get(params)
    })

  const { records } = response.data
  return records
}

// https://airtable.com/developers/web/api/get-base-schema
const getAllTables = async () => {
  const response = await axios.get(baseTablesApiEndpoint, { headers })
  const data = response.data
  const tables = data.tables
  // const existingTableNames = tables.map(table => table.name)
  
  // console.log('tables', existingTableNames)
  // return existingTableNames
  return tables
}

functions.http('getRecordsFromCdn', async (req, res) => {
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
      const [desiredPlaylists, existingTables] = await Promise.all([
        getDesiredPlaylists(),
        getAllTables()
      ])
      
      // if playlist is in info table && if playlist has its own table
      const existingPlaylists = desiredPlaylists.filter(playlist => {
        const playlistName = playlist.fields['Name'];
        const tableExists = existingTables.find(table => table.name === playlistName)
        
        return tableExists
      })
      
      // add playlist id from table to a playlist
      const playlistsWithTableIds = existingPlaylists.map(playlist => {
        const playlistName = playlist.fields['Name']
        const relatedTable = existingTables.find(table => table.name === playlistName)
        
        playlist.tableId = relatedTable.id
        return playlist
      })
      
      // console.log('ip',playlists)
      // console.log('etn',existingTableNames)
      // console.log('epl',existingPlaylists)
  
      // return res.send(existingPlaylists)
      return res.send(playlistsWithTableIds)
    }
    
    // const records = await getRecords();
    
    // doesn't have tests
    // const recordsWithUrls = await getRecordsWithSignedUrls();
    const records = await getRecords();
    res.send(records);
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      const { status, statusText } = error.response;
      return res.status(status).send(statusText);
    }
    
    res.send(error);
  }
});

