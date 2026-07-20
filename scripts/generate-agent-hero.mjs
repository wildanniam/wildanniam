#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const outputDirectory = resolve(scriptDirectory, "../assets/hero");
const featuredProjectsPath = resolve(scriptDirectory, "../data/featured-projects.json");

const portraitFilter = [
  "crop=1700:1900:800:1950",
  "format=gray",
  "eq=contrast=1.18:brightness=0.04:gamma=0.96",
  "unsharp=3:3:0.35"
].join(",");

function buildProfileLines(projects) {
  const shortNames = {
    "Nova AI Wallet": "Nova AI"
  };

  return [
    { type: "header", value: "wildan@build" },
    { type: "row", key: "Name", value: "Wildan Syukri Niam" },
    { type: "row", key: "Role", value: "Full-Stack Builder" },
    { type: "row", key: "Based", value: "Bandung, Indonesia" },
    { type: "row", key: "Mode", value: "Designing / Building / Shipping" },
    { type: "blank" },
    { type: "section", value: "BUILD.FOCUS" },
    { type: "row", key: "Product", value: "Idea to working release" },
    { type: "row", key: "AI", value: "Agents and tool use" },
    { type: "row", key: "Web3", value: "Smart contracts and payments" },
    { type: "row", key: "Quality", value: "Testing and reliability" },
    { type: "blank" },
    { type: "section", value: "SELECTED.WORK" },
    ...projects.map((project) => ({
      type: "row",
      key: shortNames[project.name] ?? project.name,
      value: project.focus
    })),
    { type: "blank" },
    { type: "footer", value: "FROM IDEA TO WORKING PRODUCT" }
  ];
}

const palettes = {
  dark: {
    backgroundStart: "#17130F",
    backgroundEnd: "#2B211A",
    panel: "#211A16",
    primary: "#F4EEE6",
    muted: "#B8A99A",
    cyan: "#D97745",
    blue: "#E3A27D",
    violet: "#C98A67",
    green: "#91A07F",
    red: "#D97745",
    scanBlend: "screen"
  },
  light: {
    backgroundStart: "#F7F1E8",
    backgroundEnd: "#EEE2D4",
    panel: "#FFF9F1",
    primary: "#211A16",
    muted: "#75675C",
    cyan: "#A9431F",
    blue: "#C66B43",
    violet: "#8A6848",
    green: "#56715A",
    red: "#A9431F",
    scanBlend: "multiply"
  }
};

const layouts = {
  desktop: {
    width: 1180,
    height: 610,
    outerRadius: 18,
    titlebar: { x: 3, y: 3, width: 1174, height: 34, radius: 16 },
    visualPanel: { x: 14, y: 64, width: 488, height: 468, radius: 14 },
    infoPanel: { x: 508, y: 48, width: 655, height: 500, radius: 14 },
    visualTitle: { x: 30, y: 62 },
    infoTitle: { x: 524, y: 62 },
    portrait: { columns: 96, rows: 64, x: 78, y: 90, lineHeight: 6.65, fontSize: 6.5 },
    portraitClip: { x: 24, y: 82, width: 470, height: 438, radius: 12 },
    system: { x: 528, y: 82, width: 620, lineHeight: 21.5, fontSize: 14 },
    footerY: 585
  },
  mobile: {
    width: 720,
    height: 1080,
    outerRadius: 22,
    titlebar: { x: 20, y: 20, width: 680, height: 42, radius: 14 },
    visualPanel: { x: 48, y: 94, width: 624, height: 350, radius: 14 },
    infoPanel: { x: 48, y: 470, width: 624, height: 526, radius: 14 },
    visualTitle: { x: 66, y: 116 },
    infoTitle: { x: 66, y: 492 },
    portrait: { columns: 84, rows: 54, x: 180, y: 132, lineHeight: 5.7, fontSize: 6.6 },
    portraitClip: { x: 58, y: 122, width: 604, height: 312, radius: 12 },
    system: { x: 72, y: 520, width: 574, lineHeight: 21, fontSize: 13 },
    footerY: 1045
  }
};

function buildAmbientPortraitLayer(layout, colors, size) {
  const clip = layout.portraitClip;
  const isDesktop = size === "desktop";
  const centerX = clip.x + clip.width * (isDesktop ? 0.52 : 0.5);
  const centerY = clip.y + clip.height * (isDesktop ? 0.48 : 0.43);
  const orbitWidth = clip.width * (isDesktop ? 0.9 : 0.82);
  const orbitHeight = clip.height * (isDesktop ? 0.58 : 0.62);
  const left = clip.x + (isDesktop ? 28 : 34);
  const right = clip.x + clip.width - (isDesktop ? 28 : 34);
  const top = clip.y + (isDesktop ? 46 : 38);
  const bottom = clip.y + clip.height - (isDesktop ? 42 : 30);

  return `<g clip-path="url(#portrait-clip)" class="ambient-map" aria-hidden="true">
  <rect x="${clip.x}" y="${clip.y}" width="${clip.width}" height="${clip.height}" fill="url(#portrait-grid)"/>
  <ellipse cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.54).toFixed(1)}" ry="${(orbitHeight * 0.54).toFixed(1)}" fill="url(#portrait-halo)"/>
  <ellipse class="motion-orbit motion-orbit--forward" style="transform-origin:${centerX.toFixed(1)}px ${centerY.toFixed(1)}px" cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.5).toFixed(1)}" ry="${(orbitHeight * 0.5).toFixed(1)}" fill="none" stroke="${colors.blue}" stroke-width="1" stroke-dasharray="3 14" opacity="0.13"/>
  <ellipse class="motion-orbit motion-orbit--backward" style="transform-origin:${centerX.toFixed(1)}px ${centerY.toFixed(1)}px" cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.4).toFixed(1)}" ry="${(orbitHeight * 0.38).toFixed(1)}" fill="none" stroke="${colors.violet}" stroke-width="1" stroke-dasharray="28 24" opacity="0.1"/>
  <path d="M ${left} ${top} H ${left + (isDesktop ? 42 : 62)} M ${left} ${top} V ${top + (isDesktop ? 42 : 54)} M ${right} ${bottom} H ${right - (isDesktop ? 42 : 62)} M ${right} ${bottom} V ${bottom - (isDesktop ? 42 : 54)}" fill="none" stroke="${colors.cyan}" stroke-width="1.2" opacity="0.2"/>
  <path d="M ${left} ${(centerY + 42).toFixed(1)} C ${(left + 32).toFixed(1)} ${(centerY + 8).toFixed(1)}, ${(centerX - orbitWidth * 0.3).toFixed(1)} ${(centerY + 58).toFixed(1)}, ${(centerX - orbitWidth * 0.19).toFixed(1)} ${(centerY + 27).toFixed(1)}" fill="none" stroke="${colors.blue}" stroke-width="1" opacity="0.12"/>
  <path d="M ${right} ${(centerY - 52).toFixed(1)} C ${(right - 38).toFixed(1)} ${(centerY - 18).toFixed(1)}, ${(centerX + orbitWidth * 0.31).toFixed(1)} ${(centerY - 70).toFixed(1)}, ${(centerX + orbitWidth * 0.2).toFixed(1)} ${(centerY - 30).toFixed(1)}" fill="none" stroke="${colors.green}" stroke-width="1" opacity="0.11"/>
  <g fill="${colors.cyan}">
    <circle cx="${left}" cy="${top}" r="2.2" opacity="0.42"/>
    <circle cx="${right}" cy="${bottom}" r="2.2" opacity="0.42"/>
    <circle cx="${left + (isDesktop ? 12 : 18)}" cy="${(centerY + 48).toFixed(1)}" r="1.7" opacity="0.32"/>
    <circle cx="${right - (isDesktop ? 10 : 16)}" cy="${(centerY - 58).toFixed(1)}" r="1.7" opacity="0.28"/>
  </g>
</g>`;
}

function getSourcePath() {
  const sourceIndex = process.argv.indexOf("--source");

  if (sourceIndex === -1 || !process.argv[sourceIndex + 1]) {
    throw new Error("Usage: node scripts/generate-agent-hero.mjs --source /absolute/path/to/portrait.jpg");
  }

  return resolve(process.argv[sourceIndex + 1]);
}

function readToken(buffer, offset) {
  let index = offset;

  while (index < buffer.length) {
    const value = buffer[index];

    if (value === 35) {
      while (index < buffer.length && buffer[index] !== 10) index += 1;
    } else if ([9, 10, 13, 32].includes(value)) {
      index += 1;
    } else {
      break;
    }
  }

  const start = index;
  while (index < buffer.length && ![9, 10, 13, 32].includes(buffer[index])) index += 1;

  return { value: buffer.subarray(start, index).toString("ascii"), offset: index };
}

function parsePgm(buffer) {
  const magic = readToken(buffer, 0);
  const width = readToken(buffer, magic.offset);
  const height = readToken(buffer, width.offset);
  const maxValue = readToken(buffer, height.offset);

  if (magic.value !== "P5" || Number(maxValue.value) !== 255) {
    throw new Error("Expected an 8-bit binary PGM image from ffmpeg.");
  }

  let pixelOffset = maxValue.offset;
  while (pixelOffset < buffer.length && [9, 10, 13, 32].includes(buffer[pixelOffset])) pixelOffset += 1;

  const pixelCount = Number(width.value) * Number(height.value);
  const pixels = buffer.subarray(pixelOffset, pixelOffset + pixelCount);

  if (pixels.length !== pixelCount) {
    throw new Error("PGM image data was incomplete.");
  }

  return { width: Number(width.value), height: Number(height.value), pixels };
}

async function samplePortrait(sourcePath, columns, rows) {
  const { stdout } = await execFileAsync(
    "ffmpeg",
    [
      "-v", "error",
      "-f", "lavfi",
      "-i", "color=c=white:s=3072x4096",
      "-i", sourcePath,
      "-filter_complex", `[0:v][1:v]overlay=shortest=1:format=auto,${portraitFilter},scale=${columns}:${rows}`,
      "-frames:v", "1",
      "-f", "image2pipe",
      "-vcodec", "pgm",
      "pipe:1"
    ],
    { encoding: "buffer", maxBuffer: 4 * 1024 * 1024 }
  );

  return parsePgm(stdout);
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function createAsciiTspans({ pixels, width, height }, placement) {
  const characters = " .:-=+*#%@";
  const rows = [];

  for (let row = 0; row < height; row += 1) {
    let line = "";

    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      const pixel = pixels[index];
      const left = pixels[row * width + Math.max(column - 1, 0)];
      const right = pixels[row * width + Math.min(column + 1, width - 1)];
      const above = pixels[Math.max(row - 1, 0) * width + column];
      const below = pixels[Math.min(row + 1, height - 1) * width + column];
      const darkness = (255 - pixel) / 255;
      const edge = (Math.abs(right - left) + Math.abs(below - above)) / 510;
      const ink = clamp(darkness * 1.02 + edge * 0.5 - 0.025, 0, 1);
      const characterIndex = Math.round(ink * (characters.length - 1));
      line += characters[characterIndex];
    }

    rows.push(
      `<tspan x="${placement.x}" y="${(placement.y + row * placement.lineHeight).toFixed(2)}" xml:space="preserve">${escapeXml(line)}</tspan>`
    );
  }

  return rows.join("\n");
}

function buildSystemLayer({ x, y, lineHeight, fontSize }, colors, profileLines) {
  const rows = [];

  profileLines.forEach((line, index) => {
    if (line.type === "blank") return;

    const lineY = y + index * lineHeight;

    if (line.type === "header") {
      rows.push(`<text x="${x}" y="${lineY}" class="system-head"><tspan fill="${colors.violet}">${escapeXml(line.value)}</tspan><tspan fill="${colors.muted}"> ------------------------------------------</tspan></text>`);
      return;
    }

    if (line.type === "section") {
      rows.push(`<text x="${x}" y="${lineY}" class="system-section" fill="${colors.green}">- ${escapeXml(line.value)} -----------------------------------</text>`);
      return;
    }

    if (line.type === "footer") {
      rows.push(`<text x="${x}" y="${lineY}" class="system-footer" fill="${colors.blue}">${escapeXml(line.value)}</text>`);
      return;
    }

    const dots = ".".repeat(Math.max(3, 14 - line.key.length));
    rows.push(
      `<text x="${x}" y="${lineY}" class="system-row"><tspan fill="${colors.muted}">. </tspan><tspan class="system-key" fill="${colors.cyan}">${escapeXml(line.key)}</tspan><tspan fill="${colors.muted}">: ${dots} </tspan><tspan fill="${colors.primary}">${escapeXml(line.value)}</tspan></text>`
    );
  });

  return rows.join("\n");
}

function createHeroSvg(mode, size, portrait, profileLines) {
  const colors = palettes[mode];
  const layout = layouts[size];
  const titlebar = layout.titlebar;
  const visual = layout.visualPanel;
  const info = layout.infoPanel;
  const clip = layout.portraitClip;
  const ascii = createAsciiTspans(portrait, layout.portrait);
  const ambientPortrait = buildAmbientPortraitLayer(layout, colors, size);
  const system = buildSystemLayer(layout.system, colors, profileLines);
  const isDesktop = size === "desktop";
  const titleCenter = titlebar.x + titlebar.width / 2;
  const liveX = titlebar.x + titlebar.width - (isDesktop ? 138 : 94);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-labelledby="title description">
<title id="title">Wildan Syukri Niam - Full-Stack Builder</title>
<desc id="description">A warm editorial profile card with Wildan's ASCII portrait, product focus, and selected work.</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.backgroundStart}"/><stop offset="1" stop-color="${colors.backgroundEnd}"/></linearGradient>
  <linearGradient id="ascii-signal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.cyan}"/><stop offset="1" stop-color="${colors.violet}"/></linearGradient>
  <linearGradient id="border" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${colors.violet}"/><stop offset="0.48" stop-color="${colors.cyan}"/><stop offset="1" stop-color="${colors.green}"/></linearGradient>
  <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors.cyan}" stop-opacity="0"/><stop offset="0.5" stop-color="${colors.cyan}" stop-opacity="0.46"/><stop offset="1" stop-color="${colors.violet}" stop-opacity="0"/></linearGradient>
  <radialGradient id="portrait-halo"><stop offset="0" stop-color="${colors.cyan}" stop-opacity="0.12"/><stop offset="0.48" stop-color="${colors.blue}" stop-opacity="0.055"/><stop offset="1" stop-color="${colors.violet}" stop-opacity="0"/></radialGradient>
  <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${colors.cyan}" opacity="0.052"/></pattern>
  <pattern id="portrait-grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M 44 0 H 0 V 44" fill="none" stroke="${colors.blue}" stroke-width="0.65" opacity="0.085"/><circle cx="0" cy="0" r="1.2" fill="${colors.cyan}" opacity="0.13"/></pattern>
  <clipPath id="portrait-clip"><rect x="${clip.x}" y="${clip.y}" width="${clip.width}" height="${clip.height}" rx="${clip.radius}"/></clipPath>
  <style>
    .mono { font-family: 'Courier New', Consolas, monospace; }
    .ascii { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.portrait.fontSize}px; letter-spacing: -0.15px; fill: url(#ascii-signal); }
    .panel-title { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 11 : 12}px; letter-spacing: 2px; fill: ${colors.blue}; opacity: 0.78; }
    .terminal-label { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 12 : 11}px; letter-spacing: 0.5px; fill: ${colors.muted}; }
    .live-label { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 10 : 9}px; letter-spacing: 1px; fill: ${colors.red}; }
    .system-head { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.system.fontSize + 2}px; font-weight: 700; }
    .system-section, .system-footer, .system-row { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.system.fontSize}px; }
    .system-section, .system-key { font-weight: 700; }
    text, tspan { white-space: pre; }
    .motion-orbit { transform-box: view-box; }
    @keyframes orbit-forward { to { transform: rotate(360deg); } }
    @keyframes orbit-backward { to { transform: rotate(-360deg); } }
    @keyframes scan-sweep { from { transform: translateY(0); } to { transform: translateY(${layout.height + 140}px); } }
    @media (prefers-reduced-motion: no-preference) {
      .motion-orbit--forward { animation: orbit-forward 42s linear infinite; }
      .motion-orbit--backward { animation: orbit-backward 34s linear infinite; }
      .motion-scan { animation: scan-sweep 8s linear infinite; }
    }
    @media (prefers-reduced-motion: reduce) {
      .motion-scan { display: none; }
    }
  </style>
</defs>
<rect width="${layout.width}" height="${layout.height}" rx="${layout.outerRadius}" fill="url(#background)"/>
<rect width="${layout.width}" height="${layout.height}" rx="${layout.outerRadius}" fill="url(#scanlines)"/>
<rect x="${titlebar.x}" y="${titlebar.y}" width="${titlebar.width}" height="${titlebar.height}" rx="${titlebar.radius}" fill="${colors.panel}" fill-opacity="0.84"/>
<circle cx="${titlebar.x + 21}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="${colors.cyan}" opacity="0.88"/>
<circle cx="${titlebar.x + 39}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="${colors.violet}" opacity="0.7"/>
<circle cx="${titlebar.x + 57}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="${colors.green}" opacity="0.78"/>
<text x="${titleCenter}" y="${titlebar.y + titlebar.height / 2 + 5}" text-anchor="middle" class="terminal-label">wildan@build ~ % ./profile</text>
${isDesktop ? `<circle cx="${liveX}" cy="${titlebar.y + titlebar.height / 2}" r="4" fill="${colors.red}"/><text x="${liveX + 10}" y="${titlebar.y + titlebar.height / 2 + 4}" class="live-label">BUILDING</text>` : ""}
<rect x="${visual.x}" y="${visual.y}" width="${visual.width}" height="${visual.height}" rx="${visual.radius}" fill="${colors.panel}" fill-opacity="0.38" stroke="url(#border)" stroke-opacity="0.42"/>
<rect x="${info.x}" y="${info.y}" width="${info.width}" height="${info.height}" rx="${info.radius}" fill="${colors.panel}" fill-opacity="0.42" stroke="url(#border)" stroke-opacity="0.42"/>
<text x="${layout.visualTitle.x}" y="${layout.visualTitle.y}" class="panel-title">PORTRAIT / WILDAN</text>
<text x="${layout.infoTitle.x}" y="${layout.infoTitle.y}" class="panel-title">PROFILE / BUILDER</text>
${ambientPortrait}
<g clip-path="url(#portrait-clip)"><text class="ascii" fill="${colors.cyan}" font-family="'Courier New', Consolas, monospace" font-size="${layout.portrait.fontSize}px" letter-spacing="-0.15px">${ascii}</text></g>
${system}
<text x="${layout.width / 2}" y="${layout.footerY}" text-anchor="middle" class="mono" font-size="10" letter-spacing="1.5" fill="${colors.muted}">PRODUCT ENGINEERING / AI AGENTS / WEB3 / DEVELOPER TOOLS</text>
<rect class="motion-scan" x="0" y="-70" width="${layout.width}" height="70" fill="url(#scan)" opacity="0.42" style="mix-blend-mode:${colors.scanBlend}"/>
<rect x="3" y="3" width="${layout.width - 6}" height="${layout.height - 6}" rx="${layout.outerRadius - 2}" fill="none" stroke="url(#border)" stroke-width="2" opacity="0.76"/>
</svg>`;
}

const outputs = [
  { filename: "builder-profile-v1-dark.svg", mode: "dark", size: "desktop" },
  { filename: "builder-profile-v1-light.svg", mode: "light", size: "desktop" },
  { filename: "builder-profile-v1-mobile-dark.svg", mode: "dark", size: "mobile" },
  { filename: "builder-profile-v1-mobile-light.svg", mode: "light", size: "mobile" }
];

function normalizeSvg(value) {
  return `${value.trimEnd()}\n`;
}

async function main() {
  const sourcePath = getSourcePath();
  const checkOnly = process.argv.includes("--check");
  const projects = JSON.parse(await readFile(featuredProjectsPath, "utf8"));

  if (!Array.isArray(projects) || projects.length !== 5) {
    throw new Error("Featured project data must contain exactly five projects.");
  }

  const seenRepos = new Set();

  for (const project of projects) {
    for (const field of ["name", "repo", "url", "role", "status", "focus", "summary"]) {
      if (typeof project[field] !== "string" || project[field].trim() === "") {
        throw new Error(`Featured project ${project.name ?? "(unknown)"} is missing ${field}.`);
      }
    }

    if (seenRepos.has(project.repo)) {
      throw new Error(`Featured project repo is duplicated: ${project.repo}.`);
    }
    seenRepos.add(project.repo);

    for (const [field, value] of [["url", project.url], ["homepage", project.homepage]]) {
      if (value === null && field === "homepage") continue;
      if (typeof value !== "string" || new URL(value).protocol !== "https:") {
        throw new Error(`Featured project ${project.name} has an unsafe ${field}.`);
      }
    }
  }

  const profileLines = buildProfileLines(projects);
  const portraits = {
    desktop: await samplePortrait(sourcePath, layouts.desktop.portrait.columns, layouts.desktop.portrait.rows),
    mobile: await samplePortrait(sourcePath, layouts.mobile.portrait.columns, layouts.mobile.portrait.rows)
  };
  const generated = outputs.map((output) => ({
    ...output,
    content: normalizeSvg(
      createHeroSvg(output.mode, output.size, portraits[output.size], profileLines)
    )
  }));

  await mkdir(outputDirectory, { recursive: true });

  if (checkOnly) {
    const drifted = [];

    for (const output of generated) {
      try {
        const current = await readFile(resolve(outputDirectory, output.filename), "utf8");
        if (current !== output.content) drifted.push(output.filename);
      } catch {
        drifted.push(output.filename);
      }
    }

    if (drifted.length > 0) {
      throw new Error(`Generated hero assets are stale: ${drifted.join(", ")}`);
    }

    console.log("Hero assets match deterministic generator output.");
    return;
  }

  await Promise.all(
    generated.map((output) =>
      writeFile(resolve(outputDirectory, output.filename), output.content)
    )
  );

  console.log(`Generated builder-first hero assets from ${basename(sourcePath)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
