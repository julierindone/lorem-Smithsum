const cheerio = require('cheerio');
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
	try {
		const songListUrl = 'https://songmeanings.com/artist/view/songs/464/'

		// make the request to the external website from the Netlify function
		const response = await fetch(songListUrl);
		const rawHtml = await response.text();
		const songList = []

		const $ = cheerio.load(rawHtml)
		
		$('#songslist tr').each((i, elem) => {
			const songId = $(elem).attr('id');

			songList.push(songId)
		})

		const scrapedContent = {
			songList: songList
		}		

		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "Content-Type"
			},
			body: JSON.stringify({
				message: "Data scraped successfully!",
				scrapedData: scrapedContent
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
			body: JSON.stringify({ error: "Failed to scrape data." })
		};
	}
};
