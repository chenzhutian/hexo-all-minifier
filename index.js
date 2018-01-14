'use strict';
/* global hexo */

const isEnabled = process.env.NODE_ENV !== 'development'
  && (hexo.config.hasOwnProperty('all_minifier') === false || hexo.config.all_minifier === true);

if (isEnabled) {

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
    minifyCSS: true,
    silent: false
  }, hexo.config.html_minifier);

  // Css minifier
  hexo.config.css_minifier = Object.assign({
    enable: true,
    exclude: ['*.min.css'],
    silent: false
  }, hexo.config.css_minifier);

  // Js minifier
  hexo.config.js_minifier = Object.assign({
    enable: true,
    mangle: true,
    output: {},
    compress: {},
    exclude: ['*.min.js'],
    silent: false
  }, hexo.config.js_minifier);

  // Image minifier
  hexo.config.image_minifier = Object.assign({
    enable: true,
    interlaced: false,
    multipass: false,
    optimizationLevel: 3,
    pngquant: false,
    progressive: false,
    silent: false
  }, hexo.config.image_minifier);

  // Js concator
  hexo.config.js_concator = Object.assign({
    enable: false,
    bundle_path: 'js/bundle.js',
    front: false,
    silent: false
  }, hexo.config.js_concator);

  hexo.extend.filter.register('after_render:html', require('./lib/optimizeHTML'));

  hexo.extend.filter.register('after_render:css', require('./lib/optimizeCSS'));

  hexo.extend.filter.register('after_render:js', require('./lib/optimizeJS'));

  hexo.extend.filter.register('after_generate', require('./lib/optimizeImage'));

  hexo.extend.filter.register('after_generate', require('./lib/concatJS'));
}
