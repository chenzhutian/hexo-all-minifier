/* global hexo */
'use strict';
var CleanCSS = require('clean-css'),
    MoreCSS = require('more-css'),
    UglifyJS = require('uglify-js'),
    Htmlminifier = require('html-minifier').minify,
    Imagemin = require('imagemin'),
    mozjpeg = require('imagemin-mozjpeg'),
    pngquant = require('imagemin-pngquant'),
    streamToArray = require('stream-to-array');

var Promise = require('bluebird');
var minimatch = require('minimatch');

function OptimizeHTML(str, data) {
    var hexo = this,
        options = hexo.config.html_minifier;
    // Return if disabled.
    if (false === options.enable) return;

    var path = data.path;
    var exclude = options.exclude;
    if (exclude && !Array.isArray(exclude)) exclude = [exclude];

    if (path && exclude && exclude.length) {
        for (var i = 0, len = exclude.length; i < len; i++) {
            if (minimatch(path, exclude[i])) return str;
        }
    }

    var log = hexo.log || console.log;
    var result = Htmlminifier(str, options);
    var saved = ((str.length - result.length) / str.length * 100).toFixed(2);
    log.log('update Optimize HTML: %s [ %s saved]', path, saved + '%');

    return result;
};

function OptimizeCSS(str, data) {
    var hexo = this,
        options = hexo.config.css_minifier;   
    // Return if disabled.
    if (false === options.enable) return;

    var path = data.path;
    var exclude = options.exclude;
    if (exclude && !Array.isArray(exclude)) exclude = [exclude];

    if (path && exclude && exclude.length) {
        for (var i = 0, len = exclude.length; i < len; i++) {
            if (minimatch(path, exclude[i])) return str;
        }
    }
    
    var log = hexo.log || console.log;
    var result = MoreCSS.compress(str,options.radical);
    var saved = ((str.length - result.length) / str.length * 100).toFixed(2);
    log.log('update Optimize CSS: %s [ %s saved]', path, saved + '%');
    return result;

    // return new Promise(function (resolve, reject) {
    //     new CleanCSS(options).minify(str, function (err, result) {
    //         if (err) return reject(err);
    //         var saved = ((str.length - result.styles.length) / str.length * 100).toFixed(2);
    //         resolve(result.styles);
    //         log.log('update Optimize CSS: %s [ %s saved]', path, saved + '%');
    //     });
    // });
}

function OptimizeJS(str, data) {
    var hexo = this,
        options = hexo.config.js_minifier;
    // Return if disabled.
    if (false === options.enable) return;

    var path = data.path;
    var exclude = options.exclude;
    if (exclude && !Array.isArray(exclude)) exclude = [exclude];

    if (path && exclude && exclude.length) {
        for (var i = 0, len = exclude.length; i < len; i++) {
            if (minimatch(path, exclude[i])) return str;
        }
    }

    var log = hexo.log || console;
    var result = UglifyJS.minify(str, options);
    var saved = ((str.length - result.code.length) / str.length * 100).toFixed(2);
    log.log('update Optimize JS: %s [ %s saved]', path, saved + '%');

    return result.code;
}


// Configure.
var streamToArrayAsync = Promise.promisify(streamToArray);

function OptimizeImage() {
    // Init.
    var hexo = this,
        options = hexo.config.image_minifier,
        route = hexo.route;

    // Return if disabled.
    if (false === options.enable) return;

    // Filter routes to select all images.
    var routes = route.list().filter(function (path) {
        return minimatch(path, '**/*.{gif,jpg,png,svg}', { nocase: true });
    });

    var log = hexo.log || console;
    // Retrieve image contents, and minify it.
    return Promise.map(routes, function (path) {
        // Retrieve and concatenate buffers.
        var stream = route.get(path);
        return streamToArrayAsync(stream).then(function (arr) {
            return Buffer.concat(arr);
        }).then(function (buffer) {
            // Create the Imagemin instance.
            var imagemin = new Imagemin()
                .src(buffer)
                .use(Imagemin.gifsicle({ interlaced: options.interlaced }))
                .use(Imagemin.jpegtran({ progressive: options.progressive })) // Strip exif.
                .use(mozjpeg({ progressive: options.progressive }))
                .use(Imagemin.optipng({ optimizationLevel: options.optimizationLevel }))
                .use(Imagemin.svgo({ multipass: options.multipass }));

            // Add additional plugins.
            if (options.pngquant) { // Lossy compression.
                imagemin.use(pngquant());
            }

            // Run.
            return Promise.fromNode(function (callback) {
                imagemin.run(callback);
            }).then(function (files) {
                // Update the route with the new contents.
                var file = files.shift(),
                    length = buffer.length;
                if (file && length > file.contents.length) {
                    var saved = ((length - file.contents.length) / length * 100).toFixed(2);
                    log.log('update Optimize IMG: %s [ %s saved]', path, saved + '%');
                    route.set(path, file.contents); // Update the route.
                }
            });
        });
    });
};

module.exports = {
    optimizeHTML: OptimizeHTML,
    optimizeCSS: OptimizeCSS,
    optimizeJS: OptimizeJS,
    optimizeImage: OptimizeImage
};