var util = require('util'),
    watcher = require('./watcher'),
    glob = require('glob');
    path = require('path');
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
    self._listen = function(car, file) {
        car.once('end', function() {
            self.emit('end', self.vars);
        });
        car.on('line', function(line) {
            for (var i = 0; i < self.matchers.length; i++) {
                var matcher = self.matchers[i];
                var m = matcher.re.exec(line);
                if (m && matcher.handler) {
                    matcher.handler(m, self.vars, file);
                    break;
                }
            }
        });
        return self;
    };
}
util.inherits(Extractor, EventEmitter);

/** exports */
module.exports = function(ac) {
    return new Extractor(ac);
};

/**
 * Add pattern matching on this extractor.
 */
Extractor.prototype.matches = function(regexp, cb) {
    this.matchers.push({
        re: regexp,
        handler: cb
    });
    return this;
};

/**
 * Start reading stream and look for registred patterns.
 * @param stream : stream or null (process.stdin)
 */
Extractor.prototype.start = function(stream) {
    var self = this;
    if (!stream) {
        stream = process.stdin;
        stream.resume();
    }
    var car = carrier.carry(stream);
    return self._listen(car);
};

/**
 * handle wildcards in filenames
 * @param f: filename.
 * @param cb : callback when a matching file is found.
 * @param ctxt : callback invocation context.
 */
function wildcards(f, cb, ctxt) {
    var starmatch = f.match(/([^*]*)\*.*/);
    if (!starmatch) { //keep async
        process.nextTick(function() {
            cb.apply(ctxt, [f]);
        });
        return ;
    }

    var basedirPath = starmatch[1].split(/\//);
    basedirPath.pop();
    var wkdir = basedirPath.join('/');
    //console.log('search base : %s', wkdir);
    var r = f.substring(wkdir.length + 1);
    //console.log('match pattern: %s', r);
    glob(r, {
        cwd: wkdir
    }, function(err, matches) {
        if (err) {
            ctxt.emit('error', err);
        }
        else {
          console.log(matches);
            matches.forEach(function(f) {
                cb.apply(ctxt, [path.join(wkdir, f)]);
            });
        }
    });
}


/**
 * Start watching for file modifications that matches registred patterns.
 * @param watchable : file to watch.
 */
Extractor.prototype.watch = function(watchable) {
    var self = this;
    wildcards(watchable, function(file) {
        //console.log('add watcher on %s',file);
        var car = watcher(file); //create watcher from watchable
        this.watchers.push(car);
        this._listen(car, file);
    }, self);
    return self;
};

/**
 * remove any watcher on files.
 */
Extractor.prototype.close = function() {
    var self = this;
    self.watchers.forEach(function closeEach(ele) {
        ele.close();
    });
    self.watchers = [];
    return this;
};
