import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import { join } from "path";

const REGISTRY_BASE = process.cwd();
const R_DIR = join(REGISTRY_BASE, "public", "r");
const REGISTRY_SRC = join(REGISTRY_BASE, "registry");
const REGISTRY_PUBLIC = join(REGISTRY_BASE, "public", "registry");

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const pathSegments = (await params).path ?? [];

  try {
    // /api/registry/registry.json -> registry index
    if (pathSegments.length === 1 && pathSegments[0] === "registry.json") {
      const content = await readFile(join(R_DIR, "registry.json"), "utf-8");
      return NextResponse.json(JSON.parse(content), {
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
      });
    }

    // /api/registry/[component].json -> component registry item
    if (
      pathSegments.length === 1 &&
      pathSegments[0].endsWith(".json") &&
      pathSegments[0] !== "registry.json"
    ) {
      const content = await readFile(join(R_DIR, pathSegments[0]), "utf-8");
      return NextResponse.json(JSON.parse(content), {
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
      });
    }

    // /api/registry/registry/... -> source files (tsx, etc.)
    if (pathSegments[0] === "registry" && pathSegments.length > 1) {
      const filePath = pathSegments.slice(1).join("/");
      if (filePath.includes("..")) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
      }
      // Prefer public/registry (build output), fallback to source registry/
      const publicPath = join(REGISTRY_PUBLIC, filePath);
      const srcPath = join(REGISTRY_SRC, filePath);

      const path = (await fileExists(publicPath)) ? publicPath : srcPath;
      if (!(await fileExists(path))) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const content = await readFile(path, "utf-8");
      const ext = filePath.split(".").pop();
      const contentType =
        ext === "tsx" || ext === "ts"
          ? "text/typescript"
          : ext === "css"
            ? "text/css"
            : "text/plain";

      return new NextResponse(content, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
