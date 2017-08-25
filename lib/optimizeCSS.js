'use strict';
var CleanCSS = require('clean-css');
var minimatch = require('minimatch');

function OptimizeCSS(str, data) {
  var hexo = this,
    options = hexo.config.css_minifier;
  // Return if disabled.
  if (options.enable === false) return;

  var path = data.path;
  var exclude = options.exclude;
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];

  if (path && exclude && exclude.length) {
    for (var i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], {matchBase:true})) return str;
    }
  }

  var log = hexo.log || console;
  var minifierOptions = Object.assign({ returnPromise: true }, options);
  delete minifierOptions.enable;
  delete minifierOptions.exclude;
  return new CleanCSS(minifierOptions)
    .minify(str)
    .then(result => {
      var saved = ((str.length - result.styles.length) / str.length * 100).toFixed(2);
      log.log('update Optimize CSS: %s [ %s saved]', path, saved + '%');
      return result.styles;
    })
    .catch(err=>{
      log.log('Cannot minifier CSS: %s, because %s', path, err);
      return str;
    });
}

module.exports = OptimizeCSS;