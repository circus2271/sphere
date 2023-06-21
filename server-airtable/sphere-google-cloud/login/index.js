const functions = require('@google-cloud/functions-framework');
const Firestore = require('@google-cloud/firestore');
const axios = require('axios');
require('dotenv').config()

const {
  ALLOWED_ORIGIN,
  PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS,
  GET_RECORDS_API_ENDPOINT
} = process.env

// const login = 'test1111';
// const login = 'Piñata';
// const password = 'pass';

const db = new Firestore({
  projectId: PROJECT_ID,
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
});

functions.http('login', async (req, res) => {
  // https://cloud.google.com/functions/docs/samples/functions-http-cors
  res.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(400).send('only POST and OPTIONS HTTP request methods are supported');
  
  const { login, password } = req.body
  const userRef = db.collection('users').doc(login);
  const doc = await userRef.get()
  
  
  if (!doc.exists) {
    console.log('No matching documents.');
    return res.send('empty dataset');
  }
  
  const user = doc.data()
  
  if (user.password !== password) {
    // user is not logged in
    // send error to a client
    return res.status(403).send('user is not logged in')
  }
  
  //  user is logged in
  //  send him playlists and a baseId
  const baseId = user.baseId
  const { data: playlists } = await axios(GET_RECORDS_API_ENDPOINT, {
    params: {
      baseId,
      tableId: 'Info' // this table has information about playlists.
    }
  })
  
  // https://getrecords-pxkzcjm4rq-lm.a.run.app/?baseId=app62dBMf9YymVKP6&tableId=tbl886QoG6g0tC9tV
  
  const playlistNames = playlists.map(playlist => playlist.fields['Name'])
  console.log(playlistNames)
  res.send('passw: ' + user.password)
});

