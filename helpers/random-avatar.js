const Avatar = require('../models/avatar');

randomAvatar = function() {
  
  let result = 'default';
  
  Avatar.find((err, avatars) => {
  
    if (err) {
      return result;
    }
  
    if (!avatars) {
      return result;
    }
  
    return result = avatars[Math.floor(Math.random() * avatars.length)].avatar;

  });
}

module.exports = randomAvatar;