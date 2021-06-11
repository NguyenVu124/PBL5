const express = require("express");
const mongoose = require("mongoose");
const formidable = require("formidable");
const flush = require("connect-flash");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const Parking = require("./model/parking");
const ParkingLot = require("./model/parking_lot");
const History = require("./model/history");
//
const {
  renameFile,
  sendImage,
  sendSignal,
  timeout,
  deleteIfExist,
  hintLot,
  timeNow,
} = require("./helpers/functions");
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(__dirname + "/public"));
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

app.get("/", async (req, res) => {
  try {
    let history = [];
    history = await History.find({}).lean();
    res.render("history", { history });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.get("/parking", async (req, res) => {
  try {
    let parkings = [];
    parkings = await Parking.find({}).lean();
    res.render("listParking", { parkings });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.get("/history/:id_random", async (req, res) => {
  const id_random = req.params.id_random;
  let history = await History.findOne({ id_random }, (err, item) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      const vehicle_number = item.vehicle_number;
      let data = item.image.data;
      base64 = Buffer.from(data).toString("base64");
      res.render("image", { item: { base64, vehicle_number } });
    }
  });
});

app.get("/in", async (req, res) => {
  await fs.readdir("./public/in", (err, files) => {
    let row = [];
    row[0] = files[0].split(".")[0];
    row[1] = files[0].split(".")[1];
    row[2] = timeNow();
    row[3] = "/in/" + files[0];
    return res.render("in", { data: row });
  });
});

app.get("/out", async (req, res) => {
  await fs.readdir("./public/in", (err, files) => {
    let row = [];
    row[0] = files[0].split(".")[0];
    row[1] = files[0].split(".")[1];
    row[2] = timeNow();
    row[3] = "/in/" + files[0];
    return res.render("out", {
      data: row,
      message: req.flash("message"),
      success: req.flash("success"),
    });
  });
});

app.get("/checkInvalid", async (req, res) => {
  return res.render("checkInvalid", {
    message: req.flash("message"),
  });
});

app.post("/parking", async (req, res) => {
  let path = "";
  const position = await hintLot();
  const parking = new Parking(req.body);
  let history = new History();
  history.id_random = req.body.id_random;
  history.id_card = req.body.id_card;
  history.vehicle_number = req.body.vehicle_number;
  history.time_in = req.body.time;
  history.time_out = "";
  await fs.readdir("./public/in", (err, files) => {
    path = files[0];
    history.image.data = fs.readFileSync("./public/in/" + path);
  });
  history.image.contentType = "image/jpg";
  try {
    await parking.save();
    await ParkingLot.updateOne(
      { position },
      {
        position,
        id_card: req.body.id_card,
        status: true,
      },
      (err) => {
        if (err) console.log(err);
      }
    );
    await history.save();
    res.redirect("http://localhost:3000/");
    // sendSignal();
    res.status(201).send();
  } catch (error) {
    res.status(400).send(error);
  }
  res.status(200).send();
});

app.post("/in", async (req, res) => {
  let src = "";
  const form = new formidable.IncomingForm();
  deleteIfExist();
  await form.parse(req, function (err, fields, files) {
    var rawData = fs.readFileSync(files.file.path);
    var newPath = path.join(__dirname, "public/in") + "/" + files.file.name;
    fs.writeFile(newPath, rawData, function (err) {
      if (err) console.log(err);
      src = newPath;
    });
    console.log("Received image form Ras!");
  });
  console.log(src);
  await timeout(1000);
  // sendImage(src);
  return res.send("Received image form AI server!");
});

app.post("/out", async (req, res) => {
  const id_card = req.body.id_card;
  const plate_number = req.body.plate_number;

  try {
    const parking = await Parking.findOne({ id_card });
    const lot = await ParkingLot.findOne({ id_card });
    if (!parking && !lot) {
      req.flash("message", "Không có dữ liệu!");
      return res.status(404).redirect("http://localhost:3000/out");
    }
    if (parking.vehicle_number === plate_number) {
      const position = lot.position;
      await Parking.deleteOne({ id_card });
      await ParkingLot.updateOne(
        { position },
        {
          position,
          id_card: "",
          status: false,
        },
        (err) => {
          if (err) console.log(err);
        }
      );
      await History.updateOne(
        { id_random: parking.id_random },
        {
          $set: {
            time_out: timeNow(),
          },
        }
      );
      // sendSignal()
      req.flash("success", "Thành công!");
      return res.status(200).redirect("http://localhost:3000/out");
    } else {
      const id_random = parking.id_random;
      const check = await History.findOne({ id_random }, (err, item) => {
        if (err) {
          console.log(err);
        } else {
          const vehicle_number = item.vehicle_number;
          let data = item.image.data;
          base64 = Buffer.from(data).toString("base64");

          req.flash("message", base64);
          return res.status(200).redirect("http://localhost:3000/out");
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
});

app.post("/getBack", async (req, res) => {
  const plate_number = req.body.message;
  console.log(plate_number);
  await renameFile(plate_number);
  res.status(200).send();
});

mongoose.connect(
  "mongodb+srv://nguyenvu124:nguyenvu124@cluster0.ewmlf.mongodb.net/pbl5?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (req, res) => {
    console.log("Connected to DB!");
  }
);
// mongodb+srv://nguyenvu124:nguyenvu124@cluster0.ewmlf.mongodb.net/pbl5?retryWrites=true&w=majority
// mongodb://127.0.0.1:27017/pbl5

app.listen(process.env.PORT || 3000, () => {
  console.log("Server in running!");
});
