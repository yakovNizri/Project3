import UserModel from "../../models/UserModel";
import jwt from "jsonwebtoken";
import { appConfig } from "../config";
import { UnauthorizedError } from "../../models/exceptions";
import { runQuery } from "../../dal/dal";

export async function createToken(user: UserModel): Promise<string> {
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    const container = { userWithoutPassword };

    const token = jwt.sign(container, appConfig.tokenSecretKey, { expiresIn: '9h' });

    return token;
}

export async function verifyToken(token: string, adminRequired: boolean = false): Promise<UserModel> {
    try {
        const res = jwt.verify(token, appConfig.tokenSecretKey) as { userWithoutPassword: UserModel };

        const q = 'SELECT id, firstName, lastName, email, isAdmin FROM "user" WHERE email=$1';
        const resQ = await runQuery(q, [res.userWithoutPassword.email]);
        if (resQ.length === 0) {
            throw "Error - user not found";
        } else if (adminRequired && !res.userWithoutPassword.isadmin)
            throw "Error - Is not Admin";

        return resQ[0];
    } catch (error) {
        throw new UnauthorizedError();
    }
}