const wordCountForm = document.getElementById('word-count-form')
const wordCountInputEl = document.getElementById('word-count-input')
const generateSmithsumBtnEl = document.getElementById('generate-smithsum-btn')
const lyricsBoxEl = document.getElementById('lyrics-box')
const errorMessageEl = document.getElementById('error-message')
const copyBtnEl = document.getElementById('copy-btn')

let lyrics = ''
let numWordsToGet = ''
let songList = []
let songWordCount = 0
let rawLyrics = ''

// // // // // // // // // // //  EVENT LISTENERS  // // // // // // // // // // // 

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
	numWordsToGet = Number(wordCountInputEl.value.trim())
	// if there are non-digits, too many words, or the number is 0...
	if (/\D/.test(numWordsToGet) || numWordsToGet > 5000 || numWordsToGet === 0) {
		errorMessageEl.innerHTML = "<p>Please enter a number between 1 and 5000.</p>"
	}
	else {
		generateLoremSmithsum()
	}
})

copyBtnEl.addEventListener('click', copyLyricsToClipboard)

// // // // // // // // // // //  GENERATE & DISPLAY CONTENT  // // // // // // // // // // // 

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

function displayLyrics() {
	const lyricsEl = document.createElement("div")  // create lyrics element
	lyricsEl.id = 'lyrics-el'
	lyricsEl.innerHTML = assembleLyrics();
	lyricsBoxEl.appendChild(lyricsEl)  // add element to the div
	toggleDisplayState("block")
}

// // // // // // // // // // //  DATA SERVICE FUNCTIONS   // // // // // // // // // // // 

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
let songToGet = pickSongId(songList)  // Get random songId from list
	const songUrl = `https://songmeanings.com/songs/view/${songToGet}/`

	// get raw string of songToGet's lyrics
	const response = await fetch(`/.netlify/functions/fetchLyrics?songUrl=${songUrl}`)
	const result = await response.json()
	if (response.ok) {
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

function copyLyricsToClipboard() {
	let copiedLyrics = document.getElementById('lyrics-el')
	navigator.clipboard.writeText(copiedLyrics.textContent)
	alert("lorem smithsum has been copied to your clipboard.")
}

// // // // // // // // // // //   FORMATTING FUNCTIONS   // // // // // // // // // // // 

// TODO: SIMPLIFY THIS ENTIRE FUNCTION, and probably break out paragraphFormatting and lineFormatting into separate functions

function formatLyrics() {
	const musicNoteFix = /\s*\(♫\)|\(&#x266B;\)|\(&#9835;\)\s*/g  // Remove music notes
	const extraSpaceRemoval = /\s(\<|"?[:?.,!]+)/g // Remove extra spaces before tags and punctuation
	const removeStartTags = /^\s*<.[^>]*>/  // Remove any tags or spaces found at start
	const verseChorusVerse = /(<br><div class="empty-line"><br><\/div>)(<br>)?(<div class="empty-line"><br><\/div>)?/g
	// Remove string of tags creating verse breaks
	const breakTag = /\<br\/?\>\s*/g

	// Format ends of paragraphs
	const removeStarFromParaEnd = /\*\s(%)/g  // Removes stars, leaves percents
	const paraEndCommaToPeriod = /\s?,("?)%/g  // Change commas at ends of paras to periods
	const paraEndPunctuation = /\s?([:;.!?]+)(["']?)%\s*/g  //Clear spaces etc from ends of paragraphs with other punctuation
	const paraNeedsPeriod = /(?<![.!?"'])(["']?)%/g  // If no other punctuation, add period.
	
	// Format sentences
	const linePunctuation = /(["']?[:;.,!?]+['"]?)\*\s*/g  // Trim stars and spacing from lines with punctuation.
	const lineNeedsComma = /(?<![:;.,"'!?"'])(["']?)\*\s*/g  // Trim stars & adds commas to lines needing punctuation 	// TODO try deleting the second star.
	const reorderPunctuation = /(["'])([:;.,!,!?])/g  // Flip backwards quotes/punctuation marks
	const decapitalize = /([,']+)\s([A-Z]{1}[a-z])/g  // Decapitalize words after commas
	const removeEndTags = /\<(p|br)\>$/g  // Removes extra break or p tags after last paragraph
	let paragraphs = []

	//  1: Get rid of any music symbols & blank lines at start
	let junkRemoval = rawLyrics.replace(extraSpaceRemoval, '$1').replace(musicNoteFix, '');
	do {
		junkRemoval = junkRemoval.replace(removeStartTags, '');
	} while (removeStartTags.test(junkRemoval));

	// 2. Split between verses, then format into paragraphs of varying sizes
	let noDivs = junkRemoval.replace(verseChorusVerse, '@').split('@')
	let newPara = ''
	let paraLength = 2

	// switch back and forth between creating 2-sentence and 3-sentence paragraphs
	if (noDivs.length > 1) {   // prevents song from going through loop if there aren't separate verses
		do {
			if (paraLength === 2) {
				newPara = noDivs[0] + '* ' + noDivs[1] + '%</p><p>'
				noDivs.splice(0, 2)
				paraLength = 3
				paragraphs.push(newPara)
			}
			else if (paraLength === 3) {
				newPara = noDivs[0] + '* ' + noDivs[1] + '* ' + noDivs[2] + '%</p><p>'
				noDivs.splice(0, 3)
				paraLength = 2
				paragraphs.push(newPara)
			}
		}
		while (noDivs.length > 3)
	}
	if (noDivs.length >= 1) {
		let lastPara = noDivs.join('* ') + '%</p><p>'
		paragraphs.push(lastPara)
	}

	// 3. Replace single line break tags temporarily with a *
	let noBreakTags = paragraphs.join('').replace(breakTag, '* ');

	// 4a. Format paragraphs
	let paragraphFormatting = noBreakTags.replace(removeStarFromParaEnd, "$1").replace(paraEndCommaToPeriod, ".$1").replace(paraEndPunctuation, '$1$2').replace(paraNeedsPeriod, ".$1")

	let lineFormatting = paragraphFormatting.replace(linePunctuation, '$1 ').replace(lineNeedsComma, ',$1 ').replace(reorderPunctuation, "$2$1").replace(decapitalize, (match, c1, c2) => { return `${c1} ${c2.toLowerCase()}` });

	// 4b: Refine formatting: reorder backwards punctuation, fix casing after commas, Remove unneeded tags at end
	let formattedLyrics = lineFormatting.replace(removeEndTags, '');

	// 5. Cut off formattedLyrics at desired # of words
	let formattedLyricsArray = formattedLyrics.split(' ');

	let wordsStillNeeded = numWordsToGet - songWordCount
	if (wordsStillNeeded <= formattedLyricsArray.length - 10) {
		// If fewer words than are in song are still needed, slice the words to meet that need.
		formattedLyricsArray = formattedLyricsArray.slice(0, wordsStillNeeded);
	}
	songWordCount += formattedLyricsArray.length;

	// 6. Add tag to first paragraph
	lyrics += `<p>${formattedLyricsArray.join(' ')}`;
}

// function formatParagraphs() {

// }

// function formatLines() {

// }

// Do last bits of formatting on entire lyrics string. 
function assembleLyrics() {
	let endPunctuation = /([:;,!?]*)(["'])?$/
	let needsCapitalLetter = /(\<p\>)(\.{3,})?\s?([a-z])/g

	// Add ending p tag and end punctuation to last sentence if needed. Ensure all paragraphs start with a capital letter.
	lyrics = lyrics.replace(endPunctuation, '...</p>').replace(needsCapitalLetter, (match, c1, c2, c3) => {
		return `${c1}${c2}${c3.toUpperCase}`
	})
	return lyrics
}

// // // // // // // // // // // //  HELPER FUNCTIONS   // // // // // // // // // // // //

function toggleDisplayState(displayState) {
	lyricsBoxEl.style.display = displayState;
	copyBtnEl.style.display = displayState;
}

function clearInput() {
	errorMessageEl.innerHTML = ''
	wordCountInputEl.value = ''
}

function resetLyrics() {
	songWordCount = 0;
	lyrics = '';
	lyricsBoxEl.innerHTML = ''
	toggleDisplayState("none")
}

function pickSongId(songList) {
	let indexToGet = Math.floor(Math.random(0, songList.length) * songList.length)
	return (songList[indexToGet]).substring(6)
}
