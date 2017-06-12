require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const randomAvatar = require('../../helpers/random-avatar');
const randomString = require('../../helpers/random-string');
const sendVerifyEmail = require('../../helpers/send-verify-email');
const sendResetPasswordEmail = require('../../helpers/send-reset-password-email');

const User = require('../../models/user');
const Verification = require('../../models/verification');



// Signup user
router.post('/', (req, res, next) => {
  
  req.checkBody('userName', 'Invalid userName')
    .isLength({min: process.env.USERNAME_MIN_LENGTH, max: process.env.USERNAME_MAX_LENGTH})
    .matches(/[a-zA-Z0-9!@#$%^&*]+/);
  req.checkBody('email', 'Invalid email')
    .isEmail();
  req.checkBody('password', 'Invalid password')
    .isLength({min: process.env.PASSWORD_MIN_LENGTH})
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{6,}$/);
    // .equals(req.body.passwordConfirm);
  req.checkBody('firstName', 'Invalid firstName')
    .isLength({min: process.env.FIRSTNAME_MIN_LENGTH});
  req.checkBody('lastName', 'Invalid lastName')
    .isLength({min: process.env.LASTNAME_MIN_LENGTH});

  req.getValidationResult().then((result) => {
    
    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }
    
    const user = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      active: true,
      verify: false,
      paid: false,
      avatar: 'atlph',
      admin: false,
    });
    
    user.save((err, user) => {
    
      if (err) {
        return res.status(500).json({
          message: 'An error occurred creating user',
          data: {error: err, message: 'An error occurred creating user'},
        });
      }

      const rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const verification = new Verification({
        type: 'verify',
        hash: rString,
        userId: user._id
      });
    
      verification.save((err, verification) => {
    
        if (err) {
          return res.status(500).json({
            message: 'An error occurred creating hash',
            data: {error: err, message: 'An error occurred creating hash'},
          });
        }
    
        sendVerifyEmail(user.email, rString);
      });

      const newUser = new User({
        _id: user._id,
        userName: user.userName,
        email: user.email,
        password: null,
        firstName: user.firstName,
        lastName: user.lastName,
        active: user.active,
        verify: user.verify,
        paid: user.paid,
        avatar: user.avatar
      });
    
      res.status(201).json({
        message: 'User created',
        data: newUser,
      });

    });
  });
});



// Signin user
router.post('/signin', (req, res, next) => {

  if (req.body.userNameOrEmail.indexOf('@') === -1) {
    req.checkBody('userNameOrEmail', 'Invalid userName email')
      .isLength({min: process.env.USERNAME_MIN_LENGTH, max: process.env.USERNAME_MAX_LENGTH})
      .matches(/[a-zA-Z0-9!@#$%^&*]+/);
  } else {
    req.checkBody('email', 'Invalid email')
      .isEmail();
  }
  req.checkBody('password', 'Invalid password')
    .isLength({min: process.env.PASSWORD_MIN_LENGTH})
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{6,}$/);
    // .equals(req.body.passwordConfirm);

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Login failed, invalid login credentials',
        data: {message: 'Login failed, invalid login credentials', error: result.mapped()}
      });
    }

    User.findOne({$or: [{userName: req.body.userNameOrEmail}, {email: req.body.userNameOrEmail}]}, (err, user) => {
     
      if (err) {
        return res.status(500).json({
          message: 'An error occurred fetching user',
          data: {error: err, message: 'An error occurred fetching user'},
        });
      }
      
      if (!user) {
        return res.status(401).json({
          message: 'Login failed, invalid login credentials',
          data: {message: 'Login failed, invalid login credentials'},
        });
      }

      if (!user.verify) {
        return res.status(401).json({
          message: 'Not verified',
          data: {message: 'Your account is not verified. Please verified your email', verified: false}
        });
      }

      if (!user.active) {
        return res.status(401).json({
          message: 'Login failed, invalid login credentials',
          data: {message: 'Login failed, invalid login credentials'},
        });
      }
      
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(401).json({
          message: 'Login failed, invalid login credentials',
          data: {message: 'Login failed, invalid login credentials'},
        });
      }
      
      let scope;
      
      if (user.admin) {
        scope = 'admin';
      }
      
      const token = jwt.sign(
        {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          avatar: user.avatar,
          active: user.active,
          verify: user.verify,
          scope: scope
        },
        process.env.SECRET_KEY,
        {expiresIn: 21600}
      );
      
      res.status(200).json({
        message: 'Login successful',
        data: {message: 'Login successful', token: token, userId: user._id},
      });

    });
  });
});



// Request password
router.post('/request-reset-password', (req, res, next) => {

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

      Verification.findOne({userId: user._id, type: 'password'}, (err, verification) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred fetching verification',
            data: {error: err, message: 'An error occurred fetching verification'},
          });
        }

        if (!verification) {
          
          const rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
          const newVerification = new Verification({
            type: 'password',
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

            sendResetPasswordEmail(user.email, rString);

            return res.status(201).json({
              message: 'Request sent',
              data: {message: 'Request sent'},
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
              type: 'password',
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

              sendResetPasswordEmail(user.email, rString);

              return res.status(201).json({
                message: 'Request sent',
                data: {message: 'Request sent'},
              });

            });
          });
        }
      });
    });
  });
});



// Reset password
router.patch('/:id/reset-password', (req, res, next) => {

  req.checkBody('password', 'Invalid password')
    .isLength({min: process.env.PASSWORD_MIN_LENGTH})
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{6,}$/);
    // .equals(req.body.passwordConfirm);

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }
    
    User.findById(req.params.id, (err, user) => {

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

      Verification.findOne({userId: user._id, type: 'password'}, (err, verification) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred fetching verification',
            data: {error: err, message: 'An error occurred fetching verification'},
          });
        }

        if (!verification) {
          
          user.password = bcrypt.hashSync(req.body.password, 10);

          user.save((err, user) => {

            if (err) {
              return res.status(500).json({
                message: 'An error occurred saving password',
                data: {error: err, message: 'An error occurred saving password'},
              });
            }

            const newUser = new User({
              _id: user._id,
              userName: user.userName,
              email: user.email,
              password: null,
              firstName: user.firstName,
              lastName: user.lastName,
              active: user.active,
              verify: user.verify,
              paid: user.paid,
              avatar: user.avatar
            });

            res.status(200).json({
              message: 'Password updated',
              data: newUser,
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

            user.password = bcrypt.hashSync(req.body.password, 10);

            user.save((err, user) => {

              if (err) {
                return res.status(500).json({
                  message: 'An error occurred saving password',
                  data: {error: err, message: 'An error occurred saving password'},
                });
              }

              const newUser = new User({
                _id: user._id,
                userName: user.userName,
                email: user.email,
                password: null,
                firstName: user.firstName,
                lastName: user.lastName,
                active: user.active,
                verify: user.verify,
                paid: user.paid,
                avatar: user.avatar
              });

              res.status(200).json({
                message: 'Password updated',
                data: newUser,
              });

            });
          });
        }
      });
    });
  });
});



// Get all users
router.get('/', (req, res, next) => {

  User.find((err, users) => {

    if (err) {
      return res.status(500).json({
        message: 'An error occurred fetching users',
        data: {error: err, message: 'An error occurred fetching users'},
      });
    }

    if (!users) {
      return res.status(404).json({
        message: 'Users not found',
        data: {message: 'Users not found'},
      });
    }

    const newUsers = users.map(user => {
      return {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        password: null,
        firstName: user.firstName,
        lastName: user.lastName,
        active: user.active,
        verify: user.verify,
        paid: user.paid,
        avatar: user.avatar
      }
    });

    res.status(200).json({
      message: 'Users retrieved',
      data: newUsers,
    });

  });
});



// Get one user
router.get('/:id', (req, res, next) => {

  User.findById(req.params.id, (err, user) => {

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

    const newUser = new User({
      _id: user._id,
      userName: user.userName,
      email: user.email,
      password: null,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
      verify: user.verify,
      paid: user.paid,
      avatar: user.avatar
    });

    res.status(200).json({
      message: 'User retrieved',
      data: newUser,
    });

  });
});



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



// Update a user
router.patch('/:id', (req, res, next) => {
  const decoded = jwt.decode(req.query.token);
  if (req.body.active && decoded.scope === 'admin') {
    User.findById(req.body.userId, (err, user) => {
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
      user.active = req.body.active;
      user.paid = req.body.paid;
      user.save((err, user) => {
        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving status/paid',
            data: {error: err, message: 'An error occurred saving status/paid'},
          });
        }
        const newUser = new User({
          _id: user._id,
          userName: user.userName,
          email: user.email,
          password: null,
          firstName: user.firstName,
          lastName: user.lastName,
          active: user.active,
          verify: user.verify,
          paid: user.paid,
          avatar: user.avatar
        });
        res.status(200).json({
          message: 'Status and Paid updated',
          data: newUser,
        });
      });
    });
  }
  if (req.body.userName || req.body.avatar || req.body.password) {
    // If user exist
    User.findById(req.params.id, (err, user) => {
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
      if (req.params.id != decoded._id) {
        return res.status(401).json({
          message: 'Not Authenticated',
          data: {message: 'Not Authenticated'},
        });
      }
      if (req.body.userName) {
        user.userName = req.body.userName;
        user.email = req.body.email;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.save((err, user) => {
          if (err) {
            return res.status(500).json({
              message: 'An error occurred saving user',
              data: {error: err, message: 'An error occurred saving user'},
            });
          }
          const newUser = new User({
            _id: user._id,
            userName: user.userName,
            email: user.email,
            password: null,
            firstName: user.firstName,
            lastName: user.lastName,
            active: user.active,
            verify: user.verify,
            paid: user.paid,
            avatar: user.avatar
          });
          res.status(200).json({
            message: 'User updated',
            data: newUser,
          });
        });
      }
      if (req.body.avatar) {
        user.avatar = req.body.avatar;
        user.save((err, user) => {
          if (err) {
            return res.status(500).json({
              message: 'An error occurred saving avatar',
              data: {error: err, message: 'An error occurred saving avatar'},
            });
          }
          const newUser = new User({
            _id: user._id,
            userName: user.userName,
            email: user.email,
            password: null,
            firstName: user.firstName,
            lastName: user.lastName,
            active: user.active,
            verify: user.verify,
            paid: user.paid,
            avatar: user.avatar
          });
          res.status(200).json({
            message: 'Avatar updated',
            data: newUser,
          });
        });
      }
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 10);
        user.save((err, user) => {
          if (err) {
            return res.status(500).json({
              message: 'An error occurred saving password',
              data: {error: err, message: 'An error occurred saving password'},
            });
          }
          const newUser = new User({
            _id: user._id,
            userName: user.userName,
            email: user.email,
            password: null,
            firstName: user.firstName,
            lastName: user.lastName,
            active: user.active,
            verify: user.verify,
            paid: user.paid,
            avatar: user.avatar
          });
          res.status(200).json({
            message: 'Password updated',
            data: newUser,
          });
        });
      }
    });
  }
});



// Update a user status/paid
router.patch('/:id/status', (req, res, next) => {

  req.checkBody('active', 'Invalid active').isBoolean();
  req.checkBody('verify', 'Invalid verify').isBoolean();
  req.checkBody('paid', 'Invalid paid').isBoolean();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    const decoded = jwt.decode(req.query.token);

    if (decoded.scope === 'admin') {

      User.findById(req.body.userId, (err, user) => {

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

        user.active = req.body.active;
        user.verify = req.body.verify;
        user.paid = req.body.paid;

        user.save((err, user) => {

          if (err) {
            return res.status(500).json({
              message: 'An error occurred saving status',
              data: {error: err, message: 'An error occurred saving status'},
            });
          }

          const newUser = new User({
            _id: user._id,
            userName: user.userName,
            email: user.email,
            password: null,
            firstName: user.firstName,
            lastName: user.lastName,
            active: user.active,
            verify: user.verify,
            paid: user.paid,
            avatar: user.avatar
          });

          res.status(200).json({
            message: 'Status and Paid updated',
            data: newUser,
          });

        });
      });
    }
  });
});



// Update a user account
router.patch('/:id/account', (req, res, next) => {

  req.checkBody('userName', 'Invalid userName')
    .isLength({min: process.env.USERNAME_MIN_LENGTH, max: process.env.USERNAME_MAX_LENGTH})
    .matches(/[a-zA-Z0-9!@#$%^&*]+/);
  req.checkBody('email', 'Invalid email')
    .isEmail();
  req.checkBody('firstName', 'Invalid firstName')
    .isLength({min: process.env.FIRSTNAME_MIN_LENGTH});
  req.checkBody('lastName', 'Invalid lastName')
    .isLength({min: process.env.LASTNAME_MIN_LENGTH});

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }

    const decoded = jwt.decode(req.query.token);

    User.findById(req.params.id, (err, user) => {

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

      if (req.params.id != decoded._id) {
        return res.status(401).json({
          message: 'Not Authenticated',
          data: {message: 'Not Authenticated'},
        });
      }

      user.userName = req.body.userName;
      user.email = req.body.email;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;

      user.save((err, user) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving user',
            data: {error: err, message: 'An error occurred saving user'},
          });
        }

        const newUser = new User({
          _id: user._id,
          userName: user.userName,
          email: user.email,
          password: null,
          firstName: user.firstName,
          lastName: user.lastName,
          active: user.active,
          verify: user.verify,
          paid: user.paid,
          avatar: user.avatar
        });

        res.status(200).json({
          message: 'User updated',
          data: newUser,
        });

      });
    });
  });
});



// Update a user avatar
router.patch('/:id/avatar', (req, res, next) => {

  req.checkBody('avatar', 'Invalid status').isAlpha().isLowercase();

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }
  
    const decoded = jwt.decode(req.query.token);

    User.findById(req.params.id, (err, user) => {

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

      if (req.params.id != decoded._id) {
        return res.status(401).json({
          message: 'Not Authenticated',
          data: {message: 'Not Authenticated'},
        });
      }

      user.avatar = req.body.avatar;

      user.save((err, user) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving avatar',
            data: {error: err, message: 'An error occurred saving avatar'},
          });
        }

        const newUser = new User({
          _id: user._id,
          userName: user.userName,
          email: user.email,
          password: null,
          firstName: user.firstName,
          lastName: user.lastName,
          active: user.active,
          verify: user.verify,
          paid: user.paid,
          avatar: user.avatar
        });

        res.status(200).json({
          message: 'Avatar updated',
          data: newUser,
        });

      });
    });
  });
});



// Update a user password
router.patch('/:id/password', (req, res, next) => {

  req.checkBody('password', 'Invalid password')
    .isLength({min: process.env.PASSWORD_MIN_LENGTH})
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{6,}$/);
    // .equals(req.body.passwordConfirm);

  req.getValidationResult().then((result) => {

    if (!result.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid form',
        data: {message: 'Form not valid', error: result.mapped()}
      });
    }
  
    const decoded = jwt.decode(req.query.token);

    User.findById(req.params.id, (err, user) => {

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

      if (req.params.id != decoded._id) {
        return res.status(401).json({
          message: 'Not Authenticated',
          data: {message: 'Not Authenticated'},
        });
      }

      user.password = bcrypt.hashSync(req.body.password, 10);

      user.save((err, user) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred saving password',
            data: {error: err, message: 'An error occurred saving password'},
          });
        }

        const newUser = new User({
          _id: user._id,
          userName: user.userName,
          email: user.email,
          password: null,
          firstName: user.firstName,
          lastName: user.lastName,
          active: user.active,
          verify: user.verify,
          paid: user.paid,
          avatar: user.avatar
        });

        res.status(200).json({
          message: 'Password updated',
          data: newUser,
        });

      });
    });
  });
});



// Delete a user
router.delete('/:id', (req, res, next) => {

  const decoded = jwt.decode(req.query.token);

  if (decoded.scope = 'admin') {

    User.findById(req.params.id, (err, user) => {

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

      user.remove((err, user) => {

        if (err) {
          return res.status(500).json({
            message: 'An error occurred deleting user',
            data: {error: err, message: 'An error occurred deleting user'},
          });
        }

        res.status(200).json({
          message: 'User deleted',
          data: user,
        });

      });
    });

  } else {
    return res.status(401).json({
      message: 'Not Authenticated',
      data: {message: 'Not Authenticated'},
    });
  }

});



module.exports = router;
