'use strict';
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const cheerio = require('cheerio');

// Local modules.
const concatJS = require('../lib/concatJS');
const format = require('./utils').hexoPathFormat;

// Configure.
const fixtures = [];
const files = fs.readdirSync(path.resolve(__dirname, './fixture'));
for (const file of files) {
  fixtures.push(format(file));
}

// Stub hexo.route.
const hexoRoute = {
  buffer: fixtures.reduce((o, file) => {
    o[file] = true;
    return o;
  }, {}),
  get(name) {
    if(this.buffer[this.format(name)]) {
      return fs.createReadStream(path.join(__dirname, './fixture', this.format(name)));
    }
    return undefined;
  },
  list() {
    return Object.keys(this.buffer);
  },
  set(name, data) {
    this.buffer[this.format(name)] = data;
  },
  remove(name) {
    delete this.buffer[this.format(name)];
  },
  format,
};

describe('ConcatJS', () => {
  it('should do nothing if options.enable is false', () => {
    const hexo = {
      config: {
        js_concator: {
          enable: false,
        }
      }
    };
    expect(concatJS.call(hexo)).to.be.undefined;
  });

  it('should concat all local js', () => {
    // Configure.
    const hexo = {
      config: {
        js_concator: {
          enable: true,
          bundlePath: '//js/bundle.js',
        }
      },
      route: hexoRoute,
    };
    const promise = concatJS.call(hexo);
    return promise.then(() => {
      for (const file of fixtures) {
        if (file.includes('.html')) {
          const $ = cheerio.load(hexoRoute.buffer[file]);
          $('script[src]').each((idx, ele) => {
            const $script = $(ele);
            const src = $script.attr('src');
            if(src !== hexo.config.js_concator.bundlePath) {
              expect(src.startsWith('//') || src.startsWith('http')).to.be.true;
            }
          });
        } else if (file.includes('.js')) {
          expect(hexoRoute.buffer[format(file)], 'js file has been removed').to.be.undefined;
        }
        expect(hexoRoute.buffer[format(hexo.config.js_concator.bundlePath)]).to.has.length.greaterThan(0);
      }
    });
  });
});