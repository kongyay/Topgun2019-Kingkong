let mongoose = require("mongoose");
let BeaconData = require("../models/BeaconData");
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
	let action = req.body.beacon.status;

	BeaconData.countDocuments({ timestamp: Utility.getFullHour() }, (err, count) => {
		if (err) {
			console.log(err);
			res.end("ERROR");
			return;
		}
		if (count == 0) {
			let insert = {};
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

			BeaconData.updateOne({ timestamp: Utility.getFullHour() }, update, (err) => {
				if (err) {
					console.log(err);
					res.end("ERROR");
					return;
				}
				res.end(JSON.stringify(req.body));
			});
		}
	});

	
};

module.exports = beaconDataController;
