import { NextRequest, NextResponse } from "next/server";
import { getInstallDashboardKey, getInstallSummary } from "@/lib/install-tracking";

export async function GET(request: NextRequest) {
  const expectedKey = getInstallDashboardKey();
  if (expectedKey) {
    const providedKey =
      request.headers.get("x-nexus-installs-key") ??
      request.nextUrl.searchParams.get("key");

    if (providedKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const daysParam = Number(request.nextUrl.searchParams.get("days") ?? "14");
  const summary = await getInstallSummary(daysParam);

  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
