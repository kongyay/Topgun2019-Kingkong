var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/webhook', (req, res) => {
  console.log(req.body);
  if(req.queryResult.action === 'predict') {
    temp = req.queryResult.parameters.temp
    res.json({text:'yes'});
  }
  res.json({text:'test'});
});

module.exports = router;
