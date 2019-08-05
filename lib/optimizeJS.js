'use strict';
const UglifyJS = require('uglify-es');
const micromatch = require('micromatch');

function OptimizeJS(str, data) {
  const hexo = this;
  const options = hexo.config.js_minifier;
  // Return if disabled.
  if (options.enable === false) return;

  var path = data.path;
  var exclude = options.exclude;

  if (path && exclude) {
    if (micromatch.isMatch(path, exclude, {basename: true})) return str;
  }

  const log = hexo.log || console;
  var minifyOptions = Object.assign({}, options);
  // remove unnecessory options
  delete minifyOptions.enable;
  delete minifyOptions.exclude;
  delete minifyOptions.silent;

  var result = UglifyJS.minify(str, minifyOptions);
  if (result.code) {
    var saved = ((str.length - result.code.length) / str.length * 100).toFixed(2);
    log[options.silent ? 'debug' : 'info']('update Optimize JS: %s [ %s saved]', path, saved + '%');
    return result.code;
  }
  log[options.silent ? 'debug' : 'info'](`Cannot minify the js of ${path}`);
  return str;
}

module.exports = OptimizeJS;
