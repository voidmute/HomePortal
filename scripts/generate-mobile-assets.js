#!/usr/bin/env node
// Generates every icon/splash asset the mobile shell and PWA need from one
// vector "portal arch" mark, defined once below and rasterized with sharp.
// Re-run after changing colors/geometry: `node scripts/generate-mobile-assets.js`
// (or `npm run assets:generate`). Requires `sharp` (devDependency).
const path = require("node:path");
const fs = require("node:fs/promises");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");

const COLOR = {
  amber: "#D4A96A",
  amberDark: "#B8894F",
  espresso: "#2A221C",
  cream: "#FDF8F3",
};

// A hollow "arch/doorway" mark — reads as both "home" (doorway) and "portal"
// (gateway). Built as a single evenodd path (outer arch minus a smaller
// inset arch) so it renders identically as a solid glyph or a punched-out
// transparency, on any background.
function archPath({ cx = 512, cy = 512, outerRadius = 170, straight = 260, thickness = 42 }) {
  const oLeft = cx - outerRadius;
  const oRight = cx + outerRadius;
  const oBottom = cy + straight;
  const innerRadius = outerRadius - thickness;
  const iLeft = cx - innerRadius;
  const iRight = cx + innerRadius;
  const iBottom = cy + straight - thickness;
  return [
    `M${oLeft},${cy} A${outerRadius},${outerRadius} 0 0 1 ${oRight},${cy} L${oRight},${oBottom} L${oLeft},${oBottom} Z`,
    `M${iLeft},${cy} A${innerRadius},${innerRadius} 0 0 1 ${iRight},${cy} L${iRight},${iBottom} L${iLeft},${iBottom} Z`,
  ].join(" ");
}

function svgCanvas({ size = 1024, background, markScale = 1, markColor = COLOR.espresso, cornerRadius = 0 }) {
  const bg = background
    ? cornerRadius
      ? `<rect width="1024" height="1024" rx="${cornerRadius}" ry="${cornerRadius}" fill="${background}"/>`
      : `<rect width="1024" height="1024" fill="${background}"/>`
    : "";
  const mark = archPath({});
  return `<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${bg}
  <g transform="translate(512 512) scale(${markScale}) translate(-512 -512)">
    <path d="${mark}" fill="${markColor}" fill-rule="evenodd"/>
  </g>
</svg>`;
}

function svgSplash({ width, height, background = COLOR.cream, markColor = COLOR.espresso }) {
  const shortSide = Math.min(width, height);
  const markSize = shortSide * 0.34;
  const scale = markSize / 1024;
  const cx = width / 2;
  const cy = height / 2;
  const mark = archPath({});
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${background}"/>
  <g transform="translate(${cx} ${cy}) scale(${scale}) translate(-512 -512)">
    <path d="${mark}" fill="${markColor}" fill-rule="evenodd"/>
  </g>
</svg>`;
}

async function writePng(svg, outPath, size) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(Math.round(size.width ?? size), size.height ? Math.round(size.height) : undefined)
    .png()
    .toFile(outPath);
}

const ANDROID_RES = path.join(ROOT, "android", "app", "src", "main", "res");
const DENSITIES = {
  mdpi: 1,
  hdpi: 1.5,
  xhdpi: 2,
  xxhdpi: 3,
  xxxhdpi: 4,
};

async function generateAndroidLauncherIcons() {
  for (const [density, factor] of Object.entries(DENSITIES)) {
    const legacySize = Math.round(48 * factor);
    const adaptiveSize = Math.round(108 * factor);

    // Legacy square icon: full-bleed amber background + mark, safe for
    // launchers that don't support adaptive icons.
    const flat = svgCanvas({ size: legacySize, background: COLOR.amber, markScale: 1.05, markColor: COLOR.espresso });
    await writePng(flat, path.join(ANDROID_RES, `mipmap-${density}`, "ic_launcher.png"), { width: legacySize });

    // Round-masked variant of the same flat icon.
    const flatBuf = await sharp(Buffer.from(flat), { density: 300 }).resize(legacySize, legacySize).png().toBuffer();
    const circleMask = Buffer.from(
      `<svg width="${legacySize}" height="${legacySize}"><circle cx="${legacySize / 2}" cy="${legacySize / 2}" r="${legacySize / 2}" fill="#fff"/></svg>`
    );
    await fs.mkdir(path.join(ANDROID_RES, `mipmap-${density}`), { recursive: true });
    await sharp(flatBuf)
      .composite([{ input: circleMask, blend: "dest-in" }])
      .png()
      .toFile(path.join(ANDROID_RES, `mipmap-${density}`, "ic_launcher_round.png"));

    // Adaptive foreground: transparent background, mark scaled well inside
    // the 66/108 safe zone so no launcher mask (circle/squircle/rounded) clips it.
    const fg = svgCanvas({ size: adaptiveSize, background: null, markScale: 0.62, markColor: COLOR.espresso });
    await writePng(fg, path.join(ANDROID_RES, `mipmap-${density}`, "ic_launcher_foreground.png"), { width: adaptiveSize });
  }
}

const SPLASH_SIZES = {
  "drawable-port-mdpi": [320, 480],
  "drawable-port-hdpi": [480, 800],
  "drawable-port-xhdpi": [720, 1280],
  "drawable-port-xxhdpi": [960, 1600],
  "drawable-port-xxxhdpi": [1280, 1920],
  "drawable-land-mdpi": [480, 320],
  "drawable-land-hdpi": [800, 480],
  "drawable-land-xhdpi": [1280, 720],
  "drawable-land-xxhdpi": [1600, 960],
  "drawable-land-xxxhdpi": [1920, 1280],
  drawable: [320, 480],
};

async function generateAndroidSplash() {
  for (const [dir, [w, h]] of Object.entries(SPLASH_SIZES)) {
    const svg = svgSplash({ width: w, height: h });
    await writePng(svg, path.join(ANDROID_RES, dir, "splash.png"), { width: w, height: h });
  }
}

async function generatePwaIcons() {
  const outDir = path.join(ROOT, "public", "icons");
  const jobs = [
    ["icon-192.png", 192, 1.05, COLOR.amber],
    ["icon-512.png", 512, 1.05, COLOR.amber],
    ["icon-maskable-192.png", 192, 0.62, COLOR.amber],
    ["icon-maskable-512.png", 512, 0.62, COLOR.amber],
  ];
  for (const [name, size, markScale, bg] of jobs) {
    const svg = svgCanvas({ size, background: bg, markScale, markColor: COLOR.espresso });
    await writePng(svg, path.join(outDir, name), { width: size });
  }
}

async function generateNextAppIcons() {
  const appDir = path.join(ROOT, "src", "app");
  const icon = svgCanvas({ size: 512, background: COLOR.amber, markScale: 1.05, markColor: COLOR.espresso });
  await writePng(icon, path.join(appDir, "icon.png"), { width: 512 });

  // apple-touch-icon: opaque background required (iOS flattens/ignores alpha),
  // slightly smaller scale since iOS applies its own rounded-rect mask on top.
  const appleIcon = svgCanvas({ size: 180, background: COLOR.amber, markScale: 0.85, markColor: COLOR.espresso });
  await writePng(appleIcon, path.join(appDir, "apple-icon.png"), { width: 180 });
}

async function main() {
  const previewOnly = process.argv.includes("--preview");

  if (previewOnly) {
    const outDir = path.join(ROOT, ".tmp-preview");
    await fs.mkdir(outDir, { recursive: true });
    await writePng(svgCanvas({ size: 512, background: COLOR.amber, markScale: 1.05 }), path.join(outDir, "icon-flat.png"), { width: 512 });
    await writePng(svgCanvas({ size: 512, background: null, markScale: 0.62 }), path.join(outDir, "icon-adaptive-fg.png"), { width: 512 });
    await writePng(svgSplash({ width: 720, height: 1280 }), path.join(outDir, "splash-preview.png"), { width: 720, height: 1280 });
    console.log(`Preview images written to ${outDir}`);
    return;
  }

  await generateAndroidLauncherIcons();
  await generateAndroidSplash();
  await generatePwaIcons();
  await generateNextAppIcons();
  console.log("Mobile assets generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
