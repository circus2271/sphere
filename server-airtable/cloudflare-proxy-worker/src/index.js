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

const loginApiEndpoint = `${basePath}/login`
const getRecordsApiEndpoint = `${basePath}/getRecordsFromCdn` // info + tracks
const updateRecordApiEndpoint = `${basePath}/updateRecordStatus`
const updateSongStatsApiEndpoint = `${basePath}/updateSongStats`


export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)
		const pathname = url.pathname
		const searchParams = url.search

		let endpoint;

		switch (pathname) {
			case('/login'):
				endpoint = loginApiEndpoint
				break
			case('/getRecordsFromCdn'):
				endpoint = getRecordsApiEndpoint
				break
			case('/updateRecordStatus'):
				endpoint = updateRecordApiEndpoint
				break
			case('/updateSongStats'):
				endpoint = updateSongStatsApiEndpoint
				break
		}

		if (!endpoint) {
			return new Response(`api route didn't match, try eiter '/login', '/getRecordsFromCdn', '/updateRecordStatus' or '/updateSongStats'`)
		}

		endpoint += searchParams

		// proxy this request with different url and same options
		return await fetch(endpoint, request)
	},
};
