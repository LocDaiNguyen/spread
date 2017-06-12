const Game = require('../models/game');

getCurrentWeek = function() {
  const adjustedTime = 36; /*start the next week x(ex.36hrs) hours before the first game of that week*/
  const adjustedCurrentTime = new Date().setHours(new Date().getHours() - adjustedTime);
  Game.find(games => {
    let game = games.find(g => new Date(g.gameTimeEastern).getTime() > adjustedCurrentTime);
    if (!game) {
      game = games[games.length - 1];
    }
    return game.weekNum;
  });
}

module.exports = getCurrentWeek;