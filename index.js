// import axios from 'axios'
// import { load } from 'cheerio'

import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm'
import { load } from 'https://cdn.jsdelivr.net/npm/cheerio@1.1.0/+esm'

const wordCountInputEl = document.getElementById('word-count-input')
const generateSmithsumBtnEl = document.getElementById('generate-smithsum-btm')
const lyricsBoxEl = document.getElementById('lyrics-box')
const errorMessageEl = document.getElementById('error-message')
const copyBtnEl = document.getElementById('copy-btn')
let numWordsToGet = ''
let songToGet = ''

generateSmithsumBtnEl.addEventListener('click', () => {
	numWordsToGet = Number(wordCountInputEl.value.trim())
	// console.log(`numWordsToGet: ${numWordsToGet} \ntype is ${typeof numWordsToGet}`);

	if (/\D/.test(numWordsToGet) || numWordsToGet > 300 || numWordsToGet === 0) {
		errorMessageEl.innerHTML = "<p>Please enter a number between 1 and 300.</p>"
		wordCountInputEl.addEventListener('focus', clearerrorMessageEl)
	}
	else {
		generateLoremSmithsum()

		wordCountInputEl.addEventListener('focus', () => {
			wordCountInputEl.value = ''
		})
	}
})

copyBtnEl.addEventListener('click', copyLyricsToClipboard)

// on button click
// NOTE: I'm switching this over to an async function because copilot told me. that way i can 
async function generateLoremSmithsum() {
	try {

		getCorrectwordCountInputEl()

		// Call songList webscraper. Only do this ONCE.
		const songList = await getSongList();

		// Do/While loop
		//DO: get a random song Id. harvest its lyrics, and convert to songList array.
		let indexToGet = Math.floor(Math.random(0, songList.length) * songList.length)
			songToGet = songList[indexToGet]
			console.log(`songToGet after await: ` + songToGet)


		// WHILE: the actual wordcount is <  numWordsToGet
	

		// Strip unneeded tags; convert string to array; count words. 

				// If numwordstoget < array.length, grab that number of words and display. if it's greater, call  getSongList again. 
				// PROBLEM: is this going to fuck up the async stuff? I think some of this definitely needs to be moved out of the generateLoremSmithsum() function.

			// TODO: Decide on lyrics formatting - how do I want the lyrics to look? remove breaks, possibly punctuation.

			// TODO: Convert string to array

			// Display lyricsWrapper box
			lyricsBoxEl.classList.replace('empty-lyrics-box', 'lyrics-box')
			copyBtnEl.classList.replace('empty-lyrics-box', 'copy-btn')

		// TEMPORARY: DISPLAY ID # for songList[0]
			// Insert lyrics
			displayLyrics(songToGet) // This stays synchronous! (Within the order of the function, I guess.)
	}
	catch (err) {
		console.log(err)
	}
}

// This needs a better name but it'll work for now.
function getCorrectwordCountInputEl() {
	numWordsToGet = wordCountInputEl.value
	console.log(`getCorrectwordCountInputEl() function.
		number of words to get: ${numWordsToGet}`);

	// TODO: THE PROBLEM: numWordsToGet is reset to '' in clearerrorMessageEl, but then that creates an endless loop. How to make it wait until it gets new input from user? or maybe the validation should be in a sep step? i know i've done this before....
	////////////// TODO: ** IS THIS PROBLEM STILL HAPPENING? CANT REMEMBER. Check it out.

	// Clear any existing content
	lyricsBoxEl.innerHTML = ''
	// numWordsToGet = ''
	// console.log("Getting # words: " + numWordsToGet);

	return numWordsToGet
}

function clearerrorMessageEl() {
	errorMessageEl.innerHTML = ''
	wordCountInputEl.value = ''
	lyricsBoxEl.textContent = ''
}

function displayLyrics(songToGet) {
	// console.log(`word count is ${numWordsToGet}`);
	console.log(`displayLyrics() function called.`);
	console.log("songToGet is " + songToGet)
	console.log(`word count is ${numWordsToGet}`);

	const lyricsEl = document.createElement("p")
	lyricsEl.id = 'lyrics-el'
	let testLyrics = "girlfriend in a coma i know, i know, it's serious. there were times when I could've murdered her."

	// passing songToGet is temporary! It'll only be used to get that song's yrics
	lyricsEl.innerHTML = songToGet + ":&ensp;" + testLyrics


	// I need to have the previously generated lyrics cleared out, which means removing the appended paragraph before running this line again.
	document.getElementById('lyrics-el') ? "there is at least one testLyrics element." : "no testLyrics element exists."
	// lyricsBoxEl.removeChild(lyricsEl)
	lyricsBoxEl.appendChild(lyricsEl)
}

// It doesn't seem to matter if this is async or not.
async function copyLyricsToClipboard() {
	console.log(`copyLyricsToClipboard() function`);

	let copiedLyrics = document.getElementById('lyrics-el')

	navigator.clipboard.writeText(copiedLyrics.textContent)
}

async function getSongList() {
	console.log(`inside song:istURL()`);

	const songListUrl = 'https://songmeanings.com/artist/view/songs/464/'
	//  get data from axios
	const { data } = await axios.get(songListUrl)
	// pass data to cheerio
	let $ = load(data)
	// declare arrayOfSongIds variable
	const arrayOfSongIds = []
	// Loop through needed data (songs) & push to array
	$('#songslist tr').each((i, elem) => {
		// get ID of each song
		const songId = $(elem).attr('id');

		// add song-id to arrayOfSongIds array
		arrayOfSongIds.push(songId);
	})
	return arrayOfSongIds;
}


// how i was using getSongList() before converting generateLorumSmithsum() into async:
// getSongList().then(songList => {
// 	songResult = songList[0]
// 	console.log(`songResult inside generateLoremSmithsum (inside the then function): ${songResult}`)
// 	return songResult
// }
