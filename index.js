/* global hexo */

var isDev = process.env.NODE_ENV === 'development';

module.exports = function(hexo) {
  if (isDev) return;
  if (false === hexo.config.hasOwnProperty('all_minifier') || true === hexo.config.all_minifier) {
    // HTML minifier
    hexo.config.html_minifier = Object.assign({
      enable: true,
      exclude: [],
      ignoreCustomComments: [/^\s*more/],
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true,
      minifyJS: true,
      minifyCSS: true
    }, hexo.config.html_minifier);

    // Css minifier
    hexo.config.css_minifier = Object.assign({
      enable: true,
      exclude: ['*.min.css']
    }, hexo.config.css_minifier);

    // Js minifier
    hexo.config.js_minifier = Object.assign({
      enable: true,
      mangle: true,
      output: {},
      compress: {},
      exclude: ['*.min.js']
    }, hexo.config.js_minifier, {
      fromString: true
    });

    // Image minifier
    hexo.config.image_minifier = Object.assign({
      enable: true,
      interlaced: false,
      multipass: false,
      optimizationLevel: 3,
      pngquant: false,
      progressive: false
    }, hexo.config.image_minifier);

    var filter = require('./lib/filter');
    hexo.extend.filter.register('after_render:html', filter.optimizeHTML);

    hexo.extend.filter.register('after_render:css', filter.optimizeCSS);

    hexo.extend.filter.register('after_render:js', filter.optimizeJS);

    hexo.extend.filter.register('after_generate', filter.optimizeImage);
  }
};