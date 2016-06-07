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

    if(map) {
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
            cell[i] = 0;
        }
    }

    return {
        get: get,
        set: set,
        reset: reset,
    };
});
