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
                console.log(test + " succeeded", f, result);
            n_success++;
        }
    }

    function basic() {
        cell.reset();
        assert("set", cell.set("a"), cell);
        assert("get", cell.get(), "1");
        assert("get black", cell.get("black"), "a");
        assert("get dots", cell.get("dots"), "1");
        assert("get brf", cell.get("brf"), "A"); 
        assert("reset", cell.reset(), "0");
    }

    function dots() {
        cell.reset();
        assert("set dots", cell.set("123", "dots"), cell);
        assert("get black", cell.get("black"), "l");
    }

    function acc() {
        cell.reset();
        assert("set", cell.set("A"), cell);
        assert("get black", cell.get("black"), "A");
        assert("get dots", cell.get("dots"), "46 1");
        assert("get brf", cell.get("brf"), ".A");
    }

    function brf() {
        cell.reset();
        assert("set brf", cell.set("L", "brf"), cell);
        assert("get dots", cell.get("dots"), "123");
        assert("get prefix", cell.get("prefix"), "none");
        assert("get black", cell.get("black"), "l");
        cell.reset();
        assert("set brf", cell.set(".", "brf"), cell);
        assert("get dots", cell.get("dots"), "46");
        assert("get black", cell.get("black"), "");
        assert("get prefix", cell.get("prefix"), "upper");
        assert("set brf", cell.set("L", "brf"), cell);
        assert("get prefix", cell.get("prefix"), "upper");
        assert("get black", cell.get("black"), "L");
    }

    function run() {
        if(verbose) {
            console.log(basic.name);
        }
        basic();
        if(verbose) {
            console.log(dots.name);
        }
        dots();
        if(verbose) {
            console.log(acc.name);
        }
        acc();
        if(verbose) {
            console.log(brf.name);
        }
        brf();

        var passed = 100*n_success/(n_failed+n_success);
        if(verbose)
            console.log(passed + "% passed")
        return passed;
    }

    return {
        run: run
    };
});