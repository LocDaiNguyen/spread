const express = require('express');
const router = express.Router();

const Game = require('../../models/game');

/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

module.exports = router;