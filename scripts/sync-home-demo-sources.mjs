import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const files = {
  claude: "components/nexus-ui/examples/prompt-input/claude-input.tsx",
  v0: "components/nexus-ui/examples/prompt-input/v0-input.tsx",
  gemini: "components/nexus-ui/examples/prompt-input/gemini-input.tsx",
  chatgpt: "components/nexus-ui/examples/prompt-input/chatgpt-input.tsx",
};
const out = [];
out.push("// Sync: node scripts/sync-home-demo-sources.mjs");
out.push("export const homeDemoSources = {");
for (const [key, rel] of Object.entries(files)) {
  const raw = fs.readFileSync(path.join(root, rel), "utf8");
  out.push(`  ${key}: ${JSON.stringify(raw)},`);
}
out.push("} as const;");
out.push("export type HomeDemoSourceKey = keyof typeof homeDemoSources;");
fs.writeFileSync(
  path.join(root, "components/home/home-demo-sources.ts"),
  out.join("\n"),
);
console.log("Wrote components/home/home-demo-sources.ts");
