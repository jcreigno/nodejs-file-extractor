
file-extractor [![build status](https://secure.travis-ci.org/jcreigno/nodejs-file-extractor.png)](http://travis-ci.org/jcreigno/nodejs-file-extractor) [![NPM version](https://badge.fury.io/js/file-extractor.png)](https://npmjs.org/package/file-extractor)
=========

> Extract data from text files or log files using regular expressions.

introduction
------------
Extractor scans file line by line. Registred callbacks are notified when a patterm matches current line.

synopsis
--------
Start extracting stdin :

```javascript
    var extractor = require('file-extractor');

    extractor().matches(/;(?!(?:[^",]|[^"],[^"])+")/,function(m){
        console.log(m);
    }).start();
```  
Using multiple patterns :

```javascript
    var extractor = require('file-extractor');

    extractor()
        .matches(/regex1/, cb1)
        .matches(/regex2/, cb2)
        .matches(/regex3/, cb3).start();
```  

Using an accumulator :

```javascript
    var extractor = require('file-extractor'),
        fs = require('fs');

    var s = fs.createReadStream(__dirname + '/sample.csv',{});
    extractor({'count': 0}).matches(/;(?!(?:[^",]|[^"],[^"])+")/,function(m, vars){
        console.log(m);
        vars.count ++;
    }).on('end', function(vars){
        console.log(vars.count + ' matches found.');
    }).start(s);
```  

Using watch mode :

```javascript
    var extractor = require('file-extractor');

    extractor()
        .matches(/regex1/, cb1)
        .matches(/regex2/, cb2)
        .matches(/regex3/, cb3).watch('sample.txt');
```
This mode supports wildcards in file names :
```javascript
    var extractor = require('file-extractor');

    extractor()
        .matches(/regex1/, cb1)
        .matches(/regex2/, cb2)
        .matches(/regex3/, cb3).watch('/var/log/*.log');
```

In this case an additionnal parameter is passed to the callback function to indicate which file triggered the pattern.
```javascript
    var extractor = require('file-extractor');

    extractor()
        .matches(/regex3/, function(match, vars, file){
          console.log('pattern found in : ' + file);
        }).watch('/var/log/*.log');
```


installation
------------

    $ npm install file-extractor

API
===

extractor(ac={})
----------------
The constructor function creates a new `extractor`. Optionnaly pass an accumulator as parameter.
Accumulator may be used to share data across callbacks.


.matches(regex, callback)
--------------------------
Register a new matching pattern and corresponding callback. Each match is notified using callback. 

* First callback parameter is regex.exec result.
* Second parameter is the accumulator object.
* optionnaly the third parameter is file name (in watch mode).

Return value is `this` to enable method chaining.

.start(readableStream=process.stdin)
------------------------------------
Start scanning stream and notify callbacks. If `readableStream` is empty use standard input `process.stdin`.

.watch(filename)
------------------------------------
Start watching file `filename` for modification, may contains wildcard (see `minimatch` by @izs). Each new lines will trigger matching callbacks.

.close()
------------------------------------
Clean up method. Remove any watcher on file.

Events
======

'end'
-----
Sent when end of stream is reached. The current accumulator is given as first parameter to the event listener. Only emited in no-watch mode (`start` method).

'error'
-----
Sent when watching files with wildcards (`*`) and an error occurred when selecting files. Only emited in watch mode (`watch` method).

