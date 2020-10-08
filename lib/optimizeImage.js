'use strict';
const Imagemin = require('imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const gifsicle = require('imagemin-gifsicle');
const jpegtran = require('imagemin-jpegtran');
const optipng = require('imagemin-optipng');
const svgo = require('imagemin-svgo');

const Promise = require('bluebird');
const minimatch = require('minimatch');

// Configure.

function OptimizeImage() {
  // Init.
  const hexo = this;
  const options = hexo.config.image_minifier;
  const route = hexo.route;
  let targetfile = ['jpg', 'gif', 'png', 'svg'];

  // Return if disabled.
  if (options.enable === false) return;
  // filter target files
  if (options.exclude && options.exclude.length) {
    targetfile = targetfile.filter(t => options.exclude.every(p => !p.includes(t, p)));
  }

  // exclude image
  const routes = route.list().filter(path => {
    return minimatch(path, '*.{' + targetfile.join(',') + '}', {
      nocase: true,
      matchBase: true
    });
  });

  // Filter routes to select all images.
  const log = hexo.log || console;
  // Retrieve image contents, and minify it.
  return Promise.map(routes, path => {
    // Retrieve and concatenate buffers.
    const stream = route.get(path);
    const arr = [];
    stream.on('data', chunk => arr.push(chunk));
    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve(Buffer.concat(arr)));
    })
      .then(buffer => {
        // Create the Imagemin instance.
        const imageminOption = {
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
          .then(newBuffer => {
            const length = buffer.length;
            if (newBuffer && length > newBuffer.length) {
              const saved = ((length - newBuffer.length) / length * 100).toFixed(2);
              log[options.silent ? 'debug' : 'info']('update Optimize IMG: %s [ %s saved]', path, saved + '%');
              route.set(path, newBuffer); // Update the route.
            }
          });
      });
  });
}

module.exports = OptimizeImage;
