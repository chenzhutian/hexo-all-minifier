'use strict';
var CleanCSS = require('clean-css');
var micromatch = require('micromatch');

function OptimizeCSS(str, data) {
  const hexo = this;
  const options = hexo.config.css_minifier;
  // Return if disabled.
  if (options.enable === false) return;

  var path = data.path;
  var exclude = options.exclude;

  let enableBasename = true;
  let excludeString = exclude;
  if (exclude && Array.isArray(exclude)) excludeString = exclude.join('');
  if (excludeString.includes('/')) enableBasename = false;

  if (path && exclude && exclude.length) {
    if (micromatch.isMatch(path, exclude, {basename: enableBasename})) return str;
  }

  var log = hexo.log || console;
  var minifierOptions = Object.assign({}, options);
  delete minifierOptions.enable;
  delete minifierOptions.exclude;

  var styles = str;
  try {
    var result = new CleanCSS(minifierOptions).minify(str);

    // Log warnings
    if (result.warnings.length) {
      result.warnings.forEach(function(warning) {
        log.warn(warning, path);
      });

    // Log errors
    } else if (result.errors.length) {
      result.errors.forEach(function(error) {
        log.error(error, path);
      });

    // Log some info
    } else {
      var saved = ((str.length - result.styles.length) / str.length * 100).toFixed(2);
      log[options.silent ? 'debug' : 'info']('Update Optimize CSS: %s [ %s saved]', path, saved + '%');
    }

    styles = result.styles;
  } catch (err) {
    log.error('Cannot minify CSS: %s, because %s', path, err);
  }

  return styles;
}

module.exports = OptimizeCSS;
