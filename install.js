const axios = require("axios");

const fs = require("fs");
const os = require("os");
const path = require("path");

const ProgressBar = require("progress");
const {
    Extract
} = require("unzipper");

const {binaryDirectory, tempDirectory} = require("./lib/directories");

function download(url, fileName) {
    return new Promise(async (resolve, reject) => {
        const file = fs.createWriteStream(fileName);

        const { data, headers } = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const totalLength = headers['content-length'];

        const progressBar = new ProgressBar('-> Downloading [:bar] :percent :etas', {
            width: 40,
            complete: '=',
            incomplete: ' ',
            renderThrottle: 1,
            total: parseInt(totalLength)
        });

        data.on('data', chunk => progressBar.tick(chunk.length));
        data.on("end", () => resolve());
        data.pipe(file);
    });
}

const platform = os.platform();
const releaseTag = "v1.0";

if (!fs.existsSync(tempDirectory)) fs.mkdirSync(tempDirectory);

if (!fs.existsSync(binaryDirectory)) fs.mkdirSync(binaryDirectory);

const releaseFileName = path.join(tempDirectory, "release.zip");

download(`https://github.com/MagicFun1241/anime4k/releases/download/${releaseTag}/${platform}.zip`, releaseFileName).then(() => {
    console.log("Successfully downloaded!");

    const read = fs.createReadStream(releaseFileName);

    read.on("end", () => {
        console.log("Extracted");

        fs.unlinkSync(releaseFileName);

        console.log("Cleaned");
        console.log();
    });

    read.pipe(Extract({ path: binaryDirectory }));
});