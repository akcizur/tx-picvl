import { mkdir, writeFile } from "node:fs/promises";

const OUTPUT_DIR = new URL("../ui-assets/", import.meta.url);
const OUTPUT_FILE = new URL("pill-buttons.css", OUTPUT_DIR);

function buildCss() {
  return `
:root {
  --ui-black: #000;
  --ui-950: #080808;
  --ui-900: #101010;
  --ui-800: #1a1a1a;
  --ui-700: #2a2a2a;
  --ui-500: #666;
  --ui-300: #aaa;
  --ui-white: #fff;
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 128px;
  min-height: 48px;
  padding: 0 18px;
  border: 1px solid var(--ui-700);
  border-radius: 999px;
  background: var(--ui-900);
  color: var(--ui-white);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .075em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition:
    background .15s ease,
    color .15s ease,
    border-color .15s ease,
    transform .15s ease;
}

.pill:hover,
.pill:focus-visible {
  background: var(--ui-white);
  color: var(--ui-black);
  border-color: var(--ui-white);
  outline: none;
}

.pill:active { transform: scale(.985); }

.pill__dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: currentColor;
}

.pill--soft,
.pill--ghost,
.pill--glow {
  background: var(--ui-900);
  color: var(--ui-white);
}

.pill--circle {
  width: 48px;
  min-width: 48px;
  min-height: 48px;
  padding: 0;
  border-radius: 50%;
}

.pill--circle .pill__dot {
  width: 10px;
  height: 10px;
}
`;
}

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_FILE, buildCss().trim() + "\n", "utf8");
console.log(`Generated ${OUTPUT_FILE.pathname}`);
