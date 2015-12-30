var assign = require('object-assign');

hexo.config.html_minifier = assign({
  exclude: []
}, hexo.config.html_minifier);

hexo.extend.filter.register('after_render:html', require('./lib/filter'));