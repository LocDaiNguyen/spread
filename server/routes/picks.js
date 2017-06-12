require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Pick = require('../../models/pick');
const User = require('../../models/user');
const Game = require('../../models/game');
const Setting = require('../../models/setting');
const getCurrentWeek = require('../../helpers/current-week');



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



// Get all picks
router.get('/', (req, res, next) => {

  Pick.find()
    // .populate('user')
    .exec((err, picks) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching picks',
          data: {error: err, message: 'An error occurred fetching picks'},
        });
      }

      if (!picks) {
        return res.status(404).json({
          message: 'Picks not found',
          data: {message: 'Picks not found'},
        });
      }

      res.status(200).json({
        message: 'Picks retrieved',
        data: picks,
      });

    });
});



// Get one pick
router.get('/:id', (req, res, next) => {

  Pick.findById(req.params.id, (err, pick) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching pick',
        data: {error: err, message: 'An error occurred fetching pick'},
      });
    }

    if (!pick) {
      return res.status(404).json({
        message: 'Pick not found',
        data: {message: 'Pick not found'},
      });
    }

    res.status(200).json({
      message: 'Pick retrieved',
      data: pick,
    });

  });
});



// Create a pick
router.post('/', (req, res, next) => {

  req.checkBody('gameId', 'Invalid gameId').isMongoId();
  req.checkBody('pickedTeam', 'Invalid pickedTeam').isAlpha().isUppercase();
  req.checkBody('weekNum', 'Invalid weekNum').isInt({min: 1});

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    const decoded = jwt.decode(req.query.token);
    const adjustedTime = 36; /*start the next week x(ex.36hrs) hours before the first game of that week*/
    const adjustedCurrentTime = new Date().setHours(new Date().getHours() - adjustedTime);
    let currentWeek = 1;
    let userCurrPicks = [];
    
    // If user exist
    User.findById(decoded._id, (err, user) => {
    
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
    
      // If request pick properties are valid
      if (req.body.gameId && req.body.pickedTeam && req.body.weekNum) {
    
        // If game exist
        Game.findOne({gameTimeEastern: {$gte: adjustedCurrentTime}}, {}, {sort: {weekNum: -1}}, (err, game) => {
    
          if (err) {
            return res.status(500).json({
              message: 'An error occurred fetching game',
              data: {error: err, message: 'An error occurred fetching game'},
            });
          }
    
          if (!game) {
    
            Game.findOne({}, {}, {sort: {$natural: -1}}, (err, lastGame) => {
    
              if (err) {
                return res.status(500).json({
                  message: 'An error occurred fetching last game',
                  data: {error: err, message: 'An error occurred fetching last game'},
                });
              }
    
              if (!lastGame) {
                return res.status(404).json({
                  message: 'Last game not found',
                  data: {message: 'Last game not found'},
                });
              }
    
              currentWeek = lastGame.weekNum;
    
            });
          }
  
          currentWeek = game.weekNum;
  
          // If picks exist
          Pick.find({ userId: decoded._id, weekNum: currentWeek }, (err, picks) => {
  
            if (err) {
              return res.status(500).json({
                message: 'An error occurred fetching picks',
                data: {error: err, message: 'An error occurred fetching picks'},
              });
            }
  
            if (!picks) {
              return res.status(404).json({
                message: 'Picks not found',
                data: {message: 'Picks not found'},
              });
            }

            Setting.findOne((err, setting) => {

              if (err) {
                return res.status(500).json({
                  message: 'An error occurred fetching settings',
                  data: {error: err, message: 'An error occurred fetching settings'},
                });
              }

              if (!setting) {
                return res.status(404).json({
                  message: 'Setting not found',
                  data: {message: 'Setting not found'},
                });
              }

              // If amount of picks are greater than amount of picks allowed
              if (picks.length > setting.picksAllowed) {
                return res.status(400).json({
                  message: 'Picks allowed limit exceeded',
                  data: {message: 'Picks allowed limit exceeded'},
                });
              }
    
              // If pick already exist
              picks.map(pick => {
                if (pick.pickedTeam === req.body.pickedTeam) {
                  return res.status(400).json({
                    message: 'Pick already exist',
                    data: {message: 'Pick already exist'},
                  });
                }
                return;
              });
    
              userCurrPicks = picks;
    
              // If game exist
              Game.findOne({ _id: req.body.gameId, $or:[{awayTeam: req.body.pickedTeam}, {homeTeam: req.body.pickedTeam}], weekNum: currentWeek}, (err, game) => {
    
                if (err) {
                  return res.status(500).json({
                    message: 'An error occurred fetching game',
                    data: {message: 'An error occurred fetching game'},
                  });
                }
    
                if (!game) {
                  return res.status(404).json({
                    message: 'Game not found',
                    data: {message: 'Game not found'},
                  });
                }
    
                const gameTime = new Date(game.gameTimeEastern).getTime();
                const currentTime = Date.now();
    
                // If current time is greater than game time
                if (currentTime > gameTime) {
                  return res.status(400).json({
                    message: 'Game has already started',
                    data: {message: 'Game has already started'},
                  });
                }
    
                if (game.weekNum !== currentWeek) {
                  return res.status(400).json({
                    message: 'Game is not listed in current week',
                    data: {message: 'Game is not listed in current week'},
                  });
                }
    
                const pick = new Pick({
                  pickedTeam: req.body.pickedTeam,
                  weekNum: req.body.weekNum,
                  userId: user._id,
                  gameId: game._id
                });
    
                pick.save((err, pick) => {
    
                  if (err) {
                    return res.status(500).json({
                      message: 'An error occurred creating pick',
                      data: {error: err, message: 'An error occurred creating pick'},
                    });
                  }
    
                  user.picks.push(pick);
                  user.save();
    
                  res.status(201).json({
                    message: 'Pick created',
                    data: pick,
                    game: game,
                  });
    
                });
              });
            });
          });
        });

      } else {
        return res.status(400).json({
          message: 'Pick format is not valid',
          data: {message: 'Pick format is not valid'},
        });
      }

    });
  });
});



// Update a pick



// Delete a pick
router.delete('/:id', (req, res, next) => {

  const decoded = jwt.decode(req.query.token);

  User.findById(decoded._id, (err, user) => {

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

    Pick.findById(req.params.id, (err, pick) => {

      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching pick',
          data: {error: err, message: 'An error occurred fetching pick'},
        });
      }

      if (!pick) {
        return res.status(404).json({
          message: 'Pick not found',
          data: {message: 'Pick not found'},
        });
      }

      if (pick.userId != decoded._id) {
        return res.status(401).json({
          message: 'Not Authenticated',
          data: {message: 'Not Authenticated'},
        });
      }

      pick.remove((err, pick) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred deleting pick',
            data: {error: err, message: 'An error occurred deleting pick'},
          });
        }

        res.status(200).json({
          message: 'Pick deleted',
          data: pick,
        });

      });
    });
  });
});



module.exports = router;
