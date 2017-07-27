'use strict';
var UglifyJS = require('uglify-js');
var minimatch = require('minimatch');

function OptimizeJS(str, data) {
  var hexo = this,
    options = hexo.config.js_minifier;
  // Return if disabled.
  if (options.enable === false) return;

  var path = data.path;
  var exclude = options.exclude;
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];

  if (path && exclude) {
    for (var i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i])) return str;
    }
  }

  var log = hexo.log || console;
  var minifyOptions = Object.assign({}, options);
  delete minifyOptions.enable;
  delete minifyOptions.exclude;
  var result = UglifyJS.minify(str, minifyOptions);
  var saved = ((str.length - result.code.length) / str.length * 100).toFixed(2);
  log.log('update Optimize JS: %s [ %s saved]', path, saved + '%');
  return result.code;
}

module.exports = OptimizeJS;