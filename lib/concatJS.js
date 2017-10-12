'use strict';

const cheerio = require('cheerio');
const Promise = require('bluebird');

function concatJS(data) {
  const hexo = this;
  const log = hexo.log || console;
  const routeList = this.route.list();

  log.debug('===============after_generate================');
  // 1. get all local scripts
  const scripts = [];
  const bundlePath = '/js/bundle.js';
  return Promise.all(routeList.filter(path => path.endsWith('.html')).map(path => {
    return new Promise((resolve, reject) => {
      const html = this.route.get(path);
      let htmlTxt = ''
      html.on('data', (chunk) => (htmlTxt += chunk.trim()));
      html.on('end', () => {
        const $ = cheerio.load(htmlTxt);
        let concat = false;
        $('script[src]').each((idx, ele) => {
          const $script = $(ele);
          const src = $script.attr('src');
          // if is local script
          if (!src.startsWith('//') && !src.startsWith('http')) {
            if (scripts.indexOf(src) === -1) {
              scripts.push(src);
            }
            // remove the script tag from html
            log.info('remove script %s from %s', src, path);
            $script.remove();
            concat = true;
          }
        });
        if (concat) {
          log.info('add script %s to %s', bundlePath, path);
          $('body').append(`<script type="text/javascript" src="${bundlePath}"></script>`);
          this.route.set(path, $.html());
        }
        log.debug('finish html, a html %s', path);
        resolve();
      });
    });
  }))
    // 2. concat the script
    .then(() => {
      log.info('try to concat %s scripts', scripts.length);
      return Promise.all(scripts.map(path => {
        return new Promise((resolve, reject) => {
          const script = this.route.get(path);
          log.debug('ready concat script %s', path);
          let scriptTxt = '';
          script.on('data', chunk => (scriptTxt += chunk.trim()));
          script.on('end', () => {
            this.route.remove(path);
            log.info('concat script %s', path);
            resolve(scriptTxt);
          });
        });
      })).then(results => {
        const bundleScript = results.reduce((txt, script) => (txt += script), '');
        this.route.set(bundlePath, bundleScript);
        log.info('finish concat js script');
      });
    });
}

module.exports = concatJS;