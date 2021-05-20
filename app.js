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

app.get("/history", async (req, res) => {
  try {
    let history = [];
    history = await History.find({}).lean();
    res.render("history", { history });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

app.get("/parking_lots", (req, res) => {
  try {
    ParkingLot.find({}, function (err, all) {
      if (err) {
        res.status(404).send();
      }
      res.send(all);
    });
  } catch (error) {
    res.status(500).send();
  }
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
    history.image.data = fs.readFileSync("./public/in/" + path, {
      encoding: "utf8",
    });
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

app.get("/in", async (req, res) => {
  var d = new Date();
  now =
    d.getFullYear() +
    "/" +
    d.getMonth() +
    "/" +
    d.getDate() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds();

  await fs.readdir("./public/in", (err, files) => {
    let row = [];
    row[0] = files[0].split(".")[0];
    row[1] = files[0].split(".")[1];
    row[2] = now;
    row[3] = "/in/" + files[0];
    return res.render("in", { data: row });
  });
});

app.get("/out", async (req, res) => {
  var d = new Date();
  now =
    d.getFullYear() +
    "/" +
    d.getMonth() +
    "/" +
    d.getDate() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds();
  await fs.readdir("./public/in", (err, files) => {
    let row = [];
    row[0] = files[0].split(".")[0];
    row[1] = files[0].split(".")[1];
    row[2] = now;
    row[3] = "/in/" + files[0];
    return res.render("out", { data: row, message: req.flash("message") });
  });
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
    console.log("da nhan tu ras");
  });
  console.log(src);
  await timeout(1000);
  // sendImage(src);
  return res.send("Received image!");
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
      req.flash("message", "Thành công!");
      return res.status(200).redirect("http://localhost:3000/out");
    } else {
      req.flash("message", "Không trùng khớp biển số xe và ID thẻ từ!");
      return res.status(404).redirect("http://localhost:3000/out");
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

// ----------------------------------test------------------------------
app.get("/test", async (req, res) => {});
app.post("/data", async (req, res) => {
  sendImage();
  res.redirect("http://localhost:3000/data");
});
// ----------------------------------test------------------------------

async function renameFile(newName) {
  let old = "";
  await fs.readdir("./public/in", (err, files) => {
    old = files[0];
  });
  await timeout(10);
  fs.renameSync(
    `./public/in/${old}`,
    `./public/in/${old.split(".")[0]}.${newName}.jpg`
  );
}

async function sendImage(src) {
  var FormData = require("form-data");

  var form = new FormData();
  form.append("file", fs.createReadStream(src));
  // __dirname + `/public/in/${image}`
  form.append("message", "Controller");

  var options = {
    host: "192.168.1.3",
    port: 5000,
    path: "/data",
    method: "POST",
    headers: form.getHeaders(),
  };

  var request = http.request(options, function (res) {
    console.log(res);
  });

  form.pipe(request);

  request.on("error", function (error) {
    console.log(error);
  });
}

function sendSignal() {
  const data = JSON.stringify({
    todo: "Open barrier",
  });

  const options = {
    hostname: "192.168.1.6",
    port: 5000,
    path: "/test",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const request = http.request(options, (response) => {
    console.log(`statusCode: ${response.statusCode}`);

    response.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  request.on("error", (error) => {
    console.error(error);
  });

  request.write(data);
  request.end();
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function deleteIfExist() {
  fs.readdir("./public/in", function (err, files) {
    if (err) {
      console.log(err);
    } else {
      if (!files.length) {
        return false;
      } else {
        for (const file of files) {
          fs.unlink(path.join("./public/in", file), (err) => {
            if (err) throw err;
          });
        }
        return true;
      }
    }
  });
}

async function hintLot() {
  try {
    let lots = [];
    lots = await ParkingLot.find({ status: false }).lean();
    return lots[0].position;
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
}

function timeNow() {
  var d = new Date();
  now =
    d.getFullYear() +
    "/" +
    d.getMonth() +
    "/" +
    d.getDate() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds();

  return now;
}

mongoose.connect(
  "mongodb+srv://nguyenvu124:nguyenvu124@cluster0.ewmlf.mongodb.net/pbl5?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (req, res) => {
    console.log("Connected to DB!");
  }
);

// mongodb://127.0.0.1:27017/pbl5

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening to 3000...");
});
