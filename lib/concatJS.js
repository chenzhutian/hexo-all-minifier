'use strict';

const cheerio = require('cheerio');
const Promise = require('bluebird');

function concatJS(data) {
  const hexo = this;
  const options = hexo.config.js_concator;
  // Reture if disabled.
  if (options.enable === false) return;

  const log = hexo.log || console;
  const route = hexo.route;
  const routeList = route.list();

  // 1. get all local scripts
  const scripts = [];
  const bundlePath = options.bundlePath;
  return Promise.all(routeList.filter(path => path.endsWith('.html')).map(path => {
    return new Promise((resolve, reject) => {
      const html = route.get(path);
      let htmlTxt = ''
      html.on('data', (chunk) => (htmlTxt += chunk));
      html.on('end', () => {
        const $ = cheerio.load(htmlTxt);
        let concat = false;
        $('script[src]').each((idx, ele) => {
          const $script = $(ele);
          const src = $script.attr('src');
          if(src && src.length) {
            // local script
            if(!src.startsWith('//') && !src.startsWith('http')) {
              if(scripts.indexOf(src) === -1) {
                scripts.push(src);
              }
              // remove the script tag from html
              log.info('remove script %s from %s', src, path);
              $script.remove();
              concat = true;
            }
          }
        });
        if (concat) {
          log.info('add script %s to %s', bundlePath, path);
          $('body').append(`<script type="text/javascript" src="${bundlePath}"></script>`);
          route.set(path, $.html());
        }
        log.log('finish html %s', path);
        resolve();
      });
    });
  }))
    // 2. concat the script
    .then(() => {
      log.info('try to concat %s scripts', scripts.length);
      return Promise.all(scripts.map(path => {
        return new Promise((resolve, reject) => {
          const script = route.get(path);
          log.log('ready concat script %s', path);
          let scriptTxt = '';
          script.on('data', chunk => (scriptTxt += chunk));
          script.on('end', () => {
            route.remove(path);
            log.info('concat script %s', path);
            resolve(scriptTxt);
          });
        });
      })).then(results => {
        const bundleScript = results.reduce((txt, script) => (txt += script), '');
        route.set(route.format(bundlePath), bundleScript);
        log.info('finish concat js script');
      });
    });
}

module.exports = concatJS;