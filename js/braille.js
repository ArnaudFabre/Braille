var BrailleCell = (function (map) {

    var NONE = 0;
    var EXP = -1; // Exposant
    var SIGN = -2; // Sign prefix
    var MAJ = -3; // Upper Case
    var CUR = -4; // Currency prefix
    var NUM = -5; // number prefix
    var ING = -6; // ing
    var LET = -7; // letter prefix
    var IT = -8; // Italique

    var prefix = NONE;
    var first = false;
    var mapping;

    var rational_fr = {
        '’': "'",
        '«': '"',
        '»': '"'
    };

    var braille_fr = [
    ' ', 'a', ',', 'b', "'", 'k', ';', ['l', NONE, NONE, '£'], EXP, 'c',
    'i', 'f', ['/', '/'], 'm', ['s', NONE, NONE, '$'], 'p', SIGN, ['e', NONE, NONE, '€'], [':', ':'], 'h',
    ['*', '*'], 'o', ['!', '+'], 'r', CUR, 'd', 'j', 'g', '@', 'n',
    't', 'q', NUM, ['â', '1'], '?', ['ê', '2'], '-', 'u', '(', 'v',
    MAJ, ['î', '3'], ['œ', '9'], ['ë', '6'], [ING, NONE, '%'], ['x', 'x'], 'è', 'ç', LET, ['û', '5'],
    '.', ['ü', '8'], ')', 'z', ['"', '='], 'à', IT, ['ô', '4'], 'w', ['ï', '7'],
    '0', 'y', 'ù', ['é', NONE, '&']
    ];

    var brf = [
    ' ', 'A', '1', 'B', "'", 'K', '2', 'L', '@', 'C', // 10
    'I', 'F', '/', 'M', 'S', 'P', '"', 'E', '3', 'H', // 20
    '9', 'O', '6', 'R', '^', 'D', 'J', 'G', '>', 'N', // 30
    'T', 'Q', ',', '*', '5', '<', '-', 'U', '8', 'V', // 40
    '.', '%', '[', '$', '+', 'X', '!', '&', ';', ':', // 50
    '4', '\\', '0', 'Z', '7', '(', '_', '?', 'W', ']', // 60
    '#', 'Y', ')', '='
    ];

    var cell = [0, 0, 0, 0, 0, 0]; // Braille Cell

    if (mapping) {
        mapping = map;
    } else {
        mapping = braille_fr;
    }

    function getBraille() {
        var b = 0;
        for (var i = 0; i < 6; i++) {
            b += Math.pow(2, i) * cell[i];
        }
        return b;
    }

    function getDots() {
        var p = '';
        switch (prefix) {
        case NUM:
            if (first) {
                p = '6';
            }
            break;
        case MAJ:
            p = '4-6';
            break;
        case CUR:
            p = '4-5';
            break;
        case SIGN:
            p = '5';
            break;
        }
        var d = '';
        for (var i = 0; i < 6; i++) {
            if (cell[i]) {
                if (d !== '')
                    d += '-';
                d += (i + 1);
            }
        }
        if (prefix)
            d = p + ' ' + d;
        if (d === '') {
            return '0';
        }
        return d;
    }

    function getBlack() {
        var n = getBraille();
        var l = mapping[n];
        if (Array.isArray(l)) {
            switch (prefix) {
            case CUR:
                return l[3];
            case SIGN:
                return l[2];
            case NUM:
                return l[1];
            default:
                return l[0];
            }
        }

        switch (prefix) {
        case MAJ:
            return l.toUpperCase();
        }
        return l;
    }

    function getBrf() {
        var n = getBraille();
        switch (prefix) {
        case CUR:
            return '^' + brf[n];
        case SIGN:
            return '"' + brf[n];
        case MAJ:
            return '.' + brf[n];
        case NUM:
            if (!first)
                return brf[n];
            else
                return ',' + brf[n];
        }
        return brf[n];
    }

    function get(type) {
        type = type || 'black';
        switch (type) {
        case 'black':
            return getBlack();
        case 'brf':
            return getBrf();
        case 'braille':
            return getBraille();
        case 'dots':
            return getDots();
        }
    }

    function isNumException(n) {
        return (['x', '*', ':', '/'].indexOf(n) != -1);
    }

    function inCol(char, col) {
        for (var i = 0; i < mapping.length; i++) {
            if (Array.isArray(mapping[i])) {
                if (mapping[i][col] === char) {
                    return true;
                }
            }
        }
        return false;
    }

    function search(char) {
        if (rational_fr[char]) {
            char = rational_fr[char];
        }
        for (var i = 0; i < mapping.length; i++) {
            if (Array.isArray(mapping[i])) {
                for (var j = 0; j < mapping[i].length; j++) {
                    if (mapping[i][j] === char) {
                        return i;
                    }
                }
            } else {
                if (mapping[i] === char) {
                    return i;
                }
            }
        }

        return undefined;
    }

    function set(dot, value) {
        if (typeof dot === 'number') {
            cell[dot] = value;
        } else
        if (typeof dot === 'string') {
            var rest, letter = dot[0];
            first = false;
            if (dot[0].toUpperCase() === dot[0] && dot[0] !== dot[0].toLowerCase()) {
                // Detect Upper Case
                prefix = MAJ;
                letter = dot[0].toLowerCase();
            } else {
                // Detect number
                var nan = false;
                if (inCol(dot[0], 1)) {
                    if (prefix === NUM) {
                        first = false;
                    } else {
                        first = true;
                        if (isNumException(dot[0])) {
                            nan = true;
                            first = false;
                        }
                    }
                    if (nan) {
                        prefix = NONE;
                    } else {
                        prefix = NUM;
                    }
                } else if (inCol(dot[0], 2)) {
                    prefix = SIGN;
                } else if (inCol(dot[0], 3)) {
                    prefix = CUR;
                } else {
                    prefix = NONE;
                }
            }
            rest = search(letter);
            for (var i = 5; i >= 0; i--) {
                cell[i] = Math.floor(rest / Math.pow(2, i));
                rest = rest - cell[i] * Math.pow(2, i);
            }
        } else if (Array.isArray(dot)) {
            for (var i = 0; i < 6; i++) {
                cell[i] = dot[i];
            }
        }
        return this;
    }

    function reset() {
        for (var i = 0; i < 6; i++) {
            this.cell[i] = 0;
        }
    }

    return {
        get: get,
        set: set,
        reset: reset,
    };
});

var cell = [0, 0, 0, 0, 0, 0]; // Braille Cell

var pushed = 0; // Touch are all released
var empty = true; // If no letter is ready to be added
var refresh_rate = 500;

var voices = []; // Available voices
var lang = false; // A voice has been found
var speaking = false; // Can not speak while speaking

var speak_type = 1; // 0 is when no speak is allowed, 1 read letter when entering letter and word when space is hitted, 2 read word when new letter is added
var forbidden = true; // false if all letters are accepted, true if only alphanum

var keys_old = [71, 70, 68, 74, 75, 76]; // Cell keys
var keys_new = [70, 68, 83, 74, 75, 76]; // Cell keys
var keys = keys_new;

var shortcuts = "Perkins :" + keys.map(function (a) {
    return String.fromCharCode(a);
}).join(' ') + ", Raz : a ou q, Espace, Supprimer : m, 1 : changer la lecture, 0 : changer l'alphabet";

var questions_fr = {
    question_mode: false,
    name: 'Nathan',
    current: 0,
    max: 3,
    enonce: ['s il te plait écris coucou', 'maintenant écris babar', 'dis moi ou habites tu ?'],
    indice: ['c o u c o u', 'b a b a r '],
    resultat: ['coucou', 'babar', 'gries'],
    begin: function (name) {
        name = name || this.name;
        this.current = 0;
        this.temps = [];
        this.temps.push(new Date());
        speak('Hey ' + name + ', on joue à un jeu, réponds aux questions. Appuie sur la touche la plus à gauche pour entendre la question. Appuie sur espace pour valider ta réponse');
    },
    parse: function (text) {
        // remove arrays
        this.enonce.length = 0;
        this.indice.length = 0;
        this.resultat.length = 0;

        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test($("#fileUpload").val().toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = (function (myData) {
                    var that = myData;

                    return function (e) {
                        var table = $("<table />");
                        var rows = e.target.result.split("\n");
                        for (var i = 0; i < rows.length; i++) {
                            var row = $("<tr />");
                            var cells = rows[i].split(",");
                            for (var j = 0; j < cells.length; j++) {
                                var cell = $("<td />");
                                cell.html(cells[j]);
                                row.append(cell);
                                switch (j) {
                                case 0:
                                    that.enonce.push(cells[j]);
                                    break;
                                case 1:
                                    that.indice.push(cells[j]);
                                    break;
                                case 2:
                                    that.resultat.push(cells[j]);
                                    break;
                                }
                            }
                            table.append(row);
                        }
                        $("#exo").html('');
                        $("#exo").append(table);
                        that.essai = that.enonce.map(function (x) {
                            return 1;
                        });
                    }
                })(this);
                reader.readAsText($("#fileUpload")[0].files[0]);
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("Please upload a valid CSV file.");
        }
    },
    repeat: function () {
        speak(this.enonce[this.current]);
    },
    stat: function () {
        var e = this.essai.reduce(function (a, v) {
            var fail = 0;
            if (v == 3)
                fail++;
            return {
                essais: a.essais + v,
                fail: a.fail + fail
            };
        }, {
            essais: 0,
            fail: 0
        });
        if (e.essais - this.enonce.length == 0)
            return 'Bravo tu as fait zéro fautes !';
        else
        if (e.fail)
            return 'ouch, tu as fait ' + e.fail + ' erreurs !';
        else
            return 'Pas mal tu as fini en ' + e.essais + ' essais !';
    },
    next: function (word) {
        console.log(this);
        if (this.resultat[this.current] == word) {
            this.current++;
            this.temps.push(new Date());
            if (this.current >= this.enonce.length) {
                speak(word + ' ' + this.name + ' c fini ' + this.stat());
                this.question_mode = false;
                this.current = 0;
            } else
                speak(word + ' bravo ' + this.enonce[this.current]);
        } else {
            if (this.essai[this.current] == this.max) {
                this.current++;
                this.temps.push(new Date());
                if (this.current >= this.enonce.length) {
                    speak(word + ' ' + this.name + ' c fini ' + this.stat());
                    this.question_mode = false;
                    this.current = 0;
                } else
                    speak(word + " Tu n'as pas réussi, on passe au suivant " + this.enonce[this.current]);
                return reset();
            }

            this.essai[this.current]++;
            if (this.current >= this.enonce.length) {
                speak(word + ' ' + this.name + ' c fini ' + this.stat());
                this.question_mode = false;
                this.current = 0;
            }

            if (word.length)
                speak(' tu as écrit ' + word + ' essaie encore ' + this.indice[this.current]);
            else
                speak(word + ' essaie encore ' + this.indice[this.current]);
        }

        return reset();
    }
};

// Cell is a 6 dot array, so a 2^6 possibilites from 0 to 63
// -1 : does not exist
// -2 : Number
// -3 : Uppercase
// -4 : end of version

var MAJ = -3;

var braille_fr = [
    ' ', 'a', ',', 'b', "'", 'k', ';', 'l', -1, 'c',
    'i', 'f', '/', 'm', 's', 'p', -1, 'e', ':', 'h',
    '*', 'o', '!', 'r', -1, 'd', 'j', 'g', -4, 'n',
    't', 'q', -2, 'â', '?', 'ê', '-', 'u', '(', 'v',
    MAJ, 'î', 'œ', 'ë', -1, 'x', 'è', 'ç', -1, 'û',
    '.', 'ü', ')', 'z', '"', 'à', -1, 'ô', 'w', 'ï',
    -5, 'y', 'ù', 'é'
];

var braille_num = [
    ' ', 'a', ',', 'b', "'", 'k', ';', 'l', -1, 'c',
    'i', 'f', '/', 'm', 's', 'p', -1, 'e', ':', 'h',
    '*', 'o', '!', 'r', -1, 'd', 'j', 'g', -4, 'n',
    't', 'q', '', '1', '?', '2', '-', 'u', '(', 'v',
    MAJ, '3', '9', '6', -1, 'x', 'è', 'ç', -1, '5',
    '.', '8', ')', 'z', '"', 'à', -1, '4', 'w', '7',
    '0', 'y', 'ù', 'é'
];
var current_braille = braille_num;


$('#trans').click(function () {
    var input = $('#input').val();
    $('#output').empty();
    $('#output2').empty();
    var i = 0;
    var count = 0;

    var bc = new BrailleCell();

    var first = true;
    for (i = 0; i < input.length; count++, i++) {



        if (input[i] === '\n') {
            $('#output').append('\n');
            $('#output2').append('</br>');
            count = 0;
            continue;
        } else {
            bc.set(input[i]);
            $('#output').append(bc.get('brf'));
            $('#output2').append(bc.get('dots'));
            $('#output2').append(' ');
        }
        if ((count % 31 === 0 && !first)) {
            $('#output').append('\n');
            $('#output2').append('</br>');

            count = 0;
        }
        first = false;
    }
});

function downloadBRF(args) {
    var data, filename, link;
    var brf = $('#output').html();

    if (brf == null) return;

    filename = args.filename || 'export.brf';

    var contentType = 'text/brf';
    var blob = new Blob([brf], {
        'type': contentType
    });
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

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
    if (!speak_type || !str || str.empty || (str.length == 1 && str[0] == ' '))
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

    if (questions_fr.question_mode) {
        questions_fr.next(word);
        return reset();
    }

    if (speak_type)
        speak(word);

    if (word.length && word[word.length - 1] != ' ') {
        $('#word').append(' ');
        $('#braille').append(' ');
        $('#letter').empty();
    }

    cell = [0, 0, 0, 0, 0, 0];
    empty = true;
}

/** Reset function */
function reset() {
    if (questions_fr.question_mode)
        questions_fr.repeat();

    var word = $('#word').html();
    if (!word.length)
        return;
    $('#full').append('<p class="braille">' + $('#word').html() + '</p><p>' + $('#word').html() + '</p>');
    $('#fulltext').append('<p>' + $('#word').html() + '</p>');
    $('#fullbraille').append('<p>' + $('#word').html() + '</p>');
    $('#letter').empty();
    $('#word').empty();
    $('#braille').empty();
    cell = [0, 0, 0, 0, 0, 0];
    empty = true;
    pushed = 0;
    // window.speechSynthesis.cancel();

    if (!questions_fr.question_mode)
        speak('Ligne suivante');
}

/** Backspace hitted */
function backspace() {
    var word = $('#word').html();
    if (!word.length)
        return;
    word = word.slice(0, -1);
    $('#word').html(word);
    $('#braille').html(word);
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
    var i = keys.indexOf(e.which);
    //    console.log(i);

    if (i != -1) {
        activateDot(i);
    }
    //    console.log(cell);
});

$(document).keyup(function (e) {
    //    console.log(e.which);
    var i = keys.indexOf(e.which);
    //  console.log(i);

    if (i != -1) {
        unActivateDot(i);
    }

    if (e.which == 222) {
        backspace();
    }
    //console.log(cell);
});


jwerty.key('a', reset); // French keyboard
jwerty.key('q', reset); // English keyboard
jwerty.key('m', backspace);
jwerty.key('space', space);

jwerty.key('0', function () {
    forbidden = !forbidden;
    setAlphabet();
    speak('Change lalphabet');
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

function run_exo() {
    questions_fr.question_mode = !questions_fr.question_mode;
    if (questions_fr.question_mode) {
        questions_fr.name = $('#name').val();
        questions_fr.parse($('#questions').val());
        questions_fr.begin();
    }
}

$('#run_exo').click(run_exo);
jwerty.key('z', run_exo);


if ('speechSynthesis' in window) {
    $('#info').html('Synthèse vocale activée - ' + shortcuts);
    voices = window.speechSynthesis.getVoices();
    voices = window.speechSynthesis.getVoices();
    //speak($('#info').html());
} else {
    $('#info').html('Synthèse vocale non activée - ' + shortcuts);
}

$('#letter').focus();
