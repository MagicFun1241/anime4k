import * as path from "path";
import * as tmp from 'temp-dir';

export const binaryDirectory = path.join(__dirname, "../bin");

export const tempDirectory = path.join(tmp, "waifu2x-node");