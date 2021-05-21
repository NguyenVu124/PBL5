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

module.exports = {
  renameFile,
  sendImage,
  sendSignal,
  timeout,
  deleteIfExist,
  hintLot,
  timeNow,
};
