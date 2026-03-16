#!/usr/bin/env node
/**
 * Strips the `content` property from registry item JSON files.
 * Required for shadcn public directory: "The files array must NOT include a content property."
 * The CLI fetches file content from the path URL instead.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const rDir = join(root, "public", "r");

const files = readdirSync(rDir).filter((f) => f.endsWith(".json") && f !== "registry.json");

for (const file of files) {
  const path = join(rDir, file);
  const data = JSON.parse(readFileSync(path, "utf-8"));

  if (data.files) {
    let modified = false;
    for (const f of data.files) {
      if ("content" in f) {
        delete f.content;
        modified = true;
      }
    }
    if (modified) {
      writeFileSync(path, JSON.stringify(data, null, 2));
      console.log(`✓ Stripped content from ${file}`);
    }
  }
}
