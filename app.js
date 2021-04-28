const express = require("express");
const mongoose = require("mongoose");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");

const Vehicle = require("./model/vehicle");
const Parking = require("./model/parking");
const ParkingLot = require("./model/parking_lot");
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  let row = [];
  row[0] = "";
  row[1] = "";
  row[3] = "";
  res.render("in", { data: row });
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

app.get("/parking/:id", (req, res) => {
  const _id = req.params.id;
  try {
    const parking = Parking.findById(_id);
    if (!parking) {
      return res.status(404).send();
    }
    res.send(parking);
  } catch (error) {
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
  const parking = new Parking(req.body);
  const parking_lot = new ParkingLot({
    id_card: req.body.id_card,
    status: true,
  });

  try {
    await parking.save();
    await parking_lot.save();
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
  await fs.readdir("./public/out", (err, files) => {
    let row = [];
    row[0] = files[0].split(".")[0];
    row[1] = files[0].split(".")[1];
    row[3] = "/out/" + files[0];
    return res.render("out", { data: row });
  });
});

app.post("/out", async (req, res) => {
  const id_card = req.body.id_card;
  const plate_number = req.body.plate_number;
  try {
    const parking = await Parking.findOne({ id_card });

    if (!parking) {
      res.redirect("http://localhost:3000/out");
      return res.status(404).send();
    }

    if (parking.vehicle_number === plate_number) {
      await Parking.deleteOne({ id_card });
      // sendSignal()
      return res.status(200).send();
    } else {
      res.redirect("http://localhost:3000/out");
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(500).send();
  }
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
  sendImage(src);
  return res.send("Received image!");
});

app.post("/out", async (req, res) => {
  const form = new formidable.IncomingForm();
  await form.parse(req, function (err, fields, files) {
    var rawData = fs.readFileSync(files.file.path);
    var newPath = path.join(__dirname, "public/out") + "/" + files.file.name;
    fs.writeFile(newPath, rawData, function (err) {
      if (err) console.log(err);
    });
  });
  res.send("Received image!");
});

app.post("/parking_lot", async (req, res) => {
  const parking_lot = new ParkingLot(req.body);
  try {
    await parking_lot.save();
    res.send(parking_lot);
    res.status(201).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/getBack", async (req, res) => {
  const plate_number = req.body.message;
  console.log(plate_number);
  await renameFile(plate_number);
  res.status(200).send();
});

// ----------------------------------test------------------------------
app.get("/test", (req, res) => {});
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
    return lots[0];
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
}

mongoose.connect(
  "mongodb://127.0.0.1:27017/pbl5",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (req, res) => {
    console.log("Connected to DB!");
  }
);

app.listen(3000, () => {
  console.log("Listening to 3000...");
});
