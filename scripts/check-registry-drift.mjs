#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npm", ["run", "registry:build"]);

const root = process.cwd();
const requiredFiles = [
  join(root, "public", "r", "registry.json"),
  join(root, "public", "r", "prompt-input.json"),
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error("Registry build completed but expected generated files are missing:");
  for (const file of missing) {
    console.error(`  - ${file}`);
  }
  process.exit(1);
}

try {
  const parsed = JSON.parse(readFileSync(join(root, "public", "r", "registry.json"), "utf-8"));
  if (!Array.isArray(parsed?.items) || parsed.items.length === 0) {
    console.error("Generated public/r/registry.json is invalid or empty.");
    process.exit(1);
  }
} catch (error) {
  console.error("Failed to parse generated public/r/registry.json:", error);
  process.exit(1);
}

const registryDir = join(root, "public", "r");
const registryItems = JSON.parse(readFileSync(join(registryDir, "registry.json"), "utf-8"));

for (const item of registryItems.items ?? []) {
  const itemPath = join(registryDir, `${item.name}.json`);
  try {
    const itemData = JSON.parse(readFileSync(itemPath, "utf-8"));
    if (!Array.isArray(itemData.files) || itemData.files.length === 0) {
      console.error(`Generated ${item.name}.json is missing a files array.`);
      process.exit(1);
    }

    const hasMissingInlineContent = itemData.files.some(
      (file) => typeof file?.content !== "string" || file.content.length === 0,
    );
    if (hasMissingInlineContent) {
      console.error(
        `Generated ${item.name}.json has files without inline content. JSON-only delivery requires files[].content for all entries.`,
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(`Failed to validate generated ${item.name}.json:`, error);
    process.exit(1);
  }
}

console.log("Registry outputs were generated and validated.");
