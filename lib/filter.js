var minify = require('html-minifier').minify;
var minimatch = require('minimatch');

module.exports = function(str, data){
  var options = this.config.html_minifier;
  var path = data.path;
  var exclude = options.exclude;
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];

  if (path && exclude && exclude.length){
    for (var i = 0, len = exclude.length; i < len; i++){
      if (minimatch(path, exclude[i])) return str;
    }
  }

  var result = minify(str, options);

  return result;
};