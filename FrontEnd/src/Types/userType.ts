export type Register = {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    isadmin: boolean;
}

export type User = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    isadmin: boolean;
}

export type Login = {
    email: string;
    password: string;
}