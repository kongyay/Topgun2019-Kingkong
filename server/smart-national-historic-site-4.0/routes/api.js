let express = require("express");
let router = express.Router();
let beaconDataController = require("../controllers/BeaconDataController");

/* GET home page. */
router.get("/", (req, res) => {
	res.render("index", { title: "Express" });
});

router.get("/getSanam", (req, res) => {
	beaconDataController.getSanam(req, res);
});

module.exports = router;
