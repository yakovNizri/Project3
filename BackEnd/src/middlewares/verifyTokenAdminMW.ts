import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/helpers/authHelpers";
import { ValidationError } from "../models/exceptions";

export async function verifyTokenAdminMW(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) throw new ValidationError("No token provided");

    const user = await verifyToken(token, true);
    res.locals.user = user;
    next();
}