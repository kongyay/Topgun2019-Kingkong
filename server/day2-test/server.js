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
})

let server = app.listen(3000, () => {
  let port = server.address().port;

  console.log(`Server is running at ${port} eiei`);
})

