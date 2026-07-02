import { NextResponse } from "next/server";
import { desc, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { msg } from "@/lib/messages";

export async function GET() {
  try {
    await requireAdmin();

    const logs = await db
      .select()
      .from(auditLogs)
      .where(inArray(auditLogs.action, ["BACKUP_START", "BACKUP_SUCCESS", "BACKUP_FAIL"]))
      .orderBy(desc(auditLogs.timestamp))
      .limit(50);

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: msg.unauthorized }, { status: 401 });
  }
}
