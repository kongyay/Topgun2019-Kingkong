let predict = require("./predictModule");
let BeaconData = require("../models/BeaconData");
let PredictController = {};

PredictController.getPredict = (req, res) => {
  let result = {};

  BeaconData.countDocuments({}, (err, count) => {
    if (err) {
      console.log(err);
      result["status"] = 1;
      result["status_desc"] = "error in counting documents";
      res.end(JSON.stringify(result));
      return;
    }

    BeaconData.find({}).skip(count-12).exec((err, docs) => {
      if (err) {
        console.log(err);
        result["status"] = 1;
        result["status_desc"] = "error in getting documents";
        res.end(JSON.stringify(result));
        return;
      }

      let numOfTourist = [];
      docs.forEach(doc => {
        numOfTourist.push(doc["P-IN"]);
      });

      predict(numOfTourist).then(x => {
        let res_arr = [];
        for (let i = 0; i < 3; i++) {
          res_arr.push(`${Math.floor(x[i])}`);
        }
        result["number_of_tourist"] = res_arr;
        res.end(JSON.stringify(result));
      });
    });
  });
  
};

module.exports = PredictController;