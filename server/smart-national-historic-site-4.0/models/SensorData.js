let mongoose = require("mongoose");

let SensorDataSchema = new mongoose.Schema({
	timestamp: { type: Date, default: Date.now },
	"Temperature": Number,
	"Humidity": Number,
	"P-IN": Number,
	"P-OUT": Number
},{ collection: "SensorData"});

module.exports = mongoose.model("SensorData", SensorDataSchema);