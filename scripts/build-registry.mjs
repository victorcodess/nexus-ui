#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const registryJsonPath = join(root, "registry.json");
const publicRDir = join(root, "public", "r");
const publicRegistryDir = join(root, "public", "registry");
const registryStagingDir = join(root, "registry");

function removeIfExists(path) {
  rmSync(path, { recursive: true, force: true });
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function isWindows() {
  return process.platform === "win32";
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: isWindows(),
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const registry = JSON.parse(readFileSync(registryJsonPath, "utf-8"));

removeIfExists(publicRDir);
removeIfExists(publicRegistryDir);
removeIfExists(registryStagingDir);
ensureDir(registryStagingDir);

for (const item of registry.items ?? []) {
  for (const file of item.files ?? []) {
    if (!file?.target || !file?.path) {
      continue;
    }

    const sourcePath = join(root, file.target.replace(/^~\//, ""));
    const destinationPath = join(root, file.path);
    ensureDir(dirname(destinationPath));
    cpSync(sourcePath, destinationPath);
  }
}

try {
  run("shadcn", ["build"]);
  console.log("Registry outputs generated in public/r");
} finally {
  removeIfExists(registryStagingDir);
}
