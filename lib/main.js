var fs = require('fs'), util = require('util');
var EventEmitter = require('events').EventEmitter;
var carrier = require('carrier');

function Extractor(ac) {
    EventEmitter.call(this);
    this.matchers = [];
    this.vars = ac || {};
}
util.inherits(Extractor, EventEmitter);
module.exports = function(ac){
    return new Extractor(ac);
};

Extractor.prototype.matches = function(regexp,cb){
    this.matchers.push({re:regexp,handler:cb});
    return this;
};

Extractor.prototype.start = function(stream){
    var self = this;
    if(!stream){
        stream = process.stdin;
        stream.resume();
    }
    var car = carrier.carry(stream);
    car.on('end', function(){ 
        self.emit('end', self.vars);
    });
    car.on('line',  function(line) {
        for(i=0;i<self.matchers.length;i++){
            var matcher = self.matchers[i];
            var m = matcher.re.exec(line);
            if(m && matcher.handler){
                matcher.handler(m, self.vars);
                break;
            }
        }
    });
    return self;
};
