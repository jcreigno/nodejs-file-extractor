var fs = require('fs'), util = require('util');
var events = require('events');

function Watcher(file, sep) {
    events.EventEmitter.call(this);
    var self = this;
    self.filename = file;
    self.separator = sep || /\r?\n/;
    self.buffer = '';
    self.internalDispatcher = new events.EventEmitter();
    self.queue = [];

    self.readBlock = function(){
        if(self.queue.length >= 1){
            var b = self.queue[0];
            if(b.end > b.start){
                var stream = fs.createReadStream(self.filename,
                                    {start:b.start, end:b.end-1, encoding:'utf-8'});
                stream.on('error', function (err){ 
                    self.emit(err);
                });
                stream.once('end', function (){
                    self.queue.shift();
                    if(self.queue>=1){
                        self.internalDispatcher.emit('next');
                    }
                });
                stream.on('data', function (data){
                    self.buffer += data;
                    var parts = self.buffer.split(self.separator);
                    self.buffer = parts.pop();
                    parts.forEach(function(part){
                        self.emit('line', part);
                    });
                });
            }
        }
    };

    self.internalDispatcher.on('next', self.readBlock);

    fs.watchFile(self.filename, {persistent: true, interval: 1007 },function(curr, prev){
        if(curr.size > prev.size) {
            self.queue.push({start:prev.size, end:curr.size});
            self.internalDispatcher.emit('next');
        }
    });
}
util.inherits(Watcher, events.EventEmitter);

module.exports = function (file, sep){
    return new Watcher(file, sep);
};

Watcher.prototype.close = function (){
    var self = this;
    fs.unwatchFile(self.filename);
    return self;
};
