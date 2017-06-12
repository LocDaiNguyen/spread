require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const randomString = require('../../helpers/random-string');
const sendVerifyEmail = require('../../helpers/send-verify-email');

const User = require('../../models/user');
const Verification = require('../../models/verification');



// Get one verification
router.get('/:hash', (req, res, next) => {

  Verification.findOne({hash: req.params.hash}, (err, verification) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching hash',
        data: {error: err, message: 'An error occurred fetching hash'},
      });
    }

    if (!verification) {
      return res.status(404).json({
        message: 'Verification Not Found',
        data: {linkExist: false, message: 'Verification Not Found'},
      });
    }

    User.findById(verification.userId, (err, user) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching user',
          data: {error: err, message: 'An error occurred fetching user'},
        });
      }

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          data: {message: 'User not found'},
        });
      }

      user.verify = true;

      user.save((err, user) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving user',
            data: {error: err, message: 'An error occurred saving user'},
          });
        }

        res.status(200).json({
          message: 'Verified and Activated',
          data: {
            linkExist: true,
            message: 'Verified and Activated',
            _id: verification._id,
            userId: verification.userId
          },
        });

      });
    });
  });
});



// Create a verification
router.post('/', (req, res, next) => {

  req.checkBody('email', 'Invalid email').isEmail();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    User.findOne({email: req.body.email}, (err, user) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching user',
          data: {error: err, message: 'An error occurred fetching user'},
        });
      }

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          data: {message: 'User not found'},
        });
      }

      Verification.findOne({userId: user._id, type: 'verify'}, (err, verification) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred fetching verification',
            data: {error: err, message: 'An error occurred fetching verification'},
          });
        }

        if (!verification) {
          
          const rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
          const newVerification = new Verification({
            type: 'verify',
            hash: rString,
            userId: user._id
          });

          newVerification.save((err, verification) => {

            if (err) {
              return res.status(500).json({
                message: 'An error occurred creating hash',
                data: {error: err, message: 'An error occurred creating hash'},
              });
            }

            sendVerifyEmail(user.email, rString);

            return res.status(201).json({
              message: 'Verification resent',
              data: {message: 'Verification resent'},
            });

          });

        } else {
        
          verification.remove((err, verification) => {

            if (err) {
              return res.status(500).json({
                message: 'An error occurred deleting verification',
                data: {error: err, message: 'An error occurred deleting verification'},
              });
            }

            const rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
            const newVerification = new Verification({
              type: 'verify',
              hash: rString,
              userId: user._id
            });

            newVerification.save((err, verification) => {

              if (err) {
                return res.status(500).json({
                  message: 'An error occurred creating hash',
                  data: {error: err, message: 'An error occurred creating hash'},
                });
              }

              sendVerifyEmail(user.email, rString);

              return res.status(201).json({
                message: 'Verification resent',
                data: {message: 'Verification resent'},
              });

            });
          });
        }
      });
    });
  });
});



// Delete a verification
router.delete('/:id', (req, res, next) => {

  Verification.findById(req.params.id, (err, verification) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching verification',
        data: {error: err, message: 'An error occurred fetching verification'},
      });
    }

    if (!verification) {
      return res.status(404).json({
        message: 'Verification not found',
        data: {message: 'Verification not found'},
      });
    }

    verification.remove((err, verification) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred deleting verification',
          data: {error: err, message: 'An error occurred deleting verification'},
        });
      }

      res.status(200).json({
        message: 'Verification deleted',
        data: {message: 'Verification deleted'},
      });

    });
  });
});



module.exports = router;
