// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const compression = require('compression');

// Get our API routes
const api = require('./server/routes/api');
const users = require('./server/routes/users');
const games = require('./server/routes/games');
const teams = require('./server/routes/teams');
const picks = require('./server/routes/picks');
const avatars = require('./server/routes/avatars');
const settings = require('./server/routes/settings');
const verifications = require('./server/routes/verifications');

const app = express();
mongoose.connect('localhost:27017/db_name_here');

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(compression());

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
app.use('/api/users', users);
app.use('/api/games', games);
app.use('/api/teams', teams);
app.use('/api/picks', picks);
app.use('/api/avatars', avatars);
app.use('/api/settings', settings);
app.use('/api/verifications', verifications);
app.use('/api', api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '8080';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
