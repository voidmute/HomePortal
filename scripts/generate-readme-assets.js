#!/usr/bin/env node
// Generates the custom branded graphics used in README.md (hero banner, small
// logo mark). Feature grid icons are inline SVG in README — see
// scripts/generate-readme-features-html.js. Re-run: `npm run assets:readme`.
const path = require("node:path");
const fs = require("node:fs/promises");
const sharp = require("sharp");
const opentype = require("opentype.js");

// Great Vibes (OFL, TypeSETit) — rendered to vector outlines so the banner PNG
// looks identical regardless of which fonts are installed on the build machine.
const GREAT_VIBES = opentype.parse(
  require("node:fs").readFileSync(
    path.join(__dirname, "fonts", "GreatVibes-Regular.ttf")
  ).buffer
);

// Lay out glyphs one-by-one (opentype.js can't run Great Vibes' GSUB features).
function scriptTextPath(text, fontSize, anchorX, baselineY, anchor) {
  const scale = fontSize / GREAT_VIBES.unitsPerEm;
  const chars = [...text];
  let width = 0;
  for (const ch of chars) {
    width += (GREAT_VIBES.charToGlyph(ch).advanceWidth || 0) * scale;
  }
  let penX = anchorX;
  if (anchor === "end") penX = anchorX - width;
  else if (anchor === "middle") penX = anchorX - width / 2;
  let d = "";
  for (const ch of chars) {
    const glyph = GREAT_VIBES.charToGlyph(ch);
    d += glyph.getPath(penX, baselineY, fontSize).toPathData(2) + " ";
    penX += (glyph.advanceWidth || 0) * scale;
  }
  return d.trim();
}

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, ".github", "assets");

const COLOR = {
  cream: "#FDF8F3",
  creamMuted: "#F7EFE6",
  warm: "#F0E4D4",
  espresso: "#2A221C",
  charcoal: "#3D342C",
  amber: "#D4A96A",
  amberDark: "#B8894F",
  sage: "#9AAB8C",
  rose: "#E8C4B8",
  stone: "#7A726A",
};

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

async function writePng(svg, outPath, width, height) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg), { density: 300 }).resize(width, height).png().toFile(outPath);
}

async function generateBanner() {
  const w = 1280;
  const h = 400;
  const cx = w / 2;
  const logoY = 150;
  const markScale = 0.30;
  const mark = archPath({});
  const svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${COLOR.cream}"/>
        <stop offset="0.6" stop-color="${COLOR.creamMuted}"/>
        <stop offset="1" stop-color="${COLOR.warm}"/>
      </linearGradient>
      <radialGradient id="glow" cx="${cx}" cy="${logoY}" r="260" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${COLOR.amber}" stop-opacity="0.35"/>
        <stop offset="1" stop-color="${COLOR.amber}" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="round">
        <rect width="${w}" height="${h}" rx="200" ry="200"/>
      </clipPath>
    </defs>
    <g clip-path="url(#round)">
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <circle cx="${cx}" cy="${logoY}" r="260" fill="url(#glow)"/>
    <circle cx="150" cy="70" r="5" fill="${COLOR.sage}" opacity="0.55"/>
    <circle cx="1130" cy="70" r="7" fill="${COLOR.rose}" opacity="0.55"/>
    <circle cx="1200" cy="200" r="4" fill="${COLOR.amberDark}" opacity="0.5"/>
    <circle cx="90" cy="210" r="4" fill="${COLOR.sage}" opacity="0.5"/>
    <path d="${scriptTextPath("Home", 132, cx - 160, logoY + 44, "end")}" fill="${COLOR.espresso}"/>
    <rect x="${cx - 82}" y="${logoY - 82}" width="164" height="164" rx="44" fill="${COLOR.espresso}"/>
    <g transform="translate(${cx} ${logoY}) scale(0.125) translate(-512 -512)">
      <path d="${mark}" fill="${COLOR.amber}" fill-rule="evenodd"/>
    </g>
    <path d="${scriptTextPath("Portal", 132, cx + 160, logoY + 44, "start")}" fill="${COLOR.espresso}"/>
    <text x="${cx}" y="315" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="${COLOR.amberDark}">Уютный self-hosted портал для всей семьи</text>
    <text x="${cx}" y="352" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" letter-spacing="2" fill="${COLOR.stone}">NEXT.JS · POSTGRES · DOCKER · CLOUDFLARE TUNNEL · ANDROID / iOS</text>
    </g>
  </svg>`;
  await writePng(svg, path.join(OUT_DIR, "banner.png"), w, h);
  await writePng(svg, path.join(OUT_DIR, "banner-v2.png"), w, h);
}

// Favicon badge: espresso rounded-square with an amber portal arch.
function faviconSvg(size) {
  const mark = archPath({});
  const rx = size * 0.24;
  const scale = 0.42 * (size / 512);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${rx}" fill="${COLOR.espresso}"/>
    <g transform="translate(${size / 2} ${size / 2}) scale(${scale}) translate(-512 -512)">
      <path d="${mark}" fill="${COLOR.amber}" fill-rule="evenodd"/>
    </g>
  </svg>`;
}

async function generateMark() {
  for (const { name, size } of [
    { name: "mark.png", size: 180 },
    { name: "favicon-32.png", size: 64 },
  ]) {
    await writePng(faviconSvg(size), path.join(OUT_DIR, name), size, size);
  }
  await fs.writeFile(path.join(OUT_DIR, "favicon.svg"), faviconSvg(180));
}

async function copyToSiteAssets() {
  const siteDir = path.join(ROOT, "assets");
  await fs.mkdir(siteDir, { recursive: true });
  for (const file of ["mark.png", "favicon-32.png", "favicon.svg", "banner.png", "banner-v2.png"]) {
    const src = path.join(OUT_DIR, file);
    if (await fs.stat(src).catch(() => null)) {
      await fs.copyFile(src, path.join(siteDir, file));
    }
  }
}

async function main() {
  await generateBanner();
  await generateMark();
  await copyToSiteAssets();
  console.log("README assets generated in .github/assets/ (banner + mark + favicon)");
  console.log("Site assets copied to assets/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
