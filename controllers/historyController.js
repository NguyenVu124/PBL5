const History = require("../model/historyModel");

exports.getAllHistory = async (req, res) => {
  try {
    let history = [];
    history = await History.find({}).lean();
    res.render("history", { history });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
};

exports.getHistoryById = async (req, res) => {
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
};
