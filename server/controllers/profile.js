'use strict'
let db = require('../controllers/controller.js');
let Donor = db.Donor;
let Event = db.Event;
let Hospital = db.Hospital;
let Appointment = db.Appointment;

let getCurrentDonor = (req, res) => {
  Donor.findOne({
    where: {
      id: req.user.id
    },
    attributes: {
      exclude: ['password']
    },
    include: [{
      model: Event,
      include: [{
        model: Hospital,
        attributes: {
          exclude: ['password']
        }
      }]
    }, {
      model: Donor,
      as: 'friends',
      through: 'friends',
      attributes: {
        exclude: ['email', 'password', 'address', 'latitude', 'longitude']
      }
    }, {
      model: Appointment,
      include: [{
        model: Hospital,
        attributes: {
          exclude: ['password']
        }
      }]
    }]})
  .then(user => {
    res.send(user);
  });
};

let updateCurrentDonor = (req, res) => {
  Donor.findOne({
    where: {
      id: req.user.id
    },
    attributes: {
      exclude: ['password']
    },
    include: [{
      model: Event,
      include: [{
        model: Hospital,
        attributes: {
          exclude: ['password']
        }
      }]
    }, {
      model: Donor,
      as: 'friends',
      through: 'friends',
      attributes: {
        exclude: ['email', 'password', 'address', 'latitude', 'longitude']
      }
    }, {
      model: Appointment,
      include: [{
        model: Hospital,
        attributes: {
          exclude: ['password']
        }
      }]
    }]
  })
  .then(user => {
    user.update(req.body)
    .then(() => res.send(user));
  });
};

let getDonorById = (req, res) => {
  Donor.findOne({
    where: {
      id: req.params.id
    },
    attributes: {
      exclude: ['email', 'password', 'address', 'longitude', 'latitude']
    },
    include: [{
      model: Appointment,
      include: [{
        model: Hospital,
        attributes: {
          exclude: ['password']
        }
      }]
    }, {
        model: Donor,
        as: 'friends',
        through: 'friends',
        attributes: {
          exclude: ['email', 'password', 'address', 'latitude', 'longitude']
        }
      }]
    })
  .then(user => {
    res.send(user);
  });
};

let getDonorsByLocation = (req, res) => {
  let queries = req.query;
  Donor.findAll({
    where: {
      latitude: {$gt: queries.minLat, $lt: queries.maxLat},
      longitude: {$gt: queries.minLong, $lt: queries.maxLong}
    },
    attributes: {
      exclude: ['email', 'password', 'address', 'latitude', 'llongitude']
    },
    include:[Appointment],
  })
  .then(donors => {
    donors.sort(function(a,b){
      if (a.appointments.length > b.appointments.length) {
        return -1;
      }
      if (a.appointments.length < b.appointments.length) {
        return 1;
      }
      return 0;
    });
    res.send(donors.slice(0, 5));
  });
};


module.exports.getCurrentDonor = getCurrentDonor;
module.exports.updateCurrentDonor = updateCurrentDonor;
module.exports.getDonorById = getDonorById;
module.exports.getDonorsByLocation = getDonorsByLocation;
