var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  // hashPassword: function(){
  //   console.log('HP called')
  //   var self = this;


  // },

  initialize: function(password){
    var self = this;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    this.set('salt', salt);
    this.set('password', hash);
    // bcrypt.genSalt(10, function(err, salt){
    //   if (err){
    //     console.error(err);
    //   }
    //   console.log('salt:' + salt);
    //   self.set('salt', salt);
    //   bcrypt.hash(password, salt, function(){}, function(err, hash){
    //     if (err){
    //       console.error(err);
    //     }
    //     console.log('hash:', hash);
    //     self.set('password', hash);
    //   });
    // });
  }

});

module.exports = User;
