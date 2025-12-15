import { StatusCode } from "./statusCode";

export abstract class AppException {
    public readonly status: StatusCode;
    public readonly message: string;

    constructor(status: StatusCode, message: string){
        this.status = status;
        this.message = message;
    }
}

export class ValidationError extends AppException {
    constructor(message: string){
        super(StatusCode.BadRequest, message);
    }
}

export class ConflictError extends AppException {
    constructor(message: string){
        super(StatusCode.Conflict, message);
    }
}

export class UnknownError extends AppException {
    constructor(optionalMsg?: string){
        const msg = optionalMsg ? optionalMsg : "internal server error!"
        super(StatusCode.ServerError, msg);
    }
}

export class UnauthorizedError extends AppException {
    constructor(message?: string){
        super(StatusCode.Unauthorized, message ? message : "unauthorized");
    }
}

export class NotFoundError extends AppException {
    constructor(message: string){
        super(StatusCode.NotFound, message);
    }
}