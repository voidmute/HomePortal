import { authenticator } from "otplib";
import QRCode from "qrcode";

authenticator.options = {
  window: 1,
};

const APP_NAME = "Панель Homelab";

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function verifyToken(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export async function generateQRDataURL(name: string, secret: string): Promise<string> {
  const issuer = process.env.APP_URL || "Homelab";
  const otpauth = authenticator.keyuri(name, issuer, secret);
  return QRCode.toDataURL(otpauth, {
    width: 256,
    margin: 2,
    color: { dark: "#1A1410", light: "#FDFBF7" },
  });
}

export { authenticator };
