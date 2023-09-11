POST

params: recordId, skipped (true, false), tableId, baseId, playlistName


for local development:
```console
npm run watch
````

for testing:
```console
curl -d 'baseId=app62dBMf9YymVsdKP6&tableId=tblNcLkREyImjfpdf9I&recordId=recLqdfLmLoIRrYbzeD&playlistName=test&skipped=true' localhost:8084
```

skipped:
```console
curl -d 'baseId=app62dBMf9YymVsdKP6&tableId=tblNcLkREyImjfpdf9I&recordId=recLqdfLmLoIRrYbzeD&playlistName=test&skipped=true' localhost:8084
``````

deployed url:
https://europe-central2-sphere-385104.cloudfunctions.net/updateSongStats
