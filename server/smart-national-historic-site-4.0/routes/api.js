let express = require("express");
let router = express.Router();
let beaconDataController = require("../controllers/BeaconDataController");
let sensorDataController = require("../controllers/SensorDataController");
let adminMonController = require("../controllers/AdminMonController");
let predictController = require("../controllers/PredictController");

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
  sensorDataController.receiveSensorRaw(req, res);
});

router.get("/getAdminMon", (req, res) => {
  adminMonController.getAdminMon(req, res);
});

router.get("/predict", (req, res) => {
  predictController.getPredict(req, res);
});

module.exports = router;
