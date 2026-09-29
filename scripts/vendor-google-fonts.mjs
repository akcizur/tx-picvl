import { mkdir, writeFile } from "node:fs/promises";

const SOURCE = new URL("../fonts-czech.json", import.meta.url);
const OUT_DIR = new URL("../fonts/czech/", import.meta.url);
const OUT_CATALOG = new URL("../fonts-czech-local.json", import.meta.url);
const OUT_SCRIPT = new URL("../fonts-czech-local.js", import.meta.url);

// Additional modern open-source Google Fonts not present in the legacy catalog.
// They are vendored locally as Czech latin-ext WOFF2 files by this workflow.
const EXTRA_FONTS = [
  { fontName: "Figtree", confidence: "HIGHEST" },
  { fontName: "Manrope", confidence: "HIGHEST" },
  { fontName: "Plus Jakarta Sans", confidence: "HIGHEST" },
  { fontName: "Space Grotesk", confidence: "HIGHEST" },
  { fontName: "Sora", confidence: "HIGHEST" },
  { fontName: "Outfit", confidence: "HIGHEST" },
  { fontName: "Urbanist", confidence: "HIGHEST" },
  { fontName: "Inter", confidence: "HIGHEST" },
  { fontName: "Lato", confidence: "HIGHEST" },
  { fontName: "Lexend", confidence: "HIGHEST" },
  { fontName: "Karla", confidence: "HIGHEST" },
  { fontName: "Mulish", confidence: "HIGHEST" },
  { fontName: "Instrument Sans", confidence: "HIGHEST" },
  { fontName: "Albert Sans", confidence: "HIGHEST" },
  { fontName: "Red Hat Mono", confidence: "HIGHEST" },
  { fontName: "Bricolage Grotesque", confidence: "HIGHEST" }
];

const concurrency = 8;

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function extractLatinExtUrl(css) {
  const latinExt = css.match(/\/\*\s*latin-ext\s*\*\/[\s\S]*?(?=\/\*|$)/i);
  const block = latinExt?.[0] ?? css;
  const match = block.match(/url\(([^)]+)\)/i) ?? css.match(/url\(([^)]+)\)/i);
  return match?.[1]?.replace(/^["']|["']$/g, "") ?? null;
}

async function fetchFont(font) {
  const family = encodeURIComponent(font.fontName);
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  const cssResponse = await fetch(cssUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; tx-picvl-font-vendor/1.0)" }
  });

  if (!cssResponse.ok) throw new Error(`CSS HTTP ${cssResponse.status}`);
  const css = await cssResponse.text();
  const fontUrl = extractLatinExtUrl(css);
  if (!fontUrl) throw new Error("latin-ext WOFF2 URL not found");

  const response = await fetch(fontUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; tx-picvl-font-vendor/1.0)" }
  });
  if (!response.ok) throw new Error(`font HTTP ${response.status}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  const file = `${slugify(font.fontName)}.woff2`;
  await writeFile(new URL(file, OUT_DIR), bytes);

  return {
    fontName: font.fontName,
    confidence: font.confidence,
    file: `fonts/czech/${file}`,
    source: "Google Fonts CSS2 / latin-ext",
    cssUrl,
    bytes: bytes.length
  };
}

async function main() {
  const baseCatalog = JSON.parse(await (await import("node:fs/promises")).readFile(SOURCE, "utf8"));

  // Merge by font name so reruns never create duplicates.
  const byName = new Map(baseCatalog.map((font) => [font.fontName, font]));
  for (const font of EXTRA_FONTS) byName.set(font.fontName, font);
  const catalog = [...byName.values()];

  await mkdir(OUT_DIR, { recursive: true });

  const success = [];
  const failed = [];
  let cursor = 0;

  async function worker() {
    while (true) {
      const current = cursor++;
      if (current >= catalog.length) return;
      const font = catalog[current];

      try {
        const result = await fetchFont(font);
        success.push(result);
        process.stdout.write(`✓ ${font.fontName}\n`);
      } catch (error) {
        failed.push({
          fontName: font.fontName,
          confidence: font.confidence,
          error: String(error?.message ?? error)
        });
        process.stderr.write(`× ${font.fontName}: ${String(error?.message ?? error)}\n`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  success.sort((a, b) => a.fontName.localeCompare(b.fontName));
  failed.sort((a, b) => a.fontName.localeCompare(b.fontName));

  const output = {
    generatedAt: new Date().toISOString(),
    sourceCount: catalog.length,
    downloadedCount: success.length,
    failedCount: failed.length,
    fonts: success,
    failed
  };

  await writeFile(OUT_CATALOG, JSON.stringify(output, null, 2) + "\n");

  const runtimeCatalog = {
    generatedAt: output.generatedAt,
    sourceCount: output.sourceCount,
    downloadedCount: output.downloadedCount,
    failedCount: output.failedCount,
    fonts: success.map(({ fontName, confidence, file }) => ({ fontName, confidence, file }))
  };

  await writeFile(
    OUT_SCRIPT,
    "window.__TX_PICVL_FONT_CATALOG__ = " + JSON.stringify(runtimeCatalog) + ";\n"
  );

  if (!success.length) throw new Error("No fonts were downloaded.");
  console.log(`Downloaded ${success.length}/${catalog.length} Czech Google Fonts.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
