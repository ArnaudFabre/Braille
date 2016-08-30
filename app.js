var BrailleApp = angular.module('BrailleApp', []);

/**
 * Due to immutable JS strings...
 * Replace a character in a string at position index
 */
function replaceChar(s, index, char) {
   return s.substr(0, index) + char + s.substr(index+1);
}

BrailleApp.controller('BrailleCtrl', function ($scope) {
    $scope.view_selected = 0;
    $scope.view = function (v) {
        $scope.view_selected = v;
    };

    $scope.input = "";
    $scope.braille = "";

    var cell = new BrailleCell();

    $scope.translate = function () {
        $scope.braille = $scope.input;
    };

    var empty = true; // If no letter is ready to be added
    var refresh_rate = 200;

    function validate() {
        if (!empty) {
            var d = cell.get('black');
            if (d !== -1) {
                switch (d) {
                case -3:
                    d = '$';
                    break;
                case -5:
                    d = '§';
                    break;
                }
                $scope.input += d;
                $scope.braille += d;
                $scope.perkins = $scope.braille;
                console.log(d);
                cell.reset();
                empty = true;
                $scope.$apply();
            }
        }
    }

    $scope.max_lines = 28;
    $scope.max_chars = 30;
    $scope.pages = 0;
    // Brf converter
    $scope.toBrf = function () {
        //console.log($scope.text_area_input);
        var line = 0; // count lines
        var char = 0; // count char in the current line
        var pos = 0; // count position in the brf text
        var first = true;
        $scope.text_area_output = '';

        var last_pos = -1;  // Identify last position to cut lines
        var detect_line = false;
        
        cell.reset();
        for (var i in $scope.text_area_input) {
            var letter = $scope.text_area_input[i];
            // console.log(letter, i, pos, last_pos);
            
            if(letter === ' ') {
                // Remember last_space
                last_pos = pos;
            }
            
            if (letter === '\n') {
                // Force break line
                $scope.text_area_output += '\n';
                char = 0;
                last_pos = -1; // Reset last space
                pos++;
                line++;
                cell.reset();
                continue;
            } else {
                // Translate to brf
                var brf = cell.set(letter).get('brf');
                // console.log('{' + brf + '}');
                $scope.text_area_output += brf;
                pos += brf.length; 
                char+= brf.length;
            }
            if(char >= $scope.max_chars) {
                if(letter === ' ') {
                    // console.log("replace space", pos-1);
                    $scope.text_area_output = replaceChar($scope.text_area_output, pos-1, '\n');
                    char = 0;
                    line++;
                }
                else
                if(last_pos === -1) {
                    console.log("cut word");
                }
                else {
                    // console.log("cut at last space", last_pos);
                    $scope.text_area_output = replaceChar($scope.text_area_output, last_pos, '\n');
                    char = pos-last_pos-1;
                    // console.log("new char is " + char);
                    line++;
                }
                last_pos = -1;
            }
        }
        $scope.pages = 1+line/$scope.max_lines;
    };

    $scope.downloadBRF = function(args) {
        var data, filename, link;
        var brf = $scope.text_area_output;

        if (brf == null) return;

        filename = args.filename || 'export.brf';

        console.log(brf);

        var blob = new Blob([brf], {
            encoding: "ASCII",
            type: "text/brf;charset=ASCII"
        });
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    };

    // Braille Keyboard controller
    var keys = [70, 68, 83, 74, 75, 76]; // Cell keys
    $scope.fire = function (key) {
        console.log(key);
        var dot = keys.indexOf(key.keyCode);
        if (dot != -1) {
            empty = false;
            console.log(dot);
            cell.set(dot, 1);
            setTimeout(validate, refresh_rate);
        } else {
            // Controls
            switch (key.keyCode) {
            case 32: // space
                $scope.input += ' ';
                $scope.perkins += ' ';
                $scope.braille += ' ';
                break;
            case 77: // backspace
                $scope.input = $scope.input.slice(0, -1);
                $scope.perkins = $scope.perkins.slice(0, -2);
                $scope.braille = $scope.braille.slice(0, -1);
                cell.reset();
                empty = true;
                break;
            case 81: // newline
                $scope.input = "";
                $scope.perkins = "";
                $scope.braille = "";
                cell.reset();
                empty = true;
                break;
            }
        }
    };
});
