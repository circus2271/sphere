## google cloud nodejs quickstart

docs:
https://cloud.google.com/functions/docs/create-deploy-gcloud

repo:
https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

how to reload dev server on save:
https://medium.com/google-cloud/hot-reload-node-cloud-functions-64ffdb095a00

## how to test deployed function
send POST request to a function url with a recordId and a newStatus payload

example:

```console
curl -d 'recordId=rec7th1mbahsx1BdT&newStatus=Like' https://updaterecordstatus-pxkzcjm4rqblablabla-lm.a.run.app/
``````
