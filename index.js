var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var Client = require('mariasql');
var rx = require('rx');
var yaml = require('js-yaml');

var runQuery = require('./runquery');

var client = null;
var requestsConfig = null;

var pDbConfig = fs.readFileAsync(__dirname + '/conf/db.yaml', {
    encoding: 'utf8'
}).then(yaml.safeLoad);

var pRequestsConfig = fs.readFileAsync(__dirname + '/conf/requests.yaml', {
    encoding: 'utf8'
}).then(yaml.safeLoad);

Promise.all([pDbConfig, pRequestsConfig]).spread(function (dbConfig, _requestsConfig) {
    requestsConfig = _requestsConfig;
    return new Promise(function (resolve, reject) {
        client = new Client();
        client.connect(dbConfig);
        client.on('connect', function () {
            resolve();
        }).on('error', function () {
            reject();
        });
    });
}).then(function () {
    console.log('findAll:');
    var query = client.prepare(requestsConfig['users.findAll']);
    return runQuery.forPromise(client, query, null, function (row) {
        console.log(row);
    });
}).then(function () {
    console.log('findByName:');
    var query = client.prepare(requestsConfig['users.findByName']);
    return runQuery.forPromise(client, query, {name: 'Cy'}, function (row) {
        console.log(row);
    });
}).then(function () {
    console.log('finished without error');
    client.end();
}).catch(function (err) {
    console.log('error');
    console.log(err);
});
