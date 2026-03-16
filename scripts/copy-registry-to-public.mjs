#!/usr/bin/env node
/**
 * Copies the registry folder to public/registry so .tsx files are served at
 * /registry/new-york/... URLs. Required for shadcn CLI to fetch file content
 * when the files array does not include a content property.
 */
import { cpSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "registry");
const dest = join(root, "public", "registry");

if (!existsSync(src)) {
  console.error("✗ registry folder not found");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("✓ Copied registry to public/registry");
