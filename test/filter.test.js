'use strict';

// Standard lib.
var fs   = require('fs'),
    path = require('path');

// Package modules.
var assign = require('object-assign');

// Local modules.
var subject = require('../lib/filter.js');

// Configure.
var fixture = path.join(__dirname, 'fixture.png'),
    size    = fs.statSync(fixture).size;

// Stub hexo.route.
var hexoRoute = {
  buffer: null,
  get: function(name) {
    return fs.createReadStream(name);
  },
  list: function() {
    return [ fixture ];
  },
  set: function(name, buffer) {
    this.buffer = buffer; // Save.
  }
};

// Test suite.
describe('hexo-image-minifier', function() {
  // Reset the buffer.
  beforeEach('hexoRoute', function() {
    hexoRoute.buffer = null;
  });

  // Tests.
  it('should minify an image.', function() {
    // Configure.
    var hexo = {
      config: {
        image_minifier: { }
      },
      route: hexoRoute
    };

    // Filter and test.
    var promise = subject.optimizeImage.call(hexo);
    return promise.then(function() {
      console.assert(null !== hexoRoute.buffer);
      console.assert(size > hexoRoute.buffer.length);
    });
  });

  it('should do nothing if disabled.', function() {
    // Configure.
    var hexo = {
      config: {
        image_minifier: { enable: false }
      },
      route: hexoRoute
    };

    // Filter and test.
    subject.optimizeImage.call(hexo);
    console.assert(null === hexoRoute.buffer);
  });
});