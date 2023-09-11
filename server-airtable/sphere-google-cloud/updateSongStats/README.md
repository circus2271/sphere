POST

params: recordId, skipped (true, false), tableId, baseId


for local development:
```console
npm run watch
````

for testing:
```console
curl -d 'baseId=app62dBMf9YymVsdKP6&tableId=tblNcLkREyImjfpdf9I&recordId=recLqdfLmLoIRrYbzeD&skipped=true' localhost:8084
```

skipped:
```console
curl -d 'baseId=app62dBMf9YymVsdKP6&tableId=tblNcLkREyImjfpdf9I&recordId=recLqdfLmLoIRrYbzeD&skipped=true' localhost:8084
``````
