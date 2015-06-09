var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function(UserObj){
    this.on('creating', function(){
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(userObj.password);
      this.set('salt', salt);
      this.set('password', hash);
    }, this);
  },

  checkPassword: function(password){
    return bcrypt.compareSync(password, this.get('password'));
  }


});

module.exports = User;
