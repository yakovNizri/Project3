import Joi from "joi";
import { ValidationError } from "./exceptions";

class VacationModel {
    id?: number;
    destination: string;
    description: string;
    startdate: Date;
    enddate: Date;
    price: number;
    imagefilename: string;

    constructor(
        vacation: VacationModel
    ) {
        this.id = vacation.id;
        this.destination = vacation.destination;
        this.description = vacation.description;
        this.startdate = vacation.startdate;
        this.enddate = vacation.enddate;
        this.price = vacation.price;
        this.imagefilename = vacation.imagefilename;
    }

    private static validationSchema = Joi.object({
        id: Joi.number().optional().positive(),
        destination: Joi.string().required().min(3).max(15),
        description: Joi.string().required().min(3).max(255),
        startdate: Joi.date().required(),
        enddate: Joi.date().required(),
        price: Joi.number().required().positive().max(10000),
        imagefilename: Joi.string().required()
    }).custom((value, helpers) => {
        if (value.enddate < value.startdate) {
            return helpers.error('date.range.invalid');
        }
        return value;
    }).messages({
        'date.range.invalid': '"endDate" must be greater than "startDate"'
    });

    validate() {
        const res = VacationModel.validationSchema.validate(this);
        if (res.error)
            throw new ValidationError(res.error.details[0].message);
    }

    private static partialSchema = VacationModel.validationSchema
        .fork(
            ['imagefilename'],
            field => field.optional()
        ).fork(['id'], field => field.required()) as Joi.ObjectSchema<Partial<VacationModel>>;

    validatePartial() {
        const res = VacationModel.partialSchema.validate(this, { presence: 'optional' });
        if (res.error) throw new ValidationError(res.error.details[0].message);
    }
}

export default VacationModel