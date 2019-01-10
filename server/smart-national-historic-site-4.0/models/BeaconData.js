let mongoose = require("mongoose");
let Utility = require("../controllers/utility");

let BeaconDataSchema = new mongoose.Schema({
	timestamp: { type: Date, default: Utility.getFullHour() },
	"P-IN": { type: Number, default: 0 },
	"P-OUT": { type: Number, default: 0 },
	updated_at: { type: Date, default: Date.now }
},{ collection: "BeaconData"});

module.exports = mongoose.model("BeaconData", BeaconDataSchema);