const express = require("express");
const mongoose = require("mongoose");

const Vehicle = require("./model/vehicle");
const Parking = require("./model/parking");
const ParkingLot = require("./model/parking_lot");
const IdCard = require("./model/id_card");

const app = express();

app.use(express.json());

app.get("/vehicle/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const vehicle = await Vehicle.findById(_id);
    if (!vehicle) {
      return res.status(404).send();
    }
    res.send(vehicle);
  } catch (error) {
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
  res.send("All parking lots!");
});

app.post("/new_vehicle", async (req, res) => {
  const vehicle = new Vehicle(req.body);
  try {
    await vehicle.save();
    res.send(vehicle);
    res.status(201).send;
  } catch (error) {
    res.send({ message: error });
  }
});

app.post("/parking", async (req, res) => {
  const parking = new Parking(req.body);
  try {
    await parking.save();
    res.send(parking);
    res.status(201).send;
  } catch (error) {
    res.status(400).send(error);
  }
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

app.delete("/parkings/:id", async (req, res) => {
  try {
    const parking = await Parking.find({ id_card: req.params.id })
      .select("id_card")
      .remove()
      .exec();
    if (!parking) {
      return res.status(404).send();
    }
    res.send(parking);
  } catch (error) {
    return res.status(500).send();
  }
});

app.patch("/parking_lot/:id", async (req, res) => {
  // const parking_lot = await ParkingLot.find({
  //   id_parking: req.params.id,
  // });
  // console.log(parking_lot[0].id_parking);
  // console.log(req.body.id_parking);
  // parking_lot[0].id_parking = req.body.id_parking;
  // parking_lot[0].status = req.body.status;
  // parking_lot[0].save();
  console.log(req.params.id);
  ParkingLot.findOneAndUpdate(
    { _id: `${req.params.id}` },
    { id_parking: `${req.body.id_parking}` }
  );
});

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
