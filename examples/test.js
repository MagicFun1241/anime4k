const path = require("path");

const anime4k = require("../lib").default;

let cwd = process.cwd();
anime4k(path.join(cwd, "input.jpg")).gpuAcceleration(true).cnnMode({
    hdn: {
        level: 3
    }
}).toFile(path.join(cwd, "output.jpg")).then(() => {
    console.log("Done!");
});