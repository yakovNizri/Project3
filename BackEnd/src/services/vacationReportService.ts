import { runQuery } from "../dal/dal";
import { reportVacations } from "../types/types";

export async function getReportVacation(): Promise<reportVacations[]> {
    const q = `SELECT v.destination, COUNT(f.userId) AS followers
                FROM vacation v INNER JOIN follower f 
                ON v.id = f.vacationId
                GROUP BY v.id, v.destination`;

    const res = await runQuery(q) as reportVacations[];

    return res;
}