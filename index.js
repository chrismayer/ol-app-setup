#!/usr/bin/env node

/*
 * ol-app-setup
 *
 * (c) 2014 Christian Mayer, http://www.meggsimum.de
 *
 * Licensed under MIT-License, for full license text see LICENSE-file
 */

// core modules
var fs = require('fs');
var http = require('http');

// 3rd party modules
var program = require('commander');

var profiles = {
    ol3: {
        js: 'http://openlayers.org/en/v3.1.1/build/ol.js',
        css: 'http://openlayers.org/en/v3.1.1/css/ol.css',
        idxTpl: 'templates/index.ol3.template',
        appJsTpl: 'templates/app.ol3.template'
    },
    ol2: {
        js: 'http://cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/OpenLayers.js',
        css: 'http://cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/theme/default/style.css',
        idxTpl: 'templates/index.ol2.template',
        appJsTpl: 'templates/app.ol2.template'
    },
    jquery: {
        js: 'http://code.jquery.com/jquery-1.11.1.min.js'
    },
    bootstrap3: {
        js: 'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js',
        css: 'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css'
    }
};

program
    .option('-t, --target <folder>', 'Path to create the app within (required)')
    .option('-v, --olversion <majorversion>', 'Defines the library profile to be ' +
        'used for the app setup. Valid options are "ol3" and "ol2". ' +
        '(Default is "ol3")')
    .option('-j, --jquery', 'Includes jQuery in your app setup')
    .option('-b, --bootstrap', 'Includes bootstrap in your app setup')
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

// download local copies of library files

// ol
downloadFile(libProfile.js, libFolder + "/ol.js");
downloadFile(libProfile.css, libFolder + "/ol.css");

if(program.jquery) {
    // jQuery
    downloadFile(profiles.jquery.js, libFolder + "/jquery.js");
}
if(program.bootstrap) {
    // bootstrap
    downloadFile(profiles.bootstrap3.js, libFolder + "/bootstrap3.js");
    downloadFile(profiles.bootstrap3.css, libFolder + "/bootstrap3.css");
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

/**
 * Downloads a remote file defined by its URL
 */
function downloadFile(url, filename) {

    console.info("Start downloading ", url, "...");

    var file = fs.createWriteStream(filename),
        request = http.get(url, function(response) {
            console.info("... finished downloading ", url);
            response.pipe(file);
            file.on('finish', function() {
                file.close();
                console.info("... writing to ", filename);
            });
        }).on('error', function(e) {
            console.error('\nError while downloading: %s\n' +
                            'Reason is: %s\nExit...', url, e.message);
            process.exit(1);
        });
}

/**
 * Copies a file from source to target
 */
function copyFile(source, target, cb) {
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
