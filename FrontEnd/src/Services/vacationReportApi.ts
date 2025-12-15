import axios, { type AxiosResponse } from "axios";
import { apiUrl } from "./apiConfig";
import type { reportVacations } from "../Types/vacationType";

export async function reportFileCSVvacation(): Promise<AxiosResponse<Blob>> {
    const token = sessionStorage.getItem("token");
    const res = await axios.get(`${apiUrl}/report-FileCSV/vacation`, {
        responseType: "blob",
        headers: {
            "authorization": `Bearer ${token}`
        }
    });

    return res;
}

export async function reportVacation(): Promise<reportVacations[]> {
    const token = sessionStorage.getItem("token");
    const res = await axios.get(`${apiUrl}/report/vacation`, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    });

    return res.data;
}