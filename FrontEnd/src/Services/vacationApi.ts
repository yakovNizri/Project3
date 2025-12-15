import axios from "axios";
import { apiUrl } from "./apiConfig";
import type { newVacation, resultPagination, updateVacation, vacationsSortBy } from "../Types/vacationType";

export async function getVacationsPaged(page: number, limit: number = 10, sortBy: vacationsSortBy): Promise<resultPagination> {
    const token = sessionStorage.getItem("token");
    const res = await axios.get(`${apiUrl}/vacations-paged?page=${page}&limit=${limit}&userVaca=${sortBy.userVaca}&upcomingVaca=${sortBy.upcomingVaca}&activeVaca=${sortBy.activeVaca}`, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    });

    return res.data;
}

export async function toggleFollow(userId: string, vacationId: string, isFollowing: boolean): Promise<string> {
    const token = sessionStorage.getItem("token");
    const res = await axios.post(`${apiUrl}/vacation/toggle-follow`, { userId, vacationId, isFollowing }, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    });

    return res.data;
}

export async function deleteVacation(vid: number): Promise<string> {
    const token = sessionStorage.getItem("token");
    const res = await axios.delete(`${apiUrl}/vacation/delete/${vid}`, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    });

    return res.data;
}

export async function createVacation({ destination, description, startdate, enddate, price, imagefilename }: newVacation): Promise<string> {
    const token = sessionStorage.getItem("token");
    const res = await axios.post(`${apiUrl}/vacation/new`, { destination, description, startdate, enddate, price, "image": imagefilename }, {
        headers: {
            "authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });

    return res.data;
}

export async function editVacation({ id, destination, description, startdate, enddate, price, imagefilename }: updateVacation): Promise<string> {
    const token = sessionStorage.getItem("token");
    const res = await axios.patch(`${apiUrl}/vacation/edit`, { id, destination, description, startdate, enddate, price, "image": imagefilename }, {
        headers: {
            "authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });

    return res.data;
} 