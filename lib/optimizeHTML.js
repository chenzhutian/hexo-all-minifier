'use strict';
const htmlminifier = require('html-minifier').minify;
const micromatch = require('micromatch');

function OptimizeHTML(str, data) {
  const hexo = this;
  const options = hexo.config.html_minifier;
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

  const log = hexo.log || console;
  let result = str;
  try {
    result = htmlminifier(str, options);
    let saved = str.length === 0 ? 0 : ((str.length - result.length) / str.length * 100).toFixed(2);
    log[options.silent ? 'debug' : 'info']('update Optimize HTML: %s [ %s saved]', path, saved + '%');
  } catch (e) {
    if (options.ignore_error) {
      log.debug('----------------------------------------');
      log.debug('ignore the parse error: %s \n%s', path, e);
      log.debug('----------------------------------------');
    } else {
      throw e;
    }
  }

  return result;
}

module.exports = OptimizeHTML;
