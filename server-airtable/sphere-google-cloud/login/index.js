const functions = require('@google-cloud/functions-framework');
const Firestore = require('@google-cloud/firestore');
require('dotenv').config()

const {
  ALLOWED_ORIGIN,
  PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS
} = process.env

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
  
  if (!login || !password) {
    return res.status(400).send('request body should contain non-empty login and password')
  }
  
  const userRef = db.collection('users').doc(login);
  const doc = await userRef.get()
  
  if (!doc.exists) {
    return res.status(401).send('user with this login doesn\'t exist')
  }
  
  const user = doc.data()
  
  if (user.password === password) {
    const { baseId } = user;
    
    if (baseId) {
      return res.status(200).send(baseId)
    }
    
    return res.status(404).send('successfully logged in, but there is no baseId to send')
  }
  
  return res.status(401).send('wrong password')
});

