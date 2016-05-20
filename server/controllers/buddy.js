'use strict'

let db = require('../controllers/controller.js');
let Donor = db.Donor;
let Hospital = db.Hospital;
let Buddy = db.Buddy;
let Appointment = db.Appointment;

let requestBuddy = (req, res) => {
  let donorId = req.user.type === 'donor' ? req.user.id : null;
  Buddy.create({
    time: req.body.time,
    donorId: donorId,
    hospitalId: req.body.hospitalId})
  .then(buddy => res.send(buddy));
};


let getBuddy = (req, res) => {
  Buddy.findOne({where:
    {id: req.params.id},
    include: [{
      model: Donor,
      as: 'donor',
      attributes: {
        exclude: ['password', 'email', 'address', 'latitude', 'longitude']
      }
    }, {
      model: Donor,
      as: 'bud',
      attributes: {
        exclude: ['password', 'email', 'address', 'latitude', 'longitude']
      }
    },
    Hospital]})
  .then(buddy => res.send(buddy));

};

let updateBuddy = (req, res) => {
  Buddy.findOne({where: {id: req.params.id},
    include: [{
      model: Donor,
      as: 'donor',
      attributes: {
        exclude: ['password', 'email', 'address', 'latitude', 'longitude']
      }
    }, {
      model: Donor,
      as: 'bud',
      attributes: {
        exclude: ['password', 'email', 'address', 'latitude', 'longitude']
      }
    },
    {
      model: Hospital,
      attributes: {
        exclude: ['password']
      }
    }]
  })
  .then(buddy => {
    Promise.all([
      Appointment.create({time: buddy.time, donorId: buddy.donorId, hospitalId: buddy.hospitalId, type: 3}),
      Appointment.create({time: buddy.time, donorId: req.user.id, hospitalId: buddy.hospitalId, type: 3}),
      buddy.update({
        budId: req.user.id
      })])
    .then(results => {
      res.send(results[2]);
    });
  });
};

module.exports.getBuddy = getBuddy;
module.exports.requestBuddy = requestBuddy;
module.exports.updateBuddy = updateBuddy;
