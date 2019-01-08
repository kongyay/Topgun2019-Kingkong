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
  res.send("KINGKONG");
});

app.get('/listusers', (req, res) => {
  fs.readFile(__dirname + "/" + "users.json", 'utf8', (err, data) => {
    console.log(data);
    res.end(data);
  });
});

app.get('/showbyID/:id', (req, res) => {
  fs.readFile(__dirname + "/" + "users.json", 'utf8', (err, data) => {
    let id = parseInt(req.params.id);    
    data = JSON.parse(data);
    
    let resultKey = Object.keys(data).find(x => data[x].id == id);

    if (resultKey != undefined) {
      let result = {};
      result[resultKey] = data[resultKey];
      res.end(JSON.stringify(result));
    } else {
      res.end("NOT FOUND");
    }
  });
});

app.post('/addUser', (req, res) => {
  let newUser = req.body;

  fs.readFile(__dirname + "/" + "users.json", 'utf8', (err, data) => {
    data = JSON.parse(data);
    let dataLength = Object.keys(data).length;
    req.body["id"] = dataLength + 1;
    
    data[`user${(dataLength + 1).toString()}`] = req.body;
    console.log(data);
    res.end(JSON.stringify(data));
  })
})

let server = app.listen(3000, () => {
  let port = server.address().port;

  console.log(`Server is running at ${port} eiei`);
})

