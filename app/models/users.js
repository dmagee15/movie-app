'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    local:{
        username: String,
        password: String,
        email: String,
    }
});

module.exports = mongoose.model('User', User);
