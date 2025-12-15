import Joi from "joi";
import { ValidationError } from "./exceptions";

class UserModel {
    id?: number;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    isadmin: boolean;

    constructor(
        user: UserModel
    ) {
        this.id = user.id;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.email = user.email;
        this.password = user.password;
        this.isadmin = user.isadmin;
    }

    private static validationSchema = Joi.object({
        id: Joi.number().optional().positive(),
        firstname: Joi.string().required().min(3).max(20),
        lastname: Joi.string().required().min(3).max(20),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(4).max(20),
        isadmin: Joi.boolean().required()
    })

    validate() {
        const res = UserModel.validationSchema.validate(this);
        if (res.error)
            throw new ValidationError(res.error.details[0].message);
    }
}

export default UserModel