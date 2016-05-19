'use strict'
let buddyControllers = require('../controllers/buddy.js');
let db = require('../controllers/controller.js');
let Buddy =db.Buddy;
let Donor = db.Donor;
let Hospital = db.Hospital;

let chai = require('chai');
let expect = chai.expect;
let http_mocks = require('node-mocks-http');

function buildResponse() {
  return http_mocks.createResponse({eventEmitter: require('events').EventEmitter})
}

describe('BloodBuddy', function() {
  describe('requestBuddy', function() {
    //Need Hospital and donor information to create request
    let testDonor;
    let testHospital;
    before(function(done) {
      Promise.all([
        Donor.create({name: 'testdonor'}),
        Hospital.create({name: 'testhospital'})
        ]).then(results => {
          testDonor = results[0];
          testHospital = results[1];
          done();
        });
      });

    it('should let donor to request a buddy', function(done) {
      let response = buildResponse();
      let request = http_mocks.createRequest({
        method: 'POST',
        url: '/',
        body: {
          time: new Date().toUTCString(),
          hospitalId: testHospital.id
        }
      });
      request.user = {type:'donor',id: testDonor.id};

      response.on('end', function() {
        Buddy.destroy({where: {id: response._getData().id}});
        expect(response._getData().id).to.be.above(0);
        expect(response._getData().budId).to.be.undefined;
        done();
      });
      buddyControllers.requestBuddy(request, response);
    });
    after(function() {
      Donor.destroy({where: {name: 'testdonor'}});
      Hospital.destroy({where: {name: 'testhospital'}});
    });

  });
  it('should show the buddy request information on page', function(done) {


  });
});