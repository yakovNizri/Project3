import axios from "axios";
import type { Login, Register, User } from "../Types/userType";
import { apiUrl } from "./apiConfig";

export async function register({ firstname, lastname, email, password, isadmin = false }: Register): Promise<string> {
    const res = await axios.post(`${apiUrl}/user/register`, { firstname, lastname, email, password, isadmin });

    return res.data;
}

export async function login({ email, password }: Login): Promise<string> {
    const res = await axios.post(`${apiUrl}/user/login`, { email, password });

    return res.data;
}

export async function tokenValid(token: string): Promise<User> {
    const res = await axios.post(`${apiUrl}/user/verifyToken`, {}, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    })

    return res.data;
}