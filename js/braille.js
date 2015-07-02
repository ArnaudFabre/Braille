
var pushed = 0; // Touch are all released
var empty = true; // If no letter is ready to be added
var refresh_rate = 500;

var voices = []; // Available voices
var lang = false; // A voice has been found
var speaking = false; // Can not speak while speaking
var speak_type = 1; // 0 is when no speak is allowed, 1 read letter when entering letter and wprd when space is hitted, 2 read word when new letter is added
var forbidden = true; // false if all letters are accepted, true if only alphanum

/******* Cell ********/
var cell = [0, 0, 0, 0, 0, 0]; // Braille Cell

var key_config = 0;
var keys = [
	[70, 68, 83, 74, 75, 76], // AZERTY Classic
	[71, 70, 68, 74, 75, 76], // Modified keyboard 1 
];

// Cell is a 6 dot array, so a 2^6 possibilites from 0 to 63
// -1 : does not exist
// -2 : Number
// -3 : Uppercase
// -4 : end of version
var braille_fr = [' ', 'a', ',', 'b', "'", 'k', ';', 'l', -1, 'c', 'i', 'f', ' ', 'm', 's', 'p', -1, 'e', ':', 'h', '*', 'o', '!', 'r', -1, 'd', 'j', 'g', -4, 'n', 't', 'q',
                  -2, 'â', '?', 'ê', '-', 'u', '(', 'v', -3, 'î', 'œ', 'ë', -1, 'x', 'è', 'ç', -1, 'û', '.', 'ü', ')', 'z', '"', 'à', -1, 'ô', 'w', 'ï', -5, 'y', 'ù', 'é'
];
var current_braille = braille_fr;

function setAlphabet() {
    var dico = current_braille.map(function (l) {
        if (typeof l != 'number') return l;
        else return '';
    }).sort();
    if (forbidden) {
        dico = dico.map(function (l) {
            if (isalnum(l))
                return l;
        });
    }
    dico = dico.join(' ');
    $('#alphabet').html(dico);
    $('#braille_alphabet').html(dico.replace(/\s+/g, ''));
}

setAlphabet();

function isalnum(c) {
    if (typeof c == 'number')
        return false;

    if (c == 'é') // Force é
        return true;
    var code = c.charCodeAt(0);

    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
    }
    return true;
}

/** Return the character corresponding to the braille cell */
function get(c) {
    var n = cell[0] + 2 * cell[1] + 4 * cell[2] + 8 * cell[3] + 16 * cell[4] + 32 * cell[5];
    var l = current_braille[n];
    if (forbidden && !isalnum(l))
        l = -1;
    return l;
}

/** Speech Synthesis */
function speak(str) {

    if (!speak_type || str.empty || (str.length == 1 && str[0] == ' '))
        return;

    if (speaking) {
        speaking = false;
        window.speechSynthesis.cancel();
    }
    var msg = new SpeechSynthesisUtterance(str);

    if (!lang) {
        voices = window.speechSynthesis.getVoices();
        if (voices.length)
            lang = true;
    }
    if (voices.length) {
        msg.voice = voices.filter(function (voice) {
            return voice.name == 'Google Français';
        })[0];
    }
    msg.onstart = function () {
        speaking = true;
    }
    msg.onstop = function () {
        speaking = false;
    }
    window.speechSynthesis.speak(msg);
}

/** Set the correct letter */
function setLetter() {
    var l = get(cell);
    if (typeof l !== 'number') {
        $('#letter').html(l);
        empty = false;
        return true;
    }
    return false;
}

/** Reset or add letter to word if it valid */
function validate() {
    if (pushed == 0 && !empty) {
        var l = get(cell);
        if (typeof l !== 'number') {
            $('#word').append(l);
            $('#braille').append(l);
        }
        cell = [0, 0, 0, 0, 0, 0];
        empty = true;
        $('#letter').empty();
        if (speak_type == 2) {
            speak($('#word').html());
        } else {
            if (speak_type == 1)
                speak(l);
        }
    }
    setTimeout(validate, refresh_rate);
}
setTimeout(validate, refresh_rate);

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
    kbd.bind('touchstart mousedown', function (evt) {
        evt.preventDefault();
        $(this).css('background-color', 'orange');
        cell[value - 1] = 1;
        setLetter();
        empty = false;
        pushed++;
    });
    kbd.bind('touchend mouseup', function (evt) {
        evt.preventDefault();
        $(this).css('background-color', 'transparent');
        setTimeout(function () {
            error(value);
        }, refresh_rate / 2);
        pushed--;
    });
    return kbd;
}

/** What happens when selecting space */
function space() {
    var word = $('#word').html();
    console.log(word);
    if (word.length && word[word.length - 1] != ' ') {
        $('#word').append(' ');
        $('#braille').append(' ');
        $('#letter').empty();
    }
    if (speak_type)
        speak($('#word').html());
    cell = [0, 0, 0, 0, 0, 0];
    empty = true;
}

/** Reset function */
function reset() {
    var word = $('#word').html();
    if (!word.length)
        return;
    $('#letter').empty();
    $('#word').empty();
    $('#braille').empty();
    cell = [0, 0, 0, 0, 0, 0];
    empty = true;
    pushed = 0;
    // window.speechSynthesis.cancel();
    speak('remise à zéro');
}

/** Backspace hitted */
function backspace() {
    $('#word').html($('#word').html().slice(0, -1));
    $('#braille').html($('#word').html());
    speak("supprimer");
}

/** Init app controls */
function control() {
    $('#control').bind('touchend mouseup', function (evt) {
        reset();
    });
    $('#space').bind('touchend mouseup', function (evt) {
        space();
    });
    $('#backspace').bind('touchend mouseup', function (evt) {
        backspace();
    });
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
}

function unActivateDot(dot) {
    if (!setLetter())
        cell[dot] = 0;
}

/** Keyboard */
$(document).keydown(function (e) {
    console.log(e.which);
    var i = keys[key_config].indexOf(e.which);
    console.log(i);

    if (i != -1) {
        activateDot(i);
    }
    console.log(cell);
});

$(document).keyup(function (e) {
    console.log(e.which);
    var i = keys[key_config].indexOf(e.which);
    console.log(i);

    if (i != -1) {
        unActivateDot(i);
    }

	// Modified keyboard specific
    if (e.which == 222) {
        backspace();
    }
    console.log(cell);
});


jwerty.key('a', reset); // French keyboard
jwerty.key('q', reset); // English keyboard
jwerty.key('m', backspace);
jwerty.key('space', space);

jwerty.key('0', function () {
    forbidden = !forbidden;
    setAlphabet();
    speak('Alphanumérique');
});
jwerty.key('1', function () {
    if (speak_type == 2)
        speak('Se taire');
    speak_type = ++speak_type % 3;
    if (speak_type == 1)
        speak('Lire les lettres et les mots');
    else
        speak('Lire la phrase');
});
jwerty.key('2', function () {
    key_config = ++key_config%keys.length;

	UpdateInfo();
    speak('Config clavier ' + (key_config + 1));
});

function UpdateInfo () {
	$('#cell').html(keys[key_config].map(function (a) {
		return String.fromCharCode(a);
	}).join(' '));

	$('#keys').html("Raz : a ou q, Espace, Supprimer : m");
	
	$('#config').html("1 : changer la lecture, 0 : changer l'alphabet, 2: changer la configuration des touches");

	if ('speechSynthesis' in window) {
		$('#tts').html('activée');
		voices = window.speechSynthesis.getVoices();
		voices = window.speechSynthesis.getVoices();
	} else {
		$('#tts').html('non activée');
	}
}

UpdateInfo();


$('#letter').focus();
