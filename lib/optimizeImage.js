'use strict';
var Imagemin = require('imagemin'),
  mozjpeg = require('imagemin-mozjpeg'),
  pngquant = require('imagemin-pngquant'),
  gifsicle = require('imagemin-gifsicle'),
  jpegtran = require('imagemin-jpegtran'),
  optipng = require('imagemin-optipng'),
  svgo = require('imagemin-svgo'),
  streamToArray = require('stream-to-array');

var Promise = require('bluebird');
var minimatch = require('minimatch');

// Configure.
var streamToArrayAsync = Promise.promisify(streamToArray);

function OptimizeImage() {
  // Init.
  var hexo = this,
    options = hexo.config.image_minifier,
    targetfile = ['gif', 'jpg', 'png', 'svg'],
    route = hexo.route;

  // Return if disabled.
  if (options.enable === false) return;
  if (options.exclude && options.exclude.length) {
    for (var i = 0, len = options.exclude.length; i < len; ++i) {
      var idx = targetfile.indexOf(options.exclude[i]);
      if (idx !== -1) {
        targetfile.splice(-1, 1);
      }
    }
  }

  // exclude image
  var routes = route.list().filter((path) => {
    return minimatch(path, '**/*.{' + targetfile.join(',') + '}', {
      nocase: true
    });
  });

  // Filter routes to select all images.
  var log = hexo.log || console;
  // Retrieve image contents, and minify it.
  return Promise.map(routes, (path) => {
    // Retrieve and concatenate buffers.
    var stream = route.get(path);
    return streamToArrayAsync(stream)
      .then((arr) => Buffer.concat(arr))
      .then((buffer) => {
        // Create the Imagemin instance.
        var imageminOption = {
          plugins: [
            mozjpeg({ progressive: options.progressive }),
            gifsicle({ interlaced: options.interlaced }),
            jpegtran({ progressive: options.progressive }),
            optipng({ optimizationLevel: options.optimizationLevel }),
            svgo({ multipass: options.multipass })
          ]
        };

        // Add additional plugins.
        if (options.pngquant) { // Lossy compression.
          imageminOption.plugins.push(pngquant());
        }

        return Imagemin.buffer(buffer, imageminOption)
          .then((newBuffer) => {
            var length = buffer.length;
            if (newBuffer && length > newBuffer.length) {
              var saved = ((length - newBuffer.length) / length * 100).toFixed(2);
              log.log('update Optimize IMG: %s [ %s saved]', path, saved + '%');
              route.set(path, newBuffer); // Update the route.
            }
          });
      });
  });
}

module.exports = OptimizeImage;