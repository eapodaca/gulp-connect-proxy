var url = require('url');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var extend = require('extend');


function proxyRequest(config, localRequest, localResponse, next) {

    var base = config.proxyRoot || 'http://';

    var params = url.parse(base + localRequest.url.slice(1), true);

    var headers = localRequest.headers;
    headers.host = params.host;

    var reqOptions = {
        host: params.host.split(":")[0],
        port: params.port ? params.port : 80,
        path: params.path,
        headers: headers,
        method: localRequest.method
    };

    var httpLib = http;

    if(params.protocol.indexOf('https') !== -1) {
        reqOptions.rejectUnauthorized = false;
        httpLib = https;
    }

    var req = httpLib.request(reqOptions, function (res) {

        var resHeaders = res.headers;

        localResponse.writeHead(res.statusCode, resHeaders);

        var body = "";
        res.on('data', function (data) {
            body += data;
            localResponse.write(data);
        });
        res.on('end', function () {
            localResponse.end();

        });
    });
    req.on('error', function (e) {
        localResponse.writeHead(503);
        localResponse.write("Error: " + e.message);
        localResponse.end();
    });

    if (/POST|PUT/i.test(localRequest.method)) {
        localRequest.pipe(req);
    } else {
        req.end();
    }

};

function Proxy(options) {
    var config = extend({}, {
        route: ''
    }, options);

    return function (localRequest, localResponse, next) {
        if (typeof config.root === 'string') {
            config.root = [config.root]
        } else if (!Array.isArray(config.root)) {
            throw new Error('No root specified')
        }

        var pathChecks = []
        config.root.forEach(function (root, i) {
            var p = path.resolve(root) + localRequest.url;

            fs.access(p, function (err) {
                pathChecks.push(err ? false : true)
                if (config.root.length == ++i) {
                    var pathExists = pathChecks.some(function (p) {
                        return p;
                    });
                    if (pathExists) {
                        next();
                    } else {
                        if (localRequest.url.slice(0, config.route.length) === config.route) {
                            localRequest.url = localRequest.url.slice(config.route.length);
                            proxyRequest(config, localRequest, localResponse, next);
                        } else {
                            return next();
                        }
                    }
                }
            });
        })
    }
}

module.exports = Proxy;
