var cell = [0, 0, 0, 0, 0, 0]; // Braille Cell

var pushed = 0; // Touch are all released
var empty = true; // If no letter is ready to be added
var voices = []; // Available voices
var lang = false;   // A voice has been found
var speaking = false; // Can not speak while speaking

var shortcuts = 'Perkins : s d f j k l, Raz : a/q, Espace, Supprimer : m';

// Cell is a 6 dot array, so a 2^6 possibilites from 0 to 63
// -1 : does not exist
// -2 : Number
// -3 : Uppercase
// -4 : end of version
var braille_fr = [' ', 'a', ',', 'b', "'", 'k', ';', 'l', -1, 'c', 'i', 'f', ' ', 'm', 's', 'p', -1, 'e', ':', 'h', '*', 'o', '!', 'r', -1, 'd', 'j', 'g', -4, 'n', 't', 'q',
                  -2, 'â', '?', 'ê', '-', 'u', '(', 'v', -3, 'î', 'œ', 'ë', -1, 'x', 'è', 'ç', -1, 'û', '.', 'ü', ')', 'z', '"', 'à', -1, 'ô', 'w', 'ï', '0', 'y', 'ù', 'é'
];

/** Return the character corresponding to the braille cell */
function get(c) {
  var n = cell[0] + 2 * cell[1] + 4 * cell[2] + 8 * cell[3] + 16 * cell[4] + 32 * cell[5];
  return braille_fr[n];
}

/** Speech Synthesis */
function speak(str) {
    
    if(!str.length)
        return;
    
    if(speaking)
    {
        speaking = false;
        window.speechSynthesis.cancel();
    }
    var msg = new SpeechSynthesisUtterance(str);
    
    if(!lang)
    {
        voices = window.speechSynthesis.getVoices();
        if(voices.length)
            lang = true;
    }
    if(voices.length)
    {
        msg.voice = voices.filter(function(voice) { return voice.name == 'Google Français'; })[0];
    }
    msg.onstart = function() {
        speaking = true;
    }
    msg.onstop = function() {
        speaking = false;
    }
    window.speechSynthesis.speak(msg);
}

/** Set the correct letter */
function setLetter()
{
    var l = get(cell);
	if(typeof l !== 'number')
    {
		$('#letter').html(l);
        empty = false;
    }
}

/** Reset or add letter to word if it valid */
function validate() {
  if (pushed == 0 && !empty) {
    var l = get(cell);
	if(typeof l !== 'number')
		$('#word').append(l);
    speak($('#word').html());
    cell = [0, 0, 0, 0, 0, 0];
    empty = true;
    $('#letter').empty();
  }
  setTimeout(validate, 1000);
}
setTimeout(validate, 1000);

/** Error function if released dot */
function error(value) {
  if (pushed) {
    cell[value - 1] = 0;
    setLetter();
  }
}

/** Initialize touch and mouse event for a virtual keyboard entry */
function init(elem, value) {
  var kbd = $('#' + elem);
  kbd.bind('touchstart mousedown', function(evt) {
    evt.preventDefault();
    $(this).css('background-color', 'orange');
    cell[value - 1] = 1;
    setLetter();
    empty = false;
    pushed++;
  });
  kbd.bind('touchend mouseup', function(evt) {
    evt.preventDefault();
    $(this).css('background-color', 'transparent');  
    setTimeout(function() { error(value); }, 500);
    pushed--;
  });
  return kbd;
}

/** What happens when selecting space */
function space() {
	speak("espace");
	$('#word').append(' ');
	$('#letter').empty();
    cell = [0, 0, 0, 0, 0, 0];
	empty = true;
}

/** Reset function */
function reset() {
	//speak('remise à zéro');    
    $('#letter').empty();
	$('#word').empty();
	cell = [0, 0, 0, 0, 0, 0];
    empty = true;
    window.speechSynthesis.cancel();
}

/** Backspace hitted */
function backspace() {
    $('#word').html($('#word').html().slice(0,-1));
 //   speak("supprimer");
}

/** Init app controls */
function control() {
	$('#control').bind('touchend mouseup', function(evt) { reset(); });
	$('#space').bind('touchend mouseup', function(evt) { space(); });
    $('#backspace').bind('touchend mouseup', function(evt) { backspace(); });
}

init("one", 1);
init("two", 2);
init("three", 3);
init("four", 4);
init("five", 5);
init("six", 6);

control();

/** Activate dot in the braille cell */
function activateDot(dot) {
    cell[dot] = 1;
    setLetter();
}

/** Keyboard shortcuts */
jwerty.key('f', function() { activateDot(0); });
jwerty.key('d', function() { activateDot(1); });
jwerty.key('s', function() { activateDot(2); });
jwerty.key('j', function() { activateDot(3); });
jwerty.key('k', function() { activateDot(4); });
jwerty.key('l', function() { activateDot(5); });

jwerty.key('a', reset);
jwerty.key('q', reset);
jwerty.key('m', backspace);
jwerty.key('space', space);

if ('speechSynthesis' in window) {
  $('#info').html('Synthèse vocale activée - ' + shortcuts);
  voices = window.speechSynthesis.getVoices();
 voices = window.speechSynthesis.getVoices();
    speak($('#info').html());
} else {
  $('#info').html('Synthèse vocale non activée - ' + shortcuts);
}
