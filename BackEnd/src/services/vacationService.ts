import path from "path";
import fs from "fs/promises";
import { unlink } from "fs/promises";
import { appConfig } from "../utils/config";
import { v4 as uuid } from "uuid";
import { runQuery } from "../dal/dal";
import { UploadedFile } from "express-fileupload";
import VacationModel from "../models/VacationModel";
import { NotFoundError, ValidationError } from "../models/exceptions";
import { deleteFromS3, uploadToS3Readable } from "../utils/helpers/s3Helpers";
import { Readable } from "stream";
import Joi from "joi";
import { followersPerVacation, resultPagination, vacationsSortBy } from "../types/types";

export async function getVacationsPaged(page: number = 1, limit: number = 10, user: any, sortBy: vacationsSortBy): Promise<resultPagination> {
    const isFilterd = Object.values(sortBy).some((v: boolean) => v === true);

    const q2 = 'SELECT id FROM "user" WHERE email=$1;';
    const res2 = await runQuery(q2, [user.email]) as [{ id: string }];

    let res1 = [];

    let res3 = [];

    let runQueryCount = '';

    if (isFilterd) {
        if (sortBy.userVaca === true) {
            const q1 = "SELECT * FROM follower f INNER JOIN vacation v ON f.vacationId = v.id WHERE f.userId = $1 ORDER BY startDate, v.id ASC LIMIT($2) OFFSET($3);"
            res1 = await runQuery(q1, [res2[0].id, limit, (page - 1) * limit]) as VacationModel[];

            const q3 = `SELECT v.id, COUNT(f.userId) AS followersCount, true AS isUserFollowing
                            FROM vacation v LEFT JOIN follower f 
                            ON v.id = f.vacationId 
                            LEFT JOIN follower uf 
                            ON v.id = uf.vacationId AND uf.userId = $1 
                            WHERE uf.userId = $1
                            GROUP BY v.id
                            ORDER BY v.startDate, v.id ASC
                            LIMIT $2 OFFSET $3;`;
            res3 = await runQuery(q3, [res2[0].id, limit, (page - 1) * limit]) as followersPerVacation[];

            runQueryCount = `SELECT COUNT(*)
                                 FROM (
                                    SELECT v.id
                                    FROM vacation v LEFT JOIN follower f 
                                    ON v.id = f.vacationId 
                                    LEFT JOIN follower uf 
                                    ON v.id = uf.vacationId AND uf.userId = $1 
                                    WHERE uf.userId = $1
                                    GROUP BY v.id
                                ) AS sub`;

        } else if (sortBy.upcomingVaca === true) {
            const q1 = "SELECT * FROM vacation WHERE startDate > NOW() ORDER BY startDate, id ASC LIMIT($1) OFFSET($2);"
            res1 = await runQuery(q1, [limit, (page - 1) * limit]) as VacationModel[];

            const q3 = `SELECT v.id, COUNT(f.vacationId) AS followerscount, BOOL_OR(uf.userId IS NOT NULL) AS isUserFollowing 
                        FROM vacation v LEFT JOIN follower f 
                        ON v.id = f.vacationId 
                        LEFT JOIN follower uf 
                        ON v.id = uf.vacationId AND uf.userId = $1 
                        WHERE startDate > NOW()
                        GROUP BY v.id
                        ORDER BY v.startDate, v.id ASC
                        LIMIT($2) OFFSET($3);`;
            res3 = await runQuery(q3, [res2[0].id, limit, (page - 1) * limit]) as followersPerVacation[];

            runQueryCount = `SELECT COUNT(*) 
                                FROM (
                                    SELECT v.id
                                    FROM vacation v LEFT JOIN follower f 
                                    ON v.id = f.vacationId 
                                    LEFT JOIN follower uf 
                                    ON v.id = uf.vacationId AND uf.userId = $1 
                                    WHERE startDate > NOW()
                                    GROUP BY v.id
                                ) AS sub;`;

        } else if (sortBy.activeVaca === true) {
            const q1 = "SELECT * FROM vacation WHERE startDate <= NOW() AND endDate >= NOW() ORDER BY startDate, id ASC LIMIT($1) OFFSET($2);"
            res1 = await runQuery(q1, [limit, (page - 1) * limit]) as VacationModel[];

            const q3 = `SELECT v.id, COUNT(f.vacationId) AS followerscount, BOOL_OR(uf.userId IS NOT NULL) AS isUserFollowing 
                        FROM vacation v LEFT JOIN follower f 
                        ON v.id = f.vacationId 
                        LEFT JOIN follower uf 
                        ON v.id = uf.vacationId AND uf.userId = $1 
                        WHERE v.startDate <= NOW() AND v.endDate >= NOW()
                        GROUP BY v.id
                        ORDER BY v.startDate, v.id ASC
                        LIMIT($2) OFFSET($3);`;
            res3 = await runQuery(q3, [res2[0].id, limit, (page - 1) * limit]) as followersPerVacation[];

            runQueryCount = `SELECT COUNT(*)
                        FROM (
                            SELECT v.id
                            FROM vacation v LEFT JOIN follower f 
                            ON v.id = f.vacationId 
                            LEFT JOIN follower uf 
                            ON v.id = uf.vacationId AND uf.userId = $1 
                            WHERE v.startDate <= NOW() AND v.endDate >= NOW()
                            GROUP BY v.id
                        ) AS sub;`;
        }
    } else {
        const q1 = "SELECT * FROM vacation ORDER BY startDate, id ASC LIMIT($1) OFFSET($2);";
        res1 = await runQuery(q1, [limit, (page - 1) * limit]) as VacationModel[];

        const q3 = `SELECT v.id, COUNT(f.vacationId) AS followerscount, BOOL_OR(uf.userId IS NOT NULL) AS isUserFollowing 
                        FROM vacation v LEFT JOIN follower f 
                        ON v.id = f.vacationId 
                        LEFT JOIN follower uf 
                        ON v.id = uf.vacationId AND uf.userId = $1 
                        GROUP BY v.id
                        ORDER BY v.startDate, v.id ASC
                        LIMIT($2) OFFSET($3);`;
        res3 = await runQuery(q3, [res2[0].id, limit, (page - 1) * limit]) as followersPerVacation[];

        runQueryCount = `SELECT COUNT(*)
                            FROM (
                                SELECT v.id
                                FROM vacation v
                                LEFT JOIN follower f ON v.id = f.vacationId
                                LEFT JOIN follower uf ON v.id = uf.vacationId AND uf.userId = $1
                                GROUP BY v.id
                            ) AS sub;`
    }

    const vacations: VacationModel[] = [];

    res1.forEach(row => {
        vacations.push({
            id: row.id,
            destination: row.destination,
            description: row.description,
            startdate: row.startdate,
            enddate: row.enddate,
            price: row.price,
            imagefilename: appConfig.s3_config.objectPrefix + "/" + row.imagefilename
        } as VacationModel);
    });

    const countResult = await runQuery(runQueryCount, [res2[0].id]) as [{ count: number }];
    const totalRow = Number(countResult[0].count);

    const pagedRes: resultPagination = {
        total: totalRow,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalRow / limit),
        followers: res3 as followersPerVacation[],
        vacations: vacations as VacationModel[]
    }

    return pagedRes;
}

export async function toggleFollow(userId: string, vacationId: string, isFollowing: boolean): Promise<string> {
    let msg = '';
    const validationToggleFollow = Joi.object({
        userId: Joi.string().required(),
        vacationId: Joi.string().required(),
        isFollowing: Joi.boolean().required()
    })
    const resValidation = validationToggleFollow.validate({ userId, vacationId, isFollowing });
    if (resValidation.error)
        throw new ValidationError(resValidation.error.details[0].message);

    if (isFollowing) {
        try {
            const q1 = 'INSERT INTO follower(userId, vacationId) VALUES($1, $2)'
            await runQuery(q1, [userId, vacationId]);
        } catch (error: any) {
            if (error?.message?.includes('foreign key constraint "fk_follower_vacation"'))
                throw new NotFoundError("'vacationId' is not found");
            else if (error?.message?.includes('foreign key constraint "fk_follower_user"'))
                throw new NotFoundError("'userId' is not found");
        }
        msg = "You are now following the vacation";
    } else {
        const q2 = 'DELETE FROM follower WHERE userId = $1 AND vacationId = $2'
        await runQuery(q2, [userId, vacationId]);

        msg = "You have stopped following the vacation";
    }

    return msg;
}

export async function createVacation(vacation: VacationModel, image: UploadedFile): Promise<number> {
    const uuidString = uuid();
    const lastDot = image.name.lastIndexOf(".");
    const imageFileName = uuidString + image.name.substring(lastDot);
    // const fullPath = path.join(appConfig.vacationImagesPrefix, imageFileName);

    vacation.imagefilename = imageFileName;
    vacation.validate();
    if (new Date(vacation.startdate) < new Date()) {
        throw new ValidationError('"startDate" must be greater than or equal to "now"');
    }

    // await fs.mkdir(appConfig.vacationImagesPrefix, { recursive: true });
    // await image.mv(fullPath);

    const fileStream = Readable.from(image.data);
    await uploadToS3Readable(fileStream, imageFileName);

    const q = 'INSERT INTO vacation(destination, description, startDate, endDate, price, imageFileName) VALUES($1, $2, $3, $4, $5, $6) RETURNING id;'

    const vacationQ = await runQuery(q, [vacation.destination, vacation.description, vacation.startdate, vacation.enddate, vacation.price, vacation.imagefilename]);

    return vacationQ.lastInsertRowid;
}

export async function deleteVacation(vacationId: number): Promise<string> {
    const q1 = "SELECT imagefilename FROM vacation WHERE ID = $1"
    // let fullPath = '';
    let msgDeleteImg = '';

    const imageName = await runQuery(q1, [vacationId]);
    if (imageName.length !== 1) {
        throw new NotFoundError("'vacationId' is not found");
    }

    try {
        // fullPath = path.join(appConfig.vacationImagesPrefix, imageName[0].imagefilename);
        // await unlink(fullPath);
        await deleteFromS3(imageName[0].imagefilename);
    } catch (error: any) {
        msgDeleteImg = "'imageFile' not found to deleted";
    }

    const q2 = "DELETE FROM vacation WHERE ID = $1";
    await runQuery(q2, [vacationId]);
    return msgDeleteImg;
}

export async function editVacation(vacation: Partial<VacationModel>, image: UploadedFile = undefined): Promise<string> {
    // let fullPath = '';
    let msgDeleteImg = '';
    vacation.validatePartial();

    const checkVacation = "SELECT id FROM vacation WHERE id = $1"
    const resCheckV = await runQuery(checkVacation, [vacation.id]);
    if (resCheckV.length !== 1) {
        throw new NotFoundError("'id' is not found");
    }

    if (image) {
        const q = 'SELECT imageFileName FROM vacation WHERE id=$1';
        const nameImgOld = await runQuery(q, [vacation.id]);

        const uuidString = uuid();
        const lastDot = image.name.lastIndexOf(".");
        const fileName = uuidString + image.name.substring(lastDot);
        vacation.imagefilename = fileName;

        vacation.validatePartial();

        try {
            // fullPath = path.join(appConfig.vacationImagesPrefix, fileName);
            // const fullPathDelete = path.join(appConfig.vacationImagesPrefix, nameImgOld[0].imagefilename);
            // await unlink(fullPathDelete);
            await deleteFromS3(nameImgOld[0].imagefilename);
        } catch (error: any) {
            msgDeleteImg = "'imageFile' not found to deleted";
        }

        // await fs.mkdir(appConfig.vacationImagesPrefix, { recursive: true });
        // await image.mv(fullPath);

        const fileStream = Readable.from(image.data);
        await uploadToS3Readable(fileStream, fileName);
    }

    const fields = [
        `id = $1`,
        `destination = $2`,
        `description = $3`,
        `startdate = $4`,
        `enddate = $5`,
        `price = $6`
    ];

    const values = [
        vacation.id,
        vacation.destination,
        vacation.description,
        vacation.startdate,
        vacation.enddate,
        vacation.price
    ];

    if (vacation.imagefilename !== undefined) {
        fields.push(`imagefilename = $${values.length + 1}`);
        values.push(vacation.imagefilename);
    }

    const q = `
        UPDATE vacation
        SET ${fields.join(', ')}
        WHERE id = $1
    `;

    await runQuery(q, values);

    return msgDeleteImg;
}