let mongoose = require("mongoose");

let TemperatureSchema = new mongoose.Schema({
	timestamp: { type: Date, default: Date.now },
	teamID: Number,
	temp: Number,
},{ collection: "temperature"});

module.exports = mongoose.model("Temperature", TemperatureSchema);
