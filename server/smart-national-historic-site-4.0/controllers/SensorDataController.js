let SensorData = require("../models/SensorData");
let Utility = require("./utility");

let sensorDataController = {};

sensorDataController.receiveSensor = (req, res) => {
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
    let newData = new SensorData(data);
    newData.save(err => {
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

module.exports = sensorDataController;