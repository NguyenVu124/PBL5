const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const {
  sendImage,
  deleteIfExist,
  timeout,
  renameFile,
} = require("../helpers/functions");

exports.getInData = async (req, res) => {
  let src = "";
  try {
    const form = await new formidable.IncomingForm();

    await form.parse(req, function (err, fields, files) {
      var rawData = fs.readFileSync(files.file.path);
      var newPath = path.join("E:/PBL5/public/in") + "/" + files.file.name;
      deleteIfExist();
      fs.writeFile(newPath, rawData, function (err) {
        if (err) console.log(err);
        src = newPath;
      });
      console.log("Received image form Ras!");
    });

    await timeout(1500);
    await sendImage(src);
    console.log("Received image form AI server!");
    return res.send("Received image form AI server!");
  } catch (error) {
    res.status(400).redirect("http://localhost:3000/parking");
  }
};

exports.getBackData = async (req, res) => {
  const plate_number = req.body.message;
  console.log(plate_number);
  await renameFile(plate_number);
  res.status(200).send();
};
