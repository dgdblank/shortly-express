var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link.js')

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function(){
    this.on('creating', this.hashPassword);
  },

  hashPassword: function(){
    var cipher = Promise.promisify(bcrypt.hash);

    return cipher(this.get('password'), null, null)
      .bind(this)
      .then(function(hash){
        this.set('password', hash);
      });
  },

  checkPassword: function(password, callback){
    bcrypt.compare(password, this.get('password'), function(err, isMatch){
      callback(isMatch);
    });
  },

  links: function() {
    return this.hasMany(Link);
  }
});

module.exports = User;
