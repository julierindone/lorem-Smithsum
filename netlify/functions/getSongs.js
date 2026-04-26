import { load } from 'cheerio';
import fetch from 'node-fetch';

export async function handler () {
	console.log("Function started")

	try {
		const songListUrl = 'https://songmeanings.com/artist/view/songs/464/'

		// make the request to the external website from the Netlify function
		const response = await fetch(songListUrl);
		console.log("Status:", response.status);
		console.log("Headers:", JSON.stringify([...response.headers]))

		const rawHtml = await response.text();
		console.log("HTML length:", rawHtml.length);
		console.log("First 500 chars:", rawHtml.substring(0, 500))
		const songList = []
		console.log('songList', songList)

		const $ = load(rawHtml)

		// get song IDs from rows with songslist class & push to array
		$('#songslist tr').each((i, elem) => {
			const songId = $(elem).attr('id');

			songList.push(songId)
		})

		// Add Access Control to headers & return songList array
		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "Content-Type"
			},
			body: JSON.stringify({
				message: "Data scraped successfully!",
				songList: songList
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
			body: JSON.stringify({ error: "getSongs failed to scrape data." })
		};
	}
}
