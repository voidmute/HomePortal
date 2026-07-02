import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const cfIp = headersList.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp;

  return "127.0.0.1";
}
