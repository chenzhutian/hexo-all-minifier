'use strict';
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const cheerio = require('cheerio');
const minimatch = require('minimatch');

// Local modules.
const concatJS = require('../lib/concatJS');
const format = require('./utils').hexoPathFormat;

// Configure.
const fixtures = [];
const files = fs.readdirSync(path.resolve(__dirname, './fixture'));
const htmls = {};
for (const file of files) {
  fixtures.push(format(file));
  if (file.endsWith('.html') || file.endsWith('.js')) {
    htmls[file] = fs.readFileSync(path.resolve(__dirname, './fixture', file), { encoding: 'utf-8' });
  }
}

// Stub hexo.route.
const hexoRoute = {
  buffer: null,
  get(name) {
    if (this.buffer[this.format(name)]) {
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
  beforeEach(() => {
    hexoRoute.buffer = fixtures.reduce((o, file) => {
      o[file] = htmls[file];
      return o;
    }, {});
  });

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

  describe('when no `include` option', () => {
    // Configure.
    const hexo = {
      config: {
        js_concator: {
          enable: true,
          bundle_path: '//js/bundle.js',
        }
      },
      route: hexoRoute,
    };

    it('should not touch the remote scripts', () => {

      const promise = concatJS.call(hexo);
      return promise.then(() => {
        for (const file of fixtures) {
          if (file.includes('.html')) {
            const $raw = cheerio.load(htmls[file]);
            const expectRemoteScripts = [];
            $raw('script[src]').each((idx, ele) => {
              const $script = $raw(ele);
              const src = $script.attr('src');
              if (src.startsWith('//') || src.startsWith('http')) {
                expectRemoteScripts.push(src);
              }
            });

            const $ = cheerio.load(hexoRoute.buffer[file]);
            const actualRemoteScripts = [];
            $('script[src]').each((idx, ele) => {
              const $script = $(ele);
              const src = $script.attr('src');
              if (src.startsWith('//') || src.startsWith('http')) {
                actualRemoteScripts.push(src);
              }
            });
            expect(actualRemoteScripts).to.be.deep.equal(expectRemoteScripts);
          }
        }
      });
    });

    it('should concat scripts which exist in some htmls', () => {

      const promise = concatJS.call(hexo);
      return promise.then(() => {
        for (const file of fixtures) {
          if (file.includes('.html')) {
            // extract srcs
            const $ = cheerio.load(hexoRoute.buffer[file]);
            const srcs = [];
            $('script[src]').each((idx, ele) => {
              const $script = $(ele);
              const src = $script.attr('src');
              srcs.push(src);
            });
            // assertion
            if (file === 'concatJS1.html') {
              expect(srcs.some(src => src.startsWith('/script2.js'))).to.be.false;
            }
          } else if (file.includes('script2.js')) {
            expect(hexoRoute.buffer[format(file)], 'js file has been removed').to.be.undefined;
          }
        }
      });
    });

    it('should concat scripts which exist in all htmls', () => {

      const promise = concatJS.call(hexo);
      return promise.then(() => {
        for (const file of fixtures) {
          if (file.includes('.html')) {
            // extract js
            const $ = cheerio.load(hexoRoute.buffer[file]);
            const srcs = [];
            $('script[src]').each((idx, ele) => {
              const $script = $(ele);
              const src = $script.attr('src');
              srcs.push(src);
            });

            // assertion
            if (file === 'concatJS1.html' || file === 'concatJS2.html') {
              expect(srcs).contains(format(hexo.config.js_concator.bundle_path));
            } else {
              expect(srcs).does.not.contains(format(hexo.config.js_concator.bundle_path));
            }
          } else if (file.includes('script1.js') || file.includes('script3.js')) {
            expect(hexoRoute.buffer[format(file)], 'js file has been removed').to.be.undefined;
          }
          expect(hexoRoute.buffer[format(hexo.config.js_concator.bundle_path)]).to.has.length.greaterThan(0);
        }
      });
    });
  });

  // describe('when `include` option exist', () => {
  //   // Configure.
  //   let include = ['script2'];
  //   const hexo = {
  //     config: {
  //       js_concator: {
  //         enable: true,
  //         bundle_path: '//js/bundle.js',
  //         include,
  //       }
  //     },
  //     route: hexoRoute,
  //   };

  //   beforeEach(() => {
  //     include = ['script2'];
  //   });

  //   it('should warp the `include` to an array if it is not an array', () => {
  //     include = 'script'
  //     hexo.config.js_concator.include = include;
  //     const promise = concatJS.call(hexo);
  //     return promise.then(() => {
  //       for (const file of fixtures) {
  //         if (file.includes('.html')) {
  //           // extract src
  //           const $ = cheerio.load(hexoRoute.buffer[file]);
  //           const srcs = [];
  //           $('script[src]').each((idx, ele) => {
  //             const $script = $(ele);
  //             const src = $script.attr('src');
  //             srcs.push(src);
  //           });

  //           // assertion
  //           if (file === 'concatJS1.html' || file === 'concatJS2.html') {
  //             expect(srcs).contains(format(hexo.config.js_concator.bundle_path));
  //           } else {
  //             expect(srcs).does.not.contains(format(hexo.config.js_concator.bundle_path));
  //           }
  //         } else if (file.includes('script1.js') ||
  //           file.includes('script3.js') ||
  //           [include].some(pattern => minimatch(file, pattern, { matchBase: true }))) {
  //           expect(hexoRoute.buffer[format(file)], 'js file has been removed').to.be.undefined;
  //         }
  //         expect(hexoRoute.buffer[format(hexo.config.js_concator.bundle_path)]).to.has.length.greaterThan(0);
  //       }
  //     });
  //   });

  //   it('should not touch the remote scripts', () => {

  //     const promise = concatJS.call(hexo);
  //     return promise.then(() => {
  //       for (const file of fixtures) {
  //         if (file.includes('.html')) {
  //           const $raw = cheerio.load(htmls[file]);
  //           const expectRemoteScripts = [];
  //           $raw('script[src]').each((idx, ele) => {
  //             const $script = $raw(ele);
  //             const src = $script.attr('src');
  //             if (src.startsWith('//') || src.startsWith('http')) {
  //               expectRemoteScripts.push(src);
  //             }
  //           });

  //           const $ = cheerio.load(hexoRoute.buffer[file]);
  //           const actualRemoteScripts = [];
  //           $('script[src]').each((idx, ele) => {
  //             const $script = $(ele);
  //             const src = $script.attr('src');
  //             if (src.startsWith('//') || src.startsWith('http')) {
  //               actualRemoteScripts.push(src);
  //             }
  //           });
  //           expect(actualRemoteScripts).to.be.deep.equal(expectRemoteScripts);
  //         }
  //       }
  //     });
  //   });

  //   it('should concat scripts which exist in all htmls (which have local scripts) or match the `include pattern`', () => {
  //     const promise = concatJS.call(hexo);
  //     return promise.then(() => {
  //       for (const file of fixtures) {
  //         if (file.includes('.html')) {
  //           // extract src
  //           const $ = cheerio.load(hexoRoute.buffer[file]);
  //           const srcs = [];
  //           $('script[src]').each((idx, ele) => {
  //             const $script = $(ele);
  //             const src = $script.attr('src');
  //             srcs.push(src);
  //           });

  //           // assertion
  //           if (file === 'concatJS1.html' || file === 'concatJS2.html') {
  //             expect(srcs).contains(format(hexo.config.js_concator.bundle_path));
  //           } else {
  //             expect(srcs).does.not.contains(format(hexo.config.js_concator.bundle_path));
  //           }
  //         } else if (file.includes('script1.js') ||
  //           file.includes('script3.js') ||
  //           include.some(pattern => minimatch(file, pattern, { matchBase: true }))) {
  //           expect(hexoRoute.buffer[format(file)], 'js file has been removed').to.be.undefined;
  //         }
  //         expect(hexoRoute.buffer[format(hexo.config.js_concator.bundle_path)]).to.has.length.greaterThan(0);
  //       }
  //     });
  //   });
  // });
});