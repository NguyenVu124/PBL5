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
