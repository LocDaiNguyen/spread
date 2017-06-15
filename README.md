# Spread

[Demo https://ldn-spread.herokuapp.com/signin](https://ldn-spread.herokuapp.com/signin)

Pick winners against the spread.

## Setup

`git clone git@github.com:LocDaiNguyen/spread.git`

`cd spread`

`npm install`

Create mongo db

Create collections `avatars, games, picks, settings, teams, users`

Inside `data` folder import `avatars.json, games.json, picks.json, settings.json, teams.json, users.json` files to respective collection

In `server.js` file change `mongoose.connect('localhost:27017/db_name_here');` to point to your mongo db

In `.env` change `SECRET_KEY, WEBSITE_URL, EMAIL, EMAIL_PASSWORD, EMAIL_SERVICE`

## Build

Run `ng build --watch` and `node server.js` or `nodemon server.js` if you have `nodemon` installed
