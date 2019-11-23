/**
 * Unit Testing BrailleCell
 * @param {
 * } map a mapping, by default the fr
 * @param {*} verbosity show issues and successes
 */

var BrailleTest = (function (map, verbosity) {

    var cell = new BrailleCell(map);

    var verbose = verbosity || false;
    var n_success = 0;
    var n_failed = 0;

    function assert(test, f, result) {
        if(f != result) {
            if(verbose)
                console.error(test + " failed : " + f + " !=", result);
            n_failed++;
        } else {
            if(verbose)
                console.log(test + " succeeded");
            n_success++;
        }
    }

    function run() {
        assert("set", cell.set("a"), cell);
        assert("get", cell.get(), "1");
        assert("get black", cell.get("black"), "a");
        assert("get dots", cell.get("dots"), "1");
        assert("get brf", cell.get("brf"), "A"); 
        assert("reset", cell.reset(), "0");

        var passed = 100*n_success/(n_failed+n_success);
        if(verbose)
            console.log(passed + "% passed")
        return passed;
    }

    return {
        run: run
    };
});