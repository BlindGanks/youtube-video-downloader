const ytdl = require("ytdl-core");
const fs = require("fs");
const { dialog } = require("@electron/remote");
const Store = require("electron-store");
const store = new Store();

const downloadButton = document.getElementById("download-button");
const chooseDirButton = document.getElementById("choose-dir-button");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const percentageElement = document.getElementById("progress-percentage");
const fileSizeElement = document.getElementById("file-size-progress");
const chosenDirElement = document.getElementById("chosen-dir");
const urlInput = document.getElementById("input");
const selectedFormatInput = document.getElementById("format");

let path = store.get("chosen-directory") || "";
let isDownloading = false;

chosenDirElement.innerHTML = path;

const downloadVideo = async () => {
  const url = urlInput.value;
  const selectedFormat = selectedFormatInput.value;

  if (!url || !selectedFormat || !path || isDownloading) return;

  isDownloading = true;
  downloadButton.classList.add("disabled");
  progressContainer.style.opacity = "100%";
  urlInput.value = "";

  const info = await ytdl.getBasicInfo(url).catch((err) => {
    isDownloading = false;
    resetProgressElements();
    alert(err);
  });
  if (!info) return;
  const title = info.videoDetails.title;

  const stream = ytdl(url, {
    filter: (format) => format.container === selectedFormat,
    quality: "highest",
  });
  stream.pipe(fs.createWriteStream(`${path}/${title}.${selectedFormat}`));

  stream.on("progress", (_, downloaded, total) => {
    showProgress({
      percentage: Math.round((downloaded * 100) / total),
      total: humanFileSize(total).size,
      downloaded: humanFileSize(downloaded).size,
      sizeUnit: humanFileSize(total).unit,
    });

    if (downloaded === total) {
      resetProgressElements();
      isDownloading = false;
    }
  });
  stream.on("error", (err) => {
    isDownloading = false;
    resetProgressElements();
    alert(err.message);
  });
};

const resetProgressElements = () => {
  percentageElement.innerHTML = "0 %";
  fileSizeElement.innerHTML = "0 / 0";
  progressContainer.style.opacity = "0%";
  progressBar.firstElementChild.style.width = `0%`;
  downloadButton.classList.remove("disabled");
};

const showProgress = ({ percentage = 0, downloaded, total, sizeUnit }) => {
  progressBar.firstElementChild.style.width = `${percentage}%`;
  percentageElement.innerHTML = `${percentage} %`;
  fileSizeElement.innerHTML = `${downloaded} / ${total} ${sizeUnit}`;
};
const chooseDirectory = async () => {
  const [chosenDir] = await dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then((res) => res.filePaths || []);

  chosenDir && store.set("chosen-directory", chosenDir);
  path = chosenDir || path;
  chosenDirElement.innerHTML = chosenDir || path;
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
chooseDirButton.addEventListener("click", chooseDirectory);
