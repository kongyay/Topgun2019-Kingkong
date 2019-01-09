var mongoose = require('mongoose');

var TemperatureSchema = new mongoose.Schema({
  teamID: Number,
  temp: Number,
},{ collection: 'temperature'});

module.exports = mongoose.model('Temperature', TemperatureSchema);
