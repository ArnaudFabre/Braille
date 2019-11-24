var Mapping = (function (data) {
    var mapping = []; // Internal mapping

    if(data)
        load(data);

    /** Very basic loading of .ctb files
     * Ignoring comments, opcodes and just assigning mapping
     */
    function load(data) { 
        var lines = data.split("\n");
            for(i in lines) { // Treat each line that is not empty or a comment
                if(! (lines[i].startsWith("#") || lines[i] == "")) {
                    var ops = lines[i].split(" ");
                    // Dots to value computation
                    var value = 0;
                    for(n in ops[2]) {
                        value += Math.pow(2, (ops[2][n]-1));
                    }
                    // Remember the mapping
                    mapping[value] = ops[1];
                }
        }
    }

    function set(position, value) {
        mapping[position] = value;
    }

    function get() {
        return mapping;
    }

    return {
        load: load,
        set: set,
        get: get
    };
});
