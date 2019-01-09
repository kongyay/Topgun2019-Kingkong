var express = require('express');
var router = express.Router();
var temperature = require("../controllers/TemperatureController.js");

router.get('/showData', function(req, res) {
  temperature.list(req, res);
});

router.post('/addData', (req, res) => {
  temperature.add(req, res);
})

router.delete('/deleteData/:teamID', (req, res) => {
  temperature.deleteByID(req, res);
})

router.put('/editData/:teamID', (req, res) => {
  temperature.editByID(req, res);
})

module.exports = router;
