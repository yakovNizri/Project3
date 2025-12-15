import { NextFunction, Request, Response } from "express";
import { logIt } from "../utils/helpers/logHelpers";

export function logMiddleware(req: Request, res: Response, next: NextFunction) {
    const msg = `${new Date().toISOString()}: new ${req.method} call from ${req.ip} to: ${req.url}`;
    logIt(msg);

    next();
}