import { SessionOptions } from "iron-session";

export interface SessionData {
  userId: string;
  name: string;
  role: "ADMIN" | "USER";
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  userId: "",
  name: "",
  role: "USER",
  isLoggedIn: false,
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error(
    "SESSION_SECRET is not set. Generate one (e.g. `openssl rand -base64 32`) and set it in .env — refusing to start with an insecure default."
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "homelab_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
