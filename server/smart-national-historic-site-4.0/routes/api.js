let express = require("express");
let router = express.Router();
let beaconDataController = require("../controllers/BeaconDataController");
let sensorDataController = require("../controllers/SensorDataController");

/* GET home page. */
router.get("/", (req, res) => {
	res.render("index", { title: "Express" });
});

router.get("/getSanam", (req, res) => {
	beaconDataController.getSanam(req, res);
});

router.post("/putSanam", (req, res) => {
	beaconDataController.updateSanam(req, res);
});

router.post("/sensorReceive", (req, res) => {
	sensorDataController.receiveSensor(req, res);
});

module.exports = router;
