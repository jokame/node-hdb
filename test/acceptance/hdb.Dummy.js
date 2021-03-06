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
/* jshint undef:false */

var db = require('../lib').createDatabase();

describe('Database', function () {
  before(db.connect.bind(db));
  after(db.disconnect.bind(db));
  var client = db.client;

  describe('Table DUMMY', function () {
    describe('#Query', function () {

      it('should return a single dummy row', function (done) {
        var sql = 'select * from DUMMY';
        client.exec(sql, function (err, rows) {
          if (err) {
            return done(err);
          }
          rows.should.have.length(1);
          rows[0].should.eql({
            DUMMY: 'X'
          });
          done();
        });
      });

    });
  });

});