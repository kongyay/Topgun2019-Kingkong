const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {title: 'wtf'})
});

app.get('/listusers', (req, res) => {
  fs.readFile(__dirname + "/" + "users.json", 'utf8', (err, data) => {
    console.log(data);
    res.end(data);
  })
})

app.post('/adduser', (req, res) => {
  let json = req.body;

  fs.readFile(__dirname + "/" + "users.json", 'utf8', (err, data) => {
    data = JSON.parse(data);
    data["user4"] = req.body;
    console.log(data);
    res.end(JSON.stringify(data));
  })
})

var server = app.listen(3000, () => {
  let port = server.address().port;

  console.log(`Server is running at ${port} eiei`);
})

