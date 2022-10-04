const ytdl = require("ytdl-core");
const fs = require("fs");
const downloadVideo = async () => {
  const url = document.getElementById("input").value;
  const selectedFormat = document.getElementById("format").value;
  if (!url || !selectedFormat) return;
  try {
    ytdl(url, {
      filter: (format) => format.container === selectedFormat,
      quality: "highest",
    }).pipe(fs.createWriteStream("video.mp4"));
  } catch (err) {
    alert(err);
  }
};

const btn = document.getElementById("btn");
btn.addEventListener("click", downloadVideo);
