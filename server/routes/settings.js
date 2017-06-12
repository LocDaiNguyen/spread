require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Setting = require('../../models/setting');



// Authenticate to proceed to routes
router.use('/', (req, res, next) => {

  jwt.verify(req.query.token, process.env.SECRET_KEY, (err, decoded) => {

    if (err) {
      return res.status(401).json({
        message: 'Not Authenticated',
        data: {error: err, message: 'Not Authenticated'},
      });
    }

    next();

  });
});



// Get all settings
router.get('/', (req, res, next) => {

  Setting.find((err, settings) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching settings',
        data: {error: err, message: 'An error occurred fetching settings'},
      });
    }

    if (!settings) {
      return res.status(404).json({
        message: 'Settings not found',
        data: {message: 'Settings not found'},
      });
    }

    res.status(200).json({
      message: 'Settings retrieved',
      data: settings,
    });

  });
});



// Get one setting
router.get('/:id', (req, res, next) => {

  Setting.findById(req.params.id, (err, setting) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching setting',
        data: {error: err, message: 'An error occurred fetching setting'},
      });
    }

    if (!setting) {
      return res.status(404).json({
        message: 'Setting not found',
        data: {message: 'Setting not found'},
      });
    }

    res.status(200).json({
      message: 'Setting retrieved',
      data: setting,
    });

  });
});



// Create a setting
router.post('/', (req, res, next) => {

  req.checkBody('picksAllowed', 'Invalid picksAllowed').isInt({min: 1});
  req.checkBody('allowSignup', 'Invalid allowSignup').isBoolean();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }
  
    const setting = new Setting({
      picksAllowed: req.body.picksAllowed,
      allowSignup: req.body.allowSignup,
    });

    setting.save((err, setting) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred creating setting',
          data: {error: err, message: 'An error occurred creating setting'},
        });
      }

      res.status(201).json({
        message: 'Setting created',
        data: setting,
      });

    });
  });
});



// Update a setting
router.patch('/:id', (req, res, next) => {

  req.checkBody('picksAllowed', 'Invalid picksAllowed').isInt({min: 0});
  // req.checkBody('picksAllowed', 'Invalid picksAllowed').isInt({min: process.env.MIN_PICKS_ALLOWED, max: process.env.MAX_PICKS_ALLOWED});
  // req.checkBody('allowSignup', 'Invalid allowSignup').isBoolean();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    Setting.findById(req.params.id, (err, setting) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching setting',
          data: {error: err, message: 'An error occurred fetching setting'},
        });
      }

      if (!setting) {
        return res.status(404).json({
          message: 'Setting not found',
          data: {message: 'Setting not found'},
        });
      }

      setting.picksAllowed = req.body.picksAllowed;
      setting.allowSignup = req.body.allowSignup;

      setting.save((err, setting) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving setting',
            data: {error: err, message: 'An error occurred saving setting'},
          });
        }

        res.status(200).json({
          message: 'Setting saved',
          data: setting,
        });

      });
    });
  });
});



// Delete a setting
router.delete('/:id', (req, res, next) => {

  Setting.findById(req.params.id, (err, setting) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching setting',
        data: {error: err, message: 'An error occurred fetching setting'},
      });
    }

    if (!setting) {
      return res.status(404).json({
        message: 'Setting not found',
        data: {message: 'Setting not found'},
      });
    }

    setting.remove((err, setting) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred deleting setting',
          data: {error: err, message: 'An error occurred deleting setting'},
        });
      }

      res.status(200).json({
        message: 'Setting deleted',
        data: setting,
      });

    });
  });
});



module.exports = router;
