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
      res.end("ERR");
    }
    let result = {};
    result["add"] = data;
    res.end(JSON.stringify(result));
  });
}

temperatureController.deleteByID = (req, res) => {
  let id = parseInt(req.params.teamID);
  Temperature.find({ teamID: id }).exec(function (err, temperatures) {
    if (err) {
      console.log(err);
    } else if (temperatures.length == 0) {
      res.end(`NO TEAM ID: ${id}`);
    }
    else {
      Temperature.deleteMany({ teamID: id }, err => {
        if (err) {
          console.log(err);
          res.end("ERR")
        }
        let result = {}
        result["delete"] = temperatures
        res.end(JSON.stringify(result));
      });
    }
  });
}

temperatureController.editByID = (req, res) => {
  let id = parseInt(req.params.teamID);
  let data = req.body;
  Temperature.find({ teamID: id }).exec(function (err, temperatures) {
    if (err) {
      console.log(err);
    } else if (temperatures.length == 0) {
      res.end(`NO TEAM ID: ${id}`);
    }
    else {
      Temperature.updateMany({ teamID: id }, data, err => {
        if (err) {
          console.log(err);
          res.end("ERR")
        }
        Temperature.find({ teamID: id }).exec((err, temperatures_upd) => {
          if (err) {
            console.log(err);
            res.end("ERR");
          }
          let result = {}
          result["update"] = temperatures_upd;
          res.end(JSON.stringify(result));
        })
      });
    }
  });
}

temperatureController.addByReceive = (req, res) => {
  console.log(req.body.DevEUI_downlink_Sent.payload_parsed);
  res.sendStatus(200);
}

module.exports = temperatureController;
