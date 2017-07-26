'use strict';
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

// Local modules.
const optimizeImage = require('../lib/optimizeImage');

// Configure.
const fixture = path.join(__dirname, 'fixture.png'),
  size = fs.statSync(fixture).size;

// Stub hexo.route.
const hexoRoute = {
  buffer: null,
  get: function (name) {
    return fs.createReadStream(name);
  },
  list: function () {
    return [fixture];
  },
  set: function (name, buffer) {
    this.buffer = buffer; // Save.
  }
};

// Test suite.
describe('hexo-image-minifier', function () {
  // Reset the buffer.
  beforeEach('hexoRoute', function () {
    hexoRoute.buffer = null;
  });

  // Tests.
  // it('should minify an image.', function () {
  //   // Configure.
  //   const hexo = {
  //     config: {
  //       image_minifier: {}
  //     },
  //     route: hexoRoute
  //   };

  //   // Filter and test.
  //   const promise = optimizeImage.call(hexo);
  //   return promise.then(function () {
  //     console.assert(null !== hexoRoute.buffer);
  //     console.assert(size > hexoRoute.buffer.length);
  //   });
  // });

  it('should do nothing if disabled.', function () {
    // Configure.
    const hexo = {
      config: {
        image_minifier: { enable: false }
      },
      route: hexoRoute
    };

    // Filter and test.
    optimizeImage.call(hexo);
    expect(hexoRoute.buffer).to.be.null;
  });
});