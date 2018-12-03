var BrailleApp = angular.module('BrailleApp', []);

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
    // Brf converter
    $scope.toBrf = function (max_l, max_c) {
        //console.log($scope.text_area_input);
        var line = 0;
        var char = 0;
        var first = true;
        $scope.text_area_output = '';

        var last_space = -1; // Identify last space to cut lines
        var detect_line = false;
        
        cell.reset();
        for (var i in $scope.text_area_input) {
            // Parsing the input
            var letter = $scope.text_area_input[i];
            if(letter === ' ')
                last_space = i; // Remember last_space

            if (letter === '\n') {
                // Force break line
                $scope.text_area_output += '\n';
                char = 0;
                last_space = -1; // reset last_space
                line++;
                cell.reset();
                continue;
            } else {
                // Translate to brf
                var brf = cell.set(letter).get('brf');
                $scope.text_area_output += brf;
                char+= brf.length;
            }

            if(char > $scope.max_chars) {
               // Break line
                $scope.text_area_output[last_space] = '\n';
                char = char-last_space;
                line++;
            }
            else
            if (char === $scope.max_chars) {
                if(letter === ' ') {
                    $scope.text_area_output += '\n';
                    char = 0;
                    line++;
                }
                else {
                    $scope.text_area_output[last_space] = '\n';
                    char = char-last_space;
                    line++;
                }
            }
        }
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
