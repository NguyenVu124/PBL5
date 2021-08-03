const express = require("express");
const flush = require("connect-flash");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const parkingRouter = require("./routes/parkingRoutes");
const historyRouter = require("./routes/historyRoutes");
const transferDataRouter = require("./routes/transferDataRoutes");
const pageRouter = require("./routes/pageRoutes");
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flush());

app.use("/", pageRouter);
app.use("/parking", parkingRouter);
app.use("/history", historyRouter);
app.use("/data", transferDataRouter);

// mongodb+srv://nguyenvu124:nguyenvu124@cluster0.ewmlf.mongodb.net/pbl5?retryWrites=true&w=majority
// mongodb://127.0.0.1:27017/pbl5
module.exports = app;
