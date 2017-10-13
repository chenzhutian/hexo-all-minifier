'use strict';
const fs = require('fs');
const resolve = require('path').resolve;
const expect = require('chai').expect;

const htmlMinifier = require('../lib/optimizeHTML');

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
        minifyCSS: true
      }
    },
    log: { log: (msg) => expect(msg).is.string }
  };

  it('should do nothing if options.enable is false', () => {
    hexo.config.html_minifier.enable = false;
    expect(htmlMinifier.call(hexo)).to.be.undefined;
    hexo.config.html_minifier.enable = true;
  });

  describe('exclude options', () => {
    it('should warp the exclude to an array if it is not an array', () => {

      const str = 'strstr';
      const datas = [{ path: 'src/usr/absolute' }, { path: 'src/test.txt' }];
      for (const data of datas) {
        expect(htmlMinifier.call(hexo, str, data)).to.deep.equal(str);
      }
    });
  });

  it('should minify html', () => {
    for (const data of htmls) {
      expect(htmlMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);
    }

    const excludeData = { str: '<html><body>                  <!-- asdfsdf --></body></html>', path: 'src/usr/absolute' };
    expect(htmlMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
  });
});