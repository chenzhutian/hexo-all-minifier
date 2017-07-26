/* global hexo */
'use strict';
var CleanCSS = require('clean-css');

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

module.exports = OptimizeCSS;