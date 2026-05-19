import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { recordInstall } from "@/lib/install-tracking";

const REGISTRY_BASE = process.cwd();
const R_DIR = join(REGISTRY_BASE, "public", "r");

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
      const componentName = pathSegments[0].replace(/\.json$/, "");
      const content = await readFile(join(R_DIR, pathSegments[0]), "utf-8");
      const parsed = JSON.parse(content);
      const requiredFiles = Array.isArray(parsed.files) ? parsed.files.length : 1;
      const hasInlineContent =
        Array.isArray(parsed.files) &&
        parsed.files.length > 0 &&
        parsed.files.every(
          (file: unknown) =>
            typeof file === "object" &&
            file !== null &&
            "content" in file &&
            typeof (file as { content?: unknown }).content === "string" &&
            (file as { content: string }).content.length > 0,
        );
      await recordInstall(componentName, _request, {
        requiredFiles,
        confirmOnIntent: hasInlineContent,
      });
      return NextResponse.json(parsed, {
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
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
