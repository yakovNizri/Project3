import express from "express";
import { authRouter } from "./controllers/userController";
import { logMiddleware } from "./middlewares/logMiddleware";
import { errorHandler } from "./middlewares/errorHandler";
import { vacationRouter } from "./controllers/vacationController";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import { appConfig } from "./utils/config";
import fileUpload from "express-fileupload";
import { vacationReportRouter } from "./controllers/vacationReportController";

const server = express();

server.use(cors({
    origin: [
        "http://localhost:5173",
        "http://54.93.104.129"
    ]
}))

// D.O.S (rate limit) - per IP
server.use(expressRateLimit({
    windowMs: 1000 * 60 * 1,  // 1 minute
    max: 120 // max 120 calls
}))

server.use(express.json());

server.use(fileUpload());

server.use(logMiddleware);

server.use(authRouter);
server.use(vacationRouter);
server.use(vacationReportRouter);

server.use(errorHandler);

server.listen(appConfig.port, () => console.log(`Express server started.\nhttp://localhost:${appConfig.port}`));