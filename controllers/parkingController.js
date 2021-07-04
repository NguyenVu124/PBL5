const Parking = require("../model/parkingModel");

exports.getAllParkings = async (req, res) => {
  try {
    let parkings = [];
    parkings = await Parking.find({}).lean();
    res.render("listParking", { parkings });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
};

exports.createParking = async (req, res) => {
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
};

exports.checkOut = async (req, res) => {
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
};
