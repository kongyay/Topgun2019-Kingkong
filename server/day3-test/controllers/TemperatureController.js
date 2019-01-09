var mongoose = require("mongoose");
var Temperature = require("../models/Temperature");

var temperatureController = {};

temperatureController.list = function(req, res) {
  Temperature.find({}).exec(function (err, temperatures) {
    if (err) {
      console.log("Error:", err);
    }
    else {
      let result = {}
      result["temperature"] = temperatures
      res.end(JSON.stringify(result));
    }
  });
};

module.exports = temperatureController;
