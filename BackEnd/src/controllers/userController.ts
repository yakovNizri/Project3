import { NextFunction, Request, Response, Router } from "express";
import { StatusCode } from "../models/statusCode";
import UserModel from "../models/UserModel";
import { createUser, login } from "../services/userServices";
import { ConflictError, ValidationError } from "../models/exceptions";
import { verifyToken } from "../utils/helpers/authHelpers";

export const authRouter = Router();

authRouter.post("/user/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body) {
            const um = new UserModel(req.body);
            const token = await createUser(um);
            res.status(StatusCode.Created).json(token);
        } else {
            throw new ValidationError("Request body is empty!");
        }
    } catch (error: any) {
        if (error?.message?.includes('unique constraint "user_email_key"')) {
            throw new ConflictError("Email already in use");
        } else if (error instanceof ValidationError) {
            throw new ValidationError(error.message);
        } else {
            next(error.message);
        }
    }
})

authRouter.post("/user/login", async (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        const token = await login(req.body.email, req.body.password);
        res.status(StatusCode.Ok).json(token);
    } else {
        throw new ValidationError("Request body is empty!");
    }
})

authRouter.post("/user/verifyToken", async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['authorization']) {
        const token = req.headers['authorization']?.split(' ')[1];
        const result = await verifyToken(token);
        res.status(StatusCode.Ok).json(result);
    } else {
        throw new ValidationError("Request header 'authorization' is empty!");
    }
})