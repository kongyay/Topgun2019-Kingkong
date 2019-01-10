let mongoose = require("mongoose");
let Utility = require("../controllers/utility");

let BeaconDataRawSchema = new mongoose.Schema({
	"datetime": Date,
	"status": String
},{ collection: "BeaconDataRaw"});

module.exports = mongoose.model("BeaconDataRaw", BeaconDataRawSchema);