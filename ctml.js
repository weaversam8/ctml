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

var cliArgs = require("command-line-args");

var cli = cliArgs([
    {
        name: 'help',
        type: Boolean,
        description: 'Output this screen.'
    },
    {
        name: 'file',
        type: String,
        defaultOption: true,
        description: 'The input file.'
    },
    {
        name: 'comments',
        alias: 'c',
        type: Boolean,
        description: 'Output CTML comments as HTML comments.'
    }
]);

var options = cli.parse();
if((Object.keys(options).length <= 0) || options.help || !(options.file)) {
    console.log(cli.getUsage({
        header: 'CTML Compiler',
        footer: '\n  By Sam Weaver <sam@samweaver.com>'
    }));
    process.exit(0);
}

var fs = require('fs');
var path = require('path');

var $ = require('cheerio');
var tidy = require('htmltidy').tidy;

var fileName = options.file || null;

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

var originalFileText = fileText;

// 1, split on newlines

var parts = fileText.split(/\n/g);

// 2, separate into objects by element

var elementArray = [];
var currentElement = null;

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function matchRespectingQuotes(str, delim, dontEscape) {

    if (!dontEscape) {
        var delim = escapeRegExp(delim);
    }

    var regex = new RegExp("[^" + delim + "\"']+|\"([^\"]*)\"|'([^']*)'", 'g');
    // console.log(str.match(regex));
    return str.match(regex);

}

function splitRespectingQuotes(str, delim, dontEscape) {
    if (!dontEscape) {
        var delim = escapeRegExp(delim);
    }

    var regex = new RegExp('('+delim+')(?=(?:[^"]|"[^"]*")*$)','g');

    return str.split(regex);
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
            //2.5 dots are reserved for class definitions, unless quoted
            // valueMatched = value.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
            valueMatched = matchRespectingQuotes(value, '\\s', true);

            for (iter in valueMatched) {
                // replace spaces with %s% and remove quotes
                // .replace(/\"/g, '').replace(/\'/g, '')
                valueMatched[iter] = valueMatched[iter].replace(/ /g, '%s%');
            }

            // valueMatched2 = splitRespectingQuotes(valueMatched.join(''),'..');
            //
            // for (iter2 in valueMatched2) {
            //     // replace .. with %dd%
            //     valueMatched2[iter2] = valueMatched2[iter2].replace(/\.\./g, '%dd%');
            // }
            //
            // valueMatched3 = splitRespectingQuotes(valueMatched2.join(''),'.');
            //
            // for (iter3 in valueMatched3){
            //     // replace . with %d% and remove quotes
            //     valueMatched3[iter3] = valueMatched3[iter3].replace(/\./g,'%d%').replace(/\"/g, '').replace(/\'/g, '');
            // }

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
                //we begin the parsing dance

                // var elementParts = value.split(/(\.|#|\[|\])/g);
                var elementParts = splitRespectingQuotes(value, '.');
                value = elementParts.join('%nt%dot%');

                var elementParts = splitRespectingQuotes(value,'#');
                value = elementParts.join('%nt%id%');

                var elementParts = splitRespectingQuotes(value,'[');
                value = elementParts.join('%nt%lb%');

                var elementParts = splitRespectingQuotes(value,']');
                value = elementParts.join('%nt%rb%');

                //remove quotes
                value = value.replace(/"/g,'').replace(/'/g,'');

                var elementParts = value.split(/(%nt%dot%|%nt%id%|%nt%lb%|%nt%rb%)/g);

                // console.log(elementParts);
                // continue;
                currentElement.name = elementParts[0].replace('-', '');
                currentElement.id = [];
                currentElement.classes = [];
                currentElement.attributes = [];
                // now, loop through the parts
                var nextArrName = null;
                for (var index in elementParts) {
                    if (index == 0) continue;
                    switch (elementParts[index]) {
                        case "%nt%id%":
                            nextArrName = "id";
                            break;
                        case "%nt%dot%":
                            nextArrName = "classes";
                            break;
                        case "%nt%lb%":
                            nextArrName = "attributes";
                            break;
                        default:
                            if (nextArrName != null) {
                                if (nextArrName == 'attributes') {
                                    var arr = matchRespectingQuotes(elementParts[index], '=');
                                    // console.log(arr);
                                    elementParts[index] = {
                                        key: arr[0]
                                    };
                                    if (arr.length > 1) {
                                        arr.shift();
                                        var str = arr.join('=');
                                        // replace %s% with space
                                        elementParts[index].value = str.replace(/%s%/g, ' ').replace(/%dd%/g, '..').replace(/%d%/g, '.');
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
        } else if (value.length > 1 && value.charAt(0) == '/' && value.charAt(1) == '/') {
            // its a comment, ignore it completely
            // TODO: add config option to output comments
            if(options.comments) {
                currentElement.children.push(' <!-- '+value+'-->');
            }
        } else {
            // not an element, add to children of currentElement
            currentElement.children.push(value);
        }
    }
}


// console.log('\n' + JSON.stringify(JSON.decycle(elementArray)));

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
            newEl.attr('id', object[key].id[1]);
        }
        for (index in object[key].classes) {
            var className = object[key].classes[index] || '';
            if(className == '.') continue;
            newEl.addClass(className);
        }
        //recurse
        loopFunction(newEl, object[key].children);

        //finish
        parent.append(newEl);
    }
};

loopFunction(html, elementArray);

// 4, beautify

// console.log(html.html());


tidy(html.html(), {
    'doctype': 'html5',
    'tidy-mark': false,
    'indent': true,
    'wrap': 0
}, function(err, html) {

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
