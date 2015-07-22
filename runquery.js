var rx = require('rx');
var Promise = require('bluebird');

function toPromise(obs, cb) {
    return new Promise(function (resolve, reject) {
        obs.subscribe(cb, function (err) {
            reject(err);
        }, function () {
            resolve();
        });
    });
}

function runQueryForObservable(c, query, params) {
    return rx.Observable.create(function (observer) {
        var res = null;
        c.query(query(params)).on('result', function (_res) {
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
}

function runQueryForPromise(c, query, params, cb) {
    return toPromise(runQueryForObservable(c, query, params), cb);
}

module.exports.forObservable = runQueryForObservable;
module.exports.forPromise = runQueryForPromise;
