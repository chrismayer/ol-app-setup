OpenLayers Application Setup Generator
============

Creates a basic OpenLayers application setup

Install
------------
`npm install -g ol-app-setup`

Usage
--------

See `ol-app-setup --help` for detailed usage.

    Usage: ol-app-setup [options]

    Options:

    -h, --help                      output usage information
    -t, --target <folder>           Path to create the app within (required)
    -v, --olversion <majorversion>  Defines the library profile to be used for the app setup. Valid options are "ol3" and "ol2". (Default is "ol3")
    -j, --jquery                    Includes jQuery in your app setup
    -b, --bootstrap                 Includes bootstrap in your app setup


Example calls
-----------------
Create a simple OpenLayers 3 app

`ol-app-setup -t /tmp/foo`

Create a simple OpenLayers 2 app

`ol-app-setup -t /tmp/foo -v ol2`

Create an ol3 app with jQuery and bootstrap

`ol-app-setup -t /tmp/foo -v ol3 --jquery --bootstrap`
