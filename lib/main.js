var fs = require('fs'), util = require('util'), watcher = require('./watcher');
var EventEmitter = require('events').EventEmitter;
var carrier = require('carrier');

/**
 * Extractor Object.
 */
function Extractor(ac) {
    EventEmitter.call(this);
    var self = this;
    self.matchers = [];
    self.vars = ac || {};
    self.watchers = [];
    self._listen = function (car){
        car.once('end', function(){
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
}
util.inherits(Extractor, EventEmitter);

/** exports */
module.exports = function(ac){
    return new Extractor(ac);
};

/**
 * Add pattern matching on this extractor.
 */
Extractor.prototype.matches = function(regexp,cb){
    this.matchers.push({re:regexp, handler:cb});
    return this;
};

/**
 * Start reading stream and look for registred patterns.
 * @param stream : stream or null (process.stdin)
 */
Extractor.prototype.start = function(stream){
    var self = this;
    if(!stream){
        stream = process.stdin;
        stream.resume();
    }
    var car = carrier.carry(stream);
    return self._listen(car);
};

/**
 * Start watching for file modifications that matches registred patterns.
 * @param watchable : file to watch.
 */
Extractor.prototype.watch = function(watchable){
    var self = this;
    var car = watcher(watchable);//create watcher from watchable
    self.watchers.push(car);
    return self._listen(car);
};

/**
 * remove any watcher on files
 */
Extractor.prototype.close = function(){
    var self = this;
    self.watchers.forEach(function closeEach(ele){
        ele.close();
    });
    return this;
};

