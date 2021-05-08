// const form = document.getElementById("form");
// if (form) {
//   form.addEventListener("submit", function () {
//     fetch("/ra")
//       .then(function (response) {
//         if (response.status === 200) {
//           console.log("ok");
//           alert("Xoa thang cong");
//           return;
//         }
//       })
//       .catch((err) => {
//         console.log("Error :-S", err);
//       });
//   });
// }

const open_barrier = document.getElementById("open");
open_barrier.addEventListener("click", function () {
  console.log("Open barrier");
});
