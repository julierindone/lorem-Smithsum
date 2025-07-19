import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm'
import { load } from 'https://cdn.jsdelivr.net/npm/cheerio@1.1.0/+esm'

const wordCountInputEl = document.getElementById('word-count-input')
const generateSmithsumBtnEl = document.getElementById('generate-smithsum-btn')
const lyricsBoxEl = document.getElementById('lyrics-box')
const errorMessageEl = document.getElementById('error-message')
const copyBtnEl = document.getElementById('copy-btn')

let formattedLyrics = ''
let numWordsToGet = ''
let songList = []
let songToGet = ''
let songWordCount = ''
let rawLyrics = ''

// Get list of all songs by the Smiths as soon as the page loads
document.addEventListener("DOMContentLoaded", async () => {
	await getSongList();
})

// Clear input and related error messages upon focus on word count input box 
wordCountInputEl.addEventListener('focus', () => {
		clearInput()
})

generateSmithsumBtnEl.addEventListener('click', () => {
	numWordsToGet = getWordCountInputEl()
	// if there are non-digits, too many words, or the number is 0...
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
		await getLyrics()  // get lyrics from source

		formatLyrics()  // format for display

		displayLyrics()  // display lyrics in UI
	}
	catch (err) {
		console.log(err)
	}
}

function getWordCountInputEl() {
	// clear/hide any existing lyrics and copy button
	lyricsBoxEl.innerHTML = ''
	copyBtnEl.classList.replace('copy-btn', 'hidden-element')

	return Number(wordCountInputEl.value.trim())
}

function clearInput() {
	errorMessageEl.innerHTML = ''
	wordCountInputEl.value = ''
}

function displayLyrics() {
	// display lyricsWrapper box
	lyricsBoxEl.classList.replace('hidden-element', 'lyrics-box')
	copyBtnEl.classList.replace('hidden-element', 'copy-btn')

	// Create lyrics element
	const lyricsEl = document.createElement("p")
	lyricsEl.id = 'lyrics-el'

	lyricsEl.innerHTML = formattedLyrics  // insert content

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

	// Loop through needed data (songs) & push to array
	$('#songslist tr').each((i, elem) => {
		// get ID of each song
		const songId = $(elem).attr('id');
		// add songId to arrayOfSongIds array
		songList.push(songId);
	})
}

async function getLyrics() { 
	songToGet = pickSongId()  // Get random songId from list
	const songUrl = `https://songmeanings.com/songs/view/${songToGet}/`
	const { data } = await axios.get(songUrl) //  get data from axios
	const $ = load(data) // load data into cheerio
	rawLyrics = $('div.none').html() //convert into usable text	
	
	//  filter out instrumentals
	if (rawLyrics.length < 50) {
		await getLyrics()  // call getLyrics() again.
	}
}

function pickSongId() {
	let indexToGet = Math.floor(Math.random(0, songList.length) * songList.length)
	return (songList[indexToGet]).substring(6)
}

function formatLyrics() {
	const tagRegEx = /(\s<br|<br|<div|<\/div)[^>]*>/g
	const spaceFix = /(\.\s){2,}/g
	const punctuationFix = /\s?([:?])"?\.?/g
	
	formattedLyrics = rawLyrics.replace(tagRegEx, '. ').replace(spaceFix, '. ').replace(punctuationFix, "$1")

	return formattedLyrics
}
