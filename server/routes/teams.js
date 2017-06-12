require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Team = require('../../models/team');



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



// Get all teams
router.get('/', (req, res, next) => {

  Team.find((err, teams) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching teams',
        data: {error: err, message: 'An error occurred fetching teams'},
      });
    }

    if (!teams) {
      return res.status(404).json({
        message: 'Teams not found',
        data: {message: 'Teams not found'},
      });
    }

    res.status(200).json({
      message: 'Teams retrieved',
      data: teams,
    });

  });
});



// Get one team
router.get('/:id', (req, res, next) => {

  Team.findById(req.params.id, (err, team) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching team',
        data: {error: err, message: 'An error occurred fetching team'},
      });
    }

    if (!team) {
      return res.status(404).json({
        message: 'Team not found',
        data: {message: 'Team not found'},
      });
    }

    res.status(200).json({
      message: 'Team retrieved',
      data: team,
    });

  });
});



// Create a team
router.post('/', (req, res, next) => {

  req.checkBody('abbr', 'Invalid abbr').isAlpha().isUppercase();
  req.checkBody('divisionId', 'Invalid divisionId').isInt({min: 1});
  req.checkBody('city', 'Invalid city').isAlpha();
  req.checkBody('name', 'Invalid name').isAlpha();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    const team = new Team({
      abbr: req.body.abbr,
      divisionId: req.body.divisionId,
      city: req.body.city,
      name: req.body.name,
    });

    team.save((err, team) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred creating team',
          data: {error: err, message: 'An error occurred creating team'},
        });
      }

      res.status(201).json({
        message: 'Team created',
        data: team,
      });

    });
  });
});



// Update a team
router.patch('/:id', (req, res, next) => {

  req.checkBody('abbr', 'Invalid abbr').isAlpha().isUppercase();
  req.checkBody('divisionId', 'Invalid divisionId').isInt({min: 1});
  req.checkBody('city', 'Invalid city').isAlpha();
  req.checkBody('name', 'Invalid name').isAlpha();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }
  
    Team.findById(req.params.id, (err, team) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching team',
          data: {error: err, message: 'An error occurred fetching team'},
        });
      }

      if (!team) {
        return res.status(404).json({
          message: 'Team not found',
          data: {message: 'Team not found'},
        });
      }

      team.abbr = req.body.abbr;
      team.divisionId = req.body.divisionId;
      team.city = req.body.city;
      team.name = req.body.name;

      team.save((err, team) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving team',
            data: {error: err, message: 'An error occurred saving team'},
          });
        }

        res.status(200).json({
          message: 'Team saved',
          data: team,
        });

      });
    });
  });
});



// Delete a team
router.delete('/:id', (req, res, next) => {

  Team.findById(req.params.id, (err, team) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching team',
        data: {error: err, message: 'An error occurred fetching team'},
      });
    }

    if (!team) {
      return res.status(404).json({
        message: 'Team not found',
        data: {message: 'Team not found'},
      });
    }

    team.remove((err, team) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred deleting team',
          data: {error: err, message: 'An error occurred deleting team'},
        });
      }

      res.status(200).json({
        message: 'Team deleted',
        data: team,
      });

    });
  });
});



module.exports = router;
