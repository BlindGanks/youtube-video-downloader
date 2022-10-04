const ytdl = require("ytdl-core");
const fs = require("fs");
const homeDir = require("os").homedir(); // See: https://www.npmjs.com/package/os
const desktopDir = `${homeDir}/Desktop`;
const downloadButton = document.getElementById("download-button");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

//  const url = document.getElementById("input").value;
const selectedFormat = document.getElementById("format").value;

const downloadVideo = async () => {
  const url = "https://www.youtube.com/watch?v=bx3--22D4E4";
  if (!url || !selectedFormat) return;
  progressText.innerHTML = "0 %";
  progressBar.style.opacity = "100%";

  try {
    const { videoDetails } = await ytdl.getBasicInfo(url);
    const stream = ytdl(url, {
      filter: (format) => format.container === selectedFormat,
      quality: "highest",
    });
    stream.pipe(
      fs.createWriteStream(`${desktopDir}/${videoDetails.title}.mp4`)
    );

    stream.on("progress", (_, downloaded, total) => {
      showProgress({ percentage: Math.round((downloaded * 100) / total) });

      if (downloaded === total) {
        resetProgressElements();
        alert("finished");
        // so i dont keep deleting the video manually
        fs.unlink(`${desktopDir}/${videoDetails.title}.mp4`, (err) => {
          if (err) alert(err);
        });
      }
    });
  } catch (err) {
    resetProgressElements();
    alert(err);
  }
};

const resetProgressElements = () => {
  progressText.innerHTML = "";
  progressBar.style.opacity = "0%";
};

const showProgress = ({ percentage = 0 }) => {
  progressBar.firstElementChild.style.width = `${percentage}%`;
  progressText.innerHTML = `${percentage} %`;
};

downloadButton.addEventListener("click", downloadVideo);
