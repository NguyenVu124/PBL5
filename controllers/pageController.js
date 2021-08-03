const fs = require("fs");
const { timeNow } = require("./../helpers/functions");

exports.inFlow = async (req, res) => {
  await fs.readdir("./public/in", (err, files) => {
    let row = [];
    row[0] = files[0].split(".")[0];
    row[1] = files[0].split(".")[1];
    row[2] = timeNow();
    row[3] = "/in/" + files[0];
    return res.render("in", { data: row });
  });
};

exports.outFlow = async (req, res) => {
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
};
