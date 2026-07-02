import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const isHttps = serverUrl.startsWith("https");

const config: CapacitorConfig = {
  appId: "com.homelab.portal",
  appName: "HomePortal",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: !isHttps,
    androidScheme: isHttps ? "https" : "http",
  },
};

export default config;
