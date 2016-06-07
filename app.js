var BrailleApp = angular.module('BrailleApp', []);

BrailleApp.controller('BrailleCtrl', function ($scope) {
    $scope.view_selected = 0;
    $scope.view = function (v) {
        $scope.view_selected = v;
    };

    $scope.input = "";
    $scope.braille = "";

    var cell = new BrailleCell();

    $scope.translate = function() {
        $scope.braille = $scope.input;
    };

    var empty = true; // If no letter is ready to be added
    var refresh_rate = 200;
    function validate() {
        if(!empty) {
            var d = cell.get('black');
            if(d!== -1) {
                switch(d) {
                    case -3: d='$'; break;
                    case -5: d='§'; break;
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

    var keys = [70, 68, 83, 74, 75, 76]; // Cell keys
    $scope.fire = function(key) {
        console.log(key);
        var dot = keys.indexOf(key.keyCode);
        if (dot != -1) {
            empty = false;
            console.log(dot);
            cell.set(dot, 1);
            setTimeout(validate, refresh_rate);
        } else {
            // Controls
            switch(key.keyCode) {
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
