module.exports = {
  hexoPathFormat(path) {
    path = path || '';
    if (typeof path !== 'string') throw new TypeError('path must be a string!');

    path = path
      .replace(/^\/+/, '') // Remove prefixed slashes
      .replace(/\\/g, '/') // Replaces all backslashes
      .replace(/\?.*$/, ''); // Remove query string

    // Appends `index.html` to the path with trailing slash
    if (!path || path[path.length - 1] === '/') {
      path += 'index.html';
    }

    return path;
  },
}