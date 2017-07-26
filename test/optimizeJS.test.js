'use strict';
const expect = require('chai').expect;

const jsMinifier = require('../lib/optimizeJS');

describe('OptimizeJS', () => {

  it('should do nothing if options.enable is false', () => {
    const hexo = {
      config: {
        js_minifier: {
          enable: false,
        }
      }
    };
    expect(jsMinifier.call(hexo)).to.be.undefined;
  });

  describe('exclude options', () => {
    it('should warp the exclude to an array if it is not an array', () => {
      const hexo = {
        config: {
          js_minifier: {
            enable: true,
            exclude: 'src/**/*'
          }
        }
      };
      const str = 'strstr';
      const datas = [{ path: 'src/usr/absolute' }, { path: 'src/test.txt' }];
      for (const data of datas) {
        expect(jsMinifier.call(hexo, str, data)).to.deep.equal(str);
      }
    });
  });

  it('should minify js', () => {
    const hexo = {
      config: {
        js_minifier: {
          enable: true,
          exclude: 'src/**/*'
        }
      }
    };
    const data = { str:'var a = 10;               var b = function(){};', path: 'test.txt' };
    expect(jsMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);

    const excludeData = { str:'var a = 10;               var b = function(){};', path: 'src/usr/absolute' };
    expect(jsMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
  });
});