/* global hexo */
'use strict';
var CleanCSS = require('clean-css'),
    UglifyJS = require('uglify-js'),
    Htmlminifier = require('html-minifier').minify,
    Imagemin = require('imagemin'),
    mozjpeg = require('imagemin-mozjpeg'),
    pngquant = require('imagemin-pngquant'),
    gifsicle = require('imagemin-gifsicle'),
    jpegtran = require('imagemin-jpegtran'),
    optipng = require('imagemin-optipng'),
    svgo = require('imagemin-svgo'),
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
    var result = str;
    try {
        result = Htmlminifier(str, options);
        var saved = ((str.length - result.length) / str.length * 100).toFixed(2);
        log.log('update Optimize HTML: %s [ %s saved]', path, saved + '%');
    } catch (e) {
        if (options.ignore_error) {
            log.log('----------------------------------------');
            log.log('ignore the parse error: %s \n%s', path, e);
            log.log('----------------------------------------');
        } else {
            throw e;
        }
    }

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
    // var result = MoreCSS.compress(str, options.radical);
    // var saved = ((str.length - result.length) / str.length * 100).toFixed(2);
    // log.log('update Optimize CSS: %s [ %s saved]', path, saved + '%');
    // return result;

    return new Promise(function (resolve, reject) {
        new CleanCSS(options).minify(str, function (err, result) {
            if (err) return reject(err);
            var saved = ((str.length - result.styles.length) / str.length * 100).toFixed(2);
            resolve(result.styles);
            log.log('update Optimize CSS: %s [ %s saved]', path, saved + '%');
        });
    });
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
        targetfile = ['gif', 'jpg', 'png', 'svg'],
        route = hexo.route;

    // Return if disabled.
    if (false === options.enable) return;
    if (options.exclude && options.exclude.length) {
        for (var i = 0, len = options.exclude.length; i < len; ++i) {
            var idx = targetfile.indexOf(options.exclude[i]);
            if (idx != -1) {
                targetfile.splice(-1, 1);
            }
        }
    }

    // exclude image
    var routes = route.list().filter(function (path) {
        return minimatch(path, '**/*.{' + targetfile.join(',') + '}', {
            nocase: true
        });
    });

    // Filter routes to select all images.
    var log = hexo.log || console;
    // Retrieve image contents, and minify it.
    return Promise.map(routes, function (path) {
        // Retrieve and concatenate buffers.
        var stream = route.get(path);
        return streamToArrayAsync(stream)
            .then(function (arr) {
                return Buffer.concat(arr);
            }).then(function (buffer) {
                // Create the Imagemin instance.
                var imageminOption = {
                    plugins: [
                        mozjpeg({
                            progressive: options.progressive
                        }),
                        gifsicle({
                            interlaced: options.interlaced
                        }),
                        jpegtran({
                            progressive: options.progressive
                        }),
                        optipng({
                            optimizationLevel: options.optimizationLevel
                        }),
                        svgo({
                            multipass: options.multipass
                        })
                    ]
                };

                // Add additional plugins.
                if (options.pngquant) { // Lossy compression.
                    imageminOption.plugins.push(pngquant());
                }

                return Imagemin.buffer(buffer, imageminOption)
                    .then(function (newBuffer) {
                        var length = buffer.length;
                        if (newBuffer && length > newBuffer.length) {
                            var saved = ((length - newBuffer.length) / length * 100).toFixed(2);
                            log.log('update Optimize IMG: %s [ %s saved]', path, saved + '%');
                            route.set(path, newBuffer); // Update the route.
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