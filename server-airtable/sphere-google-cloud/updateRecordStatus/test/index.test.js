// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const assert = require('assert');
const { request } = require('gaxios');
const { exec } = require('child_process');
const waitPort = require('wait-port');
const { URLSearchParams } = require('url')

const startFF = async (target, signature, port) => {
  const ff = exec(
    `npx functions-framework --target=${target} --signature-type=${signature} --port=${port}`
  );
  await waitPort({ host: 'localhost', port });
  return ff;
};

const cleanUp = ffProc => ffProc.kill();

const httpInvocation = (fnUrl, port, query = {}) => {
  const baseUrl = `http://localhost:${port}`;

  // GET request
  return request({
    url: `${baseUrl}/${fnUrl}${queryString}`,
  });
};

describe('index.test.js', () => {
  describe('getRecord', () => {
    const PORT = 8081;
    let ffProc;
    
    before(async () => {
      ffProc = await startFF('getRecord', 'http', PORT);
    });
  
    after(async () => cleanUp(ffProc));
    
    it('getRecord:', async () => {
      const response = await httpInvocation('getRecord', PORT, { status: '' });
      assert.strictEqual(response.data.length, 104);
    })
  })
  
  // describe('patchRecord', () => {
  //   const PORT = 8081;
  //   let ffProc;
  //
  //   before(async () => {
  //     ffProc = await startFF('patchRecord', 'http', PORT);
  //   });
  //
  //   after(() => ffProc.kill());
  //
  //   it('patchRecord:', async () => {
  //     const response = await httpInvocation('patchRecord', PORT, { status: '' });
  //     assert.strictEqual(response.data.length, 104);
  //   })
  // })
  //
  // describe('updateRecordStatus', () => {
  //   const PORT = 8081;
  //   let ffProc;
  //
  //   before(async () => {
  //     ffProc = await startFF('updateRecordStatus', 'http', PORT);
  //   });
  //
  //   after(() => ffProc.kill());
  //
  //   it('getRecords: should return 104 records', async () => {
  //     const response = await httpInvocation('getRecords', PORT, { status: '' });
  //     assert.strictEqual(response.data.length, 104);
  //   })
  // })
})

