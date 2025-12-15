import { NextFunction, Request, Response, Router } from "express";
import VacationModel from "../models/VacationModel";
import { createVacation, deleteVacation, editVacation, getVacationsPaged, toggleFollow } from "../services/vacationService";
import { StatusCode } from "../models/statusCode";
import { ValidationError } from "../models/exceptions";
import { verifyTokenAdminMW } from "../middlewares/verifyTokenAdminMW";
import fileUpload from "express-fileupload";
import { verifyTokenMW } from "../middlewares/verifyTokenMW";
import { vacationsSortBy } from "../types/types";

export const vacationRouter = Router();

vacationRouter.get("/vacations-paged", verifyTokenMW, async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const userVaca = req.query.userVaca === "true";
    const upcomingVaca = req.query.upcomingVaca === "true";
    const activeVaca = req.query.activeVaca === "true";
    const sortBy: vacationsSortBy = { userVaca: userVaca, upcomingVaca: upcomingVaca, activeVaca: activeVaca };

    const vacations = await getVacationsPaged(page || 1, limit || 10, res.locals.user, sortBy);
    res.status(200).json(vacations);
})

vacationRouter.post("/vacation/toggle-follow", verifyTokenMW, async (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        const tf = await toggleFollow(req.body.userId, req.body.vacationId, req.body.isFollowing);
        res.status(StatusCode.Ok).json(tf);
    } else {
        throw new ValidationError("Request body is empty!");
    }
});

vacationRouter.post("/vacation/new", verifyTokenAdminMW, async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: fileUpload.UploadedFile };
    const image = files?.["image"];

    if (!image)
        throw new ValidationError('"image" is required');

    if (req.body) {
        const vm = new VacationModel(req.body);
        const vacationId = await createVacation(vm, image);
        res.status(StatusCode.Created).send(vacationId);
    } else {
        throw new ValidationError("Request body is empty!");
    }
});

vacationRouter.delete("/vacation/delete/:id", verifyTokenAdminMW, async (req: Request, res: Response, next: NextFunction) => {
    const vid = Number(req.params.id);
    
    if (isNaN(vid)) {
        res.status(StatusCode.BadRequest).send('"id" must be a number');
    }
    if (vid <= 0) {
        res.status(StatusCode.BadRequest).send('"id" must be a positive number');
    }

    const msgDeleteImg = await deleteVacation(vid);
    res.status(StatusCode.Ok).send(`The vacation has been deleted. ${msgDeleteImg}`);
});

vacationRouter.patch("/vacation/edit", verifyTokenAdminMW, async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: fileUpload.UploadedFile };
    const image = files?.["image"];

    if (req.body) {
        const vm = new VacationModel(req.body);
        const msgDeleteImg = await editVacation(vm, image || undefined);
        res.status(StatusCode.Created).send(`The vacation has been updated. ${msgDeleteImg}`);
    } else {
        throw new ValidationError("Request body is empty!");
    }
});