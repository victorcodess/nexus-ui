import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { SITE_TITLE, SITE_DESCRIPTION_SHORT } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(font: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  try {
    const css = await (await fetch(url)).text();
    const resource = css.match(
      /src: url\((.+)\) format\('(opentype|truetype)'\)/,
    )?.[1];
    if (!resource) return null;
    const response = await fetch(resource);
    if (!response.ok) return null;
    return response.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const assetsDir = join(process.cwd(), "public", "assets");
  const [svgLeft, svgRight] = await Promise.all([
    readFile(join(assetsDir, "og-bg-left.svg"), "utf-8"),
    readFile(join(assetsDir, "og-bg-right.svg"), "utf-8"),
  ]);
  const svgLeftDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgLeft).toString("base64")}`;
  const svgRightDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgRight).toString("base64")}`;

  const text = `${SITE_TITLE} ${SITE_DESCRIPTION_SHORT} nexus-ui.dev`;
  const [fontRegular, fontMedium] = await Promise.all([
    loadGoogleFont("Inter", 400, text),
    loadGoogleFont("Inter", 500, text),
  ]);
  const fonts = [
    fontRegular
      ? ({ name: "Inter", data: fontRegular, style: "normal", weight: 400 } as const)
      : null,
    fontMedium
      ? ({ name: "Inter", data: fontMedium, style: "normal", weight: 500 } as const)
      : null,
  ].filter((font): font is NonNullable<typeof font> => font !== null);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#ffffff",
        position: "relative",
        paddingTop: 80,
      }}
    >
      <img
        src={svgLeftDataUrl}
        alt=""
        width={490}
        height={630}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
      />
      <img
        src={svgRightDataUrl}
        alt=""
        width={490}
        height={630}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          style={{
            marginBottom: 0,
          }}
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 24C15.2548 24 24 15.2548 24 0C24 15.2548 32.7452 24 48 24C32.7452 24 24 32.7452 24 48C24 32.7452 15.2548 24 0 24Z"
            fill="#171717"
          />
        </svg>
        <h1
          style={{
            fontFamily: "Inter",
            fontSize: 48,
            fontWeight: 500,
            color: "#171717",
            marginTop: 44,
            marginBottom: 0,
            lineHeight: "54px",
            letterSpacing: "-1.2px",
            width: "278px",
            textAlign: "center",
          }}
        >
          {SITE_TITLE}
        </h1>
        <p
          style={{
            fontSize: 20,
            color: "#737373",
            maxWidth: 406,
            textAlign: "center",
            lineHeight: "28px",
            marginTop: 8,
          }}
        >
          {SITE_DESCRIPTION_SHORT}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: -180,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: "#737373",
          }}
        >
          nexus-ui.dev
        </p>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
