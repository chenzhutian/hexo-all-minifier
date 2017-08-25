'use strict';
var Htmlminifier = require('html-minifier').minify;
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
            if (minimatch(path, exclude[i], {matchBase:true})) return str;
        }
    }

    var log = hexo.log || console.log;
    var result = str;
    try {
        result = Htmlminifier(str, options);
        var saved = str.length === 0 ? 0 : ((str.length - result.length) / str.length * 100).toFixed(2);
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
}

module.exports = OptimizeHTML;