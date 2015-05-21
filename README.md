Clean Text Markup Language
==========================

[![GitHub version](https://badge.fury.io/gh/weaversam8%2Fctml.svg)](http://badge.fury.io/gh/weaversam8%2Fctml) [![npm version](https://badge.fury.io/js/ctml.svg)](http://badge.fury.io/js/ctml)

**C**lean **T**ext **M**arkup **L**anguage, or **CTML** is a simplified way to do your web coding.

## Introduction

I wrote CTML because I was increasingly frustrated with the extra amounts of characters on screen when editing HTML documents.

Imagine if all those extra brackets could simply be removed, and HTML was updated for modern web coding. I have done exactly that with CTML.

### Example

Here is an example CTML document:

```
-html
    -head
        -title
            Example Page
        -
    -
    -body
        -p #1 .par .foo [test="test data spaces"]
            This is some example text!
            Second line.
            Third Line.
        -
    -
-

```

This is rather simple and elegant.

### Installation

CTML can be installed through [npm][1], Node's package management system. It is a command line package, so please install it globally.

`npm install -g ctml`

## Command Line Tools

Included this repository are two tools that allow use of CTML. These are known as `ctmlc` and `ctmld`.

### `ctmlc` - The CTML Compiler

The CTML compiler is run by using `ctmlc` after installing the ctml package globally. `ctmlc` takes a CTML file and compiles it into HTML. You can execute it with no arguments to see current usage, but the most basic execution runs like this:

`ctmlc example.ctml`

### `ctmld` - The CTML Decompiler

The CTML decompiler is run by using `ctmld` after installing the ctml package globally. `ctmld` isn't really a decompiler as much as it is a converter.  It takes an HTML file and will convert it to CTML. It is useful for beginning work with existing HTML files that weren't originally created using CTML. You can execute it with no arguments to see current usage, but the most basic execution runs like `ctmlc`.

`ctmld exampmle.html`

## Language Syntax

CTML is designed to be a bit more strictly typed, but it simplifies HTML greatly.

### Elements

If a line begins with a hyphen character, (`-`) it is an element. The element name should immediately follow.

Example: `-body`

### ID and classes

You can specify the ID of an element and classes for an element simply by adding the appropriate CSS selector to the line of the element.

For example, to create a paragraph element with the ID `1234` and the classes `foo` and `bar`, you can use this syntax:

`-p #1234 .foo .bar`

### Additional Attributes

Additional attributes can be specified by bracket syntax, again similar to CSS selectors.

`-p [style="display:none;"]`

You can define a boolean attribute by using syntax like:

`-input [disabled]`

If you have simple values for an attribute, you are not required to use double quotes, but they are required if your attribute value includes spaces, hashtags, hyphens, or dots. Single quote compatibility is not yet completed.

### Comments

A comment line begins with double slashes. The compiler has an argument you can pass on the command line to output comments to HTML when you compile as well.

### Whitespace

Whitespace is trimmed and ignored unless within quotes. Indentation is recommended.

## Contribution Guide

This software is still in development, so be warned of breaking changes.

Feel free to submit a pull request if you believe you have made a useful contribution.

## License

The MIT License (MIT)

Copyright (c) 2015 Sam Weaver

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


[1]: http://www.npmjs.com
