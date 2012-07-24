var vows = require('vows'),
    assert = require('assert'),
    extractor = require('../lib/main.js'),
    fs = require('fs');
    
vows.describe('Extractor').addBatch({
    'when creating an Extractor object,':{
        topic: extractor(),
        'we get an object which':{
            'has a "matches" method' : function(e){
                assert.ok(e.matches);
            },
            'has a "start" method' : function(e){
                assert.ok(e.start);
            },
            'has a "watch" method' : function(e){
                assert.ok(e.watch);
            }
        }
    },
    'when creating an Extractor object with an accumulator,':{
        topic: extractor({count:0}),
        'we get an object which':{
            'has a "matches" method' : function(e){
                assert.ok(e.matches);
            },
            'has a "start" method' : function(e){
                assert.ok(e.start);
            },
            'has a "watch" method' : function(e){
                assert.ok(e.watch);
            }
        },
        'we get notified':{
            topic: function(ext){
                var s = fs.createReadStream(__dirname + '/sample.csv',{});
                ext.matches(/;(?!(?:[^",]|[^"],[^"])+")/,function(m,vars){
                    vars.count ++;
                });
                //ext.on('end', this.callback);
                return ext.start(s);
            },
            on:{ 
                "end" : {
                    "we have a 25 lines" : function(e){
                        assert.equal(e.count,25);
                    }
                }
            }
        }
    }
}).export(module);
