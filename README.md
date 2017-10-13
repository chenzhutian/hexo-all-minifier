# Hexo-all-minifier

[![Greenkeeper badge](https://badges.greenkeeper.io/chenzhutian/hexo-all-minifier.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/chenzhutian/hexo-all-minifier.svg?branch=master)](https://travis-ci.org/chenzhutian/hexo-all-minifier)
[![codecov](https://codecov.io/gh/chenzhutian/hexo-all-minifier/branch/master/graph/badge.svg)](https://codecov.io/gh/chenzhutian/hexo-all-minifier)
[![npm version](https://badge.fury.io/js/hexo-all-minifier.svg)](https://badge.fury.io/js/hexo-all-minifier)
[![NPM Dependencies](https://david-dm.org/unhealthy/hexo-all-minifier.svg)](https://www.npmjs.com/package/hexo-all-minifier)

(**Try the latest feature JS_Concator in v0.4.0**)

All in one. Minifier & Optimization plugin for [Hexo](https://hexo.io).
Since most of the optimize plugin for [HEXO](https://hexo.io) have been deprecated, and [HEXO](https://hexo.io) has upgraded to 3.XX, so I decide to implement this plugin.

## Installation
``` bash
$ npm install hexo-all-minifier --save
```
For Mac User, maybe you need to install somthing more
```bash
$ brew install libtool automake autoconf nasm
```
## Usage
Just put this line in the config file of your hexo-site to enable this plugin.
``` yaml
all_minifier: true
```
If you need futher control of this plugin, please refer the options below.

## Options
``` yaml
js_concator:
  enable: true
  bundle_path: 'js/bundle.js'
  exclude:
  include:
```
- **enable** - Enable the Js concator. Defaults to `false`.
- **bundle_path** - The output path of the bundle script.
- **include** - Include files. With default setting, the concator will extract the local scripts which exist in all html pages and then concat them as a bundle script. If you want to concat scripts which exist in some html pages, you can manully add them in the `include` option. Glob is support.
- **exclude** - Exclude files. The same as above. If you do not want to concat scripts which exist in all html pages, you can manully add them in the `exclude` option. Glob is support.

``` yaml
html_minifier:
  enable: true
  ignore_error: false
  exclude:
```
- **enable** - Enable the HTML minifier. Defaults to `true`.
- **ignore_error** - Ignore the error occurred on parsing html.
- **exclude** - Exclude files. Glob is support.

----------

``` yaml
css_minifier:
  enable: true
  exclude: 
    - '*.min.css'
```
- **enable** - Enable the CSS minifier. Defaults to `true`.
- **exclude** - Exclude files. Glob is support.

----------

``` yaml
js_minifier:
  enable: true
  mangle: true
  output:
  compress:
  exclude: 
    - '*.min.js'
```
- **enable** - Enable the JS minifier. Defaults to `true`.
- **mangle**: Mangle file names
- **output**: Output options. If it is empty, please remove it from the .yml file! Otherwise it will be set to `null`, which is different from `undefined`.
- **compress**: Compress options. If it is empty, please remove it from the .yml file! Otherwise it will be set to `null`, which is different from `undefined`.
- **exclude**: Exclude files. Glob is support.

----------

```yaml
image_minifier:
  enable: true
  interlaced: false
  multipass: false
  optimizationLevel: 2
  pngquant: false
  progressive: false
```
- **enable** - Enable the image minifier. Defaults to `true`.
- **interlaced** - Interlace gif for progressive rendering. Defaults to `false`.
- **multipass** - Optimize svg multiple times until it’s fully optimized. Defaults to `false`.
- **optimizationLevel** - Select an optimization level between 0 and 7. Defaults to `2`.
- **pngquant** - Enable [imagemin-pngquant](https://github.com/imagemin/imagemin-pngquant) plugin. Defaults to `false`.
- **progressive** - Lossless conversion to progressive. Defaults to `false`.
- **exclude** - Exclude specific types of image files, the input value could be `gif`,`jpg`, `png`, or `svg`. Default to null. Glob is not support. 


## Components
Integrate all the official minifier plugins of HEXO and a imagemin plugin:
- [hexo-html-minifier](https://github.com/hexojs/hexo-html-minifier), which is based on [HTMLMinifier](https://github.com/kangax/html-minifier)
- [hexo-clean-css](https://github.com/hexojs/hexo-clean-css), which is based on [clean-css](https://github.com/jakubpawlowicz/clean-css)
- [hexo-uglify](https://github.com/hexojs/hexo-uglify), which is based on [UglifyJS](http://lisperator.net/uglifyjs/)
- [hexo-imagemin](https://github.com/vseventer/hexo-imagemin), which is based on [imagemin](https://github.com/imagemin/imagemin)

Thanks for their work.
