## google cloud nodejs quickstart

docs:
https://cloud.google.com/functions/docs/create-deploy-gcloud

repo:
https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

## how to test deployed function
send POST request to a function url

request should contain baseId, tableId, recordId and a new status (newStatus)

for example:

```console
curl -d 'baseId=app62dBMf9Yy7232bc&tableId=tbl886QoG6abctV&recordId=rec7th1mbahsx1BdT&newStatus=Like' https://updaterecordstatus-pxkzcjm4rqblablabla-lm.a.run.app/
``````

for local testing use local server

install dependencies and start a local server with a npm script:
```console
npm i

npm run watch
```

after server started you can use similar request but to a localhost this time
```console
curl -d 'baseId=app62dBMf9Yy7232bc&tableId=tbl886QoG6abctV&recordId=rec7th1mbahsx1BdT&newStatus=Like' localhost:8084
``````
