// This module is a hack to make YNOonline prompts work with Electron.
// There's probably a better way to do this.

export default function (win) {
  win.webContents.executeJavaScript(`
    var poll = setInterval(function() {
      if (document.title === "Yume Nikki Online Project") {
        clearInterval(poll);
        return;
      }
      if (document.querySelector("#downloadButton")?.onclick) {
        clearInterval(poll);
        var originalDownloadClick = document.querySelector("#downloadButton").onclick;
        document.querySelector("#downloadButton").onclick = function () {
          var script = document.createElement("script");
          script.onload = function () {
            Swal.fire({
              title: "Save slot?",
              icon: "question",
              input: "range",
              inputLabel: "Slot number",
              inputAttributes: {
                min: 1,
                max: 15,
                step: 1,
              },
              inputValue: 1,
            }).then((result) => {
              window.prompt = function () {
                return result.value;
              };
              originalDownloadClick();
            });
          };
          script.src = "//cdn.jsdelivr.net/npm/sweetalert2@11";
          script.id = "sweetalert2";
          if (!document.querySelector("#sweetalert2")) {
            document.head.appendChild(script);
          } else {
            script.onload();
          }
        };

        var originalUploadClick = document.querySelector("#uploadButton").onclick;
        document.querySelector("#uploadButton").onclick = function () {
          var script = document.createElement("script");
          script.onload = function () {
            Swal.fire({
              title: "Save slot?",
              icon: "question",
              input: "range",
              inputLabel: "Slot number",
              inputAttributes: {
                min: 1,
                max: 15,
                step: 1,
              },
              inputValue: 1,
            }).then((result) => {
              window.prompt = function () {
                return result.value;
              };
              originalUploadClick();
            });
          };
          script.src = "//cdn.jsdelivr.net/npm/sweetalert2@11";
          script.id = "sweetalert2";
          if (!document.querySelector("#sweetalert2")) {
            document.head.appendChild(script);
          } else {
            script.onload();
          }
        };
      }
    }, 200);
  `);
};
