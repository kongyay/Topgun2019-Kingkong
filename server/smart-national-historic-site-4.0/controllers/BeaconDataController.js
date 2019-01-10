let BeaconData = require("../models/BeaconData");
let BeaconDataRaw = require("../models/BeaconDataRaw");
let Utility = require("./utility");

let beaconDataController = {};

beaconDataController.getSanam = (req, res) => {
	let hours = parseInt(req.query.hours);
	let result = {};
	BeaconData.countDocuments({}, (err, count) => {
		if (err) {
			console.log(err);
			result["status"] = 1;
			result["status_desc"] = "error in counting documents";
			res.end(JSON.stringify(result));
			return;
		}

		console.log(count);
		console.log(hours);
		
		if (hours > count) {
			result["status"] = 1;
			result["status_desc"] = "error, request more than record";
			res.end(JSON.stringify(result));
			return;
		} else {
			if (hours == 0) {
				result["status"] = 0;
				result["status_desc"] = "complete";
				result["num_of_tourist"] = [];
				res.end(JSON.stringify(result));
				return;
			}
			BeaconData.find({}).skip(count-hours).exec((err, docs) => {
				if (err) {
					console.log(err);
					result["status"] = 1;
					result["status_desc"] = "error in getting documents";
					res.end(JSON.stringify(result));
					return;
				}
				console.log(docs);

				let pack = new Promise((resolve, reject) => {
					let numOfTourist = [];
					docs.forEach(doc => {
						numOfTourist.push(`${doc["P-IN"]}`);
					});
					resolve(numOfTourist);
				});

				pack.then(hist_data => {
					result["status"] = 0;
					result["status_desc"] = "complete";
					result["num_of_tourist"] = hist_data;
					res.end(JSON.stringify(result));
					return;
				});
			});
		}
	});
};

beaconDataController.updateSanam = (req, res) => {
	let beaconContent = req.body.beacon;
	let beaconRawSave = new BeaconDataRaw(beaconContent);
	beaconRawSave.save( err => {
		if (err) {
			console.log(err);
			res.end("ERROR");
			return;
		}
		let action = req.body.beacon.status;
		let tstamp = new Date(req.body.beacon.datetime);

		BeaconData.countDocuments({ timestamp: tstamp.setMinutes(0, 0, 0) }, (err, count) => {
			if (err) {
				console.log(err);
				res.end("ERROR");
				return;
			}
			if (count == 0) {
				let insert = { timestamp: tstamp.setMinutes(0, 0, 0) };
				if (action == "enter") {
					insert["P-IN"] = 1;
				} else {
					insert["P-OUT"] = 1;
				}

				let newBeacon = new BeaconData(insert);
				newBeacon.save( err => {
					if (err) {
						console.log(err);
						res.end("ERROR");
						return;
					}
					res.end(JSON.stringify(req.body));
				});
			} else {
				let update = {};
				if (action == "enter") {
					update = { $inc: { "P-IN": 1 } };
				} else {
					update = { $inc: { "P-OUT": 1 } };
				}

				BeaconData.updateOne({ timestamp: tstamp.setMinutes(0, 0, 0) }, update, (err) => {
					if (err) {
						console.log(err);
						res.end("ERROR");
						return;
					}
					res.end(JSON.stringify(req.body));
				});
			}
		});
	});

	

	
};

module.exports = beaconDataController;
