#!/usr/bin/env node
// Renders the README feature-grid icons to PNG (GitHub strips inline SVG data
// URIs, so we must ship real image files) and patches the feature table in
// README.md between the FEATURES markers. Re-run: `npm run assets:readme`.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const README = path.join(ROOT, "README.md");
const OUT_DIR = path.join(ROOT, ".github", "assets");
const RENDER = 176; // 2x of the 88px display size for crisp icons

const COLOR = {
  cream: "#F0E4D4",
  espresso: "#2A221C",
};

// Official Feather icon contents (24x24 viewBox, stroke-based). https://feathericons.com (MIT).
const FEATHER = {
  lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`,
  cloud: `<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>`,
  activity: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>`,
  archive: `<polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line>`,
  smartphone: `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>`,
  server: `<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line>`,
};

// Feather icon centered on a cream circle badge, 44px within the 96px badge.
function featherBadge(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <circle cx="48" cy="48" r="48" fill="${COLOR.cream}"/>
    <svg x="26" y="26" width="44" height="44" viewBox="0 0 24 24" fill="none"
      stroke="${COLOR.espresso}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      ${FEATHER[name]}
    </svg>
  </svg>`;
}

const ICONS = {
  auth: featherBadge("lock"),
  cloud: featherBadge("cloud"),
  monitoring: featherBadge("activity"),
  backup: featherBadge("archive"),
  mobile: featherBadge("smartphone"),
  selfhosted: featherBadge("server"),
};

const FEATURES = [
  {
    icon: "auth",
    title: "Без паролей",
    text: "TOTP-вход через QR, безопасные cookie-сессии на <code>iron-session</code>.",
  },
  {
    icon: "cloud",
    title: "Личное облако",
    text: "Файлы каждого пользователя изолированы, пути защищены от traversal/symlink escape.",
  },
  {
    icon: "monitoring",
    title: "Живой мониторинг",
    text: "SSE-метрики CPU/RAM/диска прямо из админ-панели.",
  },
  {
    icon: "backup",
    title: "Бэкапы и аудит",
    text: "Ручные и cron-бэкапы PostgreSQL/файлов, журнал действий админов.",
  },
  {
    icon: "mobile",
    title: "Мобильный опыт",
    text: "Capacitor APK для Android, installable PWA для iPhone/iPad.",
  },
  {
    icon: "selfhosted",
    title: "Self-hosted",
    text: "Docker Compose на VPS, публичный доступ через Cloudflare Zero Trust Tunnel.",
  },
];

async function renderIcons() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const [name, svg] of Object.entries(ICONS)) {
    const out = path.join(OUT_DIR, `feature-${name}.png`);
    await sharp(Buffer.from(svg), { density: 300 })
      .resize(RENDER, RENDER)
      .png()
      .toFile(out);
  }
}

function cell(feature) {
  return `    <td align="center" valign="top" width="33%">
      <br>
      <img src=".github/assets/feature-${feature.icon}.png" alt="" width="88" height="88" />
      <br><br>
      <strong>${feature.title}</strong>
      <br><br>
      <p align="center"><sub>${feature.text}</sub></p>
      <br>
    </td>`;
}

function buildHtml() {
  const top = FEATURES.slice(0, 3).map(cell).join("\n");
  const bottom = FEATURES.slice(3, 6).map(cell).join("\n");
  return `<table border="0" cellspacing="16" cellpadding="28" width="100%">
  <tr>
${top}
  </tr>
  <tr>
    <td colspan="3" height="12"></td>
  </tr>
  <tr>
${bottom}
  </tr>
</table>`;
}

async function main() {
  await renderIcons();
  const html = buildHtml();
  const readme = await fs.readFile(README, "utf8");
  const start = "<!-- FEATURES:START -->";
  const end = "<!-- FEATURES:END -->";
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`, "m");
  if (!pattern.test(readme)) {
    throw new Error(`README.md missing ${start} / ${end} markers`);
  }
  const next = readme.replace(pattern, `${start}\n${html}\n${end}`);
  await fs.writeFile(README, next, "utf8");
  console.log("README feature grid updated (PNG icons + native HTML).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
