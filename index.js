import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm'
import { load } from 'https://cdn.jsdelivr.net/npm/cheerio@1.1.0/+esm'

const wordCountInputEl = document.getElementById('word-count-input')
const generateSmithsumBtnEl = document.getElementById('generate-smithsum-btn')
const lyricsBoxEl = document.getElementById('lyrics-box')
const errorMessageEl = document.getElementById('error-message')
const copyBtnEl = document.getElementById('copy-btn')
let numWordsToGet = ''
let songToGet = ''
let songWordCount = ''

wordCountInputEl.addEventListener('focus', () => {
		clearInput()
})

generateSmithsumBtnEl.addEventListener('click', () => {
	getWordCountInputEl()
	// if there are non-digits, too many words, or  the number is 0...
	if (/\D/.test(numWordsToGet) || numWordsToGet > 500 || numWordsToGet === 0) {
		errorMessageEl.innerHTML = "<p>Please enter a number between 1 and 900.</p>"
	}
	else {
		generateLoremSmithsum()
	}
})

copyBtnEl.addEventListener('click', copyLyricsToClipboard)

async function generateLoremSmithsum() {
	try {
		getWordCountInputEl()

		// TODO: Add provision for more than one song to be used AFTER i get the rest working
			// Do/While loop should work.
		// DO: get a random song Id. harvest its lyrics.
		// do {

		// Call songList webscraper. Only do this ONCE.
		const songList = await getSongList();

		// Get random songId from list
		let indexToGet = Math.floor(Math.random(0, songList.length) * songList.length)
		songToGet = (songList[indexToGet]).substring(6)

		// Get lyrics from site; filter out junk

		// WATCH: Once I'm adding more lyrics I might need to declare the variable globally.
		let lyrics = await getLyrics(songToGet)

		// TODO: If numwordstoget < array.length, grab that number of words and display. 
		// If it's greater, call getSongList again. 

			// Display lyricsWrapper box
		lyricsBoxEl.classList.replace('hidden-element', 'lyrics-box')
		copyBtnEl.classList.replace('hidden-element', 'copy-btn')

			// Insert lyrics
		displayLyrics(lyrics) // This stays synchronous!
	}
	catch (err) {
		console.log(err)
	}
}

function getWordCountInputEl() {
	numWordsToGet = Number(wordCountInputEl.value.trim())

	// Clear any existing content
	lyricsBoxEl.innerHTML = ''
	copyBtnEl.classList.replace('copy-btn', 'hidden-element')

	return numWordsToGet
}

function clearInput() {
	errorMessageEl.innerHTML = ''
	wordCountInputEl.value = ''
}

function displayLyrics(lyrics) {
	console.log(`displayLyrics() function called.`);
	console.log("songToGet is " + songToGet)
	console.log(`word count is ${numWordsToGet}`);

	const lyricsEl = document.createElement("p")
	lyricsEl.id = 'lyrics-el'

	lyricsEl.innerHTML = lyrics

	// Remove lyrics generated from a previous button click
	document.getElementById('lyrics-el') ? lyricsBoxEl.removeChild(lyricsEl) : null

	lyricsBoxEl.appendChild(lyricsEl)
}

function copyLyricsToClipboard() {
	let copiedLyrics = document.getElementById('lyrics-el')
	navigator.clipboard.writeText(copiedLyrics.textContent)
	alert("lorem smithsum has been copied to your clipboard.")
}

async function getSongList() {
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
		// add songId to arrayOfSongIds array
		arrayOfSongIds.push(songId);
	})
	return arrayOfSongIds;
}

async function getLyrics(songToGet) {
	const songUrl = `https://songmeanings.com/songs/view/${songToGet}/`
	const { data } = await axios.get(songUrl) //  get data from axios
	const $ = load(data) // load data into cheerio
	const rawLyrics = $('div.none').html() //convert into usable text
	
	return formatLyrics(rawLyrics)
}

function formatLyrics(rawLyrics) {
	const tagRegEx = /(\s<br|<br|<div|<\/div)[^>]*>/g
	const spaceFix = /(\.\s){2,}/g
	const punctuationFix = /\s?([:?])"?\.?/g
	
	let formattedLyrics = rawLyrics.replace(tagRegEx, '. ').replace(spaceFix, '. ').replace(punctuationFix, "$1")

	songWordCount = formattedLyrics.split(' ').length

	return formattedLyrics
}
