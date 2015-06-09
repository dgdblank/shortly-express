var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function(password){
    this.on('creating', function(){
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password.password);
      this.set('salt', salt);
      this.set('password', hash);
    }, this);
  },

  checkPassword: function(password){
    // var test = bcrypt.hashSync('4321', '$2a$10$yteofpNLk/DC2TCTJMstGO');
    // console.log('test: ', test);
    // console.log('checkPass: ', password);
    // var result = false;
    // var self = this;
    // var salt = this.get('salt');
    // console.log('salt: ', salt)
    // var check = bcrypt.hashSync(password, salt);
    // console.log('check: ',check)
    // console.log('modelPass: ',this.get('password'))
    // if(check === this.get('password')){
    //   return result = true;
    // }
    // return result
    // console.log('checkPassword', password, this.get('salt'));
    return bcrypt.compareSync(password, this.get('password'));
  }


});

module.exports = User;
