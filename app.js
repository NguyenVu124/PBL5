const express = require("express");
const formidable = require("formidable");
const flush = require("connect-flash");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const parkingRouter = require("./routes/parkingRoutes");
const historyRouter = require("./routes/historyRoutes");
const pageRouter = require("./routes/pageRoutes");
const { sendImage, sendSignal } = require("./helpers/functions");
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

// app.get("/checkInvalid", async (req, res) => {
//   return res.render("checkInvalid", {
//     message: req.flash("message"),
//   });
// });

// app.post("/in", async (req, res) => {
//   let src = "";
//   const form = new formidable.IncomingForm();
//   deleteIfExist();
//   await form.parse(req, function (err, fields, files) {
//     var rawData = fs.readFileSync(files.file.path);
//     var newPath = path.join(__dirname, "public/in") + "/" + files.file.name;
//     fs.writeFile(newPath, rawData, function (err) {
//       if (err) console.log(err);
//       src = newPath;
//     });
//     console.log("Received image form Ras!");
//   });
//   console.log(src);
//   await timeout(1000);
//   // sendImage(src);
//   return res.send("Received image form AI server!");
// });

// app.post("/out", async (req, res) => {});

// app.post("/getBack", async (req, res) => {
//   const plate_number = req.body.message;
//   console.log(plate_number);
//   await renameFile(plate_number);
//   res.status(200).send();
// });

// mongodb+srv://nguyenvu124:nguyenvu124@cluster0.ewmlf.mongodb.net/pbl5?retryWrites=true&w=majority
// mongodb://127.0.0.1:27017/pbl5
module.exports = app;
