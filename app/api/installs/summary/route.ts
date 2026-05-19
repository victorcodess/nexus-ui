import { NextRequest, NextResponse } from "next/server";
import {
  getInstallDashboardKey,
  getInstallSummary,
  toInstallSummaryDays,
} from "@/lib/install-tracking";

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

  const daysParam = toInstallSummaryDays(request.nextUrl.searchParams.get("days"));
  const summary = await getInstallSummary(daysParam);

  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
