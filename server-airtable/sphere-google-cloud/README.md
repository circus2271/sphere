## google cloud nodejs quickstart

docs:
https://cloud.google.com/functions/docs/create-deploy-gcloud

repo:
https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

how to reload dev server on save:
https://medium.com/google-cloud/hot-reload-node-cloud-functions-64ffdb095a00

example of using superset library for making a get request with query parameters:
https://github.com/ladjs/supertest/blob/master/test/supertest.js#L1255

## deploy command example
```console
gcloud functions deploy getRecords --gen2 --runtime=nodejs18 --regi
on=europe-central2 --source=. --entry-point=getRecords --trigger-http --allow-unauthenticated
````

pattern:

```console
gcloud functions deploy nodejs-http-function \
--gen2 \
--runtime=nodejs18 \
--region=REGION \
--source=. \
--entry-point=helloGET \
--trigger-http \
--allow-unauthenticated
```
