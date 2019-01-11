let SensorData = require("../models/SensorData");
let Utility = require("./utility");

let sensorDataController = {};

sensorDataController.receiveSensor = (req, res) => {
  let data = req.body.DevEUI_uplink.payload_parsed.frames;
  console.log(data);

  let unpack = new Promise((resolve, reject) => {
    let receive = {};

    data.forEach(obj => {
      if (obj.type == 104) {
        receive["Humidity"] = parseFloat(obj.value);
      } else if (obj.type == 103) {
        receive["Temperature"] = parseFloat(obj.value);
      } else if (obj.type == 2) {
        receive["P-IN"] = parseInt(obj.value);
      } else if (obj.type == 3) {
        receive["P-OUT"] = parseInt(obj.value);
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

sensorDataController.receiveSensorRaw = (req, res) => {
  let payload = req.body.DevEUI_uplink.payload_hex;
  payloadCutter(payload, res);
  // res.sendStatus(200);
};

function payloadCutter(payload, res) {
  console.log(payload);
  let newDoc = {};
  (async function loop() {
    for(let i = 2; i < payload.length; ) {
      await new Promise((resolve) => {
        resolve(
          i = payloadTranslate(payload, i, newDoc)
        );
      });
    }
    console.log(newDoc);
    let newData = new SensorData(newDoc);
    newData.save(err => {
      if (err) {
        console.log(err);
        res.end("ERR");
      }
      let result = {};
      result["receive"] = newDoc;
      res.end(JSON.stringify(result));
    });
  })();
  
}

function payloadTranslate(payload, i, doc) {
  console.log(parseInt(payload.substr(i, 2), 16));
  switch (parseInt(payload.substr(i, 2), 16)){
  case 103: 
    var temp = parseSignedHex(payload.substr(i + 2, 4))/100;
    console.log("Temperature: " + temp + " ํC");
    doc["Temperature"] = `${temp}`;
    return i+8;
  case 104:
    var humid = parseInt(payload.substr(i + 2, 4), 16)*0.5;
    console.log("Humidity: " + humid + " %"); 
    doc["Humidity"] = `${humid}`;
    return i+8;
  case 2:
    var pin = parseInt(payload.substr(i + 2, 4), 16)/100;
    console.log("P-IN: " + pin);
    doc["P-IN"] = `${pin}`;
    return i+8;
  case 3:
    var pout = parseInt(payload.substr(i + 2, 4), 16)/100;
    console.log("P-OUT: " + pout);
    doc["P-OUT"] = `${pout}`;
    return i+8;
  default: i++;
  }
}

function parseSignedHex(hexstr) {
  var raw = parseInt(hexstr, 16);
  if ((raw & 0x8000) > 0) {
    return raw - 0x10000;
  } else {
    return raw;
  }
}

module.exports = sensorDataController;