const fs = require("fs");
const path = require('path');
const nanoid = require('nanoid');
const archiver = require('archiver');

/**
 * https://stackoverflow.com/a/51518100/9675926
 * @param {String} sourceDir: /some/folder/to/compress
 * @param {String} outPath: /path/to/created.zip
 * @returns {Promise}
 */
function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 3 }});
  const stream = fs.createWriteStream(outPath);
  
  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream)
    ;
    
    stream.on('close', () => resolve());
    archive.finalize();
  });
}

const uniqueId = nanoid.customAlphabet('1234567890abcdef', 7)();
const serverlessSrcPath = path.join(__dirname, '../serverless/src/');
const serverlessZipOutputPath = path.join(__dirname, '../serverless/generated-zip/serverless_' + uniqueId + '.zip')
zipDirectory(serverlessSrcPath, serverlessZipOutputPath)
  .then(() => console.log(`Serverless zip is successfully created\n`))