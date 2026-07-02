import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireSession } from "@/lib/auth";
import { resolveUserCloudPath } from "@/lib/cloud-path";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { getClientIp } from "@/lib/ip";
import { apiErrorStatus, msg, toUserError } from "@/lib/messages";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const relativePath = request.nextUrl.searchParams.get("path");
    if (!relativePath) return NextResponse.json({ error: msg.pathRequired }, { status: 400 });

    const absolutePath = resolveUserCloudPath(session.name, relativePath);
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: msg.fileNotFound }, { status: 404 });
    }

    const stats = fs.statSync(absolutePath);
    if (stats.isDirectory()) {
      return NextResponse.json({ error: msg.cannotDownloadDir }, { status: 400 });
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const filename = path.basename(absolutePath);

    const ip = await getClientIp();
    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "FILE_DOWNLOAD",
      ipAddress: ip,
      metadata: { path: relativePath, size: stats.size },
    });

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": stats.size.toString(),
      },
    });
  } catch (err) {
    const message = toUserError(err);
    return NextResponse.json({ error: message }, { status: apiErrorStatus(message) });
  }
}
