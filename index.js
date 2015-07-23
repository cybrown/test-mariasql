var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var Client = require('mariasql');
var yaml = require('js-yaml');

var MariaSqlDriver = require('./mariasqldriver');
var SqlHelper = require('./sqlhelper');

var requestsConfig = null;
var sqlhelper;

var pDbConfig = fs.readFileAsync(__dirname + '/conf/db.yaml', {
    encoding: 'utf8'
}).then(yaml.safeLoad);

var pRequestsConfig = fs.readFileAsync(__dirname + '/conf/requests.yaml', {
    encoding: 'utf8'
}).then(yaml.safeLoad);

Promise.all([pDbConfig, pRequestsConfig]).spread(function (dbConfig, _requestsConfig) {
    requestsConfig = _requestsConfig;
    return new Promise(function (resolve, reject) {
        var client = new Client();
        client.connect(dbConfig);
        client.on('connect', function () {
            resolve();
            sqlhelper = new SqlHelper(new MariaSqlDriver(client));
        }).on('error', function () {
            reject();
        });
    });
}).then(function () {
    console.log('queryObservable:');
    var query = sqlhelper.prepare(requestsConfig.users.findAll);
    return new Promise(function (resolve, reject) {
        sqlhelper.queryObservable(query, null).subscribe(function (row) {
            console.log(row);
        }, reject, resolve);
    });
}).then(function () {
    console.log('queryArray:');
    var query = sqlhelper.prepare(requestsConfig.users.findAll);
    return sqlhelper.queryArray(query, null).then(function (result) {
        console.log(result);
    });
}).then(function () {
    console.log('querySingle:');
    var query = sqlhelper.prepare(requestsConfig.users.findByName);
    return sqlhelper.querySingle(query, {name: 'Cy'}).then(function (row) {
        console.log(row);
    });
}).then(function () {
    console.log('exec:');
    var query = sqlhelper.prepare(requestsConfig.users.saveByName);
    return sqlhelper.exec(query, {oldName: 'Cy2', name: 'Cy'});
}).then(function (info) {
    console.log(info);
}).then(function () {
    console.log('finished without error');
    sqlhelper.close();
}).catch(function (err) {
    console.error(err.stack);
    sqlhelper.close();
});
