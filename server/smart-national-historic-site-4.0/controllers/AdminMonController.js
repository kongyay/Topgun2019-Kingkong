let BeaconDataRaw = require("../models/BeaconDataRaw");
let SensorData = require("../models/SensorData");
let moment = require("moment");

let AdminMonController = {};

AdminMonController.getAdminMon = (req, res) => {
	let auth_token = req.get("X-Bot-Auth");
	let result = {};

	if (auth_token != process.env.ADMIN_AUTH_TOKEN) {
		result["status"] = 1;
		result["status_desc"] = "error, Unauthorized to call this API";
		res.end(JSON.stringify(result));
		return;
	} else {
		let lastHourStr = moment().subtract(1, "hours").toISOString();
		let lastHourDate = (new Date(lastHourStr)).getTime();
		console.log(lastHourStr);

		SensorData.findOne({}).sort("-timestamp").exec((err, sensor) => {
			SensorData.aggregate([
				{ $match: { "timestamp": { $gte:new Date(lastHourDate)}} },
				{ $group: {
					_id: null,
					"P-IN": { $sum: "$P-IN" },
					"P-OUT": { $sum: "$P-OUT" }
				}}
			], (err, data) => {
        console.log(data);
				result["status"] = 0;
				result["status_desc"] = "complete";
				result["Temperature"] = sensor["Temperature"];
        result["Humidity"] = sensor["Humidity"];
        if (data.length != 0) {
          result["P-IN"] = data[0]["P-IN"];
          result["P-OUT"] = data[0]["P-OUT"];
        } else {
          result["P-IN"] = 0;
          result["P-OUT"] = 0;
        }
				res.end(JSON.stringify(result));
			});
		});
	}

};

module.exports = AdminMonController;