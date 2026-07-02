import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";
import { resolveUserCloudPath, sanitizeUploadFilename } from "@/lib/cloud-path";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { getClientIp } from "@/lib/ip";
import { apiErrorStatus, internalError, msg, toUserError } from "@/lib/messages";

const DEFAULT_MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

function getMaxUploadBytes(): number {
  const raw = process.env.MAX_UPLOAD_BYTES;
  if (!raw) return DEFAULT_MAX_UPLOAD_BYTES;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_UPLOAD_BYTES;
  }
  return parsed;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const targetPath = (formData.get("path") as string) || "";

    if (!file) return NextResponse.json({ error: msg.noFileProvided }, { status: 400 });

    const maxBytes = getMaxUploadBytes();
    if (file.size > maxBytes) {
      return NextResponse.json({ error: msg.fileTooLarge }, { status: apiErrorStatus(msg.fileTooLarge) });
    }

    const dirPath = resolveUserCloudPath(session.name, targetPath);
    await fs.mkdir(dirPath, { recursive: true });

    const safeName = sanitizeUploadFilename(file.name);
    const filePath = path.resolve(dirPath, safeName);
    if (!filePath.startsWith(dirPath + path.sep) && filePath !== dirPath) {
      throw new Error(internalError.pathTraversal);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      await fs.writeFile(filePath, buffer, { flag: "wx" });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "EEXIST") {
        return NextResponse.json({ error: msg.fileExists }, { status: apiErrorStatus(msg.fileExists) });
      }
      throw err;
    }

    const ip = await getClientIp();
    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "FILE_UPLOAD",
      ipAddress: ip,
      metadata: { filename: safeName, size: file.size, path: targetPath },
    });

    return NextResponse.json({ success: true, filename: safeName });
  } catch (err) {
    const message = toUserError(err);
    return NextResponse.json({ error: message }, { status: apiErrorStatus(message) });
  }
}
