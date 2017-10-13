'use strict';

const cheerio = require('cheerio');
const Promise = require('bluebird');
// const minimatch = require('minimatch');

function concatJS(data) {
  const hexo = this;
  const options = hexo.config.js_concator;
  // Reture if disabled.
  if (options.enable === false) return;

  const log = hexo.log || console;
  const route = hexo.route;
  const routeList = route.list();

  // let include = options.include;
  // if (include && !Array.isArray(include)) include = [include];

  // 1. get all local scripts
  const htmls = {};
  const bundlePath = options.bundle_path;
  const front = options.front;
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
              // ignore and remove duplicated
              if (srcs.indexOf(src) === -1) {
                srcs.push(src);
                $scripts[src] = $script;
              } else {
                $script.remove();
              }
            }
          }
        });
        if (srcs.length) {
          htmls[path] = { path, $, srcs, $scripts };
        }
        resolve();
      });
    });
  }))
    // 2. extract common scripts
    .then(() => {
      const htmlPaths = Object.keys(htmls);
      const scripts = [];
      // collect the scripts
      for (const path of htmlPaths) {
        const html = htmls[path];
        const srcs = html.srcs;
        for (let i = srcs.length - 1; i >= 0; --i) { // reverse for deletion
          const src = srcs[i];
          if (scripts.indexOf(src) === -1) {
            // if a script exists in more than one htmls,
            // TODO, or match the pattern in exclude array
            const count = htmlPaths.reduce((sum, path) => htmls[path].srcs.indexOf(src) !== -1 ? ++sum : sum, 0);
            if (count > 1) {
              // remove
              log.log('update Concate JS: remove %s from %s', src, path);
              html.$scripts[src].remove()
              delete html.$scripts[src];
              srcs.splice(srcs.indexOf(src), 1);
              scripts.push(src);
            }
            // if (htmlPaths.every(path => htmls[path].srcs.indexOf(src) !== -1) ||
            //   include.some(pattern => minimatch(src, pattern, { matchBase: true }))) {
            //}
          } else {
            // remove
            log.log('update Concate JS: remove %s from %s', src, path);
            html.$scripts[src].remove()
            delete html.$scripts[src];
            srcs.splice(srcs.indexOf(src), 1);
          }
        }
        html.srcs = srcs;
      }

      if (scripts.length > 1) {
        // add the bundle script to all html
        for (const path of htmlPaths) {
          const html = htmls[path];
          if (front) {
            html.$(`<script type="text/javascript" src="${route.format(bundlePath)}"></script>`).insertBefore(html.$('body>script').first());
          } else {
            html.$('body').append(`<script type="text/javascript" src="/${route.format(bundlePath)}"></script>`);
          }
          route.set(path, html.$.html());
          log.log('update Concate JS: add /%s to %s', route.format(bundlePath), path);
        }
      }
      return scripts.reverse();
    })
    // 3. concat the script
    .then((scripts) => {
      if (scripts.length < 1) return;
      log.log('update Concate JS: try to concat %s scripts', scripts.length);
      return Promise.all(scripts.map(path => {
        return new Promise((resolve, reject) => {
          const script = route.get(path);
          let scriptTxt = '';
          script.on('data', chunk => (scriptTxt += chunk));
          script.on('end', () => {
            route.remove(path);
            log.info('update Concate JS: concat script %s', path);
            resolve(scriptTxt);
          });
        });
      })).then(results => {
        const bundleScript = results.reduce((txt, script) => (txt += script), '');
        route.set(route.format(bundlePath), bundleScript);
        log.info('update Concate JS: finish concat js script');
      });
    });
}

module.exports = concatJS;