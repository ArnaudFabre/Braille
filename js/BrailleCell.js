// An accumulator braille cell easy to use for
// - direct conversion between 
//      + braille number (called braille),
//      + readable braille sign (called dots), 
//      + ascii letters (called black, french by default),
//      + and brf representation
// - format correctly braille signs by remembering the previous cell (easy to format numbers and basic math operations)

var BrailleCell = (function (map) {
    // Identifiers
    // In braille, signification of a cell is determined by the dots enabled 
    // but also by the existence of a prefix that can be deactivated after a blank cell (Braille Number 0)
    var NONE = 0; // No identifier
    var EXP = -1; // Exposant
    var SIGN = -2; // Sign prefix
    var MAJ = -3; // Upper Case prefix
    var CUR = -4; // Currency prefix
    var NUM = -5; // number prefix
    var ING = -6; // ing
    var LET = -7; // letter prefix
    var IT = -8; // Italique

    var prefix = NONE;
    var number_start = {
        first: false,
        last: "",
        reset: function () {
            this.first = false, this.last = ""
        }
    };

    // A dictionary to cure UTF-8 entries
    var rational_fr = {
        '’': "'",
        '«': '"',
        '»': '"',
        'ä': 'à'
    };

    // A french mapping of the letters corresponding to the braille number
    // 0 -> -> no dot
    // 1 -> 2^0 -> dot 1
    // 10 -> 2^3 + 2^1 -> dot 2 and dot 4
    // If an array is stored, it contains the sign corresponding to the given prefix 
    // "NO PREFIX, NUMBER, SIGN, CURRENCY"
    var braille_fr = [
        ' ', 'a', ',', 'b', "'", 'k', ';', ['l', NONE, NONE, '£'], EXP, 'c',
        'i', 'f', ['/', '/'], 'm', ['s', NONE, NONE, '$'], 'p', SIGN, ['e', NONE, NONE, '€'],
        [':', ':'], 'h',
        ['*', '*'], 'o', ['!', '+'], 'r', CUR, 'd', 'j', 'g', '@', 'n',
        't', 'q', NUM, ['â', '1'], '?', ['ê', '2'], '-', 'u', '(', 'v',
        MAJ, ['î', '3'],
        ['œ', '9'],
        ['ë', '6'],
        [ING, NONE, '%'],
        ['x', 'x'], 'è', 'ç', LET, ['û', '5'],
        '.', ['ü', '8'], ')', 'z', ['"', '='], 'à', IT, ['ô', '4'], 'w', ['ï', '7'],
        '0', 'y', 'ù', ['é', NONE, '&']
    ];

    // Some basic brf table
    var brf = [
        ' ', 'A', '1', 'B', "'", 'K', '2', 'L', '@', 'C', // 10
        'I', 'F', '/', 'M', 'S', 'P', '"', 'E', '3', 'H', // 20
        '9', 'O', '6', 'R', '^', 'D', 'J', 'G', '>', 'N', // 30
        'T', 'Q', ',', '*', '5', '<', '-', 'U', '8', 'V', // 40
        '.', '%', '[', '$', '+', 'X', '!', '&', ';', ':', // 50
        '4', '\\', '0', 'Z', '7', '(', '_', '?', 'W', ']', // 60
        '#', 'Y', ')', '='
    ];

    // The internal representation of a Braille Cell
    var cell = [0, 0, 0, 0, 0, 0];

    // The mapping table to convert from Braille dot to black and back
    var mapping;

    // Mapping init
    mapping = map || braille_fr; // By default, if none is given, use the french braille

    // Compute the braille number representation : 2^0 + 2^1 + 2^2 + 2^3 + 2^4 + 2^5 (dot 1,2,3,4,5,6)
    function getBraille() {
        var b = 0;
        for (var i = 0; i < 6; i++) {
            b += Math.pow(2, i) * cell[i];
        }
        return b;
    }

    // Return the dot notation: i.e "123" for dot 1,2,3 enabled (letter l)
    // Sometimes need the prefix to be shown
    function getDots() {
        var p = '';
        switch (prefix) {
            case NUM:
                if (number_start.first) {
                    p = '6';
                }
                break;
            case MAJ:
                p = '46';
                break;
            case CUR:
                p = '45';
                break;
            case SIGN:
                p = '5';
                break;
        }
        var d = '';
        for (var i = 0; i < 6; i++) {
            if (cell[i]) {
                d += (i + 1);
            }
        }
        if (prefix)
            d = p + ' ' + d;

        return d;
    }

    // Return the black notation, in our example the letter l
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

    // Search in the brf mapping table, the correct translation
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
                if (number_start.first)
                    return ',' + brf[n]; // Add the dot 6 before the number
                else
                    return brf[n];
        }
        return brf[n];
    }

    function get(type) {
        type = type || 'braille';
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

    // Check if a character is in a given column of the mapping table
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

    // Search the index of a character in the mapping table
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
        console.log("Error {" + char + "}" + mapping[0]);
        return ' ';
    }

    function isNumException(n) {
        return (['x', '*', ':', '/', '-', '÷', "'"].indexOf(n) != -1);
    }

    function isNum(c) {
        if (inCol(c, 1))
            return true;
        return false;
    }

    // Function to detect if it is the start of a number and so we should add point 6
    // Ex: 123 must be true for 1, 1'234 also.
    function detect_number_start(dot) {
        if (isNum(dot[0]) && !(isNum(number_start.last) || isNumException(number_start.last)))
            number_start.first = true;
        else
            number_start.first = false;
        number_start.last = dot[0];

        return number_start.first;
    }

    // Set a dot with a value, or a string in the braille cell
    function set(dot, value) {
        //console.log(dot, value);
        if (typeof dot === 'number') {
            // Fill manually the cell with booleans
            if (value != undefined) {
                if (dot > 0 && dot < 6)
                    cell[dot] = value;
                else
                    console.warn("Not valid usage");
            } else { // Enter the value of the cell
            }
        } else
        if (typeof dot === 'string') {
            if (value == "dots") {
                reset();
                if (dot.includes("1"))
                    cell[0] = 1;
                if (dot.includes("2"))
                    cell[1] = 1;
                if (dot.includes("3"))
                    cell[2] = 1;
                if (dot.includes("4"))
                    cell[3] = 1;
                if (dot.includes("5"))
                    cell[4] = 1;
                if (dot.includes("6"))
                    cell[5] = 1;
            } else {
                var rest, letter = dot[0];
                first = false;
                if (dot[0].toUpperCase() === dot[0] && dot[0] !== dot[0].toLowerCase()) {
                    // Detect Upper Case
                    prefix = MAJ;
                    letter = dot[0].toLowerCase();
                } else {
                    // Detect number
                    if (detect_number_start(dot))
                        prefix = NUM;
                    else if (inCol(dot[0], 2)) {
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
            }
        } else if (Array.isArray(dot)) {
            for (var i = 0; i < 6; i++) {
                cell[i] = dot[i];
            }
        }
        //console.log(cell);
        return this;
    }

    // Reset the braille cell to 0 and return 0 as a string
    function reset() {
        //console.log("-------------");
        prefix = NONE;
        number_start.reset();
        for (var i = 0; i < 6; i++) {
            cell[i] = 0;
        }
        return "0";
    }

    // Expose the basic functions
    return {
        get: get,
        set: set,
        reset: reset
    };
});