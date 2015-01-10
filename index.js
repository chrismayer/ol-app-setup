#!/usr/bin/env node

/*
 * ol-app-setup
 *
 * (c) 2015 Christian Mayer, http://www.meggsimum.de
 *
 * Licensed under MIT-License, for full license text see LICENSE-file
 */

// core modules
var fs = require('fs');
var http = require('http');

// 3rd party modules
var program = require('commander');
var connect = require('connect');
var serveStatic = require('serve-static');

var profiles = {
    ol3: {
        js: 'node_modules/openlayers/dist/ol.js',
        css: 'node_modules/openlayers/css/ol.css',
        idxTpl: 'templates/index.ol3.template',
        appJsTpl: 'templates/app.ol3.template'
    },
    ol2: {
        js: 'libs/OpenLayers-2.13.1.js',
        css: 'libs/OpenLayers-2.13.1.css',
        idxTpl: 'templates/index.ol2.template',
        appJsTpl: 'templates/app.ol2.template'
    },
    jquery: {
        js: 'node_modules/jquery/dist/jquery.min.js'
    },
    bootstrap3: {
        js: 'node_modules/bootstrap/dist/js/bootstrap.min.js',
        css: 'node_modules/bootstrap/dist/css/bootstrap.min.css'
    }
};

program
    .option('-t, --target <folder>', 'Path to create the app within (required)')
    .option('-v, --olversion <majorversion>', 'Defines the library profile to be ' +
        'used for the app setup. Valid options are "ol3" and "ol2". ' +
        '(Default is "ol3")')
    .option('-j, --jquery', 'Includes jQuery in your app setup')
    .option('-b, --bootstrap', 'Includes bootstrap in your app setup')
    .option('-s, --server', 'Start an internal web server on localhost:8888')
    .parse(process.argv);


if (!program.target) {
    program.help();
    process.exit(1);
}

var olVersion = program.olversion || 'ol3';
var libProfile = profiles[olVersion];
if(!libProfile) {
    program.help();
    process.exit(1);
}

var targetFolder = program.target;
if(!strEndsWith(targetFolder, "/")) {
    targetFolder += "/";
}

// create output folder if not existing
var libFolder = targetFolder + "/" + "libs";
if(!fs.existsSync(targetFolder)) {
    fs.mkdir(targetFolder);
}
if(!fs.existsSync(libFolder)) {
    fs.mkdir(libFolder);
}

// copy local library files

// ol
copyFile(libProfile.js, libFolder + "/ol.js");
copyFile(libProfile.css, libFolder + "/ol.css");

if(program.jquery) {
    // jQuery
    copyFile(profiles.jquery.js, libFolder + "/jquery.js");
}
if(program.bootstrap) {
    // bootstrap
    copyFile(profiles.bootstrap3.js, libFolder + "/bootstrap3.js");
    copyFile(profiles.bootstrap3.css, libFolder + "/bootstrap3.css");
}

// copy the app JS-file
copyFile(libProfile.appJsTpl, targetFolder + "app.js");

// copy index file template and replace placeholder(s) afterwards
copyFile(libProfile.idxTpl, targetFolder + "index.html", function() {

    if (program.jquery) {
        replaceFileContent(targetFolder + "index.html",
                /__JQUERY__/g, '<script src="libs/jquery.js"></script>');
    } else {
        replaceFileContent(targetFolder + "index.html", /__JQUERY__/g, '');
    }
    if(program.bootstrap) {
        replaceFileContent(targetFolder + "index.html",
                /__BOOTSTRAPCSS__/g, '<link rel="stylesheet" type="text/css" ' +
                'href="libs/bootstrap3.css"></script>');
        replaceFileContent(targetFolder + "index.html",
                /__BOOTSTRAPJS__/g,
                '<script src="libs/bootstrap3.js"></script>');
    } else {
        replaceFileContent(targetFolder + "index.html",
                /__BOOTSTRAPCSS__/g, '');
        replaceFileContent(targetFolder + "index.html", /__BOOTSTRAPJS__/g, '');
    }

});

if(program.server) {
    console.info("Starting server for " + targetFolder);
    console.info("Open http://localhost:8888/ to see the app");
    connect().use(serveStatic(targetFolder)).listen(8888);
}

/**
 * Copies a file from source to target
 */
function copyFile(source, target, cb) {

    console.info("Copying " + source + " to " + target + "...");

    var cbCalled = false;

    var rs = fs.createReadStream(source);
    rs.on("error", done);

    var wrs = fs.createWriteStream(target);
    wrs.on("error", done);
    wrs.on("close", function(ex) {
        done();
    });
    rs.pipe(wrs);

    function done(err) {
        if (cb && !cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

/**
 * Replaces a text in a file
 */
function replaceFileContent(file, search, replace) {
    var indexFileText = fs.readFileSync(file, "utf8"),
        replaced = indexFileText.replace(search, replace);
    fs.writeFileSync(file, replaced);
}

/**
 * Detects the suffix of a string
 */
function strEndsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
