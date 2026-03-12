import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getRequiredEnv(name: "TURSO_DATABASE_URL") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }

  return value;
}

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const client = createClient({
    url: getRequiredEnv("TURSO_DATABASE_URL"),
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
