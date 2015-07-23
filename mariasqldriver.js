var util = require('util');
var rx = require('rx');
var Promise = require('bluebird');

function MariaSqlDriver (client) {
    this._client = client;
}

MariaSqlDriver.prototype.prepare = function (sql) {
    return this._client.prepare(sql);
};

MariaSqlDriver.prototype.close = function () {
    return this._client.end();
};

MariaSqlDriver.prototype.queryForObservable = function (query, params) {
    var _this = this;
    return rx.Observable.create(function (observer) {
        var res = null;
        _this._client.query(query(params)).on('result', function (_res) {
            res = _res;
            res.on('row', function (row) {
                observer.onNext(row);
            }).on('error', function (err) {
                observer.onError(err);
            });
        }).on('error', function (err) {
            observer.onError(err);
        }).on('end', function () {
            observer.onCompleted();
        });

        return function () {
            if (res != null) {
                res.abort();
            }
        };
    });
};

MariaSqlDriver.prototype.exec = function (query, params) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var info = null;
        _this._client.query(query(params)).on('result', function (res) {
            res.on('error', function (err) {
                reject(err);
            }).on('end', function (_info) {
                info = _info;
            });
        }).on('error', function (err) {
            reject(err);
        }).on('end', function () {
            resolve(info);
        });
    });
};

module.exports = MariaSqlDriver;
