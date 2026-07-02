import { NextResponse } from "next/server";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { getClientIp } from "@/lib/ip";
import { exec } from "child_process";
import { promisify } from "util";
import { apiErrorStatus, msg, toUserError } from "@/lib/messages";

const execAsync = promisify(exec);
const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

export async function POST() {
  try {
    const session = await requireAdmin();
    const ip = await getClientIp();

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "BACKUP_START",
      ipAddress: ip,
    });

    const results: { db?: string; cloud?: string; errors?: string[] } = {};

    try {
      const { stdout: dbOut } = await execAsync(`bash "${path.join(SCRIPTS_DIR, "backup-db.sh")}"`);
      results.db = dbOut.trim();
    } catch (err) {
      console.error("[backup] backup-db.sh failed:", err);
      results.errors = [...(results.errors || []), msg.backupFailed];
    }

    try {
      const { stdout: cloudOut } = await execAsync(`bash "${path.join(SCRIPTS_DIR, "backup-cloud.sh")}"`);
      results.cloud = cloudOut.trim();
    } catch (err) {
      console.error("[backup] backup-cloud.sh failed:", err);
      results.errors = [...(results.errors || []), msg.backupFailed];
    }

    const action = results.errors?.length ? "BACKUP_FAIL" : "BACKUP_SUCCESS";
    await db.insert(auditLogs).values({
      userId: session.userId,
      action,
      ipAddress: ip,
      metadata: results,
    });

    return NextResponse.json({ success: !results.errors?.length, results });
  } catch (err) {
    const message = toUserError(err);
    const status = apiErrorStatus(message) === 400 ? 500 : apiErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
