require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Game = require('../../models/game');



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



// Get all games
router.get('/', (req, res, next) => {

  Game.find((err, games) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching games',
        data: {error: err, message: 'An error occurred fetching games'},
      });
    }

    if (!games) {
      return res.status(404).json({
        message: 'Games not found',
        data: {message: 'Games not found'},
      });
    }

    res.status(200).json({
      message: 'Games retrieved',
      data: games,
    });

  });
});



// Get one game
router.get('/:id', (req, res, next) => {

  Game.findById(req.params.id, (err, game) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching game',
        data: {error: err, message: 'An error occurred fetching game'},
      });
    }

    if (!game) {
      return res.status(404).json({
        message: 'Game not found',
        data: {message: 'Game not found'},
      });
    }

    res.status(200).json({
      message: 'Game retrieved',
      data: game,
    });

  });
});



// Create a game
router.post('/', (req, res, next) => {

  req.checkBody('weekNum', 'Invalid weekNum').isInt({min: 1});
  req.checkBody('gameTimeEastern', 'Invalid gameTimeEastern').isDate();
  req.checkBody('homeTeam', 'Invalid homeTeam').isAlpha().isUppercase();
  req.checkBody('homeSpreadDisplay', 'Invalid homeSpreadDisplay').isAlpha();
  req.checkBody('homeSpread', 'Invalid homeSpread').isFloat();
  req.checkBody('homeScore', 'Invalid homeScore').isInt({min: 0});
  req.checkBody('homeResult', 'Invalid homeResult').isAlpha().isLowercase();
  req.checkBody('awayTeam', 'Invalid awayTeam').isAlpha().isUppercase();
  req.checkBody('awaySpreadDisplay', 'Invalid awaySpreadDisplay').isAlpha();
  req.checkBody('awaySpread', 'Invalid awaySpread').isFloat();
  req.checkBody('awayScore', 'Invalid awayScore').isInt({min: 0});
  req.checkBody('awayResult', 'Invalid awayResult').isAlpha().isLowercase();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    const game = new Game({
      weekNum: req.body.weekNum,
      gameTimeEastern: req.body.gameTimeEastern,
      homeTeam: req.body.homeTeam,
      homeSpreadDisplay: req.body.homeSpreadDisplay,
      homeSpread: req.body.homeSpread,
      homeScore: req.body.homeScore,
      homeResult: req.body.homeResult,
      awayTeam: req.body.awayTeam,
      awaySpreadDisplay: req.body.awaySpreadDisplay,
      awaySpread: req.body.awaySpread,
      awayScore: req.body.awayScore,
      awayResult: req.body.awayResult
    });

    game.save((err, game) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred creating game',
          data: {error: err, message: 'An error occurred creating game'},
        });
      }

      res.status(201).json({
        message: 'Game created',
        data: game,
      });

    });
  });
});



// Update a game
router.patch('/:id', (req, res, next) => {

  // req.checkBody('weekNum', 'Invalid weekNum').isInt({min: 1});
  // req.checkBody('gameTimeEastern', 'Invalid gameTimeEastern').isDate();
  // req.checkBody('homeTeam', 'Invalid homeTeam').isAlpha().isUppercase();
  // req.checkBody('homeSpreadDisplay', 'Invalid homeSpreadDisplay').isAlpha();
  // req.checkBody('homeSpread', 'Invalid homeSpread').isFloat();
  // req.checkBody('homeScore', 'Invalid homeScore').isInt({min: 0});
  // req.checkBody('homeResult', 'Invalid homeResult').isAlpha().isLowercase();
  // req.checkBody('awayTeam', 'Invalid awayTeam').isAlpha().isUppercase();
  // req.checkBody('awaySpreadDisplay', 'Invalid awaySpreadDisplay').isAlpha();
  // req.checkBody('awaySpread', 'Invalid awaySpread').isFloat();
  // req.checkBody('awayScore', 'Invalid awayScore').isInt({min: 0});
  // req.checkBody('awayResult', 'Invalid awayResult').isAlpha().isLowercase();

  if (req.body.type === 'spread') {
    
    req.checkBody('homeSpread', 'Invalid homeSpread').optional({checkFalsy: true}).isFloat();
    req.checkBody('awaySpread', 'Invalid awaySpread').optional({checkFalsy: true}).isFloat();

    if (req.body.awaySpreadDisplay !== '' || req.body.homeSpreadDisplay !== '') {

      const awayTeamSymbol = req.body.awaySpreadDisplay.charAt(0);
      const homeTeamSymbol = req.body.homeSpreadDisplay.charAt(0);
      const awayLastChar = req.body.awaySpreadDisplay.slice(-1);
      const homeLastChar = req.body.homeSpreadDisplay.slice(-1);
      const regex = /^[1-9]$/;

      if ((awayTeamSymbol !== '+' && awayTeamSymbol !== '-') || (homeTeamSymbol !== '+' && homeTeamSymbol !== '-')) {
        return res.status(400).json({
          message: req.body.awayTeam + ' ' + req.body.awaySpreadDisplay + ' vs ' + req.body.homeTeam + ' ' + req.body.homeSpreadDisplay + ' missing symbol or not correct symbol',
          data: {message: req.body.awayTeam + ' ' + req.body.awaySpreadDisplay + ' vs ' + req.body.homeTeam + ' ' + req.body.homeSpreadDisplay + ' missing symbol or not correct symbol'}
        });
      }

      if (awayTeamSymbol === homeTeamSymbol) {
        return res.status(400).json({
          message: req.body.awayTeam + ' ' + req.body.awaySpreadDisplay + ' vs ' + req.body.homeTeam + ' ' + req.body.homeSpreadDisplay + ' ' + ' same symbol',
          data: {message: req.body.awayTeam + ' ' + req.body.awaySpreadDisplay + ' vs ' + req.body.homeTeam + ' ' + req.body.homeSpreadDisplay + ' ' + ' same symbol'}
        });
      }

      if (!regex.test(awayLastChar) || !regex.test(homeLastChar)) {
        return res.status(400).json({
          message: req.body.awayTeam + ' ' + req.body.awaySpreadDisplay + ' vs ' + req.body.homeTeam + ' ' + req.body.homeSpreadDisplay + ' ' + ' invalid last character',
          data: {message: req.body.awayTeam + ' ' + req.body.awaySpreadDisplay + ' vs ' + req.body.homeTeam + ' ' + req.body.homeSpreadDisplay + ' ' + ' invalid last character'}
        });
      }

      if (Math.abs(parseFloat(req.body.awaySpreadDisplay)) !== Math.abs(parseFloat(req.body.homeSpreadDisplay))) {
        return res.status(400).json({
          message: req.body.awayTeam + ' ' + req.body.awaySpreadDisplay + ' vs ' + req.body.homeTeam + ' ' + req.body.homeSpreadDisplay + ' ' + ' different spread value',
          data: {message: req.body.awayTeam + ' ' + req.body.awaySpreadDisplay + ' vs ' + req.body.homeTeam + ' ' + req.body.homeSpreadDisplay + ' ' + ' different spread value'}
        });
      }

    }
  }

  if (req.body.type === 'score') {

    req.checkBody('homeScore', 'Invalid homeScore').optional({checkFalsy: true}).isInt({min: 0});
    req.checkBody('awayScore', 'Invalid awayScore').optional({checkFalsy: true}).isInt({min: 0});

    if (req.body.awayScore !== null || req.body.homeScore !== null) {
      
      if (req.body.awaySpread === null || req.body.homeSpread === null) {
        return res.status(400).json({
          message: req.body.awayTeam + ' vs ' + req.body.homeTeam + ' ' + 'has no spread',
          data: {message: req.body.awayTeam + ' vs ' + req.body.homeTeam + ' ' + 'has no spread'}
        });
      }

      if ((req.body.awayScore !== null && req.body.homeScore === null) || (req.body.awayScore === null && req.body.homeScore !== null)) {
        return res.status(400).json({
          message: req.body.awayTeam + ' ' + req.body.awayScore + ' vs ' + req.body.homeTeam + ' ' + req.body.homeScore + ' ' + ' has missing score',
          data: {message: req.body.awayTeam + ' ' + req.body.awayScore + ' vs ' + req.body.homeTeam + ' ' + req.body.homeScore + ' ' + ' has missing score'}
        });
      }

      if (req.body.awayScore < 0 || req.body.homeScore < 0) {
        return res.status(400).json({
          message: req.body.awayTeam + ' ' + req.body.awayScore + ' vs ' + req.body.homeTeam + ' ' + req.body.homeScore + ' ' + ' has negative score',
          data: {message: req.body.awayTeam + ' ' + req.body.awayScore + ' vs ' + req.body.homeTeam + ' ' + req.body.homeScore + ' ' + ' has negative score'}
        });
      }

    }
  }

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    Game.findById(req.params.id, (err, game) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching game',
          data: {error: err, message: 'An error occurred fetching game'},
        });
      }

      if (!game) {
        return res.status(404).json({
          message: 'Game not found',
          data: {message: 'Game not found'},
        });
      }

      if (req.body.type === 'spread') {
        game.homeSpread = req.body.homeSpread;
        game.homeSpreadDisplay = req.body.homeSpreadDisplay;
        game.homeScore = null;
        game.homeResult = '';
        game.awaySpread = req.body.awaySpread;
        game.awaySpreadDisplay = req.body.awaySpreadDisplay;
        game.awayScore = null;
        game.awayResult = '';
      }

      if (req.body.type === 'score') {
        game.homeScore = req.body.homeScore;
        game.homeResult = req.body.homeResult;
        game.awayScore = req.body.awayScore;
        game.awayResult = req.body.awayResult;
      }

      // game.weekNum = req.body.weekNum;
      // game.gameTimeEastern = req.body.gameTimeEastern;
      // game.homeTeam = req.body.homeTeam;
      // game.homeSpreadDisplay = req.body.homeSpreadDisplay;
      // game.homeSpread = req.body.homeSpread;
      // game.homeScore = req.body.homeScore;
      // game.homeResult = req.body.homeResult;
      // game.awayTeam = req.body.awayTeam;
      // game.awaySpreadDisplay = req.body.awaySpreadDisplay;
      // game.awaySpread = req.body.awaySpread;
      // game.awayScore = req.body.awayScore;
      // game.awayResult = req.body.awayResult;

      game.save((err, game) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving game',
            data: {error: err, message: 'An error occurred saving game'},
          });
        }

        res.status(200).json({
          message: 'Game saved',
          data: game,
        });

      });
    });
  });
});



// Delete a game
router.delete('/:id', (req, res, next) => {

  Game.findById(req.params.id, (err, game) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching game',
        data: {error: err, message: 'An error occurred fetching game'},
      });
    }

    if (!game) {
      return res.status(404).json({
        message: 'Game not found',
        data: {message: 'Game not found'},
      });
    }

    game.remove((err, game) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred deleting game',
          data: {error: err, message: 'An error occurred deleting game'},
        });
      }

      res.status(200).json({
        message: 'Game deleted',
        data: game,
      });

    });
  });
});



module.exports = router;
