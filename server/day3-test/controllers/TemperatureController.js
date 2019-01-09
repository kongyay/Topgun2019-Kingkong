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

temperatureController.add = (req, res) => {
  let data = req.body;
  let newTemp = new Temperature(data);
  newTemp.save(function(err) {
    if (err) {
      console.log(err);
      res.end("NOT OK");
    }
  });
  res.end("200 OK");
}

module.exports = temperatureController;
