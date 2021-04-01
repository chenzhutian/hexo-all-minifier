'use strict';
const UglifyJS = require('uglify-js');
const minimatch = require('minimatch');

function OptimizeJS(str, data) {
  const hexo = this;
  const options = hexo.config.js_minifier;
  // Return if disabled.
  if (options.enable === false) return;

  const path = data.path;
  let exclude = options.exclude;
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];

  if (path && exclude) {
    for (let i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], {matchBase: true})) return str;
    }
  }

  const log = hexo.log || console;
  const minifyOptions = Object.assign({}, options);
  // remove unnecessory options
  delete minifyOptions.enable;
  delete minifyOptions.exclude;
  delete minifyOptions.silent;

  const result = UglifyJS.minify(str, minifyOptions);
  if (result.code) {
    const saved = ((str.length - result.code.length) / str.length * 100).toFixed(2);
    log[options.silent ? 'debug' : 'info']('update Optimize JS: %s [ %s saved]', path, saved + '%');
    return result.code;
  }
  log[options.silent ? 'debug' : 'info'](`Cannot minify the js of ${path}`);
  return str;
}

module.exports = OptimizeJS;
