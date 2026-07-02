import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import Redis from "ioredis";
import { db } from "@/db";

async function checkPostgres(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (err) {
    console.error("[health] postgres check failed:", err);
    return false;
  }
}

async function checkRedis(): Promise<"ok" | "error" | "skipped"> {
  const url = process.env.REDIS_URL;
  if (!url) return "skipped";

  let client: Redis | null = null;
  try {
    client = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false,
      lazyConnect: true,
    });
    // Without a listener, ioredis logs its own "Unhandled error event" to
    // the console on top of the catch below — we already log deliberately.
    client.on("error", () => {});
    await client.connect();
    await client.ping();
    return "ok";
  } catch (err) {
    console.error("[health] redis check failed:", err);
    return "error";
  } finally {
    if (client) {
      try {
        await client.quit();
      } catch {
        client.disconnect();
      }
    }
  }
}

export async function GET() {
  const postgresOk = await checkPostgres();
  const redis = await checkRedis();
  const ok = postgresOk;

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      postgres: postgresOk ? "ok" : "error",
      redis,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
