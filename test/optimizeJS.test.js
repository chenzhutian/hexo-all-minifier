'use strict';
const expect = require('chai').expect;

const jsMinifier = require('../lib/optimizeJS');

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


describe('OptimizeJS', () => {
  // Reset the buffer.
  beforeEach('hexoRoute', function () {
    hexoRoute.buffer = null;
  });
  it('should do nothing if options.enable is false', () => {
    const hexo = {
      config: {
        js_minifier: {
          enable: false,
        }
      }
    };
    expect(jsMinifier.call(hexo)).to.be.undefined;
    expect(hexoRoute.buffer).to.be.null;
  });
});