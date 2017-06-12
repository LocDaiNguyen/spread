require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Avatar = require('../../models/avatar');



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



// Get all avatars
router.get('/', (req, res, next) => {

  Avatar.find((err, avatars) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching avatars',
        data: {error: err, message: 'An error occurred fetching avatars'},
      });
    }

    if (!avatars) {
      return res.status(404).json({
        message: 'Avatars not found',
        data: {message: 'Avatars not found'},
      });
    }

    res.status(200).json({
      message: 'Avatars retrieved',
      data: avatars,
    });

  });
});



// Get one avatar
router.get('/:id', (req, res, next) => {

  Avatar.findById(req.params.id, (err, avatar) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching avatar',
        data: {error: err, message: 'An error occurred fetching avatar'},
      });
    }

    if (!avatar) {
      return res.status(404).json({
        message: 'Avatar not found',
        data: {message: 'Avatar not found'},
      });
    }

    res.status(200).json({
      message: 'Avatar retrieved',
      data: avatar,
    });

  });
});



// Create an avatar
router.post('/', (req, res, next) => {

  req.checkBody('avatar', 'Invalid status').isAlpha().isLowercase();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    const avatar = new Avatar({
      avatar: req.body.avatar,
    });

    avatar.save((err, avatar) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred creating avatar',
          data: {error: err, message: 'An error occurred creating avatar'},
        });
      }

      res.status(201).json({
        message: 'Avatar created',
        data: avatar,
      });

    });
  });
});



// Update an avatar
router.patch('/:id', (req, res, next) => {

  req.checkBody('avatar', 'Invalid status').isAlpha().isLowercase();

  req.getValidationResult().then((result) => {

    Avatar.findById(req.params.id, (err, avatar) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching avatar',
          data: {error: err, message: 'An error occurred fetching avatar'},
        });
      }

      if (!avatar) {
        return res.status(404).json({
          message: 'Avatar not found',
          data: {message: 'Avatar not found'},
        });
      }

      avatar.avatar = req.body.avatar;

      avatar.save((err, avatar) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving avatar',
            data: {error: err, message: 'An error occurred saving avatar'},
          });
        }

        res.status(200).json({
          message: 'Avatar saved',
          data: avatar,
        });

      });
    });
  });
});



// Delete an avatar
router.delete('/:id', (req, res, next) => {

  Avatar.findById(req.params.id, (err, avatar) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching avatar',
        data: {error: err, message: 'An error occurred fetching avatar'},
      });
    }

    if (!avatar) {
      return res.status(404).json({
        message: 'Avatar not found',
        data: {message: 'Avatar not found'},
      });
    }

    avatar.remove((err, avatar) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred deleting avatar',
          data: {error: err, message: 'An error occurred deleting avatar'},
        });
      }

      res.status(200).json({
        message: 'Avatar deleted',
        data: avatar,
      });

    });
  });
});



module.exports = router;
