import path from "path";
import dotenv from "dotenv";

dotenv.config();

class BaseConfig {
    readonly accessLogFile = __dirname + "\\..\\..\\logs\\accessLog.log";
    readonly errorLogFile = path.resolve(__dirname, "..", "..", "logs", "errorLog.log");
    readonly vacationImagesPrefix = path.resolve(__dirname, "..", "..", "assets", "images");
    readonly tokenSecretKey = process.env.TOKEN_SECRET_KEY;
    readonly hashPepper = process.env.HASH_PEPPER;

    readonly s3_config = {
        key: process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        region: "eu-central-1",
        bucket_name: "myfirstbucketfs4",
        imagesVacationFolder: "imagesVacation",
        objectPrefix:'https://myfirstbucketfs4.s3.eu-central-1.amazonaws.com/imagesVacation'
    }

    readonly DB_URL = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

class DevConfig extends BaseConfig {
    readonly port = 3030;
}

class ProdConfig extends BaseConfig {
    readonly port = 3033;
}

export const appConfig = Number(global.process.env.IS_PROD) === 1 ? new ProdConfig() : new DevConfig();
