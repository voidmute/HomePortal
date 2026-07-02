import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";
import { resolveUserCloudPath, getUserRelativePath } from "@/lib/cloud-path";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { getClientIp } from "@/lib/ip";
import { apiErrorStatus, msg, toUserError } from "@/lib/messages";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const relativePath = request.nextUrl.searchParams.get("path") || "";
    const absolutePath = resolveUserCloudPath(session.name, relativePath);

    const entries = await fs.readdir(absolutePath, { withFileTypes: true });
    const items = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(absolutePath, entry.name);
        const stats = await fs.stat(entryPath);
        return {
          name: entry.name,
          type: entry.isDirectory() ? "directory" : "file",
          size: stats.size,
          modified: stats.mtime.toISOString(),
          path: getUserRelativePath(session.name, entryPath),
        };
      })
    );

    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name, "ru");
    });

    return NextResponse.json({ path: relativePath, items });
  } catch (err) {
    const message = toUserError(err);
    return NextResponse.json({ error: message }, { status: apiErrorStatus(message) });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession();
    const relativePath = request.nextUrl.searchParams.get("path");
    if (!relativePath) return NextResponse.json({ error: msg.pathRequired }, { status: 400 });

    const absolutePath = resolveUserCloudPath(session.name, relativePath);
    const stats = await fs.stat(absolutePath);

    if (stats.isDirectory()) {
      await fs.rm(absolutePath, { recursive: true });
    } else {
      await fs.unlink(absolutePath);
    }

    const ip = await getClientIp();
    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "FILE_DELETE",
      ipAddress: ip,
      metadata: { path: relativePath, wasDirectory: stats.isDirectory() },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = toUserError(err);
    return NextResponse.json({ error: message }, { status: apiErrorStatus(message) });
  }
}
