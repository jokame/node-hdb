// Copyright 2013 SAP AG.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http: //www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an 
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific 
// language governing permissions and limitations under the License.
'use strict';
/* jshint undef:false, expr:true */

var async = require('async');
var Statement = require('../lib').Statement;
var db = require('../lib').createDatabase();

describe('Database', function () {
  before(db.connect.bind(db));
  after(db.disconnect.bind(db));
  var client = db.client;

  describe('Table NUMBERS', function () {
    before(db.createNumbers.bind(db, [0, 25]));
    after(db.dropNumbers.bind(db));

    describe('#PrepareStatement', function () {

      it('should create and execute a prepared statement', function (done) {
        var sql = 'select * from NUMBERS where B like ? order by A';
        var statement;
        async.series([
          function prepareStatement(callback) {
            client.prepare(sql, function onprepare(err, ps) {
              statement = ps;
              statement.should.be.instanceof(Statement);
              var metadata = statement.parameterMetadata;
              metadata.should.have.length(1);
              var p = metadata[0];
              p.should.have.property('mode', 2);
              p.should.have.property('dataType', 9);
              p.should.have.property('ioType', 1);
              callback(null, statement)
            });
          },
          function endsWithTeen(callback) {
            statement.exec(['%teen'], function (err, rows) {
              if (err) {
                return callback(err);
              }
              rows.should.have.length(7);
              callback();
            });
          },
          function endsWithOne(callback) {
            statement.exec(['%one'], function (err, rows) {
              if (err) {
                return callback(err);
              }
              rows.should.have.length(2);
              callback();
            });
          },
          function dropStatement(callback) {
            statement.drop(callback);
          }
        ], done);
      });

    });


    describe('#ProcedureWithResult', function () {
      before(db.createReadNumbersBetween.bind(db));
      after(db.dropReadNumbersBetween.bind(db));

      it('should read the numbers between 3 and 5', function (done) {
        var sql = 'call READ_NUMBERS_BETWEEN (?, ?, ?)';
        var statement;
        async.series([
          function prepareStatement(callback) {
            client.prepare(sql, function (err, ps) {
              statement = ps;
              var metadata = statement.parameterMetadata;
              metadata.should.have.length(2);
              var p1 = metadata[0];
              p1.should.have.property('mode', 2);
              p1.should.have.property('dataType', 3);
              p1.should.have.property('ioType', 1);
              var p2 = metadata[0];
              p2.should.have.property('mode', 2);
              p2.should.have.property('dataType', 3);
              p2.should.have.property('ioType', 1);
              callback();
            });
          },
          function readNumbersBetween3and5(callback) {
            statement.exec([3, 5], function (err, parameters, rows) {
              if (err) {
                return callback(err);
              }
              console.log(parameters)
              Object.keys(parameters).should.have.length(0);
              arguments.should.have.length(3);
              rows.should.have.length(3)
                .and.eql(db.numbers.slice(3, 6));
              callback();
            });
          },
          function readNumbersBetween8and7(callback) {
            statement.exec([8, 7], function (err, parameters, rows) {
              if (err) {
                return callback(err);
              }
              rows.should.be.empty
              callback();
            });
          },
          function dropStatement(callback) {
            statement.drop(callback);
          }
        ], done);

      });
    });
  });
});