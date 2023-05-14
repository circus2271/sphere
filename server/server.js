const cors = require('cors')
const src = require('./serverless/src/')
const express = require('express')
const {
  fakeData,
  handle_api_requests,
  sendDataToGoogleSheets,
} = src;


const app = express()
const port = 3000

// parse application/json
// app.use(bodyParser.json())
app.use(express.json());

// allow cross-origin requests to pass
app.use(cors())

app.get('/testing-route', (req, res) => {
  console.log('request from express.js route')

  sendDataToGoogleSheets(fakeData)
    .then(data => res.send(data))
})

app.post('/test-login', async (req, res) => {
  const testLoginCredentials = [
    {
      login: 'username-test-1',
      password: 'very-strong-password-002'
    }
  ]
  
  const { login, password } = req.body
  const isLoggedIn = testLoginCredentials.filter(
    credentials => credentials.login === login && credentials.password === password
  ).length === 1
  
  res.send('test login route works, isLoggedIn: ' + isLoggedIn)
})


app.post('/sphere-api-middleware', async (req, res) => {
  console.log('sphere-api-middleware')
  
  const usersData = req.body;
  const data = await handle_api_requests(usersData);

  res.send(data);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


// uncomment for testing in a console
// because this function will be executed automatically on each codechange
// sendDataToGoogleSheets(fakeData).then(res => console.log({res}))
// handleApiRequests(fakeData).then(res => console.log({res}))
