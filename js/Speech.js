
var Speech = (function () {

    var voices = []; // Available voices
    var lang = false; // A voice has been found
    var speaking = false; // Can not speak while speaking
    var speak_type = 1; // 0 is when no speak is allowed, 1 read letter when entering letter and word when space is hitted, 2 read word when new letter is added


    /** Speech Synthesis */
    function speak(str) {
        if (!speak_type || !str || str.empty || (str.length == 1 && str[0] == ' '))
            return;

        if (speaking) {
            speaking = false;
            window.speechSynthesis.cancel();
        }
        
        str = str.replace("?", "point d'interrogation");
        str = str.replace("!", "point d'exclamation");
        str = str.replace(")", "paranthèse fermée");
        
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

    return {
        speak: speak
    };
});
