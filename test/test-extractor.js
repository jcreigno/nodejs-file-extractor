var vows = require('vows'),
    assert = require('assert'),
    extractor = require('../lib/main.js');
    
vows.describe('Extractor').addBatch({
    'Extractor object : ':{
        topic: extractor(),
        'as matches method :' : function(e){
            assert.ok(e.matches);
        },
        'as start method :' : function(e){
            assert.ok(e.start);
        }
    }
}).addBatch({
    'Extractor object with accumulator : ':{
        topic: extractor({myvar:0}),
        'as matches method :' : function(e){
            assert.ok(e.matches);
        },
        'as start method :' : function(e){
            assert.ok(e.start);
        }
    }
}).export(module);
