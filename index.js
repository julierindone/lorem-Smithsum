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

	const lyricsEl = document.createElement("div")  // create lyrics element
	lyricsEl.id = 'lyrics-el'

	lyricsEl.innerHTML = `${lyrics}</p>`  // insert content; add ending p tag

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
	console.log(`\nsongTitle: ${songTitle}\n rawLyrics: \n${rawLyrics}\n-------------------\n`)

	// TODO: SIMPLIFY THIS ENTIRE FUMCTION.

	const musicNoteFix = /\s*\(♫\)|\(&#127925;\)|\(&#x266B;\)|\(&#9835;\)\s*/g
	const extraSpaceRemoval = /\s(\<|"?[:?.,!]+)/g // Removes extra spaces before tags and punctuation
	const startTags = /^\s*<.[^>]*>/
	const verseChorusVerse = /(<br><div class="empty-line"><br><\/div>)(<br>)?(<div class="empty-line"><br><\/div>)?/g
	const breakTag = /\<br\/?\>\s*/g
	const paraEndComma = /,\*?\s?%\s*/g
	const paraEndPunctuation = /([:;.,"'!?]+)\*?\s?%\s*/g
	const paraNeedsPeriod = /([:;.,"'!?]*)\*?\s?%\s*/g // Para needs end punctuation
	const linePunctuation = /([:;.,"'!?]+)\*?\*\s*/g
	const lineNeedsComma = /([:;.,"'!?]*)\*?\*\s*/g // Line needs punctuation 
	const reorderPunctuation = /(["'])([:;.,!,!?])/g
	const endTags = /\<(p|br)\>$/g
	const decapitalize = /,\s*([[A-Z]--I])/vg
	let paragraphs = []

	//  1: Get rid of any music symbols & blank lines at start
	let junkRemoval = rawLyrics.replace(extraSpaceRemoval, '$1').replace(musicNoteFix, '');
	do {
		junkRemoval = junkRemoval.replace(startTags, '');
	} while (startTags.test(junkRemoval));

	// 2. Split between verses, then format into paragraphs of varying sizes
	let noDivs = junkRemoval.replace(verseChorusVerse, '@@@').split('@@@')
	let newPara = ''
	let paraLength = 2
	do {
		if (paraLength === 2) {
			newPara = noDivs[0] + '* ' + noDivs[1] + '%</p><p>'
			noDivs.splice(0, 2)
			paraLength = 3
		}
		else {
			newPara = noDivs[0] + '* ' + noDivs[1] + '* ' + noDivs[2] + '%</p><p>'
			noDivs.splice(0, 3)
			// console.log("paraLength = 3. NewPara:\n" + newPara)
			paraLength = 2
		}
		paragraphs.push(newPara)
	} while (noDivs.length > 4)
	let lastPara = noDivs.join('* ') + '%</p><p>'
	paragraphs.push(lastPara)

	// console.log(`paragraphs: \n${paragraphs}\n-------------------\n`);

	// 3. Replace single line break tags temporarily with a *
	let noBreakTags = paragraphs.join('').replace(breakTag, '* ');
	// console.log(`noBreakTags: \n ${noBreakTags} \n-------------------\n`);

	// 4a. Add/replace punctuation where needed	
	let crudeFormatting = noBreakTags.replace(paraEndComma, '.').replace(paraEndPunctuation, '$1').replace(paraNeedsPeriod, '.').replace(linePunctuation, '$1 ').replace(lineNeedsComma, ', ')
	// console.log(`crudeFormatting: \n ${crudeFormatting} \n-------------------\n`);

	// 4b: Refine formatting: reorder backwards punctuation, fix casing after commas, Remove unneeded tags at end
	let formattedLyrics = crudeFormatting.replace(reorderPunctuation, "$2$1").replace(endTags, '').replace(decapitalize, (match, c1) => { return `, ${c1.toLowerCase()}` })

	// 5. Cut off formattedLyrics at desired # of words
	let formattedLyricsArray = formattedLyrics.split(' ');

	// console.log(`numWordsToGet: ${numWordsToGet}\nsongWordCount: ${songWordCount}\nDifference: ${numWordsToGet - songWordCount}`);

	if ((numWordsToGet - songWordCount) < formattedLyricsArray.length) {
		// If fewer words than are in song are still needed, slice the words to meet that need.
		console.log(`numWordsToGet: ${numWordsToGet}\nsongWordCount: ${songWordCount}\nDifference: ${numWordsToGet - songWordCount}`);
		formattedLyricsArray = formattedLyricsArray.slice(0, numWordsToGet - songWordCount);
	}
	songWordCount += formattedLyricsArray.length;
	console.log(`songWordCount is now ${songWordCount}\n`);

	// 6. Add final paragraph tags
	lyrics += `<p>${formattedLyricsArray.join(' ')}`;
	console.log(`lyrics: \n ${lyrics} \n-------------------\n`);
}

function resetLyrics() {
	songWordCount = 0;
	lyrics = '';
	lyricsBoxEl.style.display = "none";
	copyBtnEl.style.display = "none";
}
