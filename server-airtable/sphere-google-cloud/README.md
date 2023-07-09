## google cloud nodejs quickstart

docs:
https://cloud.google.com/functions/docs/create-deploy-gcloud

repo:
https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

example of using "supertest" testing library for making a get request with query parameters:
https://www.npmjs.com/package/supertest
or https://github.com/ladjs/supertest/blob/master/test/supertest.js#L1255

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

## about coldstarts
https://mikhail.io/serverless/coldstarts/gcp/
