import { appConfig } from "../utils/config";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: appConfig.DB_URL,
    ssl: { rejectUnauthorized: false }
})

export async function getDbClient(): Promise<any> {
    return pool.connect();
}

export async function runQuery(q: string, params: any[] = [], client: any = undefined): Promise<any> {
    const executor = client || pool;
    const res = await executor.query(q, params);
    return res.command === "SELECT" ? res.rows : { changes: res.rowCount, lastInsertRowid: res.rows?.[0]?.id };
}

runQuery("SELECT version();").then(res => console.log(res));