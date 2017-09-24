'use strict';
const chai = require('chai');

const expect = chai.expect;

const cssMinifier = require('../lib/optimizeCSS');

describe('OptimizeCSS', () => {

  it('should do nothing if options.enable is false', () => {
    const hexo = {
      config: {
        css_minifier: {
          enable: false,
        }
      }
    };
    expect(cssMinifier.call(hexo)).to.be.undefined;
  });

  describe('exclude options', () => {
    it('should warp the exclude to an array if it is not an array', () => {
      const hexo = {
        config: {
          css_minifier: {
            enable: true,
            exclude: 'src/**/*'
          }
        }
      };
      const str = 'strstr';
      const datas = [{ path: 'src/usr/absolute' }, { path: 'src/test.txt' }];
      for (const data of datas) {
        expect(cssMinifier.call(hexo, str, data)).to.deep.equal(str);
      }
    });
  });

  it('should minify css', () => {
    const hexo = {
      config: {
        css_minifier: {
          enable: true,
          exclude: 'src/**/*'
        }
      }
    };
    const data = { str:'h { background: red;     }', path: 'test.txt' };
    expect(cssMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);

    const excludeData = { str:'h { background: red;     }', path: 'src/usr/absolute' };
    expect(cssMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
  });
});
