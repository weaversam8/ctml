#! /usr/bin/env node

// CTML - Sam Weaver <sam@samweaver.com>
//
// A modern parser for modern html

// loosely following: http://www.w3.org/TR/html-markup/syntax.html

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

var ProgressBar = require('progressbar').ProgressBar;
var progress = new ProgressBar();
var $ = require('cheerio');
var tidy = require('htmltidy').tidy;

var fileName = process.argv[2] || null;

if (fileName == null) {
    console.log('[ERR] You must provide a file name as the argument for CTML.');
    console.log('[INF] Usage: ctml FILENAME');
    process.exit(0);
}

if (path.extname(fileName) == '') {
    fileName += '.ctml';
}

var filePath = path.resolve(__dirname, fileName);

var fileText = fs.readFileSync(filePath, {
    encoding: 'utf-8'
});

// Now, start parsing

progress.step('Parsing CTML File: ' + fileName).setTotal(5);

var originalFileText = fileText;

// 1, split on newlines

progress.setTick(1);
var parts = fileText.split(/\n/g);

// 2, separate into objects by element
progress.setTick(2);

var elementArray = [];
var currentElement = null;

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function splitRespectingQuotes(str, delim, dontEscape){

    if(!dontEscape) {
        var delim = escapeRegExp(delim);
    }

    var regex = new RegExp("[^"+delim+"\"']+|\"([^\"]*)\"|'([^']*)'",'g');
    // console.log(str.match(regex));
    return str.match(regex);

}


// 2.1 loop through array
for (var index in parts) {
    // console.log(index);
    var value = parts[index];
    value = value.trim();

    if (value.length > 0) {

        if (value.charAt(0) == '-') {

            //2.2 if begins with hyphen, it's an element
            //2.3 if it's only a hyphen, it's an closing element

            //2.4 spaces in element definitions are ignored, unless quoted
            // valueMatched = value.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
            valueMatched = splitRespectingQuotes(value,'\\s',true);

            for (iter in valueMatched) {
                // replace spaces with %s% and remove quotes
                valueMatched[iter] = valueMatched[iter].replace(/ /g, '%s%').replace(/\"/g, '').replace(/\'/g, '');
            }

            //join
            value = valueMatched.join('');

            var finishElement = function() {
                //if not master, just unnest
                // console.log('element closed with name ' + currentElement.name);
                if (currentElement.parent) {
                    var parent = currentElement.parent;
                    delete currentElement.parent;
                    parent.children.push(currentElement);
                    currentElement = parent;
                } else {
                    elementArray.push(currentElement);
                    currentElement = null;
                }
            };

            if (value.length == 1) {
                finishElement();
            } else {


                // if currentElement is already defined, make a child thing
                if (currentElement != null) {
                    var temp = currentElement;
                    currentElement = {};
                    currentElement.parent = temp;
                } else {
                    currentElement = {};
                }
                currentElement.children = [];
                var elementParts = value.split(/(\.|#|\[|\])/g);
                currentElement.name = elementParts[0].replace('-', '');
                currentElement.id = [];
                currentElement.classes = [];
                currentElement.attributes = [];
                // now, loop through the parts
                var nextArrName = null;
                for (var index in elementParts) {
                    if (index == 0) continue;
                    switch (elementParts[index]) {
                        case "#":
                            nextArrName = "id";
                            break;
                        case ".":
                            nextArrName = "classes";
                            break;
                        case "[":
                            nextArrName = "attributes";
                            break;
                        default:
                            if (nextArrName != null) {
                                if (nextArrName == 'attributes') {
                                    var arr = splitRespectingQuotes(elementParts[index],'=');
                                    console.log(arr);
                                    elementParts[index] = {
                                        key: arr[0]
                                    };
                                    if (arr.length > 1) {
                                        arr.shift();
                                        var str = arr.join('=');
                                        // replace %s% with space
                                        elementParts[index].value = str.replace(/%s%/g, ' ');
                                    }
                                }
                                currentElement[nextArrName].push(elementParts[index]);
                                nextArrName = null;
                            }
                            break;
                    }
                }

                if (value.charAt(value.length - 1) == '-') {
                    // it ends on the same line
                    finishElement();
                }

                // Drop empty arrays
                // if(currentElement.id.length == 0) delete currentElement.id;
                // if(currentElement.attributes.length == 0) delete currentElement.attributes;
                // if(currentElement.classes.length == 0) delete currentElement.classes;

                // console.log('element initialized with name ' + currentElement.name);
            }
        } else {
            // not an element, add to children of currentElement
            currentElement.children.push(value);
        }
    }
}


// console.log('\n' + JSON.stringify(JSON.decycle(elementArray)));
progress.setTick(3);

// 3, compile into actual HTML
var html = $.load('<html></html>')('html');

// 3.1 loop through the object
var loopFunction = function(parent, object) {

    for (key in object) {
        //first, ensure object, otherwise, simply append
        if (typeof object[key] !== 'object') {
            parent.append(object[key] + '\n');
            continue;
        }
        var name = object[key].name;
        var newEl = $('<' + name + '></' + name + '>');
        for (index in object[key].attributes) {
            var attrKey = object[key].attributes[index].key || '';
            var attrValue = object[key].attributes[index].value || '';
            newEl.attr(attrKey, attrValue);
        }
        if (object[key].id.length > 0) {
            newEl.attr('id', object[key].id[0]);
        }
        for (index in object[key].classes) {
            var className = object[key].classes[index] || '';
            newEl.addClass(className);
        }
        //recurse
        loopFunction(newEl, object[key].children);

        //finish
        parent.append(newEl);
    }
};

loopFunction(html, elementArray);

progress.setTick(4);
// 4, beautify

tidy(html.html(), {
    'doctype': 'html5',
    'tidy-mark': false,
    'indent': true
}, function(err, html) {

    progress.setTick(5);
    console.log('\n[INF] Compile Complete.');
    console.log('[INF] Writing to file: dist/' + path.basename(fileName, path.extname(fileName)) + '.html');

    try {
        fs.mkdirSync(__dirname + '/dist');
    } catch (e) {

    }

    fs.writeFileSync('dist/' + path.basename(fileName, path.extname(fileName)) + '.html', html);

    console.log('[INF] Saved!');
    process.exit(0);
});
