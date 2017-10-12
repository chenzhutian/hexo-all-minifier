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
  const htmls = {};
  const bundlePath = options.bundlePath;
  return Promise.all(routeList.filter(path => path.endsWith('.html')).map(path => {
    // 1. get the htmls that has local scripts
    return new Promise((resolve, reject) => {
      const html = route.get(path);
      let htmlTxt = ''
      html.on('data', (chunk) => (htmlTxt += chunk));
      html.on('end', () => {
        const $ = cheerio.load(htmlTxt);
        const $scripts = {};
        const srcs = [];
        $('script[src]').each((idx, ele) => {
          const $script = $(ele);
          let src = $script.attr('src');
          if (src && src.length) {
            // local script
            if (!src.startsWith('//') && !src.startsWith('http')) {
              src = route.format(src);
              srcs.push(src);
              $scripts[src] = $script;
            }
          }
        });
        if (srcs.length) {
          htmls[path] = { path, $, srcs, $scripts };
        }
        // if (concat) {
        //   log.info('add script %s to %s', bundlePath, path);
        //   $('body').append(`<script type="text/javascript" src="${bundlePath}"></script>`);
        //   route.set(path, $.html());
        // }
        // log.log('finish html %s', path);
        resolve();
      });
    });
  }))
    // 2. extract common scripts
    .then(() => {
      const paths = Object.keys(htmls);
      const commons = [];
      // if a script exists in every html which has scripts
      for (const src of htmls[paths[0]].srcs) {
        if (paths.every(path => htmls[path].srcs.indexOf(src) !== -1)) {
          // remove the script from the html
          paths.forEach(path => {
            log.log('Remove %s from %s', src, path);
            htmls[path].$scripts[src].remove()
          });
          commons.push(src);
        }
      }
      if (commons.length > 1) {
        // add the bundle script to all html
        for (const path of paths) {
          const html = htmls[path];
          html.$('body').append(`<script type="text/javascript" src="${route.format(bundlePath)}"></script>`);
          route.set(path, html.$.html());
          log.log('Add %s to %s', route.format(bundlePath), path);
        }
      }
      return commons;
    })
    // 3. concat the script
    .then((scripts) => {
      if(scripts.length < 1) return;
      log.log('Try to concat %s scripts', scripts.length);
      return Promise.all(scripts.map(path => {
        return new Promise((resolve, reject) => {
          const script = route.get(path);
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