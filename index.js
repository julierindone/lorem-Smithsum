// import axios from 'axios'
// import { load } from 'cheerio'

import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm'
import { load } from 'https://cdn.jsdelivr.net/npm/cheerio@1.1.0/+esm'

const wordCountInputEl = document.getElementById('word-count-input')
const generateSmithsumBtnEl = document.getElementById('generate-smithsum-btm')
const resultsWrapperEl = document.getElementById('results-wrapper')
const errorMessageEl = document.getElementById('error-message')
const copyBtnEl = document.getElementById('copy-btn')
let numWordsToGet = ''
let songResult = ''

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
		songResult = songList[indexToGet]
		console.log(`songResult after await:`)
		console.log(songResult)


		// WHILE: the actual wordcount is <  numWordsToGet
	

		// Strip unneeded tags; convert string to array; count words. 

				// If numwordstoget < array.length, grab that number of words and display. if it's greater, call  getSongList again. 
				// PROBLEM: is this going to fuck up the async stuff? I think some of this definitely needs to be moved out of the generateLoremSmithsum() function.

		// TODO: Decide on results formatting - how do I want the lyrics to look? remove breaks, possibly punctuation.

		// TODO: Convert string to 

		// Display results box
		resultsWrapperEl.classList.replace('empty-results-wrapper', 'results-wrapper')
		copyBtnEl.classList.replace('empty-results-wrapper', 'copy-btn')

		// TEMPORARY: DISPLAY ID # for songList[0]
		// Insert results
		displayLyrics(songResult) // This stays synchronous! (Within the order of the function, I guess.)
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
	resultsWrapperEl.innerHTML = ''
	// numWordsToGet = ''
	// console.log("Getting # words: " + numWordsToGet);

	return numWordsToGet
}

function clearerrorMessageEl() {
	errorMessageEl.innerHTML = ''
	wordCountInputEl.value = ''
	resultsWrapperEl.textContent = ''
}

function displayLyrics(songResult) {
	// console.log(`word count is ${numWordsToGet}`);
	console.log(`displayLyrics() function called.`);
	console.log("songResult is " + songResult)

	const lyricsEl = document.createElement("p")
	lyricsEl.id = 'lyrics-el'
	let lyrics = "girlfriend in a coma i know, i know, it's serious. there were times when I could've murdered her."

	// passing songResult is temporary! It'll only be used to get that song's yrics
	lyricsEl.innerHTML = songResult + ":&ensp;" + lyrics


	// I need to have the previously generated lyrics cleared out, which means removing the appended paragraph before running this line again.
	document.getElementById('lyrics-el') ? "there is at least one lyrics element." : "no lyrics element exists."
	// resultsWrapperEl.removeChild(lyricsEl)
	resultsWrapperEl.appendChild(lyricsEl)
}

// It doesn't seem to matter if this is async or not.
async function copyLyricsToClipboard() {
	console.log(`copyLyricsToClipboard() function`);

	let copiedLyrics = document.getElementById('lyrics-el')

	navigator.clipboard.writeText(copiedLyrics.textContent)
}

async function getSongList() {
	const smithsSongs = 'https://songmeanings.com/artist/view/songs/464/'
	//  get data from axios
	const { data } = await axios.get(smithsSongs)
	// pass data to cheerio
	const $ = load(data)
	// declare results variable
	const results = []
	// Loop through needed data (songs) & push to array
	$('#songslist tr').each((i, elem) => {
		// get ID of each song
		const songId = $(elem).attr('id');

		// add song-id to results array
		results.push(songId);
	})
	return results;
}







// let lyrics = "girlfriend in a coma i know, i know, it's serious. there were times when I could've murdered her.But I'd hate anything to happen to her. No, I don't want to see her.Do you really think she'll pull through? Do you really think she'll pull through ? Let me whisper my last goodbye, I know it's serious. girlfriend in a coma i know, i know, it's serious.there were times when I could've murdered her. But I'd hate anything to happen to her.No, I don't want to see her. Do you really think she'll pull through ? Do you really think she'll pull through? Let me whisper my last goodbye, I know it's serious.girlfriend in a coma i know, i know, it's serious. there were times when I could've murdered her.But I'd hate anything to happen to her."


// how i was using getSongList() before converting generateLorumSmithsum() into async:
// getSongList().then(songList => {
// 	songResult = songList[0]
// 	console.log(`songResult inside generateLoremSmithsum (inside the then function): ${songResult}`)
// 	return songResult
// }
