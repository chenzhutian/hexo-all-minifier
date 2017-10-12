'use strict';
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const minimatch = require('minimatch');

// Local modules.
const optimizeImage = require('../lib/optimizeImage');

// Configure.
const fileSize = {};
const fixtures = [];
const targetFile = ['.jpg', '.gif', '.png', '.svg'];

const files = fs.readdirSync(path.resolve(__dirname, './fixture'));
for (const file of files) {
  const filePath = path.resolve(__dirname, './fixture', file)
  fixtures.push(filePath);
  fileSize[filePath] = fs.statSync(filePath).size;
}


// Stub hexo.route.
const hexoRoute = {
  buffer: {},
  get: function (name) {
    return fs.createReadStream(name);
  },
  list: function () {
    return fixtures;
  },
  set: function (name, buffer) {
    this.buffer[name] = buffer; // Save.
  }
};

// Test suite.
describe('hexo-image-minifier', () => {
  // Reset the buffer.
  beforeEach('hexoRoute', () => {
    hexoRoute.buffer = {};
  });

  // Tests.
  it('should minify an image.', () => {
    // Configure.
    const hexo = {
      config: {
        image_minifier: {
          enable: true,
          interlaced: false,
          multipass: false,
          optimizationLevel: 3,
          pngquant: false,
          progressive: false
        }
      },
      route: hexoRoute
    };
    // Filter and test.
    const promise = optimizeImage.call(hexo);
    return promise.then(() => {
      for (const file of fixtures) {
        if( targetFile.indexOf(path.extname(file)) !== -1) {
          expect(hexoRoute.buffer[file]).to.be.ok;
          expect(fileSize[file]).to.be.greaterThan(hexoRoute.buffer[file].length);
        }
      }
    });
  });

  it('should do nothing if disabled.', () => {
    // Configure.
    const hexo = {
      config: {
        image_minifier: { enable: false }
      },
      route: hexoRoute
    };

    // Filter and test.
    expect(optimizeImage.call(hexo)).to.be.undefined;
    expect(hexoRoute.buffer).to.be.empty;
  });

  it('should exclude files when the file extensions are listed in `exclude` options', () => {
    const exclude = ['*.svg'];

    // Configure.
    const hexo = {
      config: {
        image_minifier: {
          exclude,
          optimizationLevel: 3,
        }
      },
      route: hexoRoute
    };

    // Filter and test.
    const promise = optimizeImage.call(hexo);
    return promise.then(() => {
      for (const file of fixtures) {
        if (targetFile.indexOf(path.extname(file)) !== -1
          && exclude.every(pattern => !minimatch(file, pattern, { nocase: true, matchBase: true }))) {
          expect(hexoRoute.buffer[file]).to.be.ok;
          expect(fileSize[file]).to.be.greaterThan(hexoRoute.buffer[file].length);
        } else {
          expect(hexoRoute.buffer[file]).to.be.undefined;
        }
      }
    });
  });
});