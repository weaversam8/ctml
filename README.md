Clean Text Markup Language
==========================

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

[1]: http://www.npmjs.com
