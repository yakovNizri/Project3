import { NextFunction, Request, Response, Router } from "express";
import { verifyTokenAdminMW } from "../middlewares/verifyTokenAdminMW";
import { getReportVacation } from "../services/vacationReportService";
import { StatusCode } from "../models/statusCode";
import { reportVacations } from "../types/types";
import { Parser } from "json2csv";

export const vacationReportRouter = Router();

vacationReportRouter.get("/report/vacation", verifyTokenAdminMW, async (req: Request, res: Response, next: NextFunction) => {
    const reportVaca = await getReportVacation();
    res.status(StatusCode.Ok).json(reportVaca);
})

vacationReportRouter.get("/report-FileCSV/vacation", verifyTokenAdminMW, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reportVaca = await getReportVacation() as reportVacations[];

        const parser = new Parser();
        const csv = parser.parse(reportVaca);

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=vacation-report.csv");

        res.status(StatusCode.Ok).send(csv);
    } catch (error) {
        res.status(StatusCode.ServerError).send("Faild to generate CSV");
    }
})
