const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { sendImage, sendSignal } = require("../helpers/functions");

exports.getInData = async (req, res) => {
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
};

exports.getBackData = async (req, res) => {
  const plate_number = req.body.message;
  console.log(plate_number);
  await renameFile(plate_number);
  res.status(200).send();
};
