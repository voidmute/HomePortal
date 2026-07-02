"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getClientIp } from "@/lib/ip";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateSecret, verifyToken, generateQRDataURL } from "@/lib/totp";
import { msg } from "@/lib/messages";

export type AuthResult =
  | { success: true; requiresTotp: boolean; isFirstSetup: boolean; qrCode?: string }
  | { success: false; error: string };

export async function verifyName(name: string): Promise<AuthResult> {
  try {
    const ip = await getClientIp();
    const { allowed } = await checkRateLimit(`auth:name:${ip}`);
    if (!allowed) return { success: false, error: msg.tooManyAttempts };

    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return { success: false, error: msg.nameRequired };

    const [user] = await db.select().from(users).where(eq(users.name, trimmed)).limit(1);
    if (!user) return { success: false, error: msg.accessDenied };

    if (!user.isTotpSetup) {
      const secret = generateSecret();
      await db.update(users).set({ totpSecret: secret }).where(eq(users.id, user.id));
      const qrCode = await generateQRDataURL(user.name, secret);
      return { success: true, requiresTotp: true, isFirstSetup: true, qrCode };
    }

    return { success: true, requiresTotp: true, isFirstSetup: false };
  } catch (err) {
    console.error("[auth] verifyName failed:", err);
    return { success: false, error: msg.serviceUnavailable };
  }
}

export async function verifyTotp(name: string, code: string): Promise<AuthResult> {
  try {
    const ip = await getClientIp();
    const { allowed } = await checkRateLimit(`auth:totp:${ip}`);
    if (!allowed) return { success: false, error: msg.tooManyAttempts };

    const trimmed = name.trim().toLowerCase();
    const [user] = await db.select().from(users).where(eq(users.name, trimmed)).limit(1);
    if (!user || !user.totpSecret) return { success: false, error: msg.accessDenied };

    if (!verifyToken(user.totpSecret, code)) {
      return { success: false, error: msg.invalidTotp };
    }

    if (!user.isTotpSetup) {
      await db.update(users).set({ isTotpSetup: true }).where(eq(users.id, user.id));
    }

    const session = await getSession();
    session.userId = user.id;
    session.name = user.name;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();

    await db.insert(auditLogs).values({
      userId: user.id,
      action: "LOGIN",
      ipAddress: ip,
      metadata: { firstSetup: !user.isTotpSetup },
    });

    return { success: true, requiresTotp: false, isFirstSetup: false };
  } catch (err) {
    console.error("[auth] verifyTotp failed:", err);
    return { success: false, error: msg.serviceUnavailable };
  }
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
