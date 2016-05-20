'use strict'
let calendarRouter = require('express').Router();
let Calendar = require('../controllers/calendar.js');

calendarRouter.route('/')
  .get(Calendar.showEvents)
  .post(Calendar.addEvent);

module.exports = calendarRouter;
