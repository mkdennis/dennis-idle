import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

declare global {
  var __lifeosSql: ReturnType<typeof postgres> | undefined;
}

// Reuse the connection across hot reloads in dev; Fluid Compute reuses the module in prod.
const sql = globalThis.__lifeosSql ?? postgres(url, { max: 5, prepare: false });
if (process.env.NODE_ENV !== "production") globalThis.__lifeosSql = sql;

export const db = drizzle(sql, { schema });
export type Db = typeof db;
export { schema };
