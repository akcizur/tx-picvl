import { mkdir, writeFile } from "node:fs/promises";

const OUTPUT_DIR = new URL("../ui-assets/", import.meta.url);
const OUTPUT_FILE = new URL("pill-buttons.css", OUTPUT_DIR);

const palette = {
  glow: ["#8b5cf6", "#a78bfa"],
  soft: ["#f97316", "#fdba74"],
  ghost: ["#06b6d4", "#67e8f9"],
  circle: ["#f43f5e", "#fb7185"],
};

function buildCss() {
  return `
:root {
  --pill-bg-1: rgba(20, 20, 28, 0.96);
  --pill-bg-2: rgba(30, 30, 40, 0.92);
  --pill-ring: rgba(255, 255, 255, 0.24);
  --pill-shadow: rgba(15, 23, 42, 0.35);
  --pill-text: #f8fafc;
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 22px;
}

.pill {
  --pill-gradient-a: ${palette.glow[0]};
  --pill-gradient-b: ${palette.glow[1]};
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 146px;
  min-height: 58px;
  padding: 0 22px;
  border: 1px solid var(--pill-ring);
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.32), transparent 28%),
              linear-gradient(135deg, var(--pill-gradient-a), var(--pill-gradient-b));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 24px var(--pill-shadow);
  color: var(--pill-text);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.pill::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  border: 1px solid rgba(255,255,255,0.08);
  pointer-events: none;
}

.pill:hover,
.pill:focus-visible {
  transform: translateY(-1px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 16px 30px rgba(15, 23, 42, 0.42);
  border-color: rgba(255,255,255,0.4);
  outline: none;
}

.pill:active {
  transform: translateY(0);
}

.pill__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 0 12px rgba(255,255,255,0.65);
}

.pill--soft {
  --pill-gradient-a: ${palette.soft[0]};
  --pill-gradient-b: ${palette.soft[1]};
}

.pill--ghost {
  --pill-gradient-a: ${palette.ghost[0]};
  --pill-gradient-b: ${palette.ghost[1]};
}

.pill--glow {
  --pill-gradient-a: ${palette.glow[0]};
  --pill-gradient-b: ${palette.glow[1]};
}

.pill--circle {
  width: 58px;
  min-width: 58px;
  min-height: 58px;
  padding: 0;
  --pill-gradient-a: ${palette.circle[0]};
  --pill-gradient-b: ${palette.circle[1]};
}

.pill--circle .pill__dot {
  width: 12px;
  height: 12px;
}
`;
}

await mkdir(new URL("./", OUTPUT_DIR), { recursive: true });
await writeFile(OUTPUT_FILE, buildCss().trim() + "\n", "utf8");
console.log(`Generated \${OUTPUT_FILE.pathname}`);
