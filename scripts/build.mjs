#!/usr/bin/env node
/*
  NEXORA — build de producción (sin dependencias, solo Node 18+)

  npm run check   → solo valida el proyecto
  npm run build   → valida y genera /dist, la carpeta que publica Vercel

  Qué valida
    · sintaxis de js/projects.js y js/main.js
    · datos de js/projects.js: ids únicos, categorías válidas, medios que existen
    · que existan todos los archivos que usan index.html y css/styles.css
    · que los links internos (#seccion) apunten a una sección real
    · que el sitio no dependa de Claude ni cargue recursos de otros servidores

  Qué genera en /dist
    · index.html con CSS y JS renombrados con un hash de su contenido
      (styles.3f9a1c2b7d.css): el navegador los guarda un año y cada cambio
      genera un nombre nuevo, así nadie ve una versión vieja.
    · assets/ (fuentes, imágenes y videos) tal cual.
    · si existe SITE_URL o VERCEL_PROJECT_PRODUCTION_URL: link canónico y
      og:url / og:image absolutos para la vista previa al compartir el link.
*/
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist");
const CHECK_ONLY = process.argv.includes("--check");
const ENTRY = "index.html";
const HASHED = ["css/styles.css", "js/projects.js", "js/main.js"];
const COPY = ["assets"];

const errors = [];
const warnings = [];
const notes = [];
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), "utf8");
const clean = (u) => decodeURI(u.split(/[?#]/)[0]);
const isLocal = (u) => typeof u === "string" && u !== "" && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u);
// exact match, letter case included: Windows and macOS forgive "Foto.JPG" vs "foto.jpg", Vercel does not
function exists(p) {
  let dir = ROOT;
  for (const part of path.posix.normalize(clean(p)).split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      dir = path.dirname(dir);
      continue;
    }
    let names;
    try {
      names = fs.readdirSync(dir);
    } catch {
      return false;
    }
    if (!names.includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}
const kb = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${(n / 1e3).toFixed(1)} kB`);

/* 1 · archivos base ------------------------------------------------------ */
for (const f of [ENTRY, ...HASHED, ...COPY]) if (!exists(f)) errors.push(`Falta ${f}`);
if (errors.length) finish();

const html = read(ENTRY);
const css = read("css/styles.css");
// inline SVGs (data: URIs) can contain their own url(#id): they are not files
const cssFiles = css.replace(/url\(\s*"data:[^"]*"\s*\)/g, "").replace(/url\(\s*'data:[^']*'\s*\)/g, "");

/* 2 · sintaxis JS (se compila sin ejecutarse) ---------------------------- */
for (const f of HASHED.filter((f) => f.endsWith(".js"))) {
  try {
    new vm.Script(read(f), { filename: f });
  } catch (e) {
    errors.push(`${f}: error de sintaxis — ${e.message} (${String(e.stack).split("\n")[0]})`);
  }
}

/* 3 · contenido de js/projects.js --------------------------------------- */
let D = null;
try {
  const sandbox = { window: {} };
  vm.runInNewContext(read("js/projects.js"), sandbox, { filename: "js/projects.js", timeout: 1000 });
  D = sandbox.window.PORTFOLIO || null;
} catch (e) {
  errors.push(`js/projects.js no se pudo leer: ${e.message}`);
}
if (!D && !errors.length) errors.push("js/projects.js no define window.PORTFOLIO");

function media(where, key, value) {
  if (!value) return;
  if (typeof value !== "string") return errors.push(`${where}.${key}: tiene que ser un texto con la ruta del archivo`);
  if (isLocal(value)) {
    if (!exists(value)) errors.push(`${where}.${key}: no existe "${value}"`);
  } else if (/^https?:/i.test(value)) {
    warnings.push(`${where}.${key}: se carga desde otro servidor (${value})`);
  }
}

if (D) {
  const site = D.site || {};
  const cats = Object.keys(D.categories || {});
  const projects = Array.isArray(D.projects) ? D.projects : [];
  const ids = new Set();
  if (!site.name) warnings.push("site.name está vacío");
  if (!projects.length) errors.push("projects está vacío");
  projects.forEach((p, i) => {
    const where = `projects[${i}]${p && p.id ? ` (${p.id})` : ""}`;
    if (!p.id) errors.push(`${where}: falta "id"`);
    else if (!/^[a-z0-9-]+$/.test(p.id)) errors.push(`${where}: el id solo admite minúsculas, números y guiones (se usa en el link …/#${p.id})`);
    else if (ids.has(p.id)) errors.push(`${where}: id repetido`);
    else if (html.includes(`id="${p.id}"`)) errors.push(`${where}: el id choca con una sección de la página`);
    ids.add(p.id);
    if (!p.title) errors.push(`${where}: falta "title"`);
    const pc = p.categories || [];
    if (!pc.length) warnings.push(`${where}: no tiene categorías, no aparece en ningún filtro`);
    pc.forEach((c) => cats.includes(c) || errors.push(`${where}: categoría desconocida "${c}" (válidas: ${cats.join(", ")})`));
    media(where, "cover", p.cover);
    media(where, "video", p.video);
    (p.gallery || []).forEach((g, k) => media(where, `gallery[${k}]`, g));
    if (p.link && !/^https?:\/\//i.test(p.link)) warnings.push(`${where}.link: conviene que empiece con https://`);
  });
  if (site.showreel) {
    media("site.showreel", "video", site.showreel.video);
    media("site.showreel", "poster", site.showreel.poster);
    if (site.showreel.project && !ids.has(site.showreel.project))
      warnings.push(`site.showreel.project: no hay un proyecto con id "${site.showreel.project}"; se oculta el botón "Ver proyecto"`);
  }
  (D.services || []).forEach((s) => {
    if (!cats.includes(s.id)) warnings.push(`services: "${s.id}" no es una categoría; su botón lleva a Contacto`);
  });
  if (site.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) errors.push(`site.email no parece un correo: "${site.email}"`);
  if (site.whatsapp && site.whatsapp.number && !/^\d{8,15}$/.test(site.whatsapp.number))
    errors.push("site.whatsapp.number: solo números, con código de país y sin + ni espacios (ej. 5493764262942)");
  notes.push(`${projects.length} proyectos · ${(D.services || []).length} servicios · ${cats.length} categorías`);
}

/* 4 · archivos y anclas referenciados ------------------------------------ */
let refs = 0;
for (const [, u] of html.matchAll(/\s(?:src|href)="([^"]+)"/g)) {
  if (u.startsWith("#") && u.length > 1) {
    if (!html.includes(`id="${u.slice(1)}"`)) errors.push(`index.html: el link "${u}" no apunta a ninguna sección`);
  } else if (isLocal(u)) {
    refs++;
    if (!exists(u)) errors.push(`index.html: no existe "${u}"`);
  }
}
for (const [, u] of cssFiles.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
  if (!isLocal(u)) continue;
  refs++;
  if (!exists(path.posix.normalize(path.posix.join("css", u)))) errors.push(`css/styles.css: no existe "${u}"`);
}
notes.push(`${refs} archivos referenciados desde index.html y styles.css`);

/* 5 · independencia ------------------------------------------------------ */
for (const f of [ENTRY, ...HASHED]) {
  const t = read(f);
  if (/claude\.ai|claudeusercontent|anthropic\.com/i.test(t)) errors.push(`${f}: hace referencia a Claude; el sitio tiene que ser independiente`);
  for (const [, host] of t.matchAll(/<(?:script|link|img|video|source|iframe)\b[^>]*\s(?:src|href)="(?:https?:)?\/\/([^/"]+)/gi))
    warnings.push(`${f}: carga un recurso de ${host}`);
}

if (CHECK_ONLY || errors.length) finish();

/* 6 · generar dist/ ------------------------------------------------------ */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const d of COPY) {
  fs.cpSync(abs(d), path.join(OUT, d), { recursive: true, filter: (src) => !/^(\.|Thumbs\.db$)/.test(path.basename(src)) });
}

let page = html;
for (const f of HASHED) {
  const buf = fs.readFileSync(abs(f));
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const { dir, name, ext } = path.posix.parse(f);
  const to = `${dir}/${name}.${hash}${ext}`;
  fs.mkdirSync(path.join(OUT, dir), { recursive: true });
  fs.writeFileSync(path.join(OUT, to), buf);
  const token = `"${f}"`;
  if (!page.includes(token)) errors.push(`index.html no carga ${f}`);
  page = page.split(token).join(`"${to}"`);
}

const envUrl = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
const siteUrl = envUrl.trim().replace(/\/+$/, "");
if (siteUrl && /^https?:\/\/[^\s"'<>]+$/i.test(siteUrl)) {
  const image = (D && D.site && D.site.showreel && D.site.showreel.poster) || (D && (D.projects || []).map((p) => p.cover).find(isLocal));
  const tags = [`<link rel="canonical" href="${siteUrl}/" />`, `<meta property="og:url" content="${siteUrl}/" />`];
  if (isLocal(image)) {
    tags.push(`<meta property="og:image" content="${siteUrl}/${image}" />`, `<meta name="twitter:image" content="${siteUrl}/${image}" />`);
  }
  page = page.replace("</head>", `  ${tags.join("\n    ")}\n  </head>`);
  notes.push(`vista previa al compartir: ${siteUrl}/`);
} else if (siteUrl) {
  warnings.push(`SITE_URL no es una URL válida: "${siteUrl}"`);
}
fs.writeFileSync(path.join(OUT, ENTRY), page);

if (errors.length) {
  fs.rmSync(OUT, { recursive: true, force: true });
  finish();
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else files.push([path.relative(OUT, p).split(path.sep).join("/"), fs.statSync(p).size]);
  }
})(OUT);
files.sort((a, b) => a[0].localeCompare(b[0]));
const total = files.reduce((n, [, s]) => n + s, 0);
notes.push(`dist/ · ${files.length} archivos · ${kb(total)}`);
for (const [f, s] of files) notes.push(`  ${f.padEnd(48)} ${kb(s).padStart(9)}`);
finish();

/* ----------------------------------------------------------------------- */
function finish() {
  const title = CHECK_ONLY ? "NEXORA · verificación" : "NEXORA · build de producción";
  console.log(`\n${title}\n`);
  for (const n of notes) console.log(`  ${n}`);
  if (warnings.length) {
    console.log("\n  Avisos:");
    for (const w of warnings) console.log(`  ! ${w}`);
  }
  if (errors.length) {
    console.error("\n  Errores:");
    for (const e of errors) console.error(`  ✗ ${e}`);
    console.error(`\n  ${errors.length} error(es). ${CHECK_ONLY ? "" : "No se generó dist/."}\n`);
    process.exit(1);
  }
  console.log(`\n  ✓ Sin errores.${CHECK_ONLY ? "" : " Listo para publicar."}\n`);
  process.exit(0);
}
