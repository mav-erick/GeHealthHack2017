var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserComplete = new Schema({
    username: String,
    name: String,
    hospital : String,
    email: String,
    designation: String
});

module.exports = mongoose.model('UserComplete', UserComplete);
