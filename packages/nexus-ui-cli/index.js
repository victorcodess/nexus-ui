#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const https = require("https");

const REGISTRY_BASE = "https://nexus-ui.dev/api/registry";

function getCommandPrefix() {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent?.includes("pnpm")) return "pnpm dlx";
  if (userAgent?.includes("yarn")) return "yarn dlx";
  if (userAgent?.includes("bun")) return "bunx";

  return "npx -y";
}

function fetchRegistry() {
  return new Promise((resolve, reject) => {
    https
      .get(`${REGISTRY_BASE}/registry.json`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const registry = JSON.parse(data);
            const names = (registry.items || [])
              .filter((i) => i.type === "registry:ui" || i.type === "registry:component")
              .map((i) => i.name);
            resolve(names);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  let components = args.length >= 2 ? args.slice(1) : ["all"];

  if (components.includes("all")) {
    try {
      components = await fetchRegistry();
      if (components.length === 0) {
        console.error("No components found in registry");
        process.exit(1);
      }
    } catch (err) {
      console.error("Failed to fetch registry:", err.message);
      process.exit(1);
    }
  }

  const targetUrls = components
    .map((name) => `${REGISTRY_BASE}/${name}.json`)
    .join(" ");

  const fullCommand = `${getCommandPrefix()} shadcn@latest add ${targetUrls}`;
  const result = spawnSync(fullCommand, {
    shell: true,
    stdio: "inherit",
  });

  if (result.error) {
    console.error("Failed to execute command:", result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

main();
