const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
require('dotenv').config()

const {
  PERSONAL_ACCESS_TOKEN,
  ALLOWED_ORIGINS_JSON } = process.env


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
const getRecords = async (airtableApiEndpoint) => {
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
const getDesiredPlaylists = async (airtableApiEndpoint) => {
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
const getAllTables = async (baseTablesApiEndpoint) => {
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

  if (origin) {
    if (allowedOrigins.includes(origin) || origin.startsWith('http://192')) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
  }

  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'GET') return res.status(400).send('only GET and OPTIONS http request methods are supported');

  const { baseId, tableId } = req.query
  if (!baseId || !tableId) {
    return res.status(400).send('please, provide baseId and tableId with your request');
  }

  const airtableApiEndpoint = `https://api.airtable.com/v0/${baseId}/${tableId}`
  const baseTablesApiEndpoint = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`

  try {
    if (req.query.tableId === 'Info') {
      const [desiredPlaylists, existingTables] = await Promise.all([
        // airtable api endpoint points now to the Info table (baseId/Info)
        getDesiredPlaylists(airtableApiEndpoint),
        // get all tables from a base (use special airtable "tables" endpoint
        getAllTables(baseTablesApiEndpoint)
      ])

      // if playlist is in info table && if playlist has its own table
      // (check if a table from Info table actually exists)
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

    // airtableApiEndpoint points now not to Info table, but to some other table with tracks
    const records = await getRecords(airtableApiEndpoint);

    if (req.query.format === '2') {
      return res.send(format(records));
    }

    res.send(records);
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      if (error.response) {
        const { status, statusText } = error.response;
        return res.status(status).send(statusText);
      }

      return res.status(502).send(error.message);
    }

    res.send(error);
  }
});

// Кусок для serverless-функции: Airtable records → плейлист format 2.
// Копируется целиком вниз файла GCF, вызывается так:
//
//   if (req.query.format === '2') {
//       return res.send(format(records));
//   }
//
// place пока не отдаём: в записях Airtable его нет, а откуда он берётся —
// ещё не решено. Добавить обратно — одно поле в возвращаемом объекте.

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Разбирает то, что куратор написал в ячейке дня, в пару строк 'HH:MM'.
 *
 * Принцип: терпимы к тому, что берём — строги к тому, что отдаём.
 * На входе кураторский разнобой, на выходе всегда ровно 'HH:MM'.
 *
 * Возвращает ['HH:MM', 'HH:MM'] либо null, если разобрать не вышло.
 * null — не ошибка выполнения: вызывающий код кладёт запись в warnings
 * и идёт дальше. Одна опечатка не должна ронять весь плейлист.
 */
function parseAirtableInterval(raw) {
  if (!raw || typeof raw !== 'string') return null;

  // Разделитель — дефис, но принимаем и тире, и длинное тире: автозамена
  // на Маке и в iOS превращает дефис в тире сама, а в ячейке '5–20' от
  // '5-20' глазом не отличить. Пустые куски отбрасываем, поэтому '5 - 20',
  // '5-20' и даже '5--20' дают одно и то же.
  const parts = raw.split(/[-–—]/).map(s => s.trim()).filter(Boolean);
  if (parts.length !== 2) return null;

  const toHHMM = (part) => {
    // Минуты не обязательны: '5' — это '05:00'.
    // Точка наравне с двоеточием: '5.30' — обычная запись времени.
    const [h, m = '0'] = part.split(/[:.]/).map(s => s.trim());
    const hh = Number(h), mm = Number(m);

    // Number('') === 0 и Number('9ч') === NaN — обе дыры закрывает
    // проверка на целое. Без неё мусор молча стал бы полуночью.
    if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;

    // 24 допускаем как «конец суток». Больше — уже пирожковый диалект
    // ('26:00'), в кураторской ячейке ему делать нечего.
    if (hh < 0 || hh > 24 || mm < 0 || mm > 59) return null;

    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const start = toHHMM(parts[0]);
  const end = toHHMM(parts[1]);
  return (start && end) ? [start, end] : null;
}

// Имя файла в format 2 — человекочитаемое. В Airtable оно percent-encoded;
// на битой последовательности decodeURIComponent бросает — оставляем как есть.
function decodeName(name) {
  try { return decodeURIComponent(name); } catch { return name; }
}

function format(records) {
  const tracks = [];

  for (const rec of records || []) {
    const f = rec.fields || {};
    if (!f['Full link']) continue; // нечего играть — нечего отдавать

    const schedule = {};
    for (const day of DAYS) {
      const interval = parseAirtableInterval(f[day]);
      // Выпадает только то, что не разобралось ('', '9ч-20', '9-25'):
      // в format 2 отсутствие дня значит «в этот день не звучит».
      // Нулевое окно '0-0' — не мусор, а кураторская запись, и мы отдаём
      // её как есть, ['00:00','00:00']; что она значит, решает плеер.
      if (!interval) continue;
      schedule[day.toLowerCase()] = interval;
    }

    const attachment = Array.isArray(f.audio) ? f.audio[0] : null;
    tracks.push({
      recordId: rec.id,
      fileName: decodeName(attachment?.filename || f['Full link'].split('/').pop().split('?')[0]),
      url: f['Full link'],
      schedule,
    });
  }

  return { format: 2, generatedAt: new Date().toISOString(), tracks };
}

