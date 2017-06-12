# Spread

Demo `https://ldn-spread.herokuapp.com/signin`

Pick winners against the spread.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Setup

`git clone git@github.com:LocDaiNguyen/spread.git`

`cd spread`

`npm install`

Create mongo db and import all `avatars.json, games.json, picks.json, settings.json, teams.json, users.json` files from the `data` folder
Name of collections should be `avatars, games, picks, settings, teams, users`

In `server.js` file change `mongoose.connect('localhost:27017/db_name_here');` to point to your mongo db

In `.env` change `SECRET_KEY, WEBSITE_URL, EMAIL, EMAIL_PASSWORD, EMAIL_SERVICE`

## Build

Run `ng build --watch` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
And run `node server.js` or `nodemon server.js` if you have `nodemon` installed
