import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions, defaultSession } from "./session";
import { msg } from "./messages";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error(msg.unauthorized);
  }
  return session;
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    throw new Error(msg.forbidden);
  }
  return session;
}

export { defaultSession };
