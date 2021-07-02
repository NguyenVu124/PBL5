// app.get("/parking/:id", (req, res) => {
//   const _id = req.params.id;
//   try {
//     const parking = Parking.findById(_id);
//     if (!parking) {
//       return res.status(404).send();
//     }
//     res.send(parking);
//   } catch (error) {
//     res.status(500).send();
//   }
// });

// app.get("/out", async (req, res) => {
//   await fs.readdir("./public/out", (err, files) => {
//     let row = [];
//     row[0] = files[0].split(".")[0];
//     row[1] = files[0].split(".")[1];
//     row[3] = "/out/" + files[0];
//     return res.render("out", { data: row });
//   });
// });

// app.post("/out", async (req, res) => {
//   const id_card = req.body.id_card;
//   const plate_number = req.body.plate_number;
//   try {
//     const parking = await Parking.findOne({ id_card });

//     if (!parking) {
//       res.redirect("http://localhost:3000/out");
//       return res.status(404).send();
//     }

//     if (parking.vehicle_number === plate_number) {
//       await Parking.deleteOne({ id_card });
//       // sendSignal()
//       return res.status(200).send();
//     } else {
//       res.redirect("http://localhost:3000/out");
//       return res.status(404).send();
//     }
//   } catch (error) {
//     return res.status(500).send();
//   }
// });
// // app.post("/out", async (req, res) => {
// //   const form = new formidable.IncomingForm();
// //   await form.parse(req, function (err, fields, files) {
// //     var rawData = fs.readFileSync(files.file.path);
// //     var newPath = path.join(__dirname, "public/out") + "/" + files.file.name;
// //     fs.writeFile(newPath, rawData, function (err) {
// //       if (err) console.log(err);
// //     });
// //   });
// //   res.send("Received image!");
// // });

// app.post("/parking_lot", async (req, res) => {
//   const parking_lot = new ParkingLot(req.body);
//   try {
//     await parking_lot.save();
//     res.send(parking_lot);
//     res.status(201).send();
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });
cvxv;
// git clone --single-branch --branch mockup https://github.com/NguyenVu124/PBL5.git
