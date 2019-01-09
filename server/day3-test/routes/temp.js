var express = require('express');
var router = express.Router();
var temperature = require("../controllers/TemperatureController.js");

// Get all temperatures
router.get('/showData', function(req, res) {
  temperature.list(req, res);
});

module.exports = router;
