import Joi from "joi";
import { runQuery } from "../dal/dal";
import { UnauthorizedError, ValidationError } from "../models/exceptions";
import UserModel from "../models/UserModel";
import { createToken } from "../utils/helpers/authHelpers";
import bcrypt from "bcrypt";
import { appConfig } from "../utils/config";

export async function createUser(user: UserModel): Promise<string> {
    user.validate();

    const passwordHash = await bcrypt.hash(user.password + appConfig.hashPepper, 12);

    const q = 'INSERT INTO "user" (firstName, lastName, email, passwordHash, isAdmin) VALUES ($1, $2, $3, $4, $5) RETURNING *;'

    const returnChanges = await runQuery(q, [user.firstname, user.lastname, user.email, String(passwordHash), user.isadmin]);

    const id = returnChanges.lastInsertRowid;
    
    const um = new UserModel({...user, id} as UserModel);
    const token = await createToken(um);

    return token;
}

export async function login(email: string, password: string): Promise<string> {
    const validationLogin = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(4).max(20)
    })
    const resValidation = validationLogin.validate({ email, password });
    if (resValidation.error)
        throw new ValidationError(resValidation.error.details[0].message);

    const q = 'SELECT * FROM "user" WHERE email=$1;'
    const res = await runQuery(q, [email]);

    if (res.length !== 1)
        throw new UnauthorizedError();

    const user = res[0];
    const pepper = appConfig.hashPepper;

    const match = await bcrypt.compare(password + pepper, user.passwordhash);

    if (!match) {
        throw new UnauthorizedError();
    }

    const um = new UserModel(res[0]);
    const token = await createToken(um);

    return token;
}

