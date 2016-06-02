# gulp-connect-proxy
A simple proxy middleware for gulp-connect

support post request

pass cookie and other headers

# How to use

```javascript
gulp.task('connect', function () {
  connect.server({
    root: [conf.dist],
    port: 9000,
    livereload: true,
    middleware: function (connect, opt) {
      var Proxy = require('gulp-connect-proxy');
      opt.route = '/proxy';
      var proxy = new Proxy(opt);
      return [proxy];
    }
  });
});
```

## Notes:
`opt.route` is optional, if omitted requests made to `http://localhost:9000/foo.com/bar.png` will be proxied.

If `opt.route` is set requests made to `http://localhost:9000/proxy/foo.com/bar.png` will be proxied.

`opt.proxyRoot` is optional, if omitted requests made to `http://localhost:9000/foo.com/bar.png` will be proxied.

If `opt.proxyRoot` is set and `opt.route` is set requests made to `http://localhost:9000/proxy/bar.png` will be proxied to `http://proxyRoot/bar.png`.

**This is for development purposes only**. If you need a proxy in production use Nginx or Apache.


## TODO:
- Write Tests
