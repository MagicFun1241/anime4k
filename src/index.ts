import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import {nanoid} from "nanoid";
import {spawn} from "child_process";
import {binaryDirectory, tempDirectory} from "./directories";

const executablePath = path.join(__dirname, "../bin", os.platform() === 'win32' ? 'Anime4KCPP_CLI.exe' : 'Anime4KCPP_CLI');

interface Anime4K {
    gpuAcceleration(value: boolean): Anime4K;
    cnnMode(value: Omit<CNNMode, "type">): Anime4K;
    zoomFactor(value: number): Anime4K;

    toFile(path: string): Promise<void>;
    toBuffer(): Promise<Buffer>;
}

interface CNNMode {
    type: "cnn",
    hdn: {
        level?: 1 | 2 | 3;
    }
}

interface Anime4K09Mode {
    type: "anime4k09";
    passes: number;
}

function convert(input: string, output: string, options: {
    mode: CNNMode | Anime4K09Mode;
    zoomFactor: number;
    gpuAcceleration: boolean;
}): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const args = [
            "--input",
            input,
            "--output",
            output,
            "--zoomFactor",
            options.zoomFactor.toString()
        ];

        if (options.gpuAcceleration) args.push("--GPUMode");

        switch (options.mode.type) {
            case "cnn":
                args.push(
                    "--CNNMode",
                    "--HDN",
                    "--HDNLevel",
                    (options.mode as CNNMode).hdn.level == null ? "1" : (options.mode as CNNMode).hdn.level.toString()
                );
                break;
        }

        const child = spawn(executablePath, args, {
            cwd: binaryDirectory
        });

        child.on("exit", () => {
            resolve();
        });
    });
}

function anime4k(input: string): Anime4K {
    let mode: CNNMode | Anime4K09Mode;
    let gpuAcceleration = false;
    let zoomFactor = 2;

    const context: Anime4K = {
        toBuffer(): Promise<Buffer> {
            return new Promise<Buffer>((resolve, reject) => {
                const tmp = path.join(tempDirectory, nanoid(12));
                convert(input, tmp, {
                    mode: mode,
                    zoomFactor: zoomFactor,
                    gpuAcceleration: gpuAcceleration
                }).then(() => {
                    resolve(fs.readFileSync(tmp));
                }).catch(err => reject(err));
            });
        },
        toFile(path: string): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                convert(input, path, {
                    mode: mode,
                    zoomFactor: zoomFactor,
                    gpuAcceleration: gpuAcceleration
                }).then(() => {
                    resolve();
                }).catch(err => reject(err));
            });
        },
        gpuAcceleration(value: boolean): Anime4K {
            gpuAcceleration = value;
            return context;
        },
        cnnMode(value: Omit<CNNMode, "type">): Anime4K {
            mode = value as any;
            mode.type = "cnn";
            return context;
        },
        zoomFactor(value: number): Anime4K {
            zoomFactor = value;
            return context;
        }
    };

    return context;
}

export default anime4k;