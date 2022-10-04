const ytdl = require("ytdl-core");
const fs = require("fs");
const homeDir = require("os").homedir();
const desktopDir = `${homeDir}/Desktop`;
const downloadButton = document.getElementById("download-button");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const percentageElement = document.getElementById("progress-percentage");
const fileSizeElement = document.getElementById("file-size-progress");

//  const url = document.getElementById("input").value;
const selectedFormat = document.getElementById("format").value;

const downloadVideo = async () => {
  const url = "https://www.youtube.com/watch?v=bx3--22D4E4";
  if (!url || !selectedFormat) return;
  percentageElement.innerHTML = "0 %";
  progressContainer.style.opacity = "100%";

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
      showProgress({
        percentage: Math.round((downloaded * 100) / total),
        total: humanFileSize(total).size,
        downloaded: humanFileSize(downloaded).size,
        sizeUnit: humanFileSize(total).unit,
      });

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
  percentageElement.innerHTML = "";
  progressContainer.style.opacity = "0%";
};

const showProgress = ({ percentage = 0, downloaded, total, sizeUnit }) => {
  progressBar.firstElementChild.style.width = `${percentage}%`;
  percentageElement.innerHTML = `${percentage} %`;
  fileSizeElement.innerHTML = `${downloaded} / ${total} ${sizeUnit}`;
};

const humanFileSize = (bytes, si = true, dp = 1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );
  return {
    unit: units[u],
    size: bytes.toFixed(dp),
  };
};

downloadButton.addEventListener("click", downloadVideo);
