'use strict';
const fs = require('fs');
const resolve = require('path').resolve;
const chai = require('chai');
chai.use(require('chai-spies'));

const htmlMinifier = require('../lib/optimizeHTML');

const expect = chai.expect;
// Configure
const files = fs.readdirSync(resolve(__dirname, './fixture'));
const htmls = [];
for (const file of files) {
  if (file.endsWith('.html')) {
    const path = resolve(__dirname, './fixture', file);
    htmls.push({ str: fs.readFileSync(path, { encoding: 'utf-8' }), path });
  }
}

describe('OptimizeHTML', () => {
  const hexo = {
    config: {
      html_minifier: {
        enable: true,
        exclude: 'src/**/*',
        ignoreCustomComments: [/^\s*more/],
        removeComments: true,
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true,
        silent: false
      }
    }
    // log: { info: (msg) => expect(msg).is.string }
  };

  it('should do nothing if options.enable is false', () => {
    hexo.config.html_minifier.enable = false;
    expect(htmlMinifier.call(hexo)).to.be.undefined;
    hexo.config.html_minifier.enable = true;
  });

  it('should minify html', () => {
    for (const data of htmls) {
      expect(htmlMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);
    }

    const excludeData = { str: '<html><body>                  <!-- asdfsdf --></body></html>', path: 'src/usr/absolute' };
    expect(htmlMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
  });

  describe('silent option', () => {
    hexo.log = {
      info: console.info,
      debug: console.log
    };
    beforeEach(() => {
      chai.spy.on(hexo.log, ['info', 'debug']);
    });
    afterEach(() => {
      chai.spy.restore(hexo.log);
    });

    it('should call log.info with default options', () => {
      for (const data of htmls) {
        expect(htmlMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);
        expect(hexo.log.info).to.have.been.called();
      }

      chai.spy.restore(hexo.log);
      chai.spy.on(hexo.log, ['info', 'debug']);
      const excludeData = { str: '<html><body>                  <!-- asdfsdf --></body></html>', path: 'src/usr/absolute' };
      expect(htmlMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
      expect(hexo.log.info).to.have.not.been.called();
    });

    it('should not call log.info in slient mode', () => {
      hexo.config.html_minifier.silent = true;
      for (const data of htmls) {
        expect(htmlMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);
        expect(hexo.log.info).to.have.not.been.called();
      }

      chai.spy.restore(hexo.log);
      chai.spy.on(hexo.log, ['info', 'debug']);
      const excludeData = { str: '<html><body>                  <!-- asdfsdf --></body></html>', path: 'src/usr/absolute' };
      expect(htmlMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
      expect(hexo.log.info).to.have.not.been.called();
    });
  });


});
