'use strict'
let controllers = require('../controllers/controller.js');
let Hospital = controllers.Hospital;
let Donor = controllers.Donor;
let Review = controllers.Review;
let Schedule = controllers.Schedule;
let Event = controllers.Event;
let url = require('url');

let getCurrentHospital = (req, res) => {
  Hospital.findOne({
    where: {
      id: req.user.id
    },
    attributes: {
      exclude: ['password']
    },
    include: [{
      model: Event,
      include: [{
        model: Donor,
        attributes: {
          exclude: ['email', 'password', 'address', 'latitude', 'longitude']
        }
      }]
    }, {
      model: Review,
      include: [{
        model: Donor,
        attributes: {
          exclude: ['email', 'password', 'address', 'latitude', 'longitude']
        }
      }],
      order: 'createdAt DESC'
    }]
  })
  .then(hospital => res.send(hospital));
};

let updateCurrentHospital = (req, res) => {
  Hospital.findOne({
    where: {
      id: req.user.id
    },
    include: [{
      model: Event,
      include: [{
        model: Donor,
        attributes: {
          exclude: ['email', 'password', 'address', 'latitude', 'longitude']
        }
      }]
    }, {
      model: Review,
      include: [{
        model: Donor,
        attributes: {
          exclude: ['email', 'password', 'address', 'latitude', 'longitude']
        }
      }],
    }, Schedule]
  })
  .then((hospital) => {
    hospital.update(req.body)
    .then(() => {
      if(req.body.schedules){
        req.body.schedules.forEach((schedule) => {
          Schedule.findOne({where: {hospitalId: req.user.id}})
          .then(sch => {
            if(sch) {
              Schedule.update({
                day: schedule.day,
                openhours: schedule.openhours,
                closehours: schedule.closehours
              } ,{where: {day: schedule.day}});
            } else {
              Schedule.create({
                hospitalId: req.user.id,
                day: schedule.day,
                openhours: schedule.openhours,
                closehours: schedule.closehours
              });
            }
          });
        });
      }
    })
    .then(() => res.send(hospital));
  });
};

let getHospitalById = (req, res) => {
  Hospital.findOne({
    where: {
      id: req.params.id
    },
    attributes: {
      exclude: ['password']
    },
    include: [Schedule]
  })
  .then(hospital => {
    res.send(hospital);
  });
};

let getHospitalsByLocation = (req, res) => {
  let queries = url.parse(req.url, true).query;
  Hospital.findAll({
    where: {
      latitude: {$gt: queries.minLat, $lt: queries.maxLat},
      longitude: {$gt: queries.minLong, $lt: queries.maxLong}
    },
    attributes: {
      exclude: ['password']
    },
    include: [Schedule]
  })
  .then(hospitals => {
    res.send(hospitals);
  });
};

let getHospitalReviews = (req, res) => {
  Review.findAll({
    where: {
      hospitalId: req.params.id
    },
    include: [{
      model: Donor,
      attributes: {
        exclude: ['email', 'password', 'address', 'longitude', 'latitude']
      }
    }],
    order: 'createdAt DESC'
  })
  .then(reviews => res.send(reviews));
};

let postHospitalReview = (req, res) => {
  Review.create({
    hospitalId: req.params.id,
    donorId: req.user.id,
    content: req.body.content,
    stars: req.body.stars
  })
  .then(review => res.send(review));
};

module.exports.getCurrentHospital = getCurrentHospital;
module.exports.updateCurrentHospital = updateCurrentHospital;
module.exports.getHospitalById = getHospitalById;
module.exports.getHospitalsByLocation = getHospitalsByLocation;
module.exports.getHospitalReviews = getHospitalReviews;
module.exports.postHospitalReview = postHospitalReview;
