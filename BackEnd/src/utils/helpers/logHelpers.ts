import { promises as fsp } from "fs";
import { appConfig } from "../config";
import path from "path";

export async function logIt(msg: string, isError = false): Promise<void> {
    const logDir = path.dirname(appConfig.accessLogFile);
    await fsp.mkdir(logDir, { recursive: true })

    if (!isError)
        await fsp.appendFile(appConfig.accessLogFile, `${msg}\n`);
    else
        await fsp.appendFile(appConfig.errorLogFile, `${msg}\n`);
}