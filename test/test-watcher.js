var vows = require('vows'), 
    assert = require('assert'),
    fs = require('fs'),
    watcher = require('../lib/watcher.js');

function assertMethod(name){
    return function(e){
        assert.ok(e[name]);
    };
}

vows.describe('Watcher').addBatch({
    'when creating an Watcher object,': {
        topic: function(){ return watcher(__dirname + '/watchable.csv');},
        'we get an object which': {
            'has a "close" method' : assertMethod('close')
        }
    }/*,
    'we can start watching files':{
        topic : function(w) {
            var writable = fs.createWriteStream(__dirname + '/watchable.csv',{flags:'a+'});
            var readable = fs.createReadStream(__dirname + '/sample.csv');
            readable.on('end',function(){})
            readable.pipe(writable);
            return w;
        },
        on : {
            'line': {
                'we have a line ' : function (e) {
                }
            }
        },
        'can be closed ': {
            topic: function(w){
                if(!closed){
                    closed = true;
                    return w.close();
                }
                return w;
            },
            'clean up is done': function(w){
                assert.ok(closed);
            }
        }
    }*/
}).export(module);

//var w = watcher(__dirname + '/watchable.csv');
//w.on('line', console.log);
