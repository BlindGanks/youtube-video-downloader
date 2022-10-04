const ytdl = require("ytdl-core");
const fs = require("fs");
const homeDir = require("os").homedir(); // See: https://www.npmjs.com/package/os
const desktopDir = `${homeDir}/Desktop`;
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

//  const url = document.getElementById("input").value;
const selectedFormat = document.getElementById("format").value;

const downloadVideo = async () => {
  const url = "https://www.youtube.com/watch?v=bx3--22D4E4";
  if (!url || !selectedFormat) return;
  progressText.innerHTML = "0%";
  progressBar.style.opacity = "100%";
  const stream = ytdl(url, {
    filter: (format) => format.container === selectedFormat,
    quality: "highest",
  });
  stream.pipe(fs.createWriteStream(`${desktopDir}/video.mp4`));

  stream.on("progress", (chunkLength, downloaded, total) => {
    const percentage = `${Math.round((downloaded * 100) / total)}%`;
    progressBar.firstElementChild.style.width = percentage;
    progressText.innerHTML = percentage;

    if (downloaded === total) {
      progressText.innerHTML = "";
      progressBar.style.opacity = "0%";
      progressBar.style.width = "0%";
      alert("finished");
    }
  });
};

const btn = document.getElementById("btn");
btn.addEventListener("click", downloadVideo);
