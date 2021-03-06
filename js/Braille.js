var Braille = (function (map) {

   var cell = new BrailleCell();

    function get(str) {
        var br = "";
        cell.reset();
        for(var i in str) {
            br += cell.set(str[i]).get("braille");
        }
        return br;
    }

    return {
        get: get
    };
});
