let mongoose = require("mongoose");
let Temperature = require("../models/Temperature");

let temperatureController = {};

temperatureController.list = (req, res) => {
	Temperature.find({}).exec((err, temperatures) => {
		if (err) {
			console.log(err);
		}
		else {
			let result = {};
			result["temperature"] = temperatures;
			res.end(JSON.stringify(result));
		}
	});
};

temperatureController.add = (req, res) => {
	let data = req.body;
	let newTemp = new Temperature(data);
	newTemp.save(err => {
		if (err) {
			console.log(err);
			res.end("ERR");
		}
		let result = {};
		result["add"] = data;
		res.end(JSON.stringify(result));
	});
};

temperatureController.deleteByID = (req, res) => {
	let id = parseInt(req.params.teamID);
	Temperature.find({ teamID: id }).exec((err, temperatures) => {
		if (err) {
			console.log(err);
		} else if (temperatures.length == 0) {
			res.end(`NO TEAM ID: ${id}`);
		} else {
			Temperature.deleteMany({ teamID: id }, err => {
				if (err) {
					console.log(err);
					res.end("ERR");
				}
				let result = {};
				result["delete"] = temperatures;
				res.end(JSON.stringify(result));
			});
		}
	});
};

temperatureController.editByID = (req, res) => {
	let id = parseInt(req.params.teamID);
	let data = req.body;
	Temperature.find({ teamID: id }).exec((err, temperatures) => {
		if (err) {
			console.log(err);
		} else if (temperatures.length == 0) {
			res.end(`NO TEAM ID: ${id}`);
		} else {
			Temperature.updateMany({ teamID: id }, data, err => {
				if (err) {
					console.log(err);
					res.end("ERR");
				}
				Temperature.find({ teamID: id }).exec((err, temperatures_upd) => {
					if (err) {
						console.log(err);
						res.end("ERR");
					}
					let result = {};
					result["update"] = temperatures_upd;
					res.end(JSON.stringify(result));
				});
			});
		}
	});
};

temperatureController.addByReceive = (req, res) => {
	let data = req.body.DevEUI_uplink.payload_parsed.frames;
	console.log(data);

	let unpack = new Promise((resolve, reject) => {
		let receive = {};

		data.forEach(obj => {
			if (obj.type == 2) {
				receive["teamID"] = parseInt(obj.value);
			} else if (obj.type == 103) {
				receive["temp"] = parseFloat(obj.value);
			}
		});

		resolve(receive);
	});

	unpack.then(data => {
		let newTemp = new Temperature(data);
		newTemp.save(err => {
			if (err) {
				console.log(err);
				res.end("ERR");
			}
			let result = {};
			result["receive"] = data;
			res.end(JSON.stringify(result));
		});
	});
};

module.exports = temperatureController;
