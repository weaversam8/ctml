#! /usr/bin/env node

// Very nice looking intro logo
console.log('                               ');
console.log('-------------------------------');
console.log('                  *     (      ');
console.log('   (     *   )  (  `    )\\ )   ');
console.log('   )\\  ` )  /(  )\\))(  (()/(   ');
console.log(' (((_)  ( )(_))((_)()\\  /(_))  ');
console.log(' )\\___ (_(_()) (_()((_)(_))    ');
console.log('((/ __||_   _| |  \\/  || |     ');
console.log(' | (__   | |   | |\\/| || |__   ');
console.log('  \\___|  |_|   |_|  |_||____|  ');
console.log('-------------------------------');
console.log('Sam Weaver  <sam@samweaver.com>');
console.log('-------------------------------');
console.log('                               ');

var fs = require('fs');
var path = require('path');

var cheerio = require('cheerio');


var fileName = process.argv[2] || null;

if (fileName == null) {
    console.log('[ERR] You must provide a file name as the argument for CTML.');
    console.log('[INF] Usage: ctml FILENAME');
    process.exit(0);
}

if (path.extname(fileName) == '') {
    fileName += '.html';
}

var filePath = path.resolve(__dirname, fileName);

var fileText = fs.readFileSync(filePath, {
    encoding: 'utf-8'
});


//1, load html into cheerio

var $ = cheerio.load(fileText);

var outputString = '';
var tabLength = 0;

var escapeDoubleQuotes = function(string) {
    return string.replace(/\"/g, '\\"');
};

var removeNewlines = function(string) {
    return string.replace(/\n/g, '').replace(/\r/g, '');
};

var processFunction = function(nodes) {
    // this function will add each node to the output array
    for (index in nodes) {

        // skip if not a number
        if (isNaN(index)) continue;

        var node = nodes[index];
        var $node = $(nodes[index]);

        var id = $node.attr('id') || null;

        var classes = ($node.attr('class') || '').split(' ');
        if (classes.length == 1 && classes[0] == '') classes = null;

        var attributes = node.attribs || null;

        var name = node.name || null;

        // tabLength++;

        var elementString = '';

        //add tabs to the element string for indent
        for (var i = 0; i < tabLength; i++) {
            elementString += '    ';
        }

        if (name) {
            // console.log(name);


            elementString += '-';

            //name the element
            elementString += name;

            //if id, add id
            if (id) {
                elementString += ' #' + id;
            }

            //if classes, add classes
            if (classes) {
                for (classIndex in classes) {
                    elementString += ' .' + classes[classIndex];
                }
            }

            //if attributes add attributes
            if (attributes) {
                for (attrKey in attributes) {
                    if (attrKey == 'id' || attrKey == 'class') continue;
                    elementString += ' [' + attrKey + '=\"' + escapeDoubleQuotes(attributes[attrKey]) + '\"]'
                }
            }

            outputString += elementString + '\n';

            //we now recurse for each child
            if(node.children){
                tabLength++;
                processFunction(node.children);
                tabLength--;
            }

            elementString = '';

            //and we now return the tab level to default
            // tabLength--;

            //add tabs to the element string for indent
            for (var i = 0; i < tabLength; i++) {
                elementString += '    ';
            }

            elementString += '-\n';
        } else {
            //we need to now get the internal text

            //and we now return the tab level to default
            // tabLength--;

            if (node.type == 'text') {
                var tex = node.data.trim();
                if (tex == '') continue;

                console.log(tex);

                elementString += tex + '\n';
            }
        }

        outputString += elementString;

        // console.log(elementString);
        //
        // elementString += $node.text();
        // console.log(JSON.stringify($node.text()));

        //additionally, we close the element

        //finally, we append the elementString

        // console.log(node);
    }
};

processFunction($.root().children());

//value is now in outputString

console.log('\n[INF] Compile Complete.');
console.log('[INF] Writing to file: ctml_dist/' + path.basename(fileName, path.extname(fileName)) + '.ctml');

try {
    fs.mkdirSync(__dirname + '/ctml_dist');
} catch (e) {

}

fs.writeFileSync('ctml_dist/' + path.basename(fileName, path.extname(fileName)) + '.ctml', outputString);

console.log('[INF] Saved!');
process.exit(0);
