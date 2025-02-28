/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// also some information about workers is available here:
  // https://developers.cloudflare.com/workers/get-started/guide/


const basePath = 'https://europe-central2-sphere-385104.cloudfunctions.net'


export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)
		const { pathname, search } = url

		switch (url.pathname) {
			case('/login'):
			case('/getRecordsFromCdn'):
			case('/updateRecordStatus'):
			case('/updateSongStats'):
				const newUrl = basePath + pathname + search

				return await fetch(newUrl, request)
			default:
				return new Response(`api route didn't match, try eiter '/login', '/getRecordsFromCdn', '/updateRecordStatus' or '/updateSongStats'`)
		}
	},
};
