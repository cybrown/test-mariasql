var rx = require('rx');
var Promise = require('bluebird');

var Nil = {};

function SqlHelper(driver) {
    this._driver = driver;
}

SqlHelper.prototype.prepare = function (sql) {
    return this._driver.prepare(sql);
};

SqlHelper.prototype.close = function () {
    return this._driver.close();
};

SqlHelper.prototype.queryArray = function (query, params) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var result = [];
        _this.queryObservable(query, params).subscribe(
            function (row) {
                result.push(row);
            },
            reject,
            function () {
                resolve(result);
            }
        );
    });
};

SqlHelper.prototype.queryObservable = function (query, params) {
    return this._driver.queryForObservable(query, params);
};

SqlHelper.prototype.querySingle = function (query, params) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var result = Nil;
        _this.queryObservable(query, params).subscribe(function (row) {
            if (result != Nil) {
                throw new Error('Only one result expected');
            } else {
                result = row;
            }
        }, reject, function () {
            if (result == Nil) {
                throw new Error('Empty result set');
            } else {
                resolve(result);
            }
        });
    });
};

SqlHelper.prototype.exec = function (query, params) {
    return this._driver.exec(query, params);
};

module.exports = SqlHelper;
