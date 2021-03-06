let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");

require("dotenv").config();

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_ADDRESS}:${process.env.DB_PORT}/tgr2019`, {useNewUrlParser: true})
  .then(() =>  console.log("connection succesful"))
  .catch((err) => console.error(err));

let beaconDataController = require("./controllers/BeaconDataController");
let moment = require("moment");
let schedule = require("node-schedule");
let insertEmpythHour = schedule.scheduleJob("* 0 * * * *", () => {
  let hourStr = moment().toISOString();
  let hourDate = (new Date(hourStr)).setMinutes(0, 0, 0);
  beaconDataController.insertEmptyHour(hourDate);
});

let indexRouter = require("./routes/index");
let apiRouter = require("./routes/api");

let app = express();

global.fetch = require("node-fetch");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
