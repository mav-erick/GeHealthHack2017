var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Service = new Schema({
    name: String,
    type: String
});

module.exports = mongoose.model('Service', Service);
