import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";
import { resolveUserCloudPath } from "@/lib/cloud-path";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { getClientIp } from "@/lib/ip";
import { apiErrorStatus, msg, toUserError } from "@/lib/messages";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const targetPath = (formData.get("path") as string) || "";

    if (!file) return NextResponse.json({ error: msg.noFileProvided }, { status: 400 });

    const dirPath = resolveUserCloudPath(session.name, targetPath);
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const ip = await getClientIp();
    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "FILE_UPLOAD",
      ipAddress: ip,
      metadata: { filename: file.name, size: file.size, path: targetPath },
    });

    return NextResponse.json({ success: true, filename: file.name });
  } catch (err) {
    const message = toUserError(err);
    return NextResponse.json({ error: message }, { status: apiErrorStatus(message) });
  }
}
