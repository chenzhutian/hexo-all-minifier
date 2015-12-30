var async = require('async'),
	Imagemin = require('imagemin'),
	Cleancss = require('clean-css'),
	uglify = require('uglify-js'),
	htmlminifier = require('html-minifier').minify;

var minimatch = require('minimatch');

module.exports = function(str, data){
  var options = this.config.all_minifier;
  var path = data.path;
  var exclude = options.exclude;
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];

  if (path && exclude && exclude.length){
    for (var i = 0, len = exclude.length; i < len; i++){
      if (minimatch(path, exclude[i])) return str;
    }
  }

  var result = htmlminifier(str, options);

  return result;
};