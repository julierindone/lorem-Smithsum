import { load } from 'cheerio';
import fetch from 'node-fetch';

// export async function handler(songUrl) {
export async function handler(event) {
	const { songUrl } = event.queryStringParameters
	try {
		// make the request to the external website from the Netlify function
		const response = await fetch(songUrl);
		const rawHtml = await response.text();

		const $ = load(rawHtml)

		//convert into usable text
		let songTitle = $('title').text();
		let rawLyrics = $('div.none').html();

		// Add Access Control to headers & return rawLyrics string
		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "Content-Type"
			},
			body: JSON.stringify({
				message: "Data scraped successfully!",
				rawLyrics: rawLyrics,
				songTitle: songTitle
			})
		}
	}
	catch (error) {
		console.error("Scraping error:", error);
		return {
			statusCode: 500,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "Content-Type"
			},
			body: JSON.stringify({ error: "fetchLyrics failed to scrape data." })
		};
	}
}
