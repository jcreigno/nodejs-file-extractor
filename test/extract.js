var extractor = require('../lib/main.js'),
    fs = require('fs');

var s = fs.createReadStream(__dirname + '/sample.csv',{});
extractor({'count': 0}).matches(/;(?!(?:[^",]|[^"],[^"])+")/,function(m,vars){
    console.log(m);
    vars.count ++;
}).on('end',function(vars){
    console.log(vars.count + ' matches found.');
}).start(s);


