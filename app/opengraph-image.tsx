import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(font: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  )?.[1];
  if (resource) {
    const response = await fetch(resource);
    if (response.ok) return response.arrayBuffer();
  }
  throw new Error("Failed to load font");
}

export default async function Image() {
  const assetsDir = join(process.cwd(), "public", "assets");
  const [svgLeft, svgRight] = await Promise.all([
    readFile(join(assetsDir, "og-bg-left.svg"), "utf-8"),
    readFile(join(assetsDir, "og-bg-right.svg"), "utf-8"),
  ]);
  const svgLeftDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgLeft).toString("base64")}`;
  const svgRightDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgRight).toString("base64")}`;

  const text = `Build Better AI Interfaces ${SITE_DESCRIPTION} nexus-ui.dev`;
  const [fontRegular, fontMedium, fontBold] = await Promise.all([
    loadGoogleFont("Inter", 400, text),
    loadGoogleFont("Inter", 500, text),
    loadGoogleFont("Inter", 700, text),
  ]);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        position: "relative",
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
          marginTop: -152,
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
          Build Better AI Interfaces
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
          Flexible, customizable components engineered for modern AI
          experiences.
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
      fonts: [
        { name: "Inter", data: fontRegular, style: "normal", weight: 400 },
        { name: "Inter", data: fontMedium, style: "normal", weight: 500 },
        { name: "Inter", data: fontBold, style: "normal", weight: 700 },
      ],
    },
  );
}
