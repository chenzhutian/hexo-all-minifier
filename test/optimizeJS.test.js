'use strict';
const chai = require('chai');
chai.use(require('chai-spies'));

const expect = chai.expect;

const jsMinifier = require('../lib/optimizeJS');

describe('OptimizeJS', () => {

  it('should do nothing if options.enable is false', () => {
    const hexo = {
      config: {
        js_minifier: {
          enable: false
        }
      }
    };
    expect(jsMinifier.call(hexo)).to.be.undefined;
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
    const data = { str: 'var a = 10;   var b =  ()=>{console.log(a);}            ', path: 'test.txt' };
    expect(jsMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);

    const excludeData = { str: 'var a = 10;               var b = function(){};', path: 'src/usr/absolute' };
    expect(jsMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
  });

  describe('silent option', () => {
    const hexo = {
      config: {
        js_minifier: {
          enable: true,
          exclude: 'src/**/*',
          silent: false
        }
      },
      log: {
        info: console.info,
        debug: console.log
      }
    };
    beforeEach(() => {
      chai.spy.on(hexo.log, ['info', 'debug']);
    });
    afterEach(() => {
      chai.spy.restore(hexo.log);
    });

    it('should call log.info with default options', () => {
      const data = { str: 'var a = 10;   var b =  ()=>{console.log(a);}            ', path: 'test.txt' };
      expect(jsMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);
      expect(hexo.log.info).to.have.been.called();

      chai.spy.restore(hexo.log);
      chai.spy.on(hexo.log, ['info', 'debug']);
      const excludeData = { str: 'var a = 10;               var b = function(){};', path: 'src/usr/absolute' };
      expect(jsMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
      expect(hexo.log.info).to.have.not.been.called();
    });

    it('should not call log.info in silent mode', () => {
      hexo.config.js_minifier.silent = true;
      const data = { str: 'var a = 10;   var b =  ()=>{console.log(a);}            ', path: 'test.txt' };
      expect(jsMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);
      expect(hexo.log.info).to.have.not.been.called();

      chai.spy.restore(hexo.log);
      chai.spy.on(hexo.log, ['info', 'debug']);
      const excludeData = { str: 'var a = 10;               var b = function(){};', path: 'src/usr/absolute' };
      expect(jsMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
      expect(hexo.log.info).to.have.not.been.called();
    });
  });
});
