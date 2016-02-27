var vows = require('vows'),
    assert = require('assert'),
    extractor = require('../lib/main.js'),
    fs = require('fs');

function assertMethod(name){
    return function(e){
        assert.ok(e[name]);
    };
}

var objCreation = {
    'has a "matches" method' : assertMethod('matches'),
    'has a "start" method' : assertMethod('start'),
    'has a "watch" method' : assertMethod('watch'),
    'has a "close" method' : assertMethod('close')
};

vows.describe('Extractor').addBatch({
    'when creating an Extractor object,':{
        topic: extractor(),
        'we get an object which': objCreation
    },
    'when creating an Extractor object with an accumulator,':{
        topic: extractor({count:0}),
        'we get an object which': objCreation ,
        'we get notified':{
            topic: function(ext){
                var s = fs.createReadStream(__dirname + '/sample.csv',{});
                ext.matches(/;(?!(?:[^",]|[^"],[^"])+")/,function(m,vars){
                    vars.count ++;
                });
                return ext.start(s);
            },
            on:{
                "end" : {
                    "we have a 25 lines" : function(e){
                        assert.equal(e.count, 25);
                    }
                }
            }
        }
    },
    'when creating an Extractor object with an accumulator and successive,':{
        topic: extractor({count:0 , lines : 0} , {successive : true}),
        'we get notified':{
            topic: function(ext){
                var s = fs.createReadStream(__dirname + '/sample.csv',{});
                ext.matches(/;(?!(?:[^",]|[^"],[^"])+")/g,function(m,vars,file,firstMatch){
                    vars.count ++;
                    if(firstMatch){
                        vars.lines++;
                    }
                });
                return ext.start(s);
            },
            on:{
                "end" : {
                    "we have a 25 lines and 176 matches" : function(e){
                        assert.equal(e.lines, 25);
                        assert.equal(e.count, 200);
                    }
                }
            }
        }
    }
}).export(module);
