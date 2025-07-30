const wordCountForm = document.getElementById('word-count-form')
const wordCountInputEl = document.getElementById('word-count-input')
const generateSmithsumBtnEl = document.getElementById('generate-smithsum-btn')
const lyricsBoxEl = document.getElementById('lyrics-box')
const errorMessageEl = document.getElementById('error-message')
const copyBtnEl = document.getElementById('copy-btn')

let lyrics = ''
let numWordsToGet = ''
let songList = []
let songToGet = ''
let songWordCount = ''
let rawLyrics = ''
let songTitle = ''

// Get list of all songs by the Smiths as soon as the page loads
document.addEventListener("DOMContentLoaded", async () => {
	await getSongList();
})

// Clear input and related error messages upon focus on word count input box 
wordCountInputEl.addEventListener('focus', () => {
	clearInput()
})

wordCountForm.addEventListener('submit', (event) => {
	event.preventDefault()
	numWordsToGet = getWordCountInputEl()
	// if there are non-digits, too many words, or the number is 0...
	if (/\D/.test(numWordsToGet) || numWordsToGet > 5000 || numWordsToGet === 0) {
		errorMessageEl.innerHTML = "<p>Please enter a number between 1 and 5000.</p>"
	}
	else {
		generateLoremSmithsum()
	}
})

copyBtnEl.addEventListener('click', copyLyricsToClipboard)

async function generateLoremSmithsum() {
	try {
		resetLyrics() // reset word count and clears previously set of lyrics

		do {
			await getLyrics()  // get lyrics from source
			formatLyrics()  // format for display
		}
		while (numWordsToGet > songWordCount);

		displayLyrics()  // display final lyrics in UI
	}
	catch (err) {
		console.log(err)
	}
}

function getWordCountInputEl() {
	// clear/hide any existing lyrics and copy button
	lyricsBoxEl.innerHTML = ''
	copyBtnEl.style.display = 'none';

	return Number(wordCountInputEl.value.trim())
}

function clearInput() {
	errorMessageEl.innerHTML = ''
	wordCountInputEl.value = ''
}

function displayLyrics() {
	lyricsBoxEl.style.display = "unset";
	copyBtnEl.style.display = "unset";

	const lyricsEl = document.createElement("p")  // create lyrics element
	lyricsEl.id = 'lyrics-el'

	lyricsEl.innerHTML = lyrics  // insert content

	// remove lyrics generated from a previous button click
	document.getElementById('lyrics-el') ? lyricsBoxEl.removeChild(lyricsEl) : null

	lyricsBoxEl.appendChild(lyricsEl)  // add element to the div
}

function copyLyricsToClipboard() {
	let copiedLyrics = document.getElementById('lyrics-el')
	navigator.clipboard.writeText(copiedLyrics.textContent)
	alert("lorem smithsum has been copied to your clipboard.")
}

async function getSongList() {
	const response = await fetch('/.netlify/functions/getSongs')

	// get array of IDs (songList) from getSongs server function
	const result = await response.json()
	if (response.ok) {
		songList = result.songList
		console.log(`songList response ok`);
	} else {
		console.error("Error from function:", result.error);
	}
}

async function getLyrics() {
	songToGet = pickSongId()  // Get random songId from list
	const songUrl = `https://songmeanings.com/songs/view/${songToGet}/`

	// get raw string of songToGet's lyrics
	const response = await fetch(`/.netlify/functions/fetchLyrics?songUrl=${songUrl}`)
	const result = await response.json()
	if (response.ok) {
		songTitle = result.songTitle
		rawLyrics = result.rawLyrics
		console.log(`fetchLyrics response ok`);
	} else {
		console.error("Error from fetchLyrics function:", result.error)
	}

	// TODO: Would be more efficient for this to be checked and re-called in the server function, but get it working first.
	if (rawLyrics.length < 50) {  //  filter out instrumentals
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
	let formattedLyrics = rawLyrics.replace(tagRegEx, '. ').replace(spaceFix, '. ').replace(punctuationFix, "$1")
	let formattedLyricsArray = formattedLyrics.split(' ').slice(0, numWordsToGet);

	songWordCount += formattedLyrics.length
	lyrics += " " + formattedLyricsArray.join(' ')
}

function resetLyrics() {
	songWordCount = 0;
	lyrics = '';
	lyricsBoxEl.style.display = "none";
	copyBtnEl.style.display = "none";
}
