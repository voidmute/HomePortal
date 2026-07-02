import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { apiErrorStatus, toUserError } from "@/lib/messages";

const BACKUP_ROOT = process.env.BACKUP_ROOT || "/data/backups";

async function getLatestBackup(dir: string): Promise<{ filename: string; date: string; size: number } | null> {
  try {
    const fullDir = path.join(BACKUP_ROOT, dir);
    const files = await fs.readdir(fullDir);
    if (files.length === 0) return null;

    const withStats = await Promise.all(
      files.map(async (f) => {
        const stat = await fs.stat(path.join(fullDir, f));
        return { filename: f, date: stat.mtime.toISOString(), size: stat.size };
      })
    );

    withStats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return withStats[0];
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await requireAdmin();

    const [dbBackup, cloudBackup] = await Promise.all([
      getLatestBackup("db"),
      getLatestBackup("cloud"),
    ]);

    const schedule = process.env.BACKUP_CRON || "0 2 * * *";

    return NextResponse.json({
      schedule,
      database: {
        lastBackup: dbBackup,
        healthy: dbBackup !== null,
      },
      cloud: {
        lastBackup: cloudBackup,
        healthy: cloudBackup !== null,
      },
      overall: dbBackup || cloudBackup ? "healthy" : "idle",
    });
  } catch (err) {
    const message = toUserError(err);
    // No user input on this route — non-auth failures are server/infra issues, not 400s.
    const status = apiErrorStatus(message) === 400 ? 500 : apiErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
